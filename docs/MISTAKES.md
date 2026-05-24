# MISTAKES.md — Append-Only Error Log

This file is read at **every session start**. Never delete entries. Only append.
Format defined in `CLAUDE.md` Section 2.

If a task matches a logged pattern below, apply the fix immediately — do not repeat the mistake.

---

## Log

## 2026-05-24 — UNIQUE constraint on nullable FK columns silently fails
**Pattern:** `UNIQUE (user_id, listing_type, housing_id, carinderia_id)` on `favorite` does not
prevent duplicate rows when `carinderia_id IS NULL`. PostgreSQL treats NULL as "unknown" in
UNIQUE constraints — two rows with the same `(user_id, listing_type, housing_id, NULL)` are
considered distinct because `NULL ≠ NULL`. The duplicate-favorite acceptance test passed both
INSERTs without error.
**Fix:** Replace the table-level UNIQUE constraint with two partial unique indexes — one per XOR
branch — that filter down to the non-null column only. See DECISIONS.md #15.
**Prevention:** Any UNIQUE constraint that includes a nullable column in a polymorphic (XOR FK)
table must use partial unique indexes instead. Never rely on table-level UNIQUE when one of the
indexed columns can be NULL.

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
