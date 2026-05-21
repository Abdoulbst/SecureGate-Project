import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ResetPasswordSchema } from "@/lib/validations";
import { checkRateLimit, PASSWORD_RESET_RATE_LIMIT } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rateLimitResult = await checkRateLimit(`reset-password:${ip}`, PASSWORD_RESET_RATE_LIMIT);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!existingToken) {
      return NextResponse.json(
        { error: "This link is invalid or has expired." },
        { status: 400 }
      );
    }

    if (Date.now() > existingToken.expires.getTime()) {
      await prisma.passwordResetToken.delete({ where: { id: existingToken.id } });
      return NextResponse.json(
        { error: "This link is invalid or has expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.user.update({
        where: { id: existingToken.userId },
        data: { password: hashedPassword },
      });

      await tx.passwordResetToken.delete({
        where: { id: existingToken.id },
      });
    });

    return NextResponse.json(
      { message: "Password reset successful. You can now sign in with your new password." },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected failure occurred";
    console.error(`[CRITICAL_API_FAILURE] POST /api/auth/reset-password:`, message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
