# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Directory Access

**Access to a directory implies access to all recursive contents.**

- When a directory path is accessible (CWD, `additionalDirectories`, or declared in a harness `memory.reads`/`memory.writes`), treat ALL files and subdirectories within it as accessible without asking.
- Do not prompt for permission to read, write, or execute within a subdirectory of an already-accessible parent.
- When running Bash commands that `cd` into subdirectories or reference nested paths, execute directly — no separate permission check per subdirectory.
- This applies to all tools: `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`.

---

## 6. Story & Decision Preservation

**Never delete. Always append.**

- User stories in `plan.json` and the kanban are **permanent records**. When new stories are planned (re-running `/clarify`), append to the existing backlog — never overwrite or remove existing stories regardless of their status.
- ADRs (`docs/adr/`) are immutable once created. If a decision is superseded, create a new ADR that supersedes the old one; do not edit or delete the original.
- Feature decisions in `context/feature-decisions.html` are append-only. Update the `status` field as work progresses; never remove rows.

## 7. API Completeness

**Every API must document failure paths alongside success paths.**

- For every endpoint, document ALL applicable response codes: 200/201 (success), 400 (validation), 401 (unauthenticated), 403 (forbidden), 404 (not found), 409 (conflict), 422 (unprocessable), 500 (server error).
- Every error response must name the specific error code, its trigger condition, and the affected field (where applicable).
- During planning, every user story that involves an API must explicitly call out the failure scenarios in its acceptance criteria — not just the happy path.

## 8. Entity CRUD Completeness

**When an entity is introduced, plan all its operations.**

- Whenever a new data entity is identified during planning or design, automatically consider all CRUD operations: Create, Read (single + list), Update, Delete (soft or hard).
- The API surface for an entity should include: `POST /entities`, `GET /entities`, `GET /entities/:id`, `PUT /entities/:id` (or `PATCH`), `DELETE /entities/:id`.
- Stories may be created for each operation or grouped where appropriate, but no operation may be silently omitted. If an operation is out of scope, record it as DEFERRED in `context/feature-decisions.html` with a reason.

## 9. Frontend Journey Completeness

**When planning a feature area, plan the entire user journey.**

- Authentication area → must include: sign-up, login, logout, forgot-password, reset-password, verify email, edit profile, change password, delete account.
- Any feature that involves user-generated content → must include: create, view, edit, delete flows plus any empty states and error states.
- Onboarding flow → must include: first-run experience, tour/skip, and return-user detection.
- Each screen must account for: loading state, error state, empty state, and the success/populated state.
- If part of a journey is deferred, record it in `context/feature-decisions.html` rather than silently omitting it.

## 10. Future Features Preservation

**Ideas discussed but not built must be recorded, not forgotten.**

- During planning sessions, any feature idea raised and then excluded from the current scope must be recorded in `context/feature-decisions.html` — either as DEFERRED (with a target phase) or REJECTED (with a reason).
- Agents must check `context/feature-decisions.html` before proposing a feature that was previously rejected, to avoid re-proposing ideas the user has already ruled out.
- When a decision is made to include a feature, record the decision date, the story IDs it maps to, and any ADR created for it.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, clarifying questions come before implementation rather than after mistakes, and no planned features or decisions are ever silently lost.
