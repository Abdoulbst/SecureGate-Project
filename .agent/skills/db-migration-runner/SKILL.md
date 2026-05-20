# SKILL.md — Database Migration Runner Engine Blueprint

This rule file defines the automated execution, validation sequences, and safety guardrails for managing relational database schemas within **SecureGate**. It serves as the primary operational blueprint for the **Architect Agent** when executing schema alterations, handling data shape updates, or generating structural patches via the Prisma engine, ensuring absolute system uptime and preventing data destruction.

---

## 1. Migration Topology & Pipeline Controls

In SecureGate, database mutations follow a strict, immutable pathway. Structural modifications are never applied directly to production environments without passing local environment validation.

### Database Pipeline Lifecycle
[Local Schema Edit] ──► [Local Environment Run] ──► [Deterministic Migration Artifact]
│
▼
[Production Deploy] ◄── [CI Blueprint Match]   ◄── [Type-Safety Validation Check]

### Execution Restrictions
*   **No Out-of-Band Schemas:** Modifying the state of a live table via direct graphical dashboard tools, manual console execution patches, or raw SQL overrides is strictly banned. 
*   **Prisma Client Generation:** Every migration sequence must automatically re-run the Prisma code generation step (`prisma generate`) immediately following a schema patch to keep the TypeScript type definitions in sync.

---

## 2. Standardized Migration Deployment Routine

When the Architect Agent triggers a structural adjustment sequence, the execution workflow must run through this automated script routine. If any step fails to return a clean exit code, the runtime engine must halt operations and reverse the local working directory changes.

Location: ./agents/scripts/migration-pipeline.sh
CHECK_ENVIRONMENT:
Verify DATABASE_URL is assigned, formatted correctly, and points to a valid PostgreSQL target.
If target string is empty or evaluates to an incorrect provider structure, abort migration sequence.

RUN_LOCAL_VALIDATION:
Execute: npx prisma validate
Inspect parsing structures inside prisma/schema.prisma to confirm schema layout definitions.

GENERATE_MIGRATION_PATCH:
Execute: npx prisma migrate dev --name [descriptive_feature_tag] --create-only
Review the generated underlying raw SQL statements inside ./prisma/migrations/ for safety markers.

TEST_MIGRATION_APPLY:
Apply migration artifact locally to confirm constraints: npx prisma migrate dev
Ensure indexes create successfully and relational cascades align perfectly.

ENGINE_REGENERATION:
Execute: npx prisma generate
Rebuild system type declarations to match updated schema.

---

## 3. High-Risk Migration Strategies

To keep SecureGate continuously available, modifications that drop or replace active system constraints must use a multi-step roll-out strategy rather than an immediate schema rewrite.

### 3.1 Field Renaming Workflows
Directly altering a column name drops the original field, causing data loss. The Architect Agent must use this three-step process instead:
1. **Add New Field:** Introduce the new column to the schema definition block as an optional property alongside the old field.
2. **Backfill Execution:** Run a background processing script to duplicate data from the legacy column over to the newly introduced tracking space.
3. **Deprecation Run:** Once data continuity is confirmed, make the new field mandatory and cleanly drop the original legacy column in a subsequent deployment window.

### 3.2 Non-Null Constraint Additions
Adding a required field (`not null`) to an active table will fail if there are pre-existing records. The field must initially be deployed with an explicit default value constraint (e.g., `@default("")`) or as an optional type layer until historical data records are completely updated.

---

## 4. Migration Runner Quality Laws

*   **Destructive Alteration Warnings:** The Architect Agent must explicitly scan for table-drop markers or column-truncation commands within the generated SQL files. If an artifact contains a destructive event, execution must halt until a backup validation step is manually or programmatically confirmed.
*   **The Zero Drift Command:** Local system states must never drift out of sync with production configurations. No migration file may be modified, renamed, or spliced after it has been written to the version control repository. Any further adjustment must occupy its own distinct, sequential migration file block.