import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-[var(--headline-medium-font-size)] leading-[var(--headline-medium-line-height)] tracking-normal font-[var(--headline-medium-font-weight)] text-on-surface">
            Create your account
          </h1>
          <p className="mt-1 text-[var(--body-medium-font-size)] leading-[var(--body-medium-line-height)] text-on-surface-variant">
            Secure access starts here
          </p>
        </div>
        <SignUpForm />
        <p className="text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link href="/login" className="underline hover:text-on-surface">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
