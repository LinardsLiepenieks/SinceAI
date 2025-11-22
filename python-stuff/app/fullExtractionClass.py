from pathlib import Path
import cv2
import numpy as np
import pytesseract

PAGE_IMG = r"page_007.png"
TEMPLATE_DIR = Path("templates")


REF_PAGE_WIDTH = 2037.0


SYMBOL_X1_FRAC = 180.0 / REF_PAGE_WIDTH
SYMBOL_X2_FRAC = 620.0 / REF_PAGE_WIDTH
SUOJA_X1_FRAC  = 1420.0 / REF_PAGE_WIDTH
SUOJA_X2_FRAC = 1530.0 / REF_PAGE_WIDTH


TARGET_H = 91
MIN_BLOB_AREA = 30


MATCH_THRESH = 0.5


pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def compute_column_ranges(page_width: int):
    """
    Convert fractional column positions into concrete pixel indices
    for a given page width.
    """
    symbol_x1 = int(round(SYMBOL_X1_FRAC * page_width))
    symbol_x2 = int(round(SYMBOL_X2_FRAC * page_width))
    suoja_x1  = int(round(SUOJA_X1_FRAC  * page_width))
    suoja_x2  = int(round(SUOJA_X2_FRAC  * page_width))
    return symbol_x1, symbol_x2, suoja_x1, suoja_x2

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
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
        bw, connectivity=8
    )
    cleaned = np.zeros_like(bw)

    for lab in range(1, num_labels):  # skip background 0
        area = stats[lab, cv2.CC_STAT_AREA]
        if area >= MIN_BLOB_AREA:
            cleaned[labels == lab] = 255

    return cleaned


def prep_for_matching(img: np.ndarray, target_h: int = TARGET_H) -> np.ndarray:
    """
    Convert a template or a row symbol ROI to a normalised strip:
    - binarise + remove tiny blobs
    - crop tight to all remaining ink
    - scale to fixed height, preserve aspect
    """
    bw = binarize_and_clean(img)

    ys, xs = np.where(bw > 0)
    if len(xs) == 0 or len(ys) == 0:
        return np.zeros((target_h, 1), np.uint8)

    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()
    crop = bw[y1:y2 + 1, x1:x2 + 1]   # h×w

    h, w = crop.shape
    scale = target_h / float(h)
    new_w = max(1, int(round(w * scale)))

    resized = cv2.resize(
        crop,
        (new_w, target_h),             # (width, height)
        interpolation=cv2.INTER_NEAREST,
    )
    return resized



def load_symbol_templates_for_matching() -> dict[str, np.ndarray]:
    """
    Load template PNGs from TEMPLATE_DIR, preprocess to normalised strips.
    Used for sliding template match.
    """
    templates: dict[str, np.ndarray] = {}

    for p in TEMPLATE_DIR.glob("*.png"):
        img_gray = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
        if img_gray is None:
            continue

        strip = prep_for_matching(img_gray)
        templates[p.stem] = strip

    return templates


