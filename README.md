# CoopConnect
Multilingual Cooperative Governance & Legal Assistance Chatbot — SIH 2026, Problem Statement 26088 (Ministry of Cooperation / NCCT).

**Status: all 6 planned parts complete.** See [FINAL_STATUS.md](./FINAL_STATUS.md) for exact scope, what's genuinely production-ready vs. prototype-level, and known limitations stated plainly.

This is a hackathon prototype. It runs immediately with **zero setup** in "demo mode" (local browser storage standing in for Firebase + a local knowledge base standing in for a live Gemini key), and upgrades feature-by-feature to "live mode" as you add a Firebase project and a Gemini API key — nothing needs to be rewritten to go from one to the other.

## Project structure

```
coopconnect/
├── README.md                  ← you are here
├── FINAL_STATUS.md            ← full scope, part-by-part, limitations
├── PART_1_STATUS.md / PART_2_STATUS.md   ← earlier milestones (historical)
├── firebase/
│   ├── firebase.json
│   ├── firestore.rules         ← security rules (users + grievances)
│   └── firestore.indexes.json
├── backend/                    ← FastAPI, powers only the chatbot (Part 4)
│   ├── README.md
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py             ← FastAPI app + CORS + health check
│       ├── config.py           ← env var loading
│       ├── chat.py             ← /api/chat: retrieval + Gemini or demo answer
│       └── knowledge_base.py   ← RAG corpus (mirrors frontend's copy)
└── frontend/                   ← React + Vite + Tailwind, installable PWA
    ├── package.json, vite.config.js (PWA plugin), tailwind.config.js
    ├── .env.example
    ├── public/icons/icon.svg
    └── src/
        ├── main.jsx, App.jsx (router), index.css
        ├── lib/
        │   ├── firebase.js              ← Firebase init + offline persistence
        │   ├── demoAuth.js               ← local demo auth (3 seeded accounts)
        │   ├── grievance.js, demoGrievance.js, firestoreGrievance.js
        │   ├── users.js, demoAuth.js (roles), firestoreUsers.js
        │   ├── chatApi.js, chatSessions.js, offlineFaq.js
        │   └── offlineCache.js          ← IndexedDB cache for schemes/PACS/chat
        ├── context/ (AuthContext, LanguageContext, GrievanceContext)
        ├── i18n/translations.js          ← full EN/HI/TA strings
        ├── data/ (knowledgeBase.js, schemes.js, pacsRecords.js)
        ├── constants/grievance.js
        ├── components/ (~20 reusable UI components)
        └── pages/
            ├── Login.jsx, Register.jsx
            ├── dashboards/ (Farmer, Official, Admin)
            ├── farmer/ (Grievances, Chatbot, Schemes, PacsFinder)
            ├── official/Cases.jsx
            └── admin/ (Grievances, Users)
```

## What's implemented, end to end

- **Auth**: one login page, registration with role selection (exactly 3
  roles), preferred language, role-specific fields, persistent sessions,
  logout, protected role-based dashboards. Firebase Auth in live mode, a
  local demo-auth fallback otherwise (clearly labeled in the UI).
- **Grievances**: farmer files (category, society, district, description,
  optional attachment) → reference ID → admin assigns an official → official
  adds notes and updates status → farmer sees the update — fully persisted,
  survives refresh/logout, with a chronological, timestamped history.
  Firestore + security rules in live mode; a local store in demo mode.
- **Offline (PWA)**: installable on Android/desktop/mobile via a real
  service worker (Workbox, through `vite-plugin-pwa`) that precaches the
  app shell so previously-loaded pages open with no network. In live
  Firebase mode, Firestore's own IndexedDB-backed offline persistence
  queues writes made offline and syncs them the moment connectivity
  returns; sync status (`Saved on this device` / `Pending sync` /
  `Synced to cloud`) is shown on every grievance.
- **Chatbot**: multilingual (EN/HI/TA) chat with named sessions, voice input
  (Web Speech API) and voice output (speech synthesis), suggested
  questions, and a small retrieval-augmented backend (`backend/`) that
  answers from a verified sample knowledge base — via live Gemini if you
  provide an API key, or directly from the retrieved document if you don't
  (`mode: "demo"`, always labeled). If the backend itself is unreachable,
  the frontend falls back to the same knowledge base locally
  (`lib/offlineFaq.js`) — the chatbot never fabricates an answer; it says so
  when it doesn't have verified information.
