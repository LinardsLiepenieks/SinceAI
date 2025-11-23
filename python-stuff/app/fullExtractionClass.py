from pathlib import Path
from collections import defaultdict
import os
import cv2
import numpy as np
import pytesseract

# ========= CONFIG =========
PAGE_IMG = r"debug_pages\page_006.png"
BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = BASE_DIR / "templates"

# --- layout reference (from a good reference page) ---
# Reference page shape: width = 2037
REF_PAGE_WIDTH = 2037.0

# Original absolute X ranges (for width = 2037):
#   SYMBOL_X1, SYMBOL_X2 = 180, 620
#   SUOJA_X1,  SUOJA_X2  = 1420, 1530
#   KUVAUS_X1, KUVAUS_X2 = 853,  1410
#   KAAPELI_X1,KAAPELI_X2= 1655, 1950
SYMBOL_X1_FRAC = 180.0 / REF_PAGE_WIDTH
SYMBOL_X2_FRAC = 620.0 / REF_PAGE_WIDTH
SUOJA_X1_FRAC = 1420.0 / REF_PAGE_WIDTH
SUOJA_X2_FRAC = 1530.0 / REF_PAGE_WIDTH
kuvaus_x1_FRAC = 853.0 / REF_PAGE_WIDTH
kuvaus_x2_FRAC = 1410.0 / REF_PAGE_WIDTH
kaapeli_x1_FRAC = 1655.0 / REF_PAGE_WIDTH
kaapeli_x2_FRAC = 1950.0 / REF_PAGE_WIDTH

# --- fixed row bands in Y, measured on a 2480 px reference page ---
REF_PAGE_HEIGHT = 2480.0

# On the reference page (height = 2480):
#  R1:  352–498
#  R2:  507–661
#  R3:  666–818
#  R4:  823–980
#  R5:  985–1139
#  R6:  1145–1300
#  R7:  1305–1457
#  R8:  1463–1617
#  R9:  1622–1755
#  R10: 1760–1935
#  R11: 1940–2095
REF_ROW_BANDS: list[tuple[int, int]] = [
    (352, 498),   # R1
    (507, 661),   # R2
    (666, 818),   # R3
    (823, 980),   # R4
    (985, 1139),  # R5
    (1145, 1300), # R6
    (1305, 1457), # R7
    (1463, 1617), # R8
    (1622, 1755), # R9
    (1760, 1935), # R10
    (1940, 2095), # R11
]

# Global container with “usable” rows (only rows with symbols)
usable_rows: dict[int, dict] = {}

# height we normalise all symbol strips to (kept for reference / debugging)
TARGET_H = 91
# minimum area (in pixels) to keep a blob when cleaning dust
MIN_BLOB_AREA = 30
# template-matching threshold; if best score is below this → "unknown"
MATCH_THRESH = 0.5

# Point to your local Tesseract installation
TESSERACT_CMD_ENV = os.getenv("TESSERACT_CMD")  # optional override

if TESSERACT_CMD_ENV:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD_ENV
elif os.name == "nt":
    win_default = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.path.exists(win_default):
        pytesseract.pytesseract.tesseract_cmd = win_default
    # else: fall back to whatever is in PATH


def compute_column_ranges(page_width: int):
    """
    Convert fractional column positions into concrete pixel indices
    for a given page width.
    """
    symbol_x1 = int(round(SYMBOL_X1_FRAC * page_width))
    symbol_x2 = int(round(SYMBOL_X2_FRAC * page_width))
    suoja_x1 = int(round(SUOJA_X1_FRAC * page_width))
    suoja_x2 = int(round(SUOJA_X2_FRAC * page_width))
    kuvaus_x1 = int(round(kuvaus_x1_FRAC * page_width))
    kuvaus_x2 = int(round(kuvaus_x2_FRAC * page_width))
    kaapeli_x1 = int(round(kaapeli_x1_FRAC * page_width))
    kaapeli_x2 = int(round(kaapeli_x2_FRAC * page_width))
    return (
        symbol_x1,
        symbol_x2,
        suoja_x1,
        suoja_x2,
        kuvaus_x1,
        kuvaus_x2,
        kaapeli_x1,
        kaapeli_x2,
    )


