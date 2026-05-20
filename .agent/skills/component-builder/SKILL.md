# SKILL.md — Component Builder & UI Hardening Engine Blueprint

This rule file defines the automated structural layout generation, state binding, and Tailwind styling constraints for frontend components within **SecureGate**. It serves as the primary execution engine blueprint for the **Designer Agent** when building or modifying client-side interfaces, ensuring all code remains flat, accessible, and completely free of placeholders.

---

## 1. UI Architecture & Composition Laws

Every user interface component generated for SecureGate must be constructed as a highly optimized, single-purpose block. 

### Component Organization Schema
src/components/
└── [feature]/
├── [ComponentName].tsx      # The isolated component markup and client logic
└── [ComponentName].spec.tsx # Component interaction test harness

### Composition Rules
*   **Default Client Boundary:** Identity system forms must explicitly state their boundary using the `"use client"` directive at line 1 to support local state, transitions, and click tracking.
*   **Prose and Layout Isolation:** Component markup must handle structural layout properties natively. Coupling external global CSS layout frameworks or importing raw, uncompiled stylesheet modules is strictly banned.

---

## 2. Standardized Form Component Skeleton

Every generated form component must match the structural blueprint below. This architecture enforces flat layout constraints, accessible element mappings, and explicit loading/error state tracking.

```tsx
"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Local Schema Mirroring System Bounds
const FormInputSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormInputType = z.infer<typeof FormInputSchema>;

export const ScaffoldFormComponent: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const [systemFeedback, setSystemFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputType>({
    resolver: zodResolver(FormInputSchema),
  });

  const onSubmit = async (data: FormInputType) => {
    setSystemFeedback(null);
    
    startTransition(async () => {
      try {
        // Execute fetch call or server action pathway safely here
        // const response = await apiCall(data);
        
        setSystemFeedback({
          type: "success",
          message: "Action completed successfully.",
        });
      } catch (error) {
        setSystemFeedback({
          type: "error",
          message: "An unexpected processing error occurred.",
        });
      }
    });
  };

  return (
    <div className="w-full max-w-md border border-neutral-200 dark:border-neutral-800 p-6 bg-white dark:bg-neutral-900 rounded-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        
        <div className="space-y-1.5">
          <label 
            htmlFor="email-input-field" 
            className="block text-xs font-medium tracking-wide uppercase text-neutral-500"
          >
            Email Address
          </label>
          <input
            {...register("email")}
            id="email-input-field"
            type="email"
            disabled={isPending}
            className="w-full h-11 px-3 border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:border-neutral-900 dark:focus:border-white disabled:opacity-50 transition-colors"
            placeholder="name@example.com"
          />
          {errors.email && (
            <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        
        {systemFeedback && (
          <div className={`p-3 text-xs font-medium border ${
            systemFeedback.type === "success" 
              ? "bg-green-50/50 border-green-200 text-green-700" 
              : "bg-red-50/50 border-red-200 text-red-700"
          }`}>
            {systemFeedback.message}
          </div>
        )}

        
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
        >
          {isPending ? "Processing..." : "Continue"}
        </button>
        
      </form>
    </div>
  );
};

3. Mandatory Component Verification Steps
When generating markup configurations, the Component Builder must execute these validation steps before concluding code generation:

3.1 Aria and Label Mapping Check
Every single <input>, <textarea>, or <select> control element must possess an assigned id that matches the htmlFor property of a corresponding <label> tag. Floating inputs missing accessible text definitions are rejected.

3.2 State Interlocking Control
The code must pass the state control check: when isPending resolves to true, all input tracking fields and buttons inside the target container must receive a disabled assignment to block simultaneous request loops.

4. Component Builder Quality Guardrails
No Half-Rendered Markup: The Designer Agent cannot emit placeholders like <div>... remaining layout here ...</div>. All layouts must be written out completely, detailing layout grids, responsive breaks, and states.

Tailwind Consistency Limit: Every class applied must belong to standard Tailwind CSS structural rules. Arbitrary layout parameters (e.g., h-[43.5px]) or hardcoded hex styling variants (e.g., bg-[#f3f3f3]) are completely prohibited to maintain architectural system uniformity.