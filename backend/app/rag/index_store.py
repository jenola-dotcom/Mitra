"""
Persists a FAISS index + its chunk metadata to disk, so the server doesn't
re-embed every PDF on every restart (only `build_index.py` does that, on
demand). Two files are written together and must be read together:
  - faiss.index     (the vectors, via faiss.write_index)
  - metadata.json   (parallel list: which chunk each vector row is)
"""
from __future__ import annotations

import json
import os

import faiss
import numpy as np

from .chunker import Chunk

INDEX_FILENAME = "faiss.index"
METADATA_FILENAME = "metadata.json"


def build_index(chunks: list[Chunk], vectors: np.ndarray) -> "faiss.Index":
    if len(chunks) != vectors.shape[0]:
        raise ValueError(f"chunk/vector count mismatch: {len(chunks)} chunks vs {vectors.shape[0]} vectors")
    dim = vectors.shape[1]
    index = faiss.IndexFlatIP(dim)  # inner product; vectors are L2-normalized => cosine similarity
    index.add(vectors)
    return index


def save_index(index: "faiss.Index", chunks: list[Chunk], index_dir: str) -> None:
    os.makedirs(index_dir, exist_ok=True)
    faiss.write_index(index, os.path.join(index_dir, INDEX_FILENAME))
    metadata = [
        {"id": c.id, "pdf_name": c.pdf_name, "page_number": c.page_number, "text": c.text}
        for c in chunks
    ]
    with open(os.path.join(index_dir, METADATA_FILENAME), "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)


def load_index(index_dir: str):
    """Returns (index, metadata_list) or (None, []) if no index has been
    built yet — callers must treat that as 'RAG not ready', not an error to
    crash on, since a fresh checkout of this project has no index until
    build_index.py is run."""
    index_path = os.path.join(index_dir, INDEX_FILENAME)
    meta_path = os.path.join(index_dir, METADATA_FILENAME)
    if not (os.path.exists(index_path) and os.path.exists(meta_path)):
        return None, []
    index = faiss.read_index(index_path)
    with open(meta_path, encoding="utf-8") as f:
        metadata = json.load(f)
    return index, metadata