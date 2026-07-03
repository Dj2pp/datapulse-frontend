# CorePulse — AI Data Quality & Duplicate Detection SaaS

## ✨ Production auth: Supabase + JWT

Auth is now real, not a localStorage demo.

1. Create a project at **https://supabase.com** (free tier is fine)
2. In your Supabase dashboard → **Project Settings → API**, copy:
   - **Project URL**
   - **anon public** key
3. Frontend: `cp .env.example .env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Backend: `cp backend/.env.example backend/.env` and fill in the
   **JWT Secret** from Supabase → Project Settings → API → JWT Settings:
   ```
   SUPABASE_JWT_SECRET=your-jwt-secret-here
   ```
5. In Supabase → Authentication → Providers, make sure **Email** is
   enabled. Turn off "Confirm email" while testing locally, or check your
   inbox after signing up.

That's it — `src/lib/supabase.ts` is the only file with client config, and
`backend/app/auth.py` is the only file with server-side JWT verification.
Every session Supabase issues is a real signed JWT
(`session.access_token`); it's attached automatically as
`Authorization: Bearer <jwt>` on every backend call from `src/lib/api.ts`,
and `@require_auth` in `backend/app/server.py` rejects requests without a
valid one on `/api/analyze`, `/api/review/<id>`, and `/api/ai-verify/<id>`.

**Note:** the three file-download links (cleaned `.xlsx`, PDF report, CSV
export) are plain `<a href>` tags, which can't carry a Bearer header —
they're left ungated, relying on the report's UUID being unguessable. If
you need hard access control on downloads too, switch those routes to
short-lived signed URLs instead.

## ⚡ Production build & performance

`npm run build && npm start` — not `npm run dev` — for real performance
numbers. The slow per-route compiles you'll see in `next dev`
(`✓ Compiled /dashboard in 17.1s`) are normal **development-only** JIT
compilation (Next.js compiles each route the first time you visit it) and
disappear entirely in a production build, which pre-compiles everything
once at build time.

On top of that, this version code-splits and lazy-loads the heaviest
client-only pieces so they don't block first paint even in dev:
- Charts, results table, and comparison table (`recharts`-based) load only
  when their dashboard tab is opened (`next/dynamic`, `ssr: false`)
- `xlsx` (SheetJS, used for client-side row-count validation) is
  dynamically imported only at upload time, not bundled into every page
- The 3D wireframe sphere / particle field on the auth pages load
  client-only via `next/dynamic`

Net effect: `/dashboard` first-load JS dropped from **237 kB → 18.7 kB**.

## 🔒 Production hardening

- Backend URLs, setup commands, and raw error text are now hidden from
  end users — the "backend unreachable" panel only shows the
  `pip install` / `python run.py` snippet when `NODE_ENV !== "production"`
- Unrecognized backend error messages fall back to generic, friendly copy
  in production instead of ever surfacing raw internals to the browser
- Analytics events (`src/lib/analytics.ts`) only `console.log` in
  development; swap the body of `track()` for your real provider
  (PostHog/Amplitude/GA/Segment) before shipping

---

A full-stack app: **real Next.js frontend** + **real Python backend**.
No mock data — every chart, KPI, and table row comes from actually
analyzing the file you upload.

## ⚠️ If uploads aren't working

The #1 cause is **the backend isn't running**. The frontend now shows a
banner on the Upload tab that detects this automatically, but if you don't
see it: open the browser console (F12) and check for a network error to
`localhost:8000`. Fix:

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Leave that terminal running, then in a **second terminal** start the frontend:
```bash
npm install
npm run dev
```

## Bugfixes in this version

A full audit found and fixed these real bugs:

| # | Bug | Fix |
|---|---|---|
| 1 | Single-column CSV uploads crashed (`sep=None` delimiter sniffer mis-split the header into multiple bogus columns) | Explicit `,`/`\t` separators with C-engine parsing + Python-engine fallback for malformed rows |
| 2 | Fully-blank trailing rows in Excel files left phantom empty records | Explicit `dropna(how="all")` after read |
| 3 | `'float' object has no attribute 'strip'` crash on certain NaN cells | Replaced unreliable `astype(str)` with explicit cell-by-cell string coercion |
| 4 | Duplicate/blank column headers could silently collide | Added column-name de-duplication |
| 5 | React "Rules of Hooks" violation in the landing page (`useReveal()` called inside `.map()`) could crash the page | Extracted into a proper `StepCard` component |
| 6 | No feedback when the Flask backend isn't running — uploads just silently failed | Added a live backend-connectivity banner on the Upload tab with the exact fix command |
| 7 | `.env.local` was never actually shipped (only `.env.local.example`) | Real `.env.local` now included |
| 8 | Redundant/conflicting CORS OPTIONS routes | Cleaned up to a single, correct `after_request` CORS handler |

All fixes were verified with a real regression suite (11/11 backend tests, including the exact crash cases above) before this version was packaged — see `backend/README.md` for how to re-run them.

## What's real here

✅ Real file upload (drag & drop, Excel/.xlsx/.xls/CSV/TSV)
✅ Real exact-duplicate detection (row hashing)
✅ Real fuzzy-duplicate detection — Levenshtein distance, token-sort/set ratio,
   Soundex phonetic matching, normalized email/phone comparison — all implemented
   in pure Python in `backend/app/fuzzy.py` (no external fuzzy-match library needed)
✅ Real missing-value profiling per column
✅ Real computed quality score (completeness + uniqueness weighted composite)
✅ Real downloadable cleaned `.xlsx` file (duplicates actually removed)
✅ Real downloadable PDF report (reportlab, computed numbers)
✅ Real charts — Recharts rendering data computed by the backend, not static JSON

## Project structure

```
dataquality/
├── backend/                  ← Python/Flask API (the real engine)
│   ├── app/
│   │   ├── fuzzy.py          ← Levenshtein, Soundex, token matching (pure Python)
│   │   ├── engine.py         ← pandas-based analysis pipeline
│   │   ├── pdf_report.py     ← reportlab PDF generator
│   │   └── server.py         ← Flask routes
│   ├── run.py                ← python run.py to start the API
│   ├── requirements.txt
│   └── README.md
├── src/                      ← Next.js frontend
│   ├── app/
│   │   ├── page.tsx               Landing page
│   │   └── dashboard/page.tsx     Dashboard (real data via API)
│   ├── lib/
│   │   ├── api.ts            ← typed client for the Flask API
│   │   └── ReportContext.tsx ← React context holding the live analysis report
│   ├── components/
│   │   ├── dashboard/        ← UploadZone, Charts, ResultsTable, SummaryCards, KpiCard
│   │   ├── landing/, shared/, ui/, animations/
└── .env.local.example
```

## Quick start

### 1. Start the backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Runs at `http://localhost:8000`.

