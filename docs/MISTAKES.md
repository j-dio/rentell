# MISTAKES.md — Append-Only Error Log

This file is read at **every session start**. Never delete entries. Only append.
Format defined in `CLAUDE.md` Section 2.

If a task matches a logged pattern below, apply the fix immediately — do not repeat the mistake.

---

## Log

*No mistakes logged yet. First entry will appear here once an error is discovered.*

---

## How to add an entry

```
## [YYYY-MM-DD] — [short title]
**Pattern:** What went wrong and why it happens.
**Fix:** What the correct approach is.
**Prevention:** Rule to apply going forward.
```

Example:

```
## 2026-05-23 — Forgot XOR CHECK on Favorite
**Pattern:** Added INSERT logic for Favorite without verifying the XOR CHECK constraint
was already in schema.sql, causing duplicate-target rows to slip through in testing.
**Fix:** Always read db/schema.sql constraints before writing any INSERT query for
Review or Favorite.
**Prevention:** Before touching Review or Favorite in any phase, open SCHEMA.md Section
"Polymorphic tables" and verify the CHECK is present.
```
