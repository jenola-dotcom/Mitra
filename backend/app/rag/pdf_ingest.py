"""
PDF -> page-numbered text. Uses pypdf only (no OCR) — a scanned/image-only
PDF will extract empty/near-empty text per page, and that is REPORTED, not
silently skipped (see extract_all's "errors" list), because the earlier
version of this project's brief was explicit that unsupported documents
must be recorded rather than ignored.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field

from pypdf import PdfReader
from pypdf.errors import PdfReadError


@dataclass
class PageText:
    pdf_name: str
    page_number: int  # 1-indexed, matches what a human would cite
    text: str


@dataclass
class ExtractionResult:
    pages: list = field(default_factory=list)   # list[PageText]
    errors: list = field(default_factory=list)  # list[str], human-readable


def extract_pdf(path: str) -> tuple[list[PageText], list[str]]:
    """Extract text per page from one PDF. Returns (pages, errors) — never
    raises for a single bad file, so one broken PDF doesn't stop indexing
    of the rest."""
    pages: list[PageText] = []
    errors: list[str] = []
    pdf_name = os.path.basename(path)

    try:
        reader = PdfReader(path)
    except (PdfReadError, OSError, ValueError) as e:
        errors.append(f"{pdf_name}: could not open PDF ({e})")
        return pages, errors

    if reader.is_encrypted:
        try:
            reader.decrypt("")  # try an empty password; common for gov PDFs
        except Exception:
            errors.append(f"{pdf_name}: encrypted and could not be opened with an empty password")
            return pages, errors

    for i, page in enumerate(reader.pages, start=1):
        try:
            text = (page.extract_text() or "").strip()
        except Exception as e:  # pypdf can raise on malformed page objects
            errors.append(f"{pdf_name} page {i}: extraction failed ({e})")
            continue
        if not text:
            errors.append(
                f"{pdf_name} page {i}: no extractable text "
                "(likely a scanned image — OCR is not implemented in this prototype)"
            )
            continue
        pages.append(PageText(pdf_name=pdf_name, page_number=i, text=text))

    return pages, errors


def extract_all(knowledge_dir: str) -> ExtractionResult:
    """Extract every PDF directly inside knowledge_dir (non-recursive).
    Records which files/pages failed instead of silently dropping them."""
    result = ExtractionResult()
    if not os.path.isdir(knowledge_dir):
        result.errors.append(f"Knowledge directory not found: {knowledge_dir}")
        return result

    pdf_files = sorted(f for f in os.listdir(knowledge_dir) if f.lower().endswith(".pdf"))
    if not pdf_files:
        result.errors.append(f"No PDF files found in {knowledge_dir}")
        return result

    for fname in pdf_files:
        pages, errors = extract_pdf(os.path.join(knowledge_dir, fname))
        result.pages.extend(pages)
        result.errors.extend(errors)

    return result