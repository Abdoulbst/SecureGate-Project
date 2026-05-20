import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <svg className="w-9 h-9 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z" />
          </svg>
          <h1 className="text-[var(--display-large-font-size)] leading-none tracking-[-0.5px] font-[var(--display-large-font-weight)] text-on-surface">
            SecureGate
          </h1>
        </div>
        <p className="text-[var(--body-large-font-size)] leading-[var(--body-large-line-height)] text-on-surface-variant">
          Enterprise-grade authentication gateway. Secure, fast, and reliable identity and access management.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link
            href="/signup"
            className="w-full h-11 flex items-center justify-center bg-primary text-on-primary font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="w-full h-11 flex items-center justify-center border border-outline text-on-surface font-medium text-sm hover:bg-surface-variant transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
