"""
Wraps a multilingual sentence-embedding model so pdf_ingest/chunker/
index_store never need to know which model is in use.

IMPORTANT — this sandbox cannot verify model loading: the model weights are
downloaded from huggingface.co on first use, and this sandbox's network is
restricted to package registries (npm/pypi/github) and cannot reach
huggingface.co. `pip install sentence-transformers` succeeds here (it's on
PyPI), but actually loading a model will fail in THIS sandbox with a
connection error. On your own machine (normal internet access), the first
run downloads the model once (~400 MB for the default below) and caches it
locally (~/.cache/huggingface) — subsequent runs are offline and fast.

Default model: 'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2'
— supports 50+ languages including Hindi, Tamil, Bengali, Marathi, Telugu,
Gujarati, Urdu. Coverage for Kannada, Malayalam, Odia, Assamese, Punjabi is
present but noticeably weaker than for the more widely-resourced languages
above — a real, known limitation of this model, not something to paper
over. If retrieval quality for those languages is poor in testing, the
biggest single improvement is swapping in a stronger Indic-specific model
(e.g. an IndicSBERT / IndicBERT-based sentence encoder) via
EMBEDDING_MODEL in .env — no other code needs to change.
"""
from __future__ import annotations

import os
import threading

import numpy as np

EMBEDDING_MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)

_model = None
_model_lock = threading.Lock()
_load_error: str | None = None


class EmbeddingUnavailableError(Exception):
    """Raised when the embedding model can't be loaded — e.g. no internet
    access on first run (weights not cached yet), or the package isn't
    installed. Callers must treat this as 'RAG unavailable', never as
    'zero results found'."""


def _get_model():
    global _model, _load_error
    if _model is not None:
        return _model
    if _load_error is not None:
        raise EmbeddingUnavailableError(_load_error)
    with _model_lock:
        if _model is not None:
            return _model
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(EMBEDDING_MODEL_NAME)
            return _model
        except Exception as e:  # broad: network error, missing package, corrupt cache, etc.
            _load_error = (
                f"Could not load embedding model '{EMBEDDING_MODEL_NAME}': {e}. "
                "First run needs internet access to download model weights once; "
                "after that they're cached locally and no network is needed."
            )
            raise EmbeddingUnavailableError(_load_error) from e


def embedding_dimension() -> int:
    return _get_model().get_sentence_embedding_dimension()


def embed_texts(texts: list[str]) -> np.ndarray:
    """Returns an (N, D) float32 array of L2-normalized embeddings, so a
    plain inner-product FAISS index behaves as cosine similarity."""
    model = _get_model()
    vectors = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True, show_progress_bar=False)
    return vectors.astype("float32")


def embed_query(text: str) -> np.ndarray:
    return embed_texts([text])[0]