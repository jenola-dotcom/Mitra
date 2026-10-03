# backend/knowledge/

Put PDF documents here — cooperative acts/bye-laws, PMFBY guidelines,
Ministry of Cooperation scheme documents, financial-literacy material, etc.
Plain files directly in this folder (not subfolders); `build_index.py`
scans this directory non-recursively.

This folder is currently **empty** — there were no PDFs in the uploaded
project. The chatbot works exactly as before (small built-in demo answers)
until you:

1. Add one or more `.pdf` files here.
2. From `backend/`, run `python build_index.py`.
3. Restart the backend.

After that, `/api/chat` answers from these documents first, with accurate
`pdfName`/`pageNumber` citations, and only falls back to the old built-in
demo docs if nothing in these PDFs is relevant to a question.

Re-run `python build_index.py` any time you add, remove, or change a PDF —
it always rebuilds the whole index from scratch, so there's never a stale
mix of old and new content.