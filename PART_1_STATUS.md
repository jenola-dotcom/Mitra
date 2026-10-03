# Part 1 status

## Completed in Part 1

- [x] Project structure (frontend / backend placeholder / firebase config)
- [x] React + Vite + Tailwind CSS frontend foundation, with a distinct design system
      (see `frontend/tailwind.config.js` and `frontend/src/index.css`)
- [x] Firebase configuration (`frontend/src/lib/firebase.js`), reading all keys from
      `.env` / `.env.example`, never hardcoded
- [x] Automatic demo-mode fallback (`frontend/src/lib/demoAuth.js`) so the app runs
      and the three-role demo works with zero external setup
- [x] One login page: email/password login, clearly labeled demo-account quick-fill
- [x] One registration page: role selection (exactly 3 roles), name, email, phone,
      state, district, password + confirm, validation, inline errors
- [x] Persistent sessions (stay logged in across refresh) in both demo and live mode
- [x] Logout, from the sidebar (desktop) and reachable on mobile
- [x] Protected, role-based dashboards and routing (`ProtectedRoute.jsx`) — a
      logged-in user of one role is redirected away from another role's routes,
      not shown an error or another role's data
- [x] Firestore security rules for the `users` profile collection
      (`firebase/firestore.rules`) — a user can read/create/update only their
      own profile, and cannot self-elevate their role
- [x] Full English / Tamil / Hindi translation of navigation, login, register,
      and dashboard shells (`frontend/src/i18n/translations.js`), with a
      persisted language switcher
- [x] Responsive layout: fixed sidebar (desktop), bottom tab bar (mobile),
      visible keyboard focus states, reduced-motion respected
- [x] Base PWA manifest declared (not yet installable offline — that's Part 3)
- [x] README with full install/run/test instructions

## Explicitly NOT built yet (by design, per the phased plan)

Each of these shows a labeled "coming in a later part" screen in the app
rather than being silently faked:

- Grievance submission, review, status workflow, reference IDs — **Part 2**
- FastAPI backend and its APIs — **Part 2** (start)
- Full Firestore data model for grievances, PACS, schemes, documents — **Part 2**
- Offline PWA service worker, IndexedDB sync queue, conflict handling — **Part 3**
- Gemini chatbot, RAG, source citations, chat history, voice — **Part 4**
- Government schemes browser, PMFBY details, PACS finder — **Part 5**
- Admin user/official/document/PACS management screens — **Part 5**
- End-to-end integration testing, full security review, final README — **Part 6**

## Known limitations of Part 1 as shipped

- Demo-mode authentication (`demoAuth.js`) is explicitly **not** production-secure;
  it exists purely so the app is instantly runnable without a Firebase project.
  This is stated in the UI (a badge on the login screen) and in the README, not
  hidden.
- In **live** Firebase mode, the three demo accounts listed in the README don't
  exist until you register them once each (a seed script arrives in Part 2).
- PWA installability and offline behavior are **not** implemented yet — the
  manifest is declared, but there's no service worker registered yet. Part 3
  covers this fully per the brief's mandatory offline requirements.
- No backend exists yet; nothing in the frontend calls one.

## Next part

Say **"DO NEXT PART"** to proceed with **Part 2**: Firestore data models,
expanded security rules, FastAPI backend, and the complete online grievance
workflow (farmer submits → official updates → farmer sees the update, with
persistence, timestamps, and status history) — matching the brief's
mandatory grievance demo.