def match_templates_in_row(row_roi_bgr: np.ndarray,
                           templates: dict[str, np.ndarray],
                           thresh: float = MATCH_THRESH):
    """
    row_roi_bgr: BGR ROI of the whole symbol field for one row.
    templates: dict{name -> preprocessed strip (H = TARGET_H)}.

    Returns: (best_name|'unknown', best_score, best_x_pos_in_strip)
    """
    row_strip = prep_for_matching(row_roi_bgr)   # TARGET_H × W_row
    H, W_row = row_strip.shape

    best_name = "unknown"
    best_score = 0.0
    best_x = None

    for name, tpl_strip in templates.items():
        Ht, Wt = tpl_strip.shape

        # height should already match TARGET_H on both, but be defensive
        if Ht != H:
            continue
        if Wt > W_row:
            continue

        # classic normalised correlation on the 1-symbol strip
        res = cv2.matchTemplate(row_strip, tpl_strip, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(res)

        if max_val > best_score:
            best_score = max_val
            best_name = name
            best_x = max_loc[0]

    if best_score < thresh:
        return "unknown", best_score, None
    return best_name, best_score, best_x


def detect_row_bounds(img, debug_prefix="debug_rows"):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(
        gray, 0, 255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU
    )

    h, w = bw.shape
    cv2.imwrite(f"{debug_prefix}_bw.png", bw)

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

    dbg = img.copy()
    for y in line_positions:
        cv2.line(dbg, (0, y), (w - 1, y), (0, 0, 255), 1)
    cv2.imwrite(f"{debug_prefix}_lines.png", dbg)

    bands = []
    for i in range(len(line_positions) - 1):
        y_top = line_positions[i] + 1
        y_bottom = line_positions[i + 1] - 1
        if y_bottom - y_top > 15:
            bands.append((y_top, y_bottom))

    if bands:
        bands = bands[1:]  # skip header

    overlay = img.copy()
    for y1, y2 in bands:
        cv2.rectangle(overlay, (0, y1), (w - 1, y2), (0, 255, 0), 1)
    cv2.imwrite(f"{debug_prefix}_bands.png", overlay)

    print("Line positions:", line_positions)
    print("Row bands:", bands[:5], "… total:", len(bands))
    return bands


def ocr_suoja(roi):
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    _, bw = cv2.threshold(gray, 0, 255,
                          cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    config = r"--psm 7 -c tessedit_char_whitelist=/0123456789C"
    text = pytesseract.image_to_string(bw, config=config)
    return text.strip()


def debug_save_templates():
    dbg_dir = Path("debug_templates")
    dbg_dir.mkdir(exist_ok=True)
    templates = load_symbol_templates_for_matching()
    for name, arr in templates.items():
        cv2.imwrite(str(dbg_dir / f"{name}_norm.png"), arr)
    print("Saved normalized templates to", dbg_dir)


def debug_test_templates():
    """
    Quick self-check: run each template against itself
    to confirm we get scores near 1.0.
    """
    templates = load_symbol_templates_for_matching()
    for name, strip in templates.items():
        res = cv2.matchTemplate(strip, strip, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, _ = cv2.minMaxLoc(res)
        print(f"Template file {name}: self-score={max_val:.3f}")


def classify_page(page_path):
    img = cv2.imread(str(page_path))
    if img is None:
        raise RuntimeError(f"Could not read page image: {page_path}")

    h, w = img.shape[:2]
    print("Page shape:", img.shape)

    # compute symbol / suoja X-ranges for this particular width
    symbol_x1, symbol_x2, suoja_x1, suoja_x2 = compute_column_ranges(w)

    templates = load_symbol_templates_for_matching()
    print("Loaded templates:", list(templates.keys()))

    row_bands = detect_row_bounds(img)
    print("Detected rows:", len(row_bands))

    debug_dir = Path("debug_syms")
    debug_dir.mkdir(exist_ok=True)

    results = []

    for idx, (y1, y2) in enumerate(sorted(row_bands), start=1):
        # a little vertical margin inside the row
        ROW_MARGIN_TOP = 4
        ROW_MARGIN_BOTTOM = 2

        sy1 = y1 + ROW_MARGIN_TOP
        sy2 = y2 - ROW_MARGIN_BOTTOM

        # use per-page dynamic X ranges
        sym_roi = img[sy1:sy2, symbol_x1:symbol_x2]

        # save raw + binarised / cleaned ROIs
        cv2.imwrite(str(debug_dir / f"row{idx:02d}_sym_raw.png"), sym_roi)
        cv2.imwrite(
            str(debug_dir / f"row{idx:02d}_sym_bin.png"),
            binarize_and_clean(sym_roi),
        )

        symbol_name, score, xpos = match_templates_in_row(sym_roi, templates, MATCH_THRESH)

        suoja_roi = img[y1:y2, suoja_x1:suoja_x2]
        suoja_text = ocr_suoja(suoja_roi)

        row_result = {
            "row_index": idx,
            "y1": int(y1),
            "y2": int(y2),
            "symbol": symbol_name,
            "symbol_score": float(score),
            "symbol_xpos": int(xpos) if xpos is not None else None,
            "suoja": suoja_text,
        }
        results.append(row_result)

        print(
            f"Row {idx:02d}: symbol={symbol_name}, "
            f"score={score:.3f}, xpos={xpos}, suoja='{suoja_text}'"
        )

    return results


if __name__ == "__main__":
    debug_save_templates()
    debug_test_templates()

    rows = classify_page(PAGE_IMG)
    print()
    for r in rows:
        print(
            f"Row {r['row_index']:02d}: "
            f"symbol={r['symbol']} score={r['symbol_score']:.3f} "
            f"suoja='{r['suoja']}'"
        )
