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

## 2026-05-27 — Price range stored backwards (min > max) with no validation
**Pattern:** `monthly_price_min` and `monthly_price_max` were each validated independently with `z.number().positive()` in the Zod schemas for the POST and PUT housing routes. There was no cross-field `.refine()` check. The creation form also performed no client-side comparison before submission. A host could enter a higher value for min than max and the data was saved to the database without rejection, producing displays like "₱20,000 – ₱10,000".
**Fix:** (1) Add a client-side guard in the form's `handleSubmit` that returns early with a user-visible error message if `priceMin > priceMax`. (2) Add `.refine()` on the Zod object in both the POST (`route.ts`) and PUT (`[id]/route.ts`) API schemas that rejects payloads where both values are present and min > max.
**Prevention:** Any pair of fields that encode a range (`_min` / `_max`, `_start` / `_end`, etc.) must have a cross-field Zod `.refine()` constraint at the API layer AND a matching client-side guard before the fetch call. Never rely on field-level validation alone for ordering relationships.

---

## 2026-05-27 — Description whitespace preserved, expanding the listing page
**Pattern:** The `description` textarea was submitted raw — `(fd.get('description') as string) || null` — with no `.trim()`. The Zod schemas (`z.string().nullable().optional()`) also performed no trimming. The listing page renders description with `whitespace-pre-line`, which preserves every trailing newline, making the "About" section grow visually with empty space.
**Fix:** Add `.trim()` to the form assignment (`(fd.get('description') as string).trim() || null`) and add `.trim()` to the Zod schema in both the POST and PUT routes (`z.string().trim().nullable().optional()`). The chained `.trim()` before `.nullable()` is valid in Zod and runs before the null check.
**Prevention:** Any `<textarea>` or free-text `<input>` value must be `.trim()`-ed before inclusion in the fetch body. Any string field in a Zod schema that feeds a displayed block (`whitespace-pre-line`, `whitespace-pre-wrap`) must have `.trim()` in the schema.

---

## 2026-05-30 — SELECT-then-INSERT race condition in getOrCreate patterns
**Pattern:** `getOrCreateConversation` (and any similar upsert helper) used a SELECT to check for an existing row, then a separate INSERT if none was found. Two concurrent requests that both pass the SELECT before either INSERT commits both attempt the INSERT — the second hits the UNIQUE constraint and throws an unhandled DB error, crashing the route with a 500.
**Fix:** Replace the two-step SELECT + INSERT with an atomic `INSERT ... ON CONFLICT DO NOTHING RETURNING ...` followed by a single fallback SELECT when `RETURNING` is empty (conflict occurred). This makes the entire operation a single round-trip with no race window.
**Prevention:** Any helper function that follows the "check then insert" pattern (`getOrCreate`, `findOrCreate`, `upsert`) must use `ON CONFLICT` for atomicity. Never rely on an application-level SELECT to prevent constraint violations under concurrent load.

---

## 2026-05-30 — Parallel data fetch before authorization check leaks DB data to server memory
**Pattern:** `Promise.all([getConversationById(...), getMessagesByConversation(...)])` ran both queries concurrently. `getMessagesByConversation` had no participant check and executed before the authorization result of `getConversationById` was known. If the user was not a participant, `notFound()` was called correctly — but the full message history had already been fetched from the DB and held in server memory, violating least-privilege data access.
**Fix:** Sequence the authorization query first (`const conversation = await getConversationById(...)`), check the result (`if (!conversation) notFound()`), then fetch the data that requires authorization (`const messages = await getMessagesByConversation(...)`). Use `Promise.all` only when all parallel queries are equally authorized.
**Prevention:** Never include data-fetching queries in a `Promise.all` if those queries return sensitive data that requires an authorization check from a sibling query in the same batch. Auth checks must be sequenced before the data they protect.

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
