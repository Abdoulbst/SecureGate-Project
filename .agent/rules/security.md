---
trigger: always_on
---

# security.md — Cryptography & Perimeter Guard Blueprint

This rule file governs the defensive security posture, cryptographic operations, session protection layers, and perimeter defensive mechanisms for **SecureGate**. It serves as the primary constraint layer for the **Auditor Agent** inside the Antigravity system, enforcing rigorous data isolation and eliminating common vector vulnerabilities.

---

## 1. Cryptographic Configuration & Hashing Standards

All user credentials and ephemeral verification tokens must be handled using industry-standard cryptographic primitives. No plain text representations may ever persist past initial payload parse cycles.

### 1.1 Password Hashing Strategy
*   **Algorithm:** **bcryptjs** with an explicit work factor parameter.
*   **Work Factor Cost:** Exactly `12` rounds (`saltRounds = 12`). Lower iterations are rejected as insecure; higher levels are blocked to protect CPU resources from server-side DoS exploits.
*   **Handling Restriction:** Plain text password variables must be wiped from active memory scopes immediately following validation or hashing.

### 1.2 Ephemeral Token Generation
*   **Mechanism:** Secure, cryptographically random hexadecimal strings generated using the native Node.js `crypto` module.
*   **Entropy Standard:** Minimum of 32 bytes of random entropy per token string generation instance.
*   **Code Example:**
  ```typescript
  import crypto from "crypto";

  export function generateSecureToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  2. Perimeter Guard & Authentication Controls
SecureGate must actively defend its edge entry routes from common web exploitation methods.

2.1 User Enumeration Defenses
Authentication API routing engines must protect account existence status information from outside analysis.

Uniform Server Latency: Registration, login, and recovery execution loops must execute in relatively uniform timelines, regardless of whether the submitted user record exists.

Generic Response Messaging: If a password reset request is issued, the API must return a success response string to the client even if the target email is missing from the database.

2.2 Strict Rate Limiting Configurations
To mitigate high-frequency automated brute-force attacks, specialized connection rate limits must be applied across all authentication routes using an in-memory bucket or Redis tier.
- Target Route Scope -	Action -	Maximum Request Window Bounds:
- src/app/api/auth/	- Single IP Identifier -	Max 5 verification attempts per 15-minute sliding index 
- /reset-password	- Single Account ID -	Max 3 delivery attempts per 1-hour sliding index

2.3 Comprehensive Session Cookies Configuration
NextAuth session tracking cookies must feature defensive flag configurations inside product layers to limit cross-site script execution access.

httpOnly: true (Blocks cross-site scripts from pulling session identifier strings from browser memory targets).

secure: true (Forces client transport pipelines to drop connection attempts over unencrypted HTTP pathways).

sameSite: "lax" (Mitigates Cross-Site Request Forgery exploits across external domains).

3. Middleware Edge Protection Layout
Route filtering rules must reside within an isolated edge middleware script to inspect connection properties before exposing system views.

// Location: src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  // 1. Identify destination properties
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // 2. Redirect active sessions away from registration landing pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Block unauthenticated access to the shell environment
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};

4. Auditor Enforcement Mandates
Token Expiry Rigidness: Verification tokens must feature an explicit life-window column constraint set to 15 minutes max. Password recovery links must expire within 1 hour.

Safe Execution Rejection: If any environment scope is missing NEXTAUTH_SECRET or DATABASE_URL runtime checks during build compilation loops, the pipeline must fail immediately.