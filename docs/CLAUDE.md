# CLAUDE.md — AI Assistant Conventions for RenTell

This file governs how Claude Code assists on this project.
**User instructions always take precedence** over anything written here.

---

## 1. One-File-One-Turn Rule

**Rule:** Create or edit exactly one file per conversation turn. Stop after that file and wait for explicit approval before touching the next.

**Rationale — Learning-first:** Each file change is a contained, reviewable unit. The team needs to read and understand each change before it's built upon. A pile of simultaneous edits defeats that goal.

**Rationale — Review-first:** This is a graded CMSC 127 project. Every SQL schema, constraint, and trigger matters. One file at a time forces a checkpoint where the team can catch mistakes before they propagate.

---

## 2. Mandatory Mistake Log

Every error Claude makes — wrong schema field, missed constraint, incorrect assumption — **must be logged in `MISTAKES.md`** before moving to the next task.

**Log format (append-only):**

```
## [DATE] — [short title]
**Pattern:** What went wrong and why it happens.
**Fix:** What the correct approach is.
**Prevention:** Rule to apply going forward.
```

**At every session start:** Read `MISTAKES.md` before doing anything. If a task matches a logged pattern, apply the fix immediately — never repeat a logged mistake.

---

## 3. Context Hygiene

### Read at session start (in this order)

1. `CLAUDE.md` — these conventions (you are reading it now)
2. `MISTAKES.md` — logged errors to avoid repeating
3. `STACK.md` — locked tech decisions (do not re-debate them)
4. `PRD.md` — feature scope and v1 non-goals
5. `PHASES.md` — which phase is active and what its acceptance criteria are 
6. `ERD/Rentell Physical ERD (3).json` — source of truth for all schema work

### Update after each completed phase

- Mark the phase `[x] Done` in `PHASES.md`.
- Add any new mistakes discovered to `MISTAKES.md`.
- If the phase produced a schema change not in the ERD, add a note to `DECISIONS.md`.

### Do NOT read speculatively

Do not open files not relevant to the current task. Keep context tight.

---

## 4. Prompt Conventions

When writing prompts for this project, always include:

1. **Scope** — name the exact file or feature being changed. "Update the Review table validation" not "fix validation."
2. **ERD anchor** — cite the ERD entity/relationship involved. "See ERD: `Review`, fields `listing_type`, `housing_id`, `carinderia_id`."
3. **Current phase** — state which PHASES.md phase you are working in. "We are in Phase 2 (Auth)."
4. **Constraint callout** — if DB constraints are involved, state them explicitly. "Add CHECK (rating BETWEEN 1 AND 5) to `Review`."

**Example of a well-scoped prompt:**

> "Phase 3 (Core Directory). Add the Housing listing page. ERD: `Housing` entity, all fields. Display name, housing_type, address, monthly_price_min/max, proximity_to_campus_km, contact info. No map — v1 non-goal per PRD."

---

## 5. Forbidden Behaviors

Claude **must not** do any of the following without an explicit user instruction to do so:

| Forbidden                              | Reason                                                         |
| -------------------------------------- | -------------------------------------------------------------- |
| Edit more than one file per turn       | Violates the one-file-one-turn rule                            |
| Refactor code that was not asked about | Scope creep derails focused review                             |
| Add features not in the current phase  | PHASES.md defines what is in scope                             |
| Invent schema not in the ERD           | Undocumented deviations confuse the team                       |
| Silently resolve an ERD ambiguity      | Flag it first, get a decision, then document in `DECISIONS.md` |
| Skip writing a change summary          | The summary is the handoff for the next reviewer               |
| Re-debate locked stack decisions       | They are in `STACK.md`; re-opening wastes the 5-day timeline   |
| Add `console.log` to production code   | Use proper logging                                             |

---

## 6. Change Summary Format

After every file change, output a summary in this exact structure:

```
### Change summary — [filename]
- **What:** [1-sentence description of what was created/changed]
- **Why:** [1-sentence rationale]
- **ERD impact:** [which entities/relationships are involved, or "none"]
- **Constraints introduced:** [any CHECK, FK, UNIQUE, trigger, or DEFAULT, or "none"]
- **Verify by:** [how to confirm the change is correct — read the file, run a query, check the UI, etc.]
```

