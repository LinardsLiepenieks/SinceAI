# app/extractor.py
"""
PDF Symbol Extraction Module
Converts PDF pages to images and extracts symbols + Suoja values using template matching and OCR.
"""

from pathlib import Path
from typing import List, Optional
import cv2
import numpy as np
import pytesseract
from pdf2image import convert_from_bytes
from pydantic import BaseModel


# Constants for column detection (fractional positions based on reference page width)
REF_PAGE_WIDTH = 2037.0
SYMBOL_X1_FRAC = 180.0 / REF_PAGE_WIDTH
SYMBOL_X2_FRAC = 620.0 / REF_PAGE_WIDTH
SUOJA_X1_FRAC = 1420.0 / REF_PAGE_WIDTH
SUOJA_X2_FRAC = 1530.0 / REF_PAGE_WIDTH

# Processing constants
TARGET_H = 91
MIN_BLOB_AREA = 30
MATCH_THRESH = 0.3

# Template directory (relative to app folder)
TEMPLATE_DIR = Path(__file__).parent / "templates"


# Response models
class ExtractedRow(BaseModel):
    row_index: int
    symbol: str
    symbol_score: float
    suoja: str


class ExtractedPage(BaseModel):
    page_number: int
    rows: List[ExtractedRow]


class ExtractionResult(BaseModel):
    status: str
    filename: str
    total_pages: int
    total_rows: int
    pages: List[ExtractedPage]


def compute_column_ranges(page_width: int):
    """Convert fractional column positions into pixel indices for a given page width."""
    symbol_x1 = int(round(SYMBOL_X1_FRAC * page_width))
    symbol_x2 = int(round(SYMBOL_X2_FRAC * page_width))
    suoja_x1 = int(round(SUOJA_X1_FRAC * page_width))
    suoja_x2 = int(round(SUOJA_X2_FRAC * page_width))
    return symbol_x1, symbol_x2, suoja_x1, suoja_x2


def binarize_and_clean(img: np.ndarray) -> np.ndarray:
    """Grayscale + Otsu inverse binarization, remove tiny blobs."""
    if img.ndim == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    _, bw = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(bw, connectivity=8)
    cleaned = np.zeros_like(bw)

    for lab in range(1, num_labels):
        area = stats[lab, cv2.CC_STAT_AREA]
        if area >= MIN_BLOB_AREA:
            cleaned[labels == lab] = 255

    return cleaned


def prep_for_matching(img: np.ndarray, target_h: int = TARGET_H) -> np.ndarray:
    """Prepare image for template matching: binarize, crop, scale to fixed height."""
    bw = binarize_and_clean(img)

    ys, xs = np.where(bw > 0)
    if len(xs) == 0 or len(ys) == 0:
        return np.zeros((target_h, 1), np.uint8)

    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()
    crop = bw[y1 : y2 + 1, x1 : x2 + 1]

    h, w = crop.shape
    scale = target_h / float(h)
    new_w = max(1, int(round(w * scale)))

    resized = cv2.resize(crop, (new_w, target_h), interpolation=cv2.INTER_NEAREST)
    return resized


def load_templates() -> dict:
    """Load symbol templates from the templates directory."""
    templates = {}

    if not TEMPLATE_DIR.exists():
        return templates

    for p in TEMPLATE_DIR.glob("*.png"):
        img_gray = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
        if img_gray is None:
            continue
        strip = prep_for_matching(img_gray)
        templates[p.stem] = strip

    return templates