def compute_fixed_row_bands(page_height: int) -> list[tuple[int, int]]:
    """
    Scale the reference row bands to the actual page height.
    We always expect exactly 11 rows.
    """
    scale = float(page_height) / REF_PAGE_HEIGHT
    bands: list[tuple[int, int]] = []

    for y1_ref, y2_ref in REF_ROW_BANDS:
        y1 = int(round(y1_ref * scale))
        y2 = int(round(y2_ref * scale))
        bands.append((y1, y2))

    return bands


# ---------- common binarisation + dust removal ----------

def binarize_and_clean(img: np.ndarray) -> np.ndarray:
    """
    1. grayscale + Otsu inverse (ink = 255, background = 0)
    2. drop tiny components (smudges/dots) using connected components
    """
    if img.ndim == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    _, bw = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
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
    crop = bw[y1 : y2 + 1, x1 : x2 + 1]
    return crop


def load_symbol_templates_for_matching_2d() -> dict[str, np.ndarray]:
    """
    Load templates from TEMPLATE_DIR, prepared for 2D matching.
    """
    templates: dict[str, np.ndarray] = {}
    for p in TEMPLATE_DIR.glob("*.png"):
        img_gray = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
        if img_gray is None:
            continue
        tpl = prep_template_2d(img_gray)
        templates[p.stem] = tpl
    return templates


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
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
    )
    return bw


def match_templates_in_row_multi_2d(
    row_roi_bgr: np.ndarray,
    templates: dict[str, np.ndarray],
    thresh: float = MATCH_THRESH,
    nms_margin: int = 3,
):
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

    detections = []

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
            detections.append(
                {
                    "name": name,
                    "score": float(max_val),
                    "x": int(x),
                    "y": int(y),
                    "x_center": x + tw / 2.0,
                    "width": tw,
                    "height": th,
                }
            )

            # non-max suppression: kill a small area around this match
            x0 = max(0, x - nms_margin)
            y0 = max(0, y - nms_margin)
            x1 = min(res.shape[1], x + tw + nms_margin)
            y1 = min(res.shape[0], y + th + nms_margin)
            res[y0:y1, x0:x1] = -1.0  # below any realistic NCC

    # left→right order
    detections.sort(key=lambda d: d["x_center"])
    return detections


def ocr_suoja(roi: np.ndarray) -> str:
    """
    OCR helper for Suoja / Kuvausteksti / Kaapeli cells.
    Currently uses a simple Otsu binarisation and default Tesseract config.
    """
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU,
    )
    text = pytesseract.image_to_string(bw)
    return text.strip()


# ---------- core page classification ----------

