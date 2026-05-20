"use client";

import React, { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SignUpSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [seconds, setSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const handleResend = useCallback(async () => {
    if (!canResend || !email) return;

    setResendStatus("sending");
    setCanResend(false);
    setSeconds(60);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendStatus("sent");
      } else {
        setResendStatus("error");
        setCanResend(true);
      }
    } catch {
      setResendStatus("error");
      setCanResend(true);
    }
  }, [canResend, email]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-tertiary-container flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-[var(--headline-medium-font-size)] leading-[var(--headline-medium-line-height)] tracking-normal font-[var(--headline-medium-font-weight)] text-on-surface">
          Account created successfully
        </h1>
        <p className="text-[var(--body-medium-font-size)] leading-[var(--body-medium-line-height)] text-on-surface-variant">
          We&apos;ve sent a verification link to {email || "your email"}. Please check your inbox and click the link to verify your account before signing in.
        </p>

        {resendStatus === "sent" && (
          <div className="p-3 text-xs font-medium border bg-tertiary-container border-tertiary-container text-on-tertiary-container">
            Verification link sent. Please check your email.
          </div>
        )}

        {resendStatus === "error" && (
          <div className="p-3 text-xs font-medium border bg-error-container border-error-container text-on-error-container">
            Failed to send. Please try again later.
          </div>
        )}

        <Link
          href="/login"
          className="inline-block w-full h-11 leading-11 bg-primary text-on-primary font-medium text-sm hover:opacity-90 transition-opacity text-center pt-3"
        >
          Go to Sign In
        </Link>

        <div className="text-sm text-on-surface-variant space-y-2">
          {!canResend ? (
            <p>
              Resend available in{" "}
              <span className="font-medium text-on-surface">{formatTime(seconds)}</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendStatus === "sending"}
              className="underline hover:text-on-surface disabled:opacity-50 disabled:no-underline cursor-pointer"
            >
              {resendStatus === "sending" ? "Sending..." : "Didn't receive the link? Request again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignUpSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
        <div className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignUpSuccessContent />
    </Suspense>
  );
}
