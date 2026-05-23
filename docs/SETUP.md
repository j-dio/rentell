# SETUP.md — Team Onboarding Guide

Getting all 5 team members running in under 30 minutes.
**No Docker. No local Postgres install required.**

---

## Prerequisites (install once per machine)

| Tool | Purpose | Download |
|------|---------|----------|
| Node.js 20+ | Run the app | https://nodejs.org (choose LTS) |
| Git | Clone the repo | https://git-scm.com |
| DBeaver Community | Browse the shared Neon database | https://dbeaver.io |
| VS Code *(recommended)* | Code editor | https://code.visualstudio.com |

Verify Node is installed: open a terminal and run `node -v`. You should see `v20.x.x` or higher.

---

## Step 1 — Clone the repository

```bash
git clone <repo-url>
cd rentell
```

Replace `<repo-url>` with the GitHub link shared by your team lead.

---

## Step 2 — Install dependencies

```bash
npm install
```

This installs everything listed in `package.json` (Next.js, postgres.js, bcryptjs, jose, zod, Tailwind, shadcn/ui, etc.).

---

## Step 3 — Set up environment variables

Create a file named `.env.local` in the project root:

```
DATABASE_URL=<paste the Neon connection string here>
SESSION_SECRET=<paste the shared secret here>
```

**Get these values from your team lead** via a secure channel (WhatsApp DM, in person — not GitHub).

> `.env.local` is in `.gitignore` — it will never be committed. Keep it private.

The file should look like this (with real values filled in):

```
DATABASE_URL=postgresql://rentell_owner:xxxx@ep-xxx.neon.tech/rentell?sslmode=require
SESSION_SECRET=a-long-random-string-at-least-32-characters
```

---

## Step 4 — Run the development server

```bash
npm run dev
```

Open your browser at **http://localhost:3000**. You should see the app.

If you see a database error, double-check your `DATABASE_URL` in `.env.local`.

---

## Step 5 — Connect DBeaver to Neon

DBeaver lets you browse tables, run SQL, and inspect the schema visually — useful for everyone, especially non-technical members.

1. Open DBeaver.
2. Click **New Database Connection** (the plug icon in the toolbar).
3. Select **PostgreSQL** → click Next.
4. Fill in the connection details:
   - **Host:** `ep-xxx.neon.tech` *(from your DATABASE_URL, the part after `@` and before `/`)*
   - **Port:** `5432`
   - **Database:** `rentell` *(or whatever the DB name is in your URL)*
   - **Username:** from your URL
   - **Password:** from your URL
5. Check **SSL → Require SSL**.
6. Click **Test Connection** — should say "Connected".
7. Click Finish.

You can now see all tables under **Database → Schemas → public → Tables**.

**Shortcut:** Paste your full `DATABASE_URL` into DBeaver's JDBC URL field directly and it will parse the connection details automatically.

---

## Step 6 — Run the database schema (first time only)

The team lead or a technical member should do this once to create all tables in Neon.

**Option A — DBeaver:**
1. In DBeaver, open a new SQL script (Ctrl+]) or right-click the database → SQL Editor.
2. Open `db/schema.sql` from the project, copy its contents, paste into DBeaver, and run (F5 or the Execute button).
3. Then do the same for `db/seed.sql`.

**Option B — terminal:**
```bash
# Requires psql installed locally. If you don't have it, use Option A.
psql $DATABASE_URL -f db/schema.sql
psql $DATABASE_URL -f db/seed.sql
```

After running, refresh DBeaver — you should see all 11 tables under public.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `npm install` fails | Make sure Node 20+ is installed: `node -v` |
| `npm run dev` shows a DB error | Check `.env.local` — `DATABASE_URL` is likely missing or wrong |
| DBeaver can't connect | Enable SSL (Require) in connection settings; double-check host/user/password from the URL |
| Port 3000 already in use | Run `npm run dev -- -p 3001` to use a different port |
| Tables don't exist | Run `db/schema.sql` in DBeaver (Step 6) |
| Changes not reflecting | Hard-refresh the browser (Ctrl+Shift+R); or restart `npm run dev` |

---

## Daily workflow

```bash
# Before starting work each day
git pull                  # get latest changes from teammates
npm install               # in case new packages were added
npm run dev               # start the dev server
```

```bash
# Before pushing your work
git status                # see what you changed
git add <specific files>  # stage your changes (not git add .)
git commit -m "feat: describe what you built"
git push
```

---

## Key files to know

| File | What it does |
|------|-------------|
| `CLAUDE.md` | Rules for working with Claude Code on this project |
| `STACK.md` | Tech choices and why |
| `PRD.md` | What we're building and what's out of scope |
| `PHASES.md` | Build order — check here before starting any task |
| `SCHEMA.md` | Every table, column, and constraint |
| `DECISIONS.md` | Why architectural choices were made |
| `db/schema.sql` | DDL — creates all tables in Neon |
| `db/seed.sql` | Sample data for development |
| `lib/db.ts` | The shared Postgres connection — import `sql` from here |
| `.env.local` | Your local secrets — never commit this |
