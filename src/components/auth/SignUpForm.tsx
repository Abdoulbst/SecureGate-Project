"use client";

import React, { useState, useTransition, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";

const SignUpFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").max(50),
  email: z.string().email("A valid email address is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password requires at least one uppercase letter")
    .regex(/[a-z]/, "Password requires at least one lowercase letter")
    .regex(/[0-9]/, "Password requires at least one number")
    .regex(/[^A-Za-z0-9]/, "Password requires at least one special character"),
});

type SignUpFormType = z.infer<typeof SignUpFormSchema>;

function getPasswordScore(password: string): 0 | 1 | 2 | 3 {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 3) as 0 | 1 | 2 | 3;
}

export const SignUpForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormType>({
    resolver: zodResolver(SignUpFormSchema),
    mode: "all",
  });

  const { ref: passwordRegisterRef, ...passwordRest } = register("password", { disabled: isPending });

  const passwordValue = watch("password") || "";
  const passwordScore = getPasswordScore(passwordValue);

  const onSubmit = async (data: SignUpFormType) => {
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
          router.push(`/signup/success?email=${encodeURIComponent(data.email)}`);
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
          <label htmlFor="signup-name" className="block text-xs font-medium tracking-wide uppercase text-on-surface-variant">
            Full Name
          </label>
          <input
            {...register("name")}
            id="signup-name"
            type="text"
            disabled={isPending}
            className="w-full h-11 px-3 border border-outline bg-transparent text-sm focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-xs text-error font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-email" className="block text-xs font-medium tracking-wide uppercase text-on-surface-variant">
            Email Address
          </label>
          <input
            {...register("email")}
            id="signup-email"
            type="email"
            disabled={isPending}
            className="w-full h-11 px-3 border border-outline bg-transparent text-sm focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="text-xs text-error font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="signup-password" className="block text-xs font-medium tracking-wide uppercase text-on-surface-variant">
            Password
          </label>
          <div className="relative">
            <input
              {...passwordRest}
              id="signup-password"
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
          {isPending ? "Creating account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};
