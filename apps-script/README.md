# Whisper intake (Google Apps Script)

Receives anonymous survey submissions and releases them to a Google Sheet in shuffled batches.

```
Browser --POST--> Apps Script doPost --> Inbox sheet (private) --flush when >= K--> Responses sheet (Viewer access)
```

## Anonymity rules this code enforces

- A stored row is 6 ratings (1 to 5), 7 optional texts (max 1000 chars) and a version string. Nothing else: no time, date, ID, user agent or IP. The script never calls `Session.getActiveUser` or `getEffectiveUser`, and never logs request contents.
- Unknown fields are rejected. A filled honeypot field is accepted silently and never stored.
- `doPost` only appends to the **Inbox**. Responses are released by `flush_`, and only when at least **K** rows are pending (default 5, minimum 3). There is no timer fallback below K, so a lone response is never released.
- Each flush merges the batch into Responses and reshuffles the **whole** sheet, so neither row order nor batch order shows arrival order.
- The flush trigger re-schedules itself at a random delay of 1 to 6 hours, so batch times follow no pattern.
- Spam: strict validation, `LockService`, a global cap on accepted rows per UTC day (default 300, kept in cache so no date is persisted).
- Text columns are formatted as plain text, so a response like `=IMPORTXML(...)` cannot run as a formula.

## Setup

Use a **dedicated normal Google account** (Gmail or Workspace), not a personal one and not a GCP service account. Apps Script web apps cannot run as GCP service accounts. This account owns the script and both spreadsheets. Turn on 2-step verification.

1. Signed in as that account, create two spreadsheets: **Whisper Inbox** and **Whisper Responses**. Copy each ID from its URL (`docs.google.com/spreadsheets/d/<ID>/edit`).
2. Go to [script.google.com](https://script.google.com), create a **standalone** project named "Whisper intake".
3. Add two script files named `Code` and `Validate`, and paste in `Code.gs` and `Validate.gs` from this folder.
4. Project Settings, tick "Show appsscript.json manifest file in editor". Replace its contents with `appsscript.json` from this folder.
5. Project Settings, Script Properties, add:
   - `INBOX_ID` = the Inbox spreadsheet ID
   - `RESPONSES_ID` = the Responses spreadsheet ID
   - `K` = minimum batch size (optional, default 5, values below 3 are ignored)
   - `DAILY_CAP` = max accepted submissions per UTC day (optional, default 300)
6. In the editor, select `setup` and click Run. Approve the permissions. It writes the headers, builds the **Summary** tab (formulas and charts, safe with 0 responses) and arms the first flush trigger. Re-run it any time to rebuild Summary or re-arm the trigger. It is safe to repeat.
7. Deploy, New deployment, type **Web app**. Execute as **Me**. Who has access **Anyone**. Copy the `/exec` URL.
8. Set `VITE_SHEETS_ENDPOINT` to that URL in the frontend (`.env` locally, Vercel env vars in production).
9. Share **Whisper Responses** with leadership as **Viewer**. In the Share dialog, settings gear, turn off download, print and copy for viewers. Viewers cannot see version history; only editors and the owner can. Do **not** share the Inbox with anyone.

To change code later: edit, then Deploy, Manage deployments, pencil icon, Version: New version. The URL stays the same.

## Operating notes

- `flushNow` (run from the editor) flushes immediately but **refuses below K**, exactly like the trigger.
- The Triggers page should always show one `flushTick` trigger. If it is missing, run `setup` again.
- Changing the questions: update `src/surveyConfig.js` and `Validate.gs` together, then run `npm run test:apps-script`, which fails if they differ, then run `setup` again. Old rows keep their old columns, so treat a question change as a new survey.
- K trade-off: a higher K protects small teams better but delays results. With K = 5 and about 10 responses a week, expect the first batch after roughly half the team has replied.

## What the account owner can still see

Be honest with the team about these. They are visible only to the service account owner, never to Viewers:

- The Inbox's version history shows when rows arrived. Nobody should open it.
- The Apps Script Executions page lists when `doPost` ran, with no contents. `exceptionLogging` is off.
- Google Workspace admins can see audit logs for the account.

So the person holding this account must be trusted not to correlate those times with who was online. Keep the account's credentials off personal devices where possible.

## Tests

```
npm run test:apps-script
```

Covers the pure validator: valid payload, extra field, rating 0 and 6, text too long, filled honeypot, bad JSON, and drift from `src/surveyConfig.js`.
