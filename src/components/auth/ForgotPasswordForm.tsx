"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ForgotPasswordFormSchema = z.object({
  email: z.string().email("A valid email address is required"),
});

type ForgotPasswordFormType = z.infer<typeof ForgotPasswordFormSchema>;

export const ForgotPasswordForm: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const [systemFeedback, setSystemFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormType>({
    resolver: zodResolver(ForgotPasswordFormSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormType) => {
    setSystemFeedback(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        setSystemFeedback({
          type: "success",
          message: result.message || "If an account is associated with this email, a reset link has been sent.",
        });
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
          <label htmlFor="forgot-email" className="block text-xs font-medium tracking-wide uppercase text-on-surface-variant">
            Email Address
          </label>
          <input
            {...register("email")}
            id="forgot-email"
            type="email"
            disabled={isPending}
            className="w-full h-11 px-3 border border-outline bg-transparent text-sm focus:outline-none focus:border-primary disabled:opacity-50 transition-colors"
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="text-xs text-error font-medium">{errors.email.message}</p>
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
          {isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
};
