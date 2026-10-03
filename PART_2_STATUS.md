# Part 2 status

## Also fixed this part: registration

- [x] Registration now collects **preferred language** (EN/TA/HI) — previously
      stored in the data model but never asked on the form.
- [x] Registration now collects **designation** for Cooperative Officials, and
      an optional **PACS/cooperative society** for Farmers, so it pre-fills
      when filing a grievance.

## Completed in Part 2

- [x] Firestore grievance data model (`grievances/{id}`) with full field set:
      referenceId, farmerId/name, category, cooperativeSociety, district,
      description, optional attachment, status, assignedOfficialId/name,
      createdAt/updatedAt, and a chronological `statusHistory` array.
- [x] Expanded Firestore security rules (`firebase/firestore.rules`):
      a farmer can only create their own grievance (status must start
      `pending`, unassigned); an official can only update a case assigned to
      them, and only workflow fields; an admin has full read/write for
      assignment and escalation.
- [x] **Complete online grievance workflow, working end-to-end**, in both
      demo mode (`lib/demoGrievance.js`, localStorage) and live Firebase mode
      (`lib/firestoreGrievance.js`) behind one shared interface
      (`lib/grievance.js`) — exactly mirroring how auth already worked.
- [x] Farmer: submit a grievance (category, cooperative society, district,
      description, optional ≤500 KB attachment) → unique reference ID
      (`CC-YYYY-XXXXXX`) → see it in "My Grievances" with live status.
- [x] Official: see only cases assigned to them, open one, add a note, change
      status (Pending → Under Review → In Progress → Resolved / Rejected /
      Escalated), save — persisted with full history.
- [x] Admin: see all grievances, filter (all / unassigned / escalated),
      assign or reassign an official, and also update status/notes directly
      (for escalation handling).
- [x] Reference IDs, timestamps, assigned official, notes, and full
      chronological status history all stored and displayed.
- [x] Farmers see only their own grievances; officials only their assigned
      cases; admins see everything — enforced both in the UI (context
      filtering) and in Firestore rules for live mode.
- [x] Validation (required category/description, note required before saving
      a status update) and loading/error/success states throughout.
- [x] Dashboards (all three roles) now show real, live counts instead of
      placeholder zeros.
- [x] Verified: the mandatory demo works — farmer submits a Madurai loan
      complaint → gets a reference ID → official updates the same case with a
      note and "In Progress" → farmer sees the update, and it survives
      refresh and logout/login (tested via automated logic smoke test; see
      README testing steps for the manual walkthrough).

## Explicitly NOT built yet

- Offline PWA service worker, IndexedDB queue, conflict handling — **Part 3**
- Gemini chatbot, RAG, source citations, chat history, voice — **Part 4**
- Government schemes browser, PMFBY details, PACS finder search — **Part 5**
- Admin user management screens (beyond grievance assignment) — **Part 5**
- FastAPI backend endpoints (folder still scaffolded only) — used from Part 4
  onward for the chatbot; the grievance workflow intentionally talks to
  Firestore directly from the frontend, which is the standard, secure pattern
  for Firebase Authentication + Firestore rules (no backend needed for CRUD
  that security rules already protect).
- End-to-end integration testing, full security review, final README — **Part 6**

## Known limitations of Part 2 as shipped

- Reference IDs are generated client-side; collision probability is
  negligible for a prototype but a production system would enforce
  uniqueness server-side (e.g. a Cloud Function), noted here rather than
  silently assumed safe.
- Attachments are stored as inline base64 (capped at 500 KB) rather than
  uploaded to Firebase Storage — sufficient for a demo grievance with a
  photo/PDF, but not meant for large files.
- In live Firebase mode, officials/admins currently have broad *read* access
  to the grievances collection (filtered client-side to "assigned to me" /
  "all"), rather than a narrower per-document rule — documented in
  `firestore.rules` as a deliberate prototype tradeoff.

## Next part

Say **"DO NEXT PART"** for **Part 3**: offline PWA (service worker caching),
IndexedDB-backed grievance workflow, sync queue with retry/conflict handling,
and the fully offline three-role demo (including refresh and browser restart
with no internet).
