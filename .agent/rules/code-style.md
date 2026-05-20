---
trigger: always_on
---

# code-style.md — TypeScript & Route Mechanics Blueprint

This rule file governs the algorithmic logic, type validation systems, and file execution standards for **SecureGate**. It serves as the primary constraint layer for the **Engineer Agent** inside the Antigravity system, enforcing type safety, preventing code omissions, and ensuring predictable runtime environments.

---

## 1. Code Completeness & Truncation Ban

The Antigravity code engine must output production-ready code with absolute clarity. The engine must follow these strict rules to eliminate execution gaps:

*   **Zero Placeholders:** Code generation outputs must be complete. No usage of comments like `// TODO`, `// ... rest of code`, or `// implement logic here`.
*   **Full Context Files:** When updating an existing file, rewrite and emit the *entire* file with changes cleanly integrated. Partial snippets that force manual splicing are banned.
*   **Defensive Exports:** Every utility module, API endpoint router, and server operation must cleanly export its types and interfaces directly alongside its execution logic.

---

## 2. Strict Type Safety & Validation Rules

SecureGate operates on the principle that the client application layer is fundamentally untrusted. The backend must enforce absolute data boundaries.

### 2.1 The TypeScript Boundary
*   **Explicit Parameters:** Set `"strict": true` in `tsconfig.json`. Every function parameter, class property, and return signature must declare an explicit type.
*   **The Any Ban:** The `any` keyword is banned. If a data type shape is unknown at compile time, use `unknown` and run type guards before interacting with the properties.
*   **Catch-Block Typing:** Exception objects inside `catch` fragments must be parsed using type checks before extracting descriptive text errors:
  ```typescript
  catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected failure occurred";
    // Proceed with secure processing...
  }

  ## 2.2 Server-Side Zod Schemas
Every network entry point must validate incoming request shapes against explicit Zod schemas before executing database queries, processing tokens, or performing password comparisons.

import { z } from "zod";

export const SignUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(50),
  email: z.string().email("A valid email address is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password requires at least one uppercase letter")
    .regex(/[a-z]/, "Password requires at least one lowercase letter")
    .regex(/[0-9]/, "Password requires at least one number")
    .regex(/[^A-Za-z0-9]/, "Password requires at least one special character"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

3. Route Handler Structure & NextAuth Implementation
3.1 NextAuth Authorize Strategy
When initializing NextAuth inside src/app/api/auth/[...nextauth]/route.ts, credentials validation must cleanly isolate matching rules without breaking execution paths.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { LoginSchema } from "@/lib/validations";

const prisma = new PrismaClient();

// Inside CredentialsProvider configuration block:
async authorize(credentials) {
  const parsedFields = LoginSchema.safeParse(credentials);
  
  if (!parsedFields.success) {
    return null;
  }
  
  const { email, password } = parsedFields.data;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !user.password) {
    return null; // Return null to trigger an uninformative credentials error on the frontend
  }

  const passwordsMatch = await bcrypt.compare(password, user.password);
  
  if (!passwordsMatch) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

3.2 Asynchronous Control Laws
Explicit HTTP Methods: Do not mix logic routines inside a single file location. Isolate individual request verbs clearly using explicit export async function POST() declarations.

Database Transaction Protection: When a workflow requires multiple linked mutations (such as validating an activation token and marking a user verified), execute those mutations inside a single prisma.$transaction() block to guarantee atomic database updates.

4. Error Logging Protocols
Internal Detail Capture: Log clear, granular debug trace errors on the server console using native console.error modules to make debugging easier for system operators.

Sanitized Client Exits: Every API response must capture runtime exceptions cleanly and output standardized, generic JSON structures to the network client. Never expose internal stack traces or database engine messages to the network payload.