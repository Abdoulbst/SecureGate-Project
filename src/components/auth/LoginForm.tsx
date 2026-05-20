"use client";

import React, { useState, useTransition, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginFormSchema = z.object({
  email: z.string().email("A valid email address is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormType = z.infer<typeof LoginFormSchema>;

export const LoginForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const [systemFeedback, setSystemFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>({
    resolver: zodResolver(LoginFormSchema),
  });

  const { ref: passwordRegisterRef, ...passwordRest } = register("password", { disabled: isPending });

  const onSubmit = async (data: LoginFormType) => {
    setSystemFeedback(null);

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          setSystemFeedback({
            type: "error",
            message: "Invalid credentials",
          });
        } else {
          router.push("/dashboard");
        }
      } catch {
        setSystemFeedback({
          type: "error",
          message: "Something went wrong. Please try again later.",
        });
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto border border-outline p-6 bg-surface rounded-sm text-left">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="login-email" className="block text-xs font-medium tracking-wide uppercase text-on-surface-variant">
            Email Address
          </label>
          <input
            {...register("email")}
            id="login-email"
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
          <label htmlFor="login-password" className="block text-xs font-medium tracking-wide uppercase text-on-surface-variant">
            Password
          </label>
          <div className="relative">
            <input
              {...passwordRest}
              id="login-password"
              type={showPassword ? "text" : "password"}
              ref={(node) => { passwordRegisterRef(node); passwordRef.current = node; }}
              className="w-full h-11 px-3 pr-10 border border-outline bg-transparent text-sm focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
              placeholder="Enter your password"
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
        </div>

        {systemFeedback && (
          <div className={`p-3 text-xs font-medium border ${
            systemFeedback.type === "success"
              ? "bg-tertiary-container border-tertiary-container text-on-tertiary-container"
              : "bg-error-container border-error-container text-on-error-container"
          }`}>
            {systemFeedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-primary text-on-primary font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-center">
          <a href="/forgot-password" className="text-xs text-on-surface-variant hover:text-on-surface underline">
            Forgot your password?
          </a>
        </div>
      </form>
    </div>
  );
};
