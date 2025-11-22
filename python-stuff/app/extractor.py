from __future__ import annotations

import logging
from typing import Dict, List

import cv2
import numpy as np
from pdf2image import convert_from_bytes
from pydantic import BaseModel

from .fullExtractionClass import classify_page_image

logger = logging.getLogger(__name__)


class ExtractedRow(BaseModel):
    row_index: int
    symbols: List[str]
    symbol_scores: Dict[str, float]
    kuvaus: str
    suoja: str
    kaapeli: str


class ExtractedPage(BaseModel):
    page_number: int
    rows: List[ExtractedRow]


class ExtractionResult(BaseModel):
    status: str
    filename: str
    total_pages: int
    total_rows: int
    pages: List[ExtractedPage]


def extract_page(page_img: np.ndarray, page_number: int) -> ExtractedPage:
    """
    Run symbol + text extraction on a single page image.

    :param page_img: OpenCV BGR image of the page
    :param page_number: 1-based page index in the PDF
    """
    row_results = classify_page_image(page_img)

    rows: List[ExtractedRow] = []
    for r in row_results:
        # Keep naming flexible: support both "unique_symbols" and "symbols" keys.
        symbols = r.get("unique_symbols") or r.get("symbols") or []
        symbol_scores = r.get("symbol_scores", {})

        rows.append(
            ExtractedRow(
                row_index=int(r.get("row_index", 0)),
                symbols=list(symbols),
                symbol_scores={k: float(v) for k, v in symbol_scores.items()},
                kuvaus=r.get("kuvaus", ""),
                suoja=r.get("suoja", ""),
                kaapeli=r.get("kaapeli", ""),
            )
        )

    return ExtractedPage(page_number=page_number, rows=rows)


def extract_from_pdf_bytes(pdf_bytes: bytes, filename: str) -> ExtractionResult:
    """
    Top-level entry used by FastAPI.

    Takes raw PDF bytes and returns structured extraction result with:
      - per-page list of rows
      - per-row list of detected symbols (+ scores)
      - Kuvausteksti / Suoja / Kaapeli text for each row
    """
    try:
        images = convert_from_bytes(pdf_bytes, dpi=300)
    except Exception:
        logger.exception("Failed to convert PDF %s to images", filename)
        raise

    pages: List[ExtractedPage] = []

    for idx, pil_img in enumerate(images, start=1):
        # pdf2image gives RGB PIL images → convert to OpenCV BGR
        page_rgb = np.array(pil_img)
        page_bgr = cv2.cvtColor(page_rgb, cv2.COLOR_RGB2BGR)

        page = extract_page(page_bgr, idx)
        pages.append(page)

    total_pages = len(pages)
    total_rows = sum(len(p.rows) for p in pages)

    return ExtractionResult(
        status="ok",
        filename=filename,
        total_pages=total_pages,
        total_rows=total_rows,
        pages=pages,
    )
