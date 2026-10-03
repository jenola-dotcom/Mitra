# CoopConnect backend (FastAPI)

Powers the `/api/chat` endpoint used by the chatbot (Part 4). Retrieval-
augmented: every question is matched against `app/knowledge_base.py` first;
if `GEMINI_API_KEY` is set, Gemini answers using only that retrieved context
(and says so if the context doesn't cover the question); if not, the
endpoint still answers directly from the retrieved document, labeled
`mode: "demo"`. Either way, **nothing is invented** — this matches the
product brief's "never invent laws/deadlines/eligibility" requirement.

Everything else in the app (auth, grievances, schemes, PACS) talks to
Firestore directly from the frontend and does **not** need this backend
running — only the chatbot does. The frontend chat page also has its own
offline fallback (`frontend/src/lib/offlineFaq.js`) for when this backend
isn't reachable at all.

## Setup

```bash
cd backend
python -m venv venv

# macOS/Linux
source venv/bin/activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1
# Windows (cmd.exe)
venv\Scripts\activate.bat

pip install -r requirements.txt
copy .env.example .env      # Windows
cp .env.example .env         # macOS/Linux
```

Leave `GEMINI_API_KEY` blank in `.env` to run in demo mode (no external
calls, works immediately). To enable live Gemini answers, get a key at
https://aistudio.google.com/app/apikey and paste it into `.env`.

## Run

```bash
uvicorn app.main:app --reload --port 8000
```

Then set `VITE_API_BASE_URL=http://localhost:8000` in `frontend/.env` (see
`frontend/.env.example`) and restart the frontend dev server.

## Verify it's working

```bash
curl http://localhost:8000/api/health
# {"status":"ok","gemini_configured":false}

curl -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"How do I apply for a PACS crop loan?\",\"language\":\"en\"}"
```

You should get back a grounded answer with a `source`, `officialLink`, and
`mode` field (`"demo"` unless you've configured a Gemini key). This exact
request was tested during development and returns a real, grounded answer.

## Extending the knowledge base

Add entries to `app/knowledge_base.py` (and the mirrored
`frontend/src/data/knowledgeBase.js` for the offline fallback to match).
The `retrieve()` function currently does dependency-free keyword scoring —
its signature is the integration point for swapping in real embeddings
+ FAISS/a vector database later, per the original tech-stack brief, without
changing `chat.py`.
