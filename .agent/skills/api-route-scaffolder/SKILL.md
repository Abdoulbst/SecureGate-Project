# SKILL.md — API Route Scaffolding & Integration Engine Blueprint

This rule file defines the automated structural generation patterns, validation injection, and dependency integration mechanics for backend route entry points in **SecureGate**. It provides the core workflow blueprint for the **Engineer Agent** when spinning up or modifying API handlers, ensuring that every route is uniformly secure, self-documenting, and resilient to failure.

---

## 1. Scaffold Topology & Architectural Pattern

Every API route built within SecureGate must follow a rigid structure. Combining routes or implementing loose, unvalidated route handlers is strictly banned. Each route must occupy its own directory containing an isolated `route.ts` file.

### Required Directory Structure
src/app/api/
└── [domain]/
└── [feature]/
├── route.ts            # The sole execution file handler
└── route.spec.ts       # Isolated functional test harness

### Route Design Axioms
*   **Verb-Level Isolation:** A single `route.ts` file may only export standard uppercase HTTP verb functions (`GET`, `POST`, `PUT`, `DELETE`). Internal logic partitioning based on query strings or request body flags is forbidden.
*   **Unshared Dependency Context:** Shared runtime states across routes are prohibited. All database instances must be imported explicitly from the centralized global initialization layer (`@/lib/prisma`).

---

## 2. Standardized Route Skeleton Spec

Every generated API route handler must strictly match the following implementation layout. This skeleton guarantees uniform error catching, schema validation, and rate limit verification before touching core system data models.

```typescript
// Location: src/app/api/[domain]/[feature]/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/request";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 1. Explicit Feature Input Validation Schema
const RouteInputSchema = z.object({
  // Define precise parameter constraints here
});

export async function POST(request: NextRequest) {
  try {
    // 2. Local Perimeter Rate-Limiting Check Evaluation
    // Implementation must explicitly verify calling IP prior to processing body
    
    // 3. Payload Extraction and Parsing
    const body = await request.json();
    const result = RouteInputSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Validation Failed", 
          details: result.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // 4. Atomic Database Transaction Execution
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Execute feature logic safely inside isolation bounds here
      return { success: true };
    });

    // 5. Sanitized Client Return Payload
    return NextResponse.json(
      { message: "Operation completed successfully", data: transactionResult },
      { status: 200 }
    );

  } catch (error) {
    // 6. Internal Detail Capture & Sanitized Response Exit
    console.error(`[CRITICAL_API_FAILURE] POST ${request.nextUrl.pathname}:`, error);
    
    return NextResponse.json(
      { error: "An unexpected server error occurred processing this request." },
      { status: 500 }
    );
  }
}

3. Mandatory Integration Checklist
When the orchestration engine triggers an API scaffolding sequence, the execution workflow must fulfill these four automated structural steps before considering the task complete:

3.1 Schema Definition Linking
The route must have a corresponding, dedicated validation schema located either inside the local directory or imported from a centralized validation index. Loose parsing via standard JavaScript objects will cause the build pipeline to reject the code file.

3.2 Secure Error Containment
Raw database engine exceptions (e.g., Prisma unique constraint failures or PostgreSQL connection drops) must never pass through to the client payload layer. They must be intercepted, mapped to explicit error models, and written out to the server-side log layer using a standardized prefix tag format: [API_ERROR_LOG_DOMAIN].

3.3 Transaction Integrity Guard
If the route mutates state across multiple database tables (e.g., marking a verification token as used and changing a user status flag), the logic block must be fully enclosed inside a prisma.$transaction() routine. This guarantees complete rollback capability if a secondary query fails mid-execution.

4. Scaffold Quality Enforcement Laws
No Half-Baked Features Rule: The Engineer Agent is strictly forbidden from writing placeholder response bodies, short-circuited logic branches, or using mock datasets. Every data point generated within the response payload model must tie directly back to an active database entity or system state.

Strict Return Type Declarations: Every route handler function signature must implicitly or explicitly resolve back to a typed Promise<NextResponse> container. Retaining bare object structures or unformatted string responses will trigger a build compilation failure.