- **Schemes & PMFBY**: browsable sample scheme data (PMFBY, KCC, PACS
  computerization) with eligibility, documents, steps, season, and the
  correct official link — clearly labeled as sample data, since real
  deadlines/eligibility change and must be confirmed on the official site.
- **PACS finder**: search by state/district, seeded for Tamil Nadu →
  Madurai with 5 sample PACS records (address, phone, services);
  structured so adding another state/district is a data change, not a
  code change.
- **Admin**: manage all grievances (assign/reassign officials, escalation
  view), and a user/official directory across all three roles.

## Quick start (Windows)

You only need the **frontend** to see the entire app working in demo mode —
the backend is optional and only powers live Gemini answers in the chatbot.

### 1. Install prerequisites
- [Node.js 18+](https://nodejs.org/) (includes npm) — during install, keep the default "Add to PATH" option checked.
- (Optional, for the chatbot backend) [Python 3.10+](https://www.python.org/downloads/windows/) — during install, **check "Add python.exe to PATH"**.

### 2. Get the project onto your machine
Unzip the project anywhere, e.g. `C:\Users\<you>\Documents\coopconnect`.

### 3. Run the frontend
Open **PowerShell** (Start menu → type `PowerShell`) and run:

```powershell
cd C:\Users\<you>\Documents\coopconnect\frontend
npm install
npm run dev
```

Open the URL it prints — usually **http://localhost:5173** — in your
browser. You're now looking at CoopConnect in demo mode; log in with any of
the three demo accounts shown on the login screen.

> If `npm` is "not recognized": Node wasn't added to PATH. Reinstall Node.js
> and make sure "Add to PATH" is checked, then close and reopen PowerShell.

### 4. (Optional) Run the chatbot backend for live Gemini answers
In a **second** PowerShell window:

```powershell
cd C:\Users\<you>\Documents\coopconnect\backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
```

> If `venv\Scripts\Activate.ps1` gives an "execution policy" error, run
> PowerShell as Administrator once and execute:
> `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then retry.

Open `.env` in Notepad, paste your Gemini API key
(from https://aistudio.google.com/app/apikey) into `GEMINI_API_KEY=`, save,
then:

```powershell
uvicorn app.main:app --reload --port 8000
```

Back in `frontend\.env` (copy from `.env.example` if it doesn't exist yet),
set `VITE_API_BASE_URL=http://localhost:8000`, save, and restart
`npm run dev`. The chatbot will now show **"Live answer"** instead of
**"Demo answer"** on responses it can ground in the knowledge base.

### 5. (Optional) Connect a real Firebase project
Without this, everything already works in demo mode. To go live: create a
Firebase project → enable Authentication (Email/Password) and Firestore →
copy the web app config into `frontend\.env` (see `.env.example`) → deploy
`firebase\firestore.rules` (Firebase Console → Firestore → Rules → paste and
publish, or `firebase deploy --only firestore:rules` with the Firebase CLI).

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Farmer / Cooperative Member | `farmer@demo.coopconnect.in` | `Farmer@123` |
| Cooperative Official | `official@demo.coopconnect.in` | `Official@123` |
| Admin | `admin@demo.coopconnect.in` | `Admin@123` |

## End-to-end test script (the mandatory demo)

1. Log in as **Farmer** → **My Grievances** → file a new grievance
   (category "PACS loan", district "Madurai", society "Madurai East PACS").
   Note the reference ID. Refresh — it's still there.
2. Log out, log in as **Admin** → **All Grievances** → open the case →
   assign it to Priya Ramaswamy (the official demo account).
3. Log out, log in as **Official** → **Assigned Cases** → open the case →
   add a note, set status to "In Progress", save.
4. Log out, log in as **Farmer** again → the same grievance now shows
   "In Progress" with the official's note and timestamp in the timeline.
5. Try all of the above with your Wi-Fi/network disabled after the first
   page load — the app still opens (installed PWA / previously visited tab)
   and the demo-mode grievance flow works identically, since it's
   local-storage-backed either way.
6. Try the chatbot: ask "How do I apply for a PACS crop loan?" — you'll get
   a grounded answer with a source and official link, labeled "Demo answer"
   (or "Live answer" if you've configured Gemini per step 4 above).
7. Switch the language switcher to Tamil and Hindi at any point — the whole
   UI, including the chatbot's replies, follows.

No console errors are expected during any of the above.
