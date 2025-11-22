from __future__ import annotations

from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Any

import cv2
import numpy as np
import pytesseract

# ========= CONFIG =========

TEMPLATE_DIR = Path(__file__).parent / "templates"

# Reference layout (from a good sample page)
# reference page width in pixels
REF_PAGE_WIDTH = 2037.0

# Original absolute X ranges (for width = 2037):
#   SYMBOL_X1, SYMBOL_X2 = 180, 620
#   SUOJA_X1,  SUOJA_X2  = 1420, 1530
#   KUVAUS_X1, KUVAUS_X2 = 853,  1410
#   KAAPELI_X1,KAAPELI_X2= 1655, 1950
# Store them as fractions so they scale with any page width.
SYMBOL_X1_FRAC = 180.0 / REF_PAGE_WIDTH
SYMBOL_X2_FRAC = 620.0 / REF_PAGE_WIDTH
SUOJA_X1_FRAC  = 1420.0 / REF_PAGE_WIDTH
SUOJA_X2_FRAC  = 1530.0 / REF_PAGE_WIDTH
KUVAUS_X1_FRAC = 853.0 / REF_PAGE_WIDTH
KUVAUS_X2_FRAC = 1410.0 / REF_PAGE_WIDTH
KAAPELI_X1_FRAC = 1655.0 / REF_PAGE_WIDTH
KAAPELI_X2_FRAC = 1950.0 / REF_PAGE_WIDTH

# Minimum area (in pixels) to keep a blob when cleaning dust
MIN_BLOB_AREA = 30

# Template-matching base threshold; below this → ignored
MATCH_THRESH = 0.5

# Per-row confidence threshold for "strong" detections
ROW_SYMBOL_THRESH = 0.80

# Optional: configure Tesseract path on Windows.
# You can override this with the TESSERACT_CMD env var if needed.
# If Tesseract is already on PATH, you can safely comment this out.
# import os
# pytesseract.pytesseract.tesseract_cmd = os.getenv(
#     "TESSERACT_CMD",
#     r"C:\Program Files\Tesseract-OCR\tesseract.exe",
# )

# Internal cache so templates are loaded only once
_TEMPLATES_CACHE: Dict[str, np.ndarray] | None = None


# ---------- column geometry ----------

def compute_column_ranges(page_width: int) -> tuple[int, int, int, int, int, int, int, int]:
    """
    Convert fractional column positions into concrete pixel indices
    for a given page width.
    """
    symbol_x1 = int(round(SYMBOL_X1_FRAC * page_width))
    symbol_x2 = int(round(SYMBOL_X2_FRAC * page_width))
    suoja_x1  = int(round(SUOJA_X1_FRAC  * page_width))
    suoja_x2  = int(round(SUOJA_X2_FRAC  * page_width))
    kuvaus_x1 = int(round(KUVAUS_X1_FRAC * page_width))
    kuvaus_x2 = int(round(KUVAUS_X2_FRAC * page_width))
    kaapeli_x1 = int(round(KAAPELI_X1_FRAC * page_width))
    kaapeli_x2 = int(round(KAAPELI_X2_FRAC * page_width))
    return symbol_x1, symbol_x2, suoja_x1, suoja_x2, kuvaus_x1, kuvaus_x2, kaapeli_x1, kaapeli_x2


# ---------- binarisation + dust removal ----------

def binarize_and_clean(img: np.ndarray) -> np.ndarray:
    """
    1. Grayscale + Otsu inverse (ink = 255, background = 0).
    2. Drop tiny components (smudges/dots) using connected components.
    """
    if img.ndim == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    _, bw = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU,
    )

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
        bw, connectivity=8,
    )
    cleaned = np.zeros_like(bw)

    for lab in range(1, num_labels):  # skip background 0
        area = stats[lab, cv2.CC_STAT_AREA]
        if area >= MIN_BLOB_AREA:
            cleaned[labels == lab] = 255

    return cleaned


def prep_template_2d(img: np.ndarray) -> np.ndarray:
    """
    Prepare a template for 2D matching:
    - binarise (ink=255, background=0)
    - remove tiny blobs
    - crop tight to ink

    NO resizing, so scale stays as in the original drawing.
    """
    bw = binarize_and_clean(img)

    ys, xs = np.where(bw > 0)
    if len(xs) == 0 or len(ys) == 0:
        return np.zeros((1, 1), np.uint8)

    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()
    crop = bw[y1:y2 + 1, x1:x2 + 1]
    return crop


def _load_symbol_templates_for_matching_2d() -> Dict[str, np.ndarray]:
    """
    Load templates from TEMPLATE_DIR, prepared for 2D matching.
    This is called once and cached via get_symbol_templates().
    """
    templates: Dict[str, np.ndarray] = {}
    for p in TEMPLATE_DIR.glob("*.png"):
        img_gray = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
        if img_gray is None:
            continue
        tpl = prep_template_2d(img_gray)
        templates[p.stem] = tpl
    return templates


