"use client";

import React, { useState, useTransition, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

const ResetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password requires at least one uppercase letter")
    .regex(/[a-z]/, "Password requires at least one lowercase letter")
    .regex(/[0-9]/, "Password requires at least one number")
    .regex(/[^A-Za-z0-9]/, "Password requires at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordFormType = z.infer<typeof ResetPasswordFormSchema>;

function getPasswordScore(password: string): 0 | 1 | 2 | 3 {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormType>({
    resolver: zodResolver(ResetPasswordFormSchema),
  });

  const { ref: passwordRegisterRef, ...passwordRest } = register("password", { disabled: isPending });
  const { ref: confirmPasswordRegisterRef, ...confirmPasswordRest } = register("confirmPassword", { disabled: isPending });

  const passwordValue = watch("password") || "";
  const passwordScore = getPasswordScore(passwordValue);

  const onSubmit = async (data: ResetPasswordFormType) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: data.password }),
        });

        const result = await response.json();

        if (response.ok) {
          router.push("/reset-password/success");
        } else {
          setErrorMessage(result.error || "Something went wrong. Please try again later.");
        }
      } catch {
        setErrorMessage("Something went wrong. Please try again later.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto border border-outline p-6 bg-surface rounded-sm text-left">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="reset-password" className="block text-xs font-medium tracking-wide uppercase text-on-surface-variant">
            New Password
          </label>
          <div className="relative">
            <input
              {...passwordRest}
              id="reset-password"
              type={showPassword ? "text" : "password"}
              ref={(node) => { passwordRegisterRef(node); passwordRef.current = node; }}
              className="w-full h-11 px-3 pr-10 border border-outline bg-transparent text-sm focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-error font-medium">{errors.password.message}</p>
          )}
          {passwordValue.length > 0 && !errors.password && (
            <PasswordStrengthIndicator score={passwordScore} />
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reset-confirm-password" className="block text-xs font-medium tracking-wide uppercase text-on-surface-variant">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              {...confirmPasswordRest}
              id="reset-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              ref={(node) => { confirmPasswordRegisterRef(node); confirmPasswordRef.current = node; }}
              className="w-full h-11 px-3 pr-10 border border-outline bg-transparent text-sm focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
              placeholder="Confirm your new password"
            />
            <button
              type="button"
              onClick={toggleConfirmPassword}
              className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <svg className="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-error font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 text-xs font-medium border bg-error-container border-error-container text-on-error-container">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-primary text-on-primary font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
        >
          {isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};
