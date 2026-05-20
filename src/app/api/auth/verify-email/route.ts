import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limiter";
import { VerifyEmailSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimitResult = checkRateLimit(`verify-email:${ip}`, AUTH_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "This link is invalid or has expired." },
        { status: 400 }
      );
    }

    const parsed = VerifyEmailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "This link is invalid or has expired." },
        { status: 400 }
      );
    }

    const { token, email } = parsed.data;

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingToken = await tx.verificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!existingToken) {
        if (email) {
          const user = await tx.user.findUnique({ where: { email } });
          if (user?.emailVerified) {
            return { status: 200, message: "Email already verified. You can sign in." };
          }
        }
        return { status: 400, error: "This link is invalid or has expired." };
      }

      if (Date.now() > existingToken.expires.getTime()) {
        await tx.verificationToken.delete({ where: { id: existingToken.id } });
        return { status: 400, error: "This link is invalid or has expired." };
      }

      if (existingToken.user.emailVerified) {
        return { status: 200, message: "Email already verified. You can sign in." };
      }

      await tx.user.update({
        where: { id: existingToken.userId },
        data: { emailVerified: new Date() },
      });

      return {
        status: 200,
        message: "Email verified successfully. You can now sign in.",
        newUser: { email: existingToken.user.email, name: existingToken.user.name },
      } as const;
    });

    if (result.status === 200 && "newUser" in result) {
      const userInfo = result as { status: 200; message: string; newUser: { email: string; name: string } };
      sendWelcomeEmail(userInfo.newUser.email, userInfo.newUser.name).catch((err) =>
        console.error("[EMAIL_FAILURE] Welcome email:", err)
      );
    }

    return NextResponse.json(
      "error" in result && result.error ? { error: result.error } : { message: result.message },
      { status: result.status }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected failure occurred";
    const stack = error instanceof Error ? error.stack : "No stack trace";
    console.error(`[CRITICAL_API_FAILURE] POST /api/auth/verify-email:`, message, stack);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