def get_symbol_templates() -> Dict[str, np.ndarray]:
    global _TEMPLATES_CACHE
    if _TEMPLATES_CACHE is None:
        _TEMPLATES_CACHE = _load_symbol_templates_for_matching_2d()
    return _TEMPLATES_CACHE


def prep_row_roi_2d(row_roi_bgr: np.ndarray) -> np.ndarray:
    """
    Binarise a row symbol ROI for 2D template matching.
    """
    if row_roi_bgr.ndim == 3:
        gray = cv2.cvtColor(row_roi_bgr, cv2.COLOR_BGR2GRAY)
    else:
        gray = row_roi_bgr.copy()

    _, bw = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU,
    )
    return bw


def match_templates_in_row_multi_2d(
    row_roi_bgr: np.ndarray,
    templates: Dict[str, np.ndarray],
    thresh: float = MATCH_THRESH,
    nms_margin: int = 3,
) -> List[Dict[str, Any]]:
    """
    2D template matching on one row ROI.

    Returns list of hits:
      [
        {
          "name": str,
          "score": float,
          "x": int, "y": int,
          "x_center": float,
          "width": int, "height": int,
        }, ...
      ]
    """
    bw_row = prep_row_roi_2d(row_roi_bgr)
    H, W = bw_row.shape

    detections: List[Dict[str, Any]] = []

    for name, tpl in templates.items():
        th, tw = tpl.shape
        if th > H or tw > W:
            continue

        # 2D NCC
        res = cv2.matchTemplate(bw_row, tpl, cv2.TM_CCOEFF_NORMED)

        while True:
            _, max_val, _, max_loc = cv2.minMaxLoc(res)
            if max_val < thresh:
                break

            x, y = max_loc
            detections.append({
                "name": name,
                "score": float(max_val),
                "x": int(x),
                "y": int(y),
                "x_center": x + tw / 2.0,
                "width": tw,
                "height": th,
            })

            # non-max suppression: kill a small area around this match
            x0 = max(0, x - nms_margin)
            y0 = max(0, y - nms_margin)
            x1 = min(res.shape[1], x + tw + nms_margin)
            y1 = min(res.shape[0], y + th + nms_margin)
            res[y0:y1, x0:x1] = -1.0  # below any realistic NCC

    # left→right order
    detections.sort(key=lambda d: d["x_center"])
    return detections


# ---------- row detection ----------

