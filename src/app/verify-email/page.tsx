"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This link is invalid or has expired.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const result = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(result.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(result.error || "This link is invalid or has expired.");
        }
      } catch {
        setStatus("error");
        setMessage("Something went wrong. Please try again later.");
      }
    };

    verifyEmail();
  }, [token, email]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <div className="space-y-4">
            <div className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-[var(--body-medium-font-size)] text-on-surface-variant">
              Verifying your email...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <h1 className="text-[var(--headline-small-font-size)] leading-[var(--headline-small-line-height)] tracking-normal font-[var(--headline-small-font-weight)] text-tertiary">
              Email Verified
            </h1>
            <p className="text-[var(--body-medium-font-size)] text-on-surface-variant">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-block w-full h-11 leading-11 bg-primary text-on-primary font-medium text-sm hover:opacity-90 transition-opacity text-center pt-3"
            >
              Sign In
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <h1 className="text-[var(--headline-small-font-size)] leading-[var(--headline-small-line-height)] tracking-normal font-[var(--headline-small-font-weight)] text-error">
              Verification Failed
            </h1>
            <p className="text-[var(--body-medium-font-size)] text-on-surface-variant">
              {message}
            </p>
            <Link
              href="/login"
              className="inline-block w-full h-11 leading-11 bg-primary text-on-primary font-medium text-sm hover:opacity-90 transition-opacity text-center pt-3"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-surface">
        <div className="w-8 h-8 border-2 border-outline border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