def match_templates_in_row(
    row_roi_bgr: np.ndarray, templates: dict, thresh: float = MATCH_THRESH
):
    """Match templates against a row ROI. Returns (name, score, x_position)."""
    if not templates:
        return "unknown", 0.0, None

    row_strip = prep_for_matching(row_roi_bgr)
    H, W_row = row_strip.shape

    best_name = "unknown"
    best_score = 0.0
    best_x = None

    for name, tpl_strip in templates.items():
        Ht, Wt = tpl_strip.shape

        if Ht != H or Wt > W_row:
            continue

        res = cv2.matchTemplate(row_strip, tpl_strip, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(res)

        if max_val > best_score:
            best_score = max_val
            best_name = name
            best_x = max_loc[0]

    if best_score < thresh:
        return "unknown", best_score, None
    return best_name, best_score, best_x


def detect_row_bounds(img: np.ndarray) -> List[tuple]:
    """Detect row boundaries using horizontal projection."""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    h, w = bw.shape
    row_sums = bw.sum(axis=1).astype(np.float32)
    max_val = row_sums.max() if row_sums.max() > 0 else 1.0
    norm = row_sums / max_val
    line_mask = norm > 0.4

    line_positions = []
    in_segment = False
    start = 0

    for y, flag in enumerate(line_mask):
        if flag and not in_segment:
            in_segment = True
            start = y
        elif not flag and in_segment:
            in_segment = False
            end = y - 1
            center = (start + end) // 2
            line_positions.append(center)

    if in_segment:
        end = len(line_mask) - 1
        center = (start + end) // 2
        line_positions.append(center)

    line_positions = [y for y in line_positions if 50 < y < h - 50]
    line_positions = sorted(line_positions)

    bands = []
    for i in range(len(line_positions) - 1):
        y_top = line_positions[i] + 1
        y_bottom = line_positions[i + 1] - 1
        if y_bottom - y_top > 15:
            bands.append((y_top, y_bottom))

    # Skip header row
    if bands:
        bands = bands[1:]

    return bands


def ocr_suoja(roi: np.ndarray) -> str:
    """OCR the Suoja (protection) value from a ROI."""
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    config = r"--psm 7 -c tessedit_char_whitelist=/0123456789C"
    text = pytesseract.image_to_string(bw, config=config)
    return text.strip()


def extract_page(img: np.ndarray, templates: dict, page_number: int) -> ExtractedPage:
    """Extract all rows from a single page image."""
    h, w = img.shape[:2]
    symbol_x1, symbol_x2, suoja_x1, suoja_x2 = compute_column_ranges(w)

    row_bands = detect_row_bounds(img)
    rows = []

    for idx, (y1, y2) in enumerate(sorted(row_bands), start=1):
        ROW_MARGIN_TOP = 4
        ROW_MARGIN_BOTTOM = 2

        sy1 = y1 + ROW_MARGIN_TOP
        sy2 = y2 - ROW_MARGIN_BOTTOM

        # Extract symbol ROI
        sym_roi = img[sy1:sy2, symbol_x1:symbol_x2]
        symbol_name, score, _ = match_templates_in_row(sym_roi, templates, MATCH_THRESH)

        # Extract Suoja ROI and OCR
        suoja_roi = img[y1:y2, suoja_x1:suoja_x2]
        suoja_text = ocr_suoja(suoja_roi)

        rows.append(
            ExtractedRow(
                row_index=idx,
                symbol=symbol_name,
                symbol_score=round(score, 3),
                suoja=suoja_text,
            )
        )

    return ExtractedPage(page_number=page_number, rows=rows)


def extract_from_pdf_bytes(
    pdf_bytes: bytes, filename: str, dpi: int = 300
) -> ExtractionResult:
    """
    Main extraction function: takes PDF bytes, returns structured extraction result.
    """
    # Load templates once
    templates = load_templates()

    # Convert PDF to images
    try:
        images = convert_from_bytes(pdf_bytes, dpi=dpi)
    except Exception as e:
        return ExtractionResult(
            status="error", filename=filename, total_pages=0, total_rows=0, pages=[]
        )

    pages = []
    total_rows = 0

    for page_num, pil_image in enumerate(images, start=1):
        # Convert PIL Image to OpenCV format (BGR)
        img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

        # Extract data from this page
        extracted_page = extract_page(img, templates, page_num)
        pages.append(extracted_page)
        total_rows += len(extracted_page.rows)

    return ExtractionResult(
        status="success",
        filename=filename,
        total_pages=len(images),
        total_rows=total_rows,
        pages=pages,
    )
