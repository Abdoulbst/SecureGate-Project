import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ForgotPasswordSchema } from "@/lib/validations";
import { generateSecureToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, PASSWORD_RESET_RATE_LIMIT } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimitResult = await checkRateLimit(`forgot-password:${ip}`, PASSWORD_RESET_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const result = ForgotPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { message: "If an account is associated with this email, a reset link has been sent." },
        { status: 200 }
      );
    }

    const { email } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = generateSecureToken();

      await prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expires: new Date(Date.now() + 60 * 60 * 1000),
          userId: user.id,
        },
      });

      try {
        await sendPasswordResetEmail(email, token);
      } catch (emailError) {
        const emailMessage = emailError instanceof Error ? emailError.message : "Email sending failed";
        console.error(`[EMAIL_FAILURE] POST /api/auth/forgot-password:`, emailMessage);
      }
    }

    return NextResponse.json(
      { message: "If an account is associated with this email, a reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected failure occurred";
    console.error(`[CRITICAL_API_FAILURE] POST /api/auth/forgot-password:`, message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
