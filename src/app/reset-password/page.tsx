"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import Link from "next/link";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-[var(--headline-small-font-size)] leading-[var(--headline-small-line-height)] tracking-normal font-[var(--headline-small-font-weight)] text-error">
            Invalid Link
          </h1>
          <p className="text-[var(--body-medium-font-size)] text-on-surface-variant">
            This link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full h-11 leading-11 bg-primary text-on-primary font-medium text-sm hover:opacity-90 transition-opacity text-center pt-3"
          >
            Request New Reset Link
          </Link>
          <p className="text-sm text-on-surface-variant">
            <Link href="/login" className="underline hover:text-on-surface">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-[var(--headline-medium-font-size)] leading-[var(--headline-medium-line-height)] tracking-normal font-[var(--headline-medium-font-weight)] text-on-surface">
            Reset your password
          </h1>
          <p className="mt-1 text-[var(--body-medium-font-size)] leading-[var(--body-medium-line-height)] text-on-surface-variant">
            Enter your new password below
          </p>
        </div>
        <ResetPasswordForm token={token} />
        <p className="text-sm text-on-surface-variant">
          <Link href="/login" className="underline hover:text-on-surface">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
        <div className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
