#!/usr/bin/env python3
"""
Builds (or rebuilds) the FAISS index from every PDF in backend/knowledge/.

Run from backend/:
    python build_index.py

Needs internet access the FIRST time it's run (to download the embedding
model, ~400 MB) — after that the model is cached locally and this runs
offline. Safe to re-run any time you add/remove/change a PDF; it always
rebuilds from scratch rather than patching in place, so there's never a
stale mix of old and new chunks.

Prints exactly what it extracted, skipped, and indexed — nothing here is
invented or assumed; a failed/scanned PDF shows up as a reported error, not
a silent gap.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

from app.rag.pdf_ingest import extract_all
from app.rag.chunker import chunk_pages
from app.rag.embeddings import embed_texts, EmbeddingUnavailableError, EMBEDDING_MODEL_NAME
from app.rag.index_store import build_index, save_index

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "knowledge")
INDEX_DIR = os.path.join(os.path.dirname(__file__), "knowledge_index")
REPORT_PATH = os.path.join(INDEX_DIR, "build_report.json")


def main():
    print(f"Scanning {KNOWLEDGE_DIR} ...")
    result = extract_all(KNOWLEDGE_DIR)

    if not result.pages:
        print("\nNo usable text extracted from any PDF. Nothing to index.")
        print("Errors:")
        for e in result.errors:
            print(f"  - {e}")
        if result.errors and "No PDF files found" in result.errors[0]:
            print(f"\nPut at least one .pdf file directly in {KNOWLEDGE_DIR} and re-run.")
        sys.exit(1)

    print(f"Extracted {len(result.pages)} page(s) with text.")
    if result.errors:
        print(f"{len(result.errors)} issue(s) while extracting (reported, not silently skipped):")
        for e in result.errors:
            print(f"  - {e}")

    chunks = chunk_pages(result.pages)
    print(f"\nSplit into {len(chunks)} chunk(s).")

    print(f"\nLoading embedding model '{EMBEDDING_MODEL_NAME}' (downloads on first run)...")
    t0 = time.time()
    try:
        vectors = embed_texts([c.text for c in chunks])
    except EmbeddingUnavailableError as e:
        print(f"\nERROR: {e}")
        print("Check your internet connection (first run only) and that")
        print("`pip install -r requirements.txt` completed successfully.")
        sys.exit(1)
    print(f"Embedded {len(chunks)} chunks in {time.time() - t0:.1f}s.")

    index = build_index(chunks, vectors)
    save_index(index, chunks, INDEX_DIR)

    report = {
        "pdf_files_processed": sorted({c.pdf_name for c in chunks}),
        "pages_extracted": len(result.pages),
        "chunks_indexed": len(chunks),
        "extraction_issues": result.errors,
        "embedding_model": EMBEDDING_MODEL_NAME,
    }
    os.makedirs(INDEX_DIR, exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    print(f"\nDone. Index saved to {INDEX_DIR}/")
    print(f"Report saved to {REPORT_PATH}")
    print(f"\n{len(chunks)} chunks from {len(report['pdf_files_processed'])} PDF(s) are now searchable.")
    print("Restart the backend (uvicorn) so it picks up the new index.")


if __name__ == "__main__":
    main()