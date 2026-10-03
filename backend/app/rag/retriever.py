"""
The single function chat.py calls: retrieve(query) -> list of the top-k
most relevant chunks, each carrying exactly the metadata needed for an
accurate citation (pdf_name, page_number) — never invented, always the
actual page the matched text came from.
"""
from __future__ import annotations

import os
import threading

from .embeddings import embed_query, EmbeddingUnavailableError
from .index_store import load_index

INDEX_DIR = os.getenv("RAG_INDEX_DIR", os.path.join(os.path.dirname(__file__), "..", "..", "knowledge_index"))
MIN_SIMILARITY = float(os.getenv("RAG_MIN_SIMILARITY", "0.25"))  # cosine similarity floor (0-1); below this, treat as "no match" rather than a weak guess

_index = None
_metadata: list = []
_index_lock = threading.Lock()
_loaded = False


class RagUnavailableError(Exception):
    """Raised when there's no built index yet, or the embedding model can't
    be loaded — distinct from 'searched and found nothing relevant'."""


def _ensure_loaded():
    global _index, _metadata, _loaded
    if _loaded:
        return
    with _index_lock:
        if _loaded:
            return
        _index, _metadata = load_index(INDEX_DIR)
        _loaded = True


def is_ready() -> bool:
    """True only if a real index has been built AND has at least one
    chunk. Never true just because the code path exists."""
    _ensure_loaded()
    return _index is not None and len(_metadata) > 0


def retrieve(query: str, top_k: int = 3) -> list[dict]:
    """
    Returns up to top_k chunks as
        {pdf_name, page_number, text, score}
    ordered by relevance, filtered to score >= MIN_SIMILARITY. Returns []
    (not an error) when the index is ready but nothing matches well enough
    — chat.py treats an empty list as "no verified information found",
    which is the correct, honest response, not a bug to work around.

    Raises RagUnavailableError if there's no index yet or the embedding
    model can't be loaded (e.g. no internet on first run) — chat.py catches
    this and falls back to the small built-in knowledge_base.py demo docs,
    so the chatbot still answers something rather than erroring out.
    """
    _ensure_loaded()
    if _index is None or not _metadata:
        raise RagUnavailableError(
            f"No FAISS index found at {INDEX_DIR}. Run `python build_index.py` from backend/ first."
        )

    try:
        query_vec = embed_query(query).reshape(1, -1)
    except EmbeddingUnavailableError as e:
        raise RagUnavailableError(str(e)) from e

    k = min(top_k, len(_metadata))
    scores, indices = _index.search(query_vec, k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        if float(score) < MIN_SIMILARITY:
            continue
        meta = _metadata[idx]
        results.append({
            "pdf_name": meta["pdf_name"],
            "page_number": meta["page_number"],
            "text": meta["text"],
            "score": float(score),
        })
    return results