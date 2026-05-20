import Link from "next/link";

export default function ResetPasswordSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-[var(--headline-medium-font-size)] leading-[var(--headline-medium-line-height)] tracking-normal font-[var(--headline-medium-font-weight)] text-on-surface">
          Password changed successfully
        </h1>
        <p className="text-[var(--body-medium-font-size)] leading-[var(--body-medium-line-height)] text-on-surface-variant">
          Your password has been updated. You can now sign in using your new password.
        </p>
        <Link
          href="/login"
          className="inline-block w-full h-11 leading-11 bg-primary text-on-primary font-medium text-sm hover:opacity-90 transition-opacity text-center pt-3"
        >
          Sign In with New Password
        </Link>
      </div>
    </div>
  );
}
