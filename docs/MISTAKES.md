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

## 2026-05-25 — Server component + client component duplicate list rendering
**Pattern:** The manage-listing page (`dashboard/[id]/page.tsx`) rendered a static read-only list for rooms, images, visiting hours, and nearby places, then immediately passed the same data as props to a client form component that also rendered the same list with action buttons. Every item appeared twice on screen — once without buttons, once with.
**Fix:** Remove the static list renders from the server component entirely. Let each client form component own the full display (list + actions + add form). The server component only fetches data and passes it as props.
**Prevention:** When a server component passes data to a client component that renders it, the server component must not also render that same data. One owner per display.

---

## 2026-05-25 — Zod flatten object rendered as React child
**Pattern:** API routes return `NextResponse.json({ error: parsed.error.flatten() })` on validation failure. `parsed.error.flatten()` produces `{ formErrors: string[], fieldErrors: Record<string, string[]> }`. Client code did `setError(data.error?.formErrors?.[0] ?? data.error ?? 'fallback')` — when `formErrors[0]` is undefined (error is on a specific field, not the form level), the fallback `data.error` is the full object, not a string. Setting that as React state and rendering it as `{error}` crashes with "Objects are not valid as a React child."
**Fix:** Always extract a string from the error object before setting state: `typeof e === 'string' ? e : e?.formErrors?.[0] ?? Object.values(e?.fieldErrors ?? {})?.[0]?.[0] ?? 'Generic fallback'`.
**Prevention:** Never use `data.error` directly as a React state string when the API returns Zod flatten output. Always destructure to a string first.

---

## 2026-05-25 — HTML input onChange stores string; Zod schema expects number
**Pattern:** Controlled inputs in React always produce string values from `e.target.value`, even for `type="number"` inputs. Storing these directly in state and sending them in a JSON body causes Zod `z.number()` validation to fail with a `fieldErrors` entry (the field error path), which then triggered the object-as-React-child crash above.
**Fix:** Coerce to `Number()` before including numeric fields in the fetch body: `monthly_price: Number(editValues.monthly_price)`.
**Prevention:** Any field validated with `z.number()` must be explicitly coerced with `Number()` before the fetch call when the value originates from a React controlled input.

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
