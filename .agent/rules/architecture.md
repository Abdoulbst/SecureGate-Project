---
trigger: always_on
---

# architecture.md — System Topology & Database Schema Blueprint

This rule file governs the structural blueprint, folder organization, physical file layout, and relational database migrations for **SecureGate**. It serves as the primary constraint layer for the **Architect Agent** inside the Antigravity system, enforcing structural integrity and ensuring the codebase adheres strictly to Gall's Law.

---

## 1. System Topology & Framework Design

SecureGate is architected as an isolated identity layer utilizing Next.js 14 with the App Router. The layout separates logical execution scopes into distinct route groups to clear up mental mapping and protect network boundaries.

src/
├── app/
│   ├── (auth)/                # Unauthenticated entry paths
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/           # Token-authenticated route scope
│   │   └── dashboard/
│   ├── api/                   # Isolated backend communication routes
│   │   └── auth/
│   ├── verify-email/          # Out-of-band verification route handlers
│   └── reset-password/         # Out-of-band credential recovery routes
├── components/                # Modular visual structures
├── lib/                       # Global shared utilities and DB clients
└── middleware.ts              # Edge-level route protection filter

### Framework Rules
*   **Next.js 14 App Router:** Every layout and route must use the App Router standard.
*   **Static vs. Dynamic Scope:** Keep the marketing and public access points separate from the core session engine to avoid mixed routing contexts.
*   **Absolute Paths:** All components, hooks, and utilities must be imported using absolute path aliases mapping back to `@/*` (e.g., `@/lib/prisma`).

---

## 2. Database Layer & Schema Rules

The database layer utilizes **PostgreSQL** managed through the **Prisma ORM**. To adhere to Gall's Law, the schema model must remain lean, highly indexable, and explicit about relational actions.

### Schema Modeling Guidelines
*   **Id Generation:** Every table record identifier must utilize high-entropy, unpredictable string representations (CUID or UUID). Integer auto-increment parameters are strictly banned to prevent database profiling exploits.
*   **Strict Relational Constraints:** Every token-based relationship must feature explicit relational definitions mapping cascading deletions (`onDelete: Cascade`) back to the parent `User` record.
*   **Data Minimization:** No fields may exist in the data model unless they explicitly serve active verification or session states.

---

## 3. Production Prisma Schema Spec

The production database definition file must match this model block exactly inside `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                 String              @id @default(cuid())
  name               String
  email              String              @unique
  password           String              // Explicitly stores the 60-character bcrypt hash sequence
  emailVerified      DateTime?           // Null means unverified, DateTime marks activation time
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  verificationTokens VerificationToken[]
  passwordResets     PasswordResetToken[]

  @@index([email])
}

model VerificationToken {
  id         String   @id @default(cuid())
  identifier String   // Maps directly to the target user's email address
  token      String   @unique // Cryptographically secure pseudo-random hash token string
  expires    DateTime // Explicit 15-minute verification lifetime deadline
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
}

model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String   // Maps directly to the target user's email address
  token     String   @unique // Cryptographically secure pseudo-random recovery hash token string
  expires   DateTime // Explicit 1-hour lifecycle deadline
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
}

4. Migration & State Management Guardrails
When modifying system topology or running migrations under the Antigravity automation framework, the Architect Agent must abide by these hard database laws:

Pre-Flight Environment Checks: Never trigger a migration routine unless the database connection string validation passes. If DATABASE_URL is unassigned or points to a non-PostgreSQL adapter string, block execution immediately.

Deterministic State Migration: Migrations must be run and captured through the Prisma CLI (prisma migrate dev). Direct manual database overrides using raw SQL command scripts or external visual editors are strictly banned.

The Law of Leaky Abstractions Test: When applying schema updates, the agent must check that generated TypeScript types mirror actual schema structures perfectly. If database-level defaults diverge from application validation types, execution halts until types are unified.