def _classify_page_core(img: np.ndarray):
    """
    Core implementation that works directly on a BGR page image.

    Returns a list of per-row dictionaries with:
      - row_index
      - unique_symbols (alphabetical list)
      - symbol_scores (best score per symbol)
      - kuvaus, suoja, kaapeli
      - symbols_raw, strong_symbols, y1, y2 (for debugging)
    """
    global usable_rows
    usable_rows.clear()

    if img is None:
        raise RuntimeError("classify_page: received empty image")

    h, w = img.shape[:2]
    print("Page shape:", img.shape)

    (
        symbol_x1,
        symbol_x2,
        suoja_x1,
        suoja_x2,
        kuvaus_x1,
        kuvaus_x2,
        kaapeli_x1,
        kaapeli_x2,
    ) = compute_column_ranges(w)

    templates = load_symbol_templates_for_matching_2d()
    print("Loaded templates:", list(templates.keys()))

    row_bands = compute_fixed_row_bands(h)
    print("Using fixed row bands:", row_bands)

    debug_dir = Path("debug_syms")
    debug_dir.mkdir(exist_ok=True)

    results: list[dict] = []

    for idx, (y1, y2) in enumerate(row_bands, start=1):
        ROW_MARGIN_TOP = 4
        ROW_MARGIN_BOTTOM = 2

        sy1 = max(y1 + ROW_MARGIN_TOP, 0)
        sy2 = min(y2 - ROW_MARGIN_BOTTOM, h)

        symbols = []
        strong_symbols = []
        unique_symbols: list[str] = []
        symbol_scores: dict[str, float] = {}
        kuvaus_text = ""
        suoja_text = ""
        kaapeli_text = ""

        if sy2 > sy1:
            # --- SYMBOLS ---
            sym_roi = img[sy1:sy2, symbol_x1:symbol_x2]
            cv2.imwrite(str(debug_dir / f"row{idx:02d}_sym_raw.png"), sym_roi)

            symbols = match_templates_in_row_multi_2d(
                sym_roi, templates, MATCH_THRESH
            )

            # --- OCR CELLS (same y band, different x columns) ---
            suoja_roi = img[y1:y2, suoja_x1:suoja_x2]
            suoja_text = ocr_suoja(suoja_roi)

            kuvaus_roi = img[y1:y2, kuvaus_x1:kuvaus_x2]
            kuvaus_text = ocr_suoja(kuvaus_roi)

            kaapeli_roi = img[y1:y2, kaapeli_x1:kaapeli_x2]
            kaapeli_text = ocr_suoja(kaapeli_roi)

            # --- FILTER + PER-SYMBOL BEST SCORE ---
            ROW_SYMBOL_THRESH = 0.80
            strong_symbols = [
                d for d in symbols if d["score"] >= ROW_SYMBOL_THRESH
            ]

            name_best_score: dict[str, float] = defaultdict(float)
            for det in strong_symbols:
                name = det["name"]
                score = float(det["score"])
                if score > name_best_score[name]:
                    name_best_score[name] = score

            # Only one of basic1line / basic3line per row (keep higher score)
            b1 = name_best_score.get("JOHDONSUOJA 1-NAP")
            b3 = name_best_score.get("JOHDONSUOJA 3-NAP")
            if b1 is not None and b3 is not None:
                if b1 >= b3:
                    del name_best_score["JOHDONSUOJA 3-NAP"]
                else:
                    del name_best_score["JOHDONSUOJA 1-NAP"]

            symbol_scores = dict(name_best_score)
            unique_symbols = sorted(name_best_score.keys())

        row_result = {
            "row_index": idx,
            "y1": int(y1),
            "y2": int(y2),
            "symbols_raw": symbols,
            "strong_symbols": strong_symbols,
            "unique_symbols": unique_symbols,
            "symbol_scores": symbol_scores,
            "kuvaus": kuvaus_text,
            "suoja": suoja_text,
            "kaapeli": kaapeli_text,
        }
        results.append(row_result)

        # Only rows with at least one symbol go into usable_rows
        if unique_symbols:
            usable_rows[idx] = {
                "symbols": unique_symbols,
                "symbol_scores": symbol_scores,
                "kuvaus": kuvaus_text,
                "suoja": suoja_text,
                "kaapeli": kaapeli_text,
            }

    return results


def classify_page(page_path: str):
    """
    Convenience wrapper: load a page from disk and classify all 11 rows.
    """
    img = cv2.imread(str(page_path))
    if img is None:
        raise RuntimeError(f"Could not read page image: {page_path}")
    return _classify_page_core(img)


def classify_page_image(page_image: np.ndarray):
    """
    Entry point used by `extractor.py` – works on an in-memory BGR image.
    """
    return _classify_page_core(page_image)


if __name__ == "__main__":
    rows = classify_page(PAGE_IMG)
    print("\nRow summary:")
    for r in rows:
        syms = r.get("unique_symbols", []) or r.get("symbols", [])
        syms_str = ", ".join(syms) if syms else "none"
        #print(
        #    f"Row {r['row_index']:02d}: "
        #    f"symbols=[{syms_str}], "
        #    f"Kuvaus='{r.get('kuvaus', '')}', "
        #    f"Suoja='{r.get('suoja', '')}', "
        #    f"Kaapeli='{r.get('kaapeli', '')}'"
        #)

    print("\nUsable rows dict (for export):")
    for idx, data in usable_rows.items():
        print(idx, "->", data)
