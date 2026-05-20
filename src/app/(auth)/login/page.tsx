import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
      <div className="max-w-md w-full text-center space-y-6">
        <div>
          <h1 className="text-[var(--headline-medium-font-size)] leading-[var(--headline-medium-line-height)] tracking-normal font-[var(--headline-medium-font-weight)] text-on-surface">
            Welcome back
          </h1>
          <p className="mt-1 text-[var(--body-medium-font-size)] leading-[var(--body-medium-line-height)] text-on-surface-variant">
            Sign in to your SecureGate account
          </p>
        </div>
        <LoginForm />
        <p className="text-sm text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline hover:text-on-surface">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