def detect_row_bounds(img: np.ndarray, debug_prefix: str | None = None) -> List[tuple[int, int]]:
    """
    Detect horizontal row bands between the horizontal grid lines.
    Returns list of (y_top, y_bottom) for each row.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU,
    )

    h, w = bw.shape

    if debug_prefix:
        cv2.imwrite(f"{debug_prefix}_bw.png", bw)

    row_sums = bw.sum(axis=1).astype(np.float32)
    max_val = row_sums.max() if row_sums.max() > 0 else 1.0
    norm = row_sums / max_val
    # "Line" if it has a lot of ink in this scan line
    line_mask = norm > 0.4

    line_positions: List[int] = []
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

    # remove obvious junk near page borders
    line_positions = [y for y in line_positions if 50 < y < h - 50]
    line_positions = sorted(line_positions)

    bands: List[tuple[int, int]] = []
    for i in range(len(line_positions) - 1):
        y_top = line_positions[i] + 1
        y_bottom = line_positions[i + 1] - 1
        if y_bottom - y_top > 15:
            bands.append((y_top, y_bottom))

    # skip header row
    if bands:
        bands = bands[1:]

    if debug_prefix:
        dbg = img.copy()
        for y in line_positions:
            cv2.line(dbg, (0, y), (w - 1, y), (0, 0, 255), 1)
        cv2.imwrite(f"{debug_prefix}_lines.png", dbg)

        overlay = img.copy()
        for y1, y2 in bands:
            cv2.rectangle(overlay, (0, y1), (w - 1, y2), (0, 255, 0), 1)
        cv2.imwrite(f"{debug_prefix}_bands.png", overlay)

    return bands


# ---------- OCR helpers ----------

def ocr_text(roi: np.ndarray) -> str:
    """
    Generic OCR for a small text cell (suoja / kuvaus / kaapeli).
    """
    if roi.size == 0:
        return ""

    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY | cv2.THRESH_OTSU,
    )
    text = pytesseract.image_to_string(bw, config="--psm 7")
    return text.strip()


# ---------- main page classification ----------

def classify_page_image(page_img: np.ndarray) -> List[Dict[str, Any]]:
    """
    Main entry-point used by the backend.

    Input: OpenCV BGR page image.
    Output: list of per-row dicts with:
        row_index, unique_symbols, symbol_scores, kuvaus, suoja, kaapeli, y1, y2
    """
    if page_img is None or page_img.size == 0:
        raise RuntimeError("Empty page image passed to classify_page_image")

    h, w = page_img.shape[:2]
    print("Page shape:", page_img.shape)

    symbol_x1, symbol_x2, suoja_x1, suoja_x2, kuvaus_x1, kuvaus_x2, kaapeli_x1, kaapeli_x2 = compute_column_ranges(w)

    templates = get_symbol_templates()
    print("Loaded templates:", list(templates.keys()))

    row_bands = detect_row_bounds(page_img, debug_prefix="debug_rows")
    print("Detected rows:", len(row_bands))

    debug_dir = Path("debug_syms")
    debug_dir.mkdir(exist_ok=True)

    results: List[Dict[str, Any]] = []

    for idx, (y1, y2) in enumerate(sorted(row_bands), start=1):
        ROW_MARGIN_TOP = 4
        ROW_MARGIN_BOTTOM = 2

        sy1 = y1 + ROW_MARGIN_TOP
        sy2 = y2 - ROW_MARGIN_BOTTOM

        # --- symbols ROI ---
        sym_roi = page_img[sy1:sy2, symbol_x1:symbol_x2]
        cv2.imwrite(str(debug_dir / f"row{idx:02d}_sym_raw.png"), sym_roi)

        symbols = match_templates_in_row_multi_2d(sym_roi, templates, MATCH_THRESH)

        # --- text ROIs ---
        suoja_roi = page_img[y1:y2, suoja_x1:suoja_x2]
        kuvaus_roi = page_img[y1:y2, kuvaus_x1:kuvaus_x2]
        kaapeli_roi = page_img[y1:y2, kaapeli_x1:kaapeli_x2]

        suoja_text = ocr_text(suoja_roi)
        kuvaus_text = ocr_text(kuvaus_roi)
        kaapeli_text = ocr_text(kaapeli_roi)

        # Keep only strong symbol detections for the per-row summary
        strong_symbols = [d for d in symbols if d["score"] >= ROW_SYMBOL_THRESH]

        name_best_score: Dict[str, float] = defaultdict(float)
        for det in strong_symbols:
            name = det["name"]
            score = float(det["score"])
            if score > name_best_score[name]:
                name_best_score[name] = score

        # For each ROI, it cannot be both basic1line and basic3line:
        # keep only the one with higher confidence.
        b1 = name_best_score.get("basic1line")
        b3 = name_best_score.get("basic3line")
        if b1 is not None and b3 is not None:
            if b1 >= b3:
                del name_best_score["basic3line"]
            else:
                del name_best_score["basic1line"]

        symbol_scores = dict(name_best_score)
        unique_symbols = sorted(name_best_score.keys())

        # Skip rows without any detected symbols
        if not unique_symbols:
            continue

        # Optional debug print
        syms_str = ", ".join(
            f"{name}({symbol_scores[name]:.3f})" for name in unique_symbols
        )
        print(
            f"Row {idx:02d}: symbols=[{syms_str}] "
            f"Kuvaus='{kuvaus_text}' Suoja='{suoja_text}' Kaapeli='{kaapeli_text}'"
        )

        row_result: Dict[str, Any] = {
            "row_index": idx,
            "y1": int(y1),
            "y2": int(y2),
            "unique_symbols": unique_symbols,
            "symbol_scores": symbol_scores,
            "kuvaus": kuvaus_text,
            "suoja": suoja_text,
            "kaapeli": kaapeli_text,
        }
        results.append(row_result)

    return results


def classify_page(page_path: str) -> List[Dict[str, Any]]:
    """
    Convenience wrapper for running the classifier directly on a PNG/JPG file.
    Useful for standalone debugging.
    """
    img = cv2.imread(str(page_path))
    if img is None:
        raise RuntimeError(f"Could not read page image: {page_path}")
    return classify_page_image(img)


if __name__ == "__main__":
    # Simple manual test when running this file directly.
    # Adjust PAGE_IMG to point to a debug page if you like.
    PAGE_IMG = Path("debug_pages/page_008.png")
    if PAGE_IMG.exists():
        rows = classify_page(PAGE_IMG)
        print("\nRow summary:")
        for r in rows:
            syms = r["unique_symbols"]
            syms_str = ", ".join(syms) if syms else "none"
            print(
                f"Row {r['row_index']:02d}: "
                f"symbols=[{syms_str}], "
                f"Kuvaus='{r['kuvaus']}', "
                f"Suoja='{r['suoja']}', "
                f"Kaapeli='{r['kaapeli']}'"
            )
    else:
        print("No debug page found at", PAGE_IMG)
