"""
Splits per-page text into overlapping chunks small enough for the
embedding model, while keeping every chunk traceable to exactly one
(pdf_name, page_number) — this is what makes citations accurate rather than
invented: a chunk never spans two pages, so "cited page N" always means the
text really is on page N of that PDF.
"""
from __future__ import annotations

from dataclasses import dataclass

from .pdf_ingest import PageText

CHUNK_SIZE_CHARS = 900     # ~150-200 words; small enough for good retrieval precision
CHUNK_OVERLAP_CHARS = 150  # keeps sentences that straddle a chunk boundary searchable


@dataclass
class Chunk:
    id: str
    pdf_name: str
    page_number: int
    text: str


def _split_text(text: str, size: int, overlap: int) -> list[str]:
    if len(text) <= size:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        # Prefer to break on a sentence/paragraph boundary near `end` so
        # chunks don't cut mid-sentence when avoidable.
        if end < len(text):
            boundary = text.rfind(". ", start + int(size * 0.5), end)
            if boundary != -1:
                end = boundary + 1
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return [c for c in chunks if c]


def chunk_pages(pages: list[PageText]) -> list[Chunk]:
    chunks: list[Chunk] = []
    for page in pages:
        pieces = _split_text(page.text, CHUNK_SIZE_CHARS, CHUNK_OVERLAP_CHARS)
        for i, piece in enumerate(pieces):
            chunk_id = f"{page.pdf_name}::p{page.page_number}::c{i}"
            chunks.append(Chunk(id=chunk_id, pdf_name=page.pdf_name, page_number=page.page_number, text=piece))
    return chunks