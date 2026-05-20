# AGENTS.md — Antigravity Multi-Agent Orchestration & Core Rules Blueprint

This document defines the runtime constraints, communication channels, and boundary definitions for the Antigravity multi-agent orchestration engine used to build **SecureGate**. 

Because SecureGate is an isolated, production-grade identity and access management (IAM) system, any automated modification made by the AI development engine must be tightly controlled. This blueprint prevents configuration drift, accidental security omissions, and unauthorized cross-domain code generation.

---

## 1. System Agent Directory & Rule Mapping

The Antigravity system coordinates four specialized execution roles. Each role is bound to a strict, single-purpose rule file located in `./agents/rules/`. No agent may operate outside its defined file boundaries.

| Agent Identity | Target System Domain | Core Rule File Path | Primary Behavioral Guardrail |
| :--- | :--- | :--- | :--- |
| **Architect Agent** | System Topology & Schemas | `./agents/rules/architecture.md` | Enforce Gall's Law; design strictly incremental relational data models. |
| **Engineer Agent** | TypeScript & Route Mechanics | `./agents/rules/code-style.md` | Emit fully realized production-grade code; zero code truncation or text omissions. |
| **Designer Agent** | UI/UX & Tailwind Hardening | `./agents/rules/design-system.md` | Build flat, zero-bleed form layouts with native loading states and explicit validation markup. |
| **Auditor Agent** | Cryptography & Perimeter Guard | `./agents/rules/security.md` | Mitigate user enumeration, enforce rate-limiting, and eliminate plain text transport patterns. |

---

## 2. Core Execution Domains & File Boundaries

To prevent conflicting modifications during automated code generation, the system maintains strict workspace isolation:

*   **Database & Structural Domain (Architect):** Authorized exclusively for `prisma/schema.prisma`, `package.json` configurations, framework configuration variants (`next.config.js`), and environment variable initialization layouts.
*   **Logical Router & Service Domain (Engineer):** Authorized exclusively for backend file systems inside `src/app/api/`, routing middleware wrappers, server-side cryptographical helper operations, and third-party mailer configurations.
*   **Visual Interface & Form Domain (Designer):** Authorized exclusively for layout structures inside client components, form markup patterns, password strength components, and global Tailwind configurations.
*   **Security Assessment Domain (Auditor):** Authorized to place inline audit notes, verify request parameters, evaluate error response schemas, and run verification protocols across all file scopes without modifying layout properties.

---

## 3. Global Guardrails & System Overrides

The following five baseline laws are hardcoded into the Antigravity supervisor wrapper. If an execution branch violates any of these guardrails, processing will freeze immediately and trigger a system exception.

### 3.1 The Plain Text Ban
Under no circumstances may an agent emit, write, or log an unhashed password string, raw query token, hardcoded API credential, or database password. Any simulation of runtime conditions must rely strictly on environment parameters mapping directly to variables managed inside `.env.local`.

### 3.2 Completeness Mandate
Agents are strictly forbidden from outputting partial structural layouts, placeholder text, or comments such as `// TODO: implement later` or `// ... rest of code`. Every generated component, router file, or database migration pattern must be structurally complete and syntactically sound upon initial emission.

### 3.3 Strict Isolation Rules
An agent can never modify a file system layer outside its active identity bounds. If a UI generation step requires an adjustment to an underlying database entity type definition, the task must be suspended and handed off to the *Architect Agent* to complete a schema step before resuming visual development.

### 3.4 Verification Dependency Chain
The system enforces sequential development according to Gall's Law. Phase 2 mechanics cannot begin until Phase 1 schemas have been actively checked against the database engine via local validation protocols. The system must verify data state persistence before allowing a downstream authentication route to look up user properties.

### 3.5 Context & Frame Preservation
When modifying existing application scopes, agents must parse, preserve, and respect existing file headers, global middleware layers, security properties, and package definitions. Automated generation runs must never clean out, overwrite, or simplify security parameters introduced by parallel development streams.

---

## 4. Multi-Agent Inter-Process Communication (IPC)

When a complex feature bridges multiple system boundaries, agents must log changes and state changes through the execution stream using a structured handoff model.

[System Request] ──► [Architect Agent: Migrates Schema] ──► [Log: Schema Applied]
│
▼
[Auditor Agent: Assesses Security] ◄── [Engineer Agent: Implements API] ◄┘
│
▼
[Log: Endpoint Hardened] ──► [Designer Agent: Connects UI] ──► [Final System Review]

Every state modification log entry must record:
1. **Origin Target:** The exact file path and line block altered.
2. **Security Property Satisfied:** The specific OWASP risk or architectural principle handled (e.g., preventing timing attacks, securing user records from leaks).
3. **Downstream Context Injection:** The exact properties or parameter models passed down to the next agent in line.