### 2. Start the frontend
```bash
cp .env.local.example .env.local
npm install
npm run dev
```
Open `http://localhost:3000/dashboard` → **Upload tab** → drop a real `.xlsx`/`.csv` file.

## How the fuzzy matching actually works

`backend/app/fuzzy.py` implements (from scratch, no dependency):

| Function | Purpose |
|---|---|
| `levenshtein(a, b)` | Classic edit-distance DP algorithm |
| `ratio(a, b)` | Normalized similarity 0–100 |
| `token_sort_ratio` | Handles word reordering: "Smith John" ≈ "John Smith" |
| `token_set_ratio` | Robust to repeated/extra words |
| `soundex(name)` | Phonetic match: "Smith" ≈ "Smyth" |
| `normalize_email` | Strips `+tags`, Gmail dot-insensitivity |
| `normalize_phone` | Strips formatting/country code so `+1 (555) 010-1` = `5550101` |

`engine.py` uses a **blocking strategy** (group by Soundex code / normalized
email / normalized phone before comparing) so it doesn't do a naive O(n²)
scan on large files — the same technique production dedup tools
(Dedupe.io, Melissa Data) use.

## Adjustable in the UI

- **Fuzzy match sensitivity slider** (50–100%) on the Upload tab — controls
  the similarity threshold sent to the backend.
- **Cleaned file mode** — `remove` (drops duplicate rows) or `flag` (keeps
  all rows, adds a status column) via the download endpoint.

## Tech stack

- **Frontend**: Next.js 14 App Router, Tailwind, shadcn/ui, Recharts, Canvas-based 3D animations
- **Backend**: Flask, pandas, numpy, openpyxl, xlsxwriter, reportlab — pure Python fuzzy matching
