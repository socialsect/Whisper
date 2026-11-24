# Whisper

Anonymous employee feedback. A fast, one-question-per-screen survey that writes to a Google Sheet through Google Apps Script. There is no backend to run and no admin login: the sheet is the admin.

## For employees

- Two minutes, one question per screen. Six tap-to-answer ratings (auto-advance), then seven optional written prompts with a Skip button.
- Phone-first, light and dark themes that follow the system.
- Keyboard friendly: press 1 to 5 to rate, Ctrl or Cmd + Enter to continue.

## How anonymity works

- A response is **six ratings, up to seven optional texts and a version string**. There is no timestamp, date, ID, user agent or IP in the payload or the sheet.
- No login, no cookies, no analytics, self-hosted font. Progress lives in `sessionStorage` only and is wiped on submit. The page sends `credentials: omit` and `referrerPolicy: no-referrer`.
- Two-stage storage. `doPost` appends to a private **Inbox** spreadsheet. A trigger at a random time releases the Inbox into the **Responses** spreadsheet only when at least **K** responses are pending (default 5), then reshuffles the whole sheet. There is no fallback below K, so a lone response is never released. Row order and batch order never show arrival order.
- Leadership gets Viewer access to Responses only. Viewers cannot see version history, which would otherwise reveal batch times.
- The script rejects unknown fields, caps submissions per day, and uses a honeypot and a lock.
- Honest limits: the host and Google can still see network traffic, as with any website. The Google account that owns the script can see when requests ran (never what they contained). See `apps-script/README.md`. Leave written answers free of details only you would know.

## Data schema

Both spreadsheets use one row per response and these columns, with question IDs from `src/surveyConfig.js` as headers:

| Columns | Content |
| --- | --- |
| A to F | `clarity_of_role`, `collaboration_team_flow`, `balance_energy`, `leadership_support`, `growth_future`, `wellbeing_at_work`: integer 1 to 5 |
| G to M | `what_works_well`, `what_slowing_down`, `one_change_tomorrow`, `leadership_perspective`, `team_perspective`, `recognition`, `anything_else`: text up to 1000 chars, blank if skipped |
| N | `version`, for example `3.0` |

The request body is `{ "version": "3.0", "pulse": { "<id>": 1-5, ... }, "text": { "<id>": "..." } }`. Nothing else is accepted.

The **Summary** tab in Responses shows the response count, the average and distribution per rating question (with charts), and the written answers grouped per question. It works with zero responses.

## Tech stack

React 19, Vite, Motion, CSS Modules, Geist (self-hosted). Google Sheets plus Apps Script for storage.

## Setup

1. Deploy the script and sheets: follow [`apps-script/README.md`](apps-script/README.md). You end with a web app URL.
2. Frontend:
   ```bash
   npm install
   cp .env.example .env   # set VITE_SHEETS_ENDPOINT to the web app URL
   npm run dev
   ```
3. Production: set `VITE_SHEETS_ENDPOINT` in your host's environment variables (for example Vercel), then deploy. `npm run build` outputs `dist/`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:apps-script` | Tests the Apps Script validator and checks it matches `src/surveyConfig.js` |

## Changing the questions

Edit `src/surveyConfig.js` and `apps-script/Validate.gs` together, run `npm run test:apps-script` (it fails if they differ), then run `setup` again in Apps Script. Old rows keep their old columns, so treat a question change as a new survey.

## Project structure

```
apps-script/        Code.gs, Validate.gs, appsscript.json, tests, setup guide
src/pages/          Landing, survey, thank-you
src/components/     EmployeeShell, ErrorBoundary, shared UI styles
src/surveyConfig.js Question IDs and wording
src/utils/security.js  Text cleanup and rating check
```
