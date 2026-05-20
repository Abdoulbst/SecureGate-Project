import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-[var(--headline-medium-font-size)] leading-[var(--headline-medium-line-height)] tracking-normal font-[var(--headline-medium-font-weight)] text-on-surface">
            Forgot your password?
          </h1>
          <p className="mt-1 text-[var(--body-medium-font-size)] leading-[var(--body-medium-line-height)] text-on-surface-variant">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="text-sm text-on-surface-variant">
          <Link href="/login" className="underline hover:text-on-surface">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