Do not proceed to the next file until the user gives explicit approval after reading this summary.

---

## 7. Key Project References

| File                  | Purpose                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `MISTAKES.md`         | Append-only error log — read at every session start                                         |
| `STACK.md`            | Locked technology decisions                                                                 |
| `PRD.md`              | Feature scope, non-goals, success metrics                                                   |
| `PHASES.md`           | Phased build tracker — source of truth for what is in scope right now                       |
| `SCHEMA.md`           | Canonical data dictionary and DDL intent (single source of truth for columns + constraints) |
| `DECISIONS.md`        | Lightweight ADR log for schema deviations and architectural choices                         |
| `SETUP.md`            | Onboarding for all 5 team members (env vars, Neon connection, GUI client)                   |
| `ERD/rentell.dbml`    | ERD source of truth — paste into dbdiagram.io to render the physical diagram                |

---

## 8. MCP Servers & CLI Tools Worth Installing

These integrations let Claude interact directly with the project's tools — running queries, managing
diagrams, checking deployments — instead of just generating code for you to copy-paste.
Install whichever is relevant to the current phase.

---

### Neon MCP *(highest priority — install before Phase 1)*

Lets Claude run SQL directly against your Neon database: apply migrations, run sanity-check
inserts, inspect table structure, and verify constraints — all from the conversation.

**Why it matters for this project:** Phase 1 acceptance criteria require constraint testing
(reject bad rating, bad XOR FK, duplicate favorite, etc.). With Neon MCP, Claude can run those
tests itself instead of asking you to copy-paste SQL into DBeaver.

**Docs:** https://neon.tech/docs/ai/neon-mcp-server

**Quick setup** (run in terminal, then restart Claude Code):
```bash
# Install the Neon MCP server globally
npm install -g @neondatabase/mcp-server-neon

# Then add to Claude Code's MCP config (~/.claude/mcp.json or via Settings > MCP):
# {
#   "mcpServers": {
#     "neon": {
#       "command": "npx",
#       "args": ["-y", "@neondatabase/mcp-server-neon", "start"],
#       "env": { "DATABASE_URL": "<your Neon connection string>" }
#     }
#   }
# }
```

---

### Lucidchart MCP *(already available — just needs activation)*

Claude already has the Lucidchart MCP tools loaded in this environment. They allow programmatic
creation and editing of diagrams — Claude can build or update the physical ERD diagram directly
in Lucidchart without manual drag-and-drop.

**Why it matters:** Once the DBML is finalized, Claude can use Lucidchart MCP to generate the
physical ERD diagram programmatically from the schema, saving the team the manual layout work.

**To use:** Just ask — e.g. "Use Lucidchart MCP to create the physical ERD from rentell.dbml."
No extra installation needed; the tools are already connected.

**Docs (if you need to re-authenticate):** https://lucid.co/developers/mcp

---

### Vercel CLI *(install before deployment)*

Lets Claude deploy the Next.js app, inspect environment variables, and check build logs from
the conversation.

**Why it matters:** Neon's `DATABASE_URL` needs to be added as a Vercel environment variable.
With Vercel CLI configured, Claude can verify the deployment and env setup instead of you
navigating the dashboard manually.

**Docs:** https://vercel.com/docs/cli

```bash
npm install -g vercel
vercel login   # run this yourself — opens browser for auth
```

---

### shadcn CLI *(available now via npx — no install needed)*

Already works via `npx shadcn@latest add <component>`. Claude can invoke this directly to
scaffold components (Button, Card, Form, Dialog, etc.) into the project without copying from docs.

**No setup required.** Claude will use `npx shadcn@latest add` as needed during UI phases.

---

### When to prompt Claude to use these

| Task | Tool |
|------|------|
| Run DDL / verify constraints / seed data | Neon MCP |
| Update or generate the ERD diagram | Lucidchart MCP |
| Deploy app / set env vars on Vercel | Vercel CLI |
| Add a new shadcn/ui component | shadcn CLI (npx) |
