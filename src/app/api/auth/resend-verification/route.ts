import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateSecureToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limiter";
import { ResendVerificationSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimitResult = checkRateLimit(`resend-verification:${ip}`, AUTH_RATE_LIMIT);

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
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    const parsed = ResendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.findUnique({ where: { email } });

      if (!user) {
        return;
      }

      if (user.emailVerified) {
        return;
      }

      await tx.verificationToken.deleteMany({
        where: { userId: user.id },
      });

      const token = generateSecureToken();

      await tx.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires: new Date(Date.now() + 15 * 60 * 1000),
          userId: user.id,
        },
      });

      try {
        await sendVerificationEmail(email, token);
      } catch (emailError) {
        const emailMessage = emailError instanceof Error ? emailError.message : "Email sending failed";
        console.error(`[EMAIL_FAILURE] POST /api/auth/resend-verification:`, emailMessage);
      }
    });

    return NextResponse.json(
      { message: "If an account is associated with this email, a verification link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected failure occurred";
    console.error(`[CRITICAL_API_FAILURE] POST /api/auth/resend-verification:`, message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
