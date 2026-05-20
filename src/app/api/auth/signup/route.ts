import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SignUpSchema } from "@/lib/validations";
import { generateSecureToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimitResult = checkRateLimit(`signup:${ip}`, AUTH_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = SignUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;
    const hashedPassword = await bcrypt.hash(password, 12);

    let verificationToken = "";

    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const existingUser = await tx.user.findUnique({ where: { email } });

        if (existingUser) {
          throw new Error("USER_EXISTS");
        }

        const user = await tx.user.create({
          data: { name, email, password: hashedPassword },
        });

        verificationToken = generateSecureToken();

        await tx.verificationToken.create({
          data: {
            identifier: email,
            token: verificationToken,
            expires: new Date(Date.now() + 15 * 60 * 1000),
            userId: user.id,
          },
        });
      });
    } catch (txError) {
      if (txError instanceof Error && txError.message === "USER_EXISTS") {
        return NextResponse.json(
          { message: "Account created successfully. Please check your email to verify your account." },
          { status: 201 }
        );
      }
      throw txError;
    }

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      const emailMessage = emailError instanceof Error ? emailError.message : "Email sending failed";
      console.error(`[EMAIL_FAILURE] POST /api/auth/signup:`, emailMessage);
    }

    return NextResponse.json(
      { message: "Account created successfully. Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected failure occurred";
    console.error(`[CRITICAL_API_FAILURE] POST /api/auth/signup:`, message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
