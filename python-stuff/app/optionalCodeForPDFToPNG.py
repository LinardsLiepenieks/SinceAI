from pdf2image import convert_from_path
from pathlib import Path
import cv2
import numpy as np

PDF_PATH = "inputs.pdf"
OUT_DIR = Path("debug_pages")
OUT_DIR.mkdir(exist_ok=True)

POPPLER_PATH = r"C:\Users\Andre\PycharmProjects\sinceai\poppler-25.11.0\Library\bin"

pages = convert_from_path(
    PDF_PATH,
    dpi=300,
    first_page=5,
    last_page=19,
    poppler_path=POPPLER_PATH,
)

for i, page in enumerate(pages, start=5):
    out_path = OUT_DIR / f"page_{i:03d}.png"
    page.save(out_path, "PNG")
    print("Saved", out_path)


PAGE_IMG = r"debug_pages\page_012.png"
TEMPLATE_DIR = Path("templates")
TEMPLATE_DIR.mkdir(exist_ok=True)
SYMBOL_SIZE = 64


def preprocess_symbol(img, size=SYMBOL_SIZE):
    if img.ndim == 3:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    else:
        gray = img.copy()

    # binary (ink = white in this inverted version)
    _, bw = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    ys, xs = np.where(bw > 0)
    if len(xs) == 0 or len(ys) == 0:
        return np.zeros((size, size), np.float32)

    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()
    crop = bw[y1:y2 + 1, x1:x2 + 1]

    h, w = crop.shape
    scale = size / max(h, w)
    crop_resized = cv2.resize(
        crop,
        (int(w * scale), int(h * scale)),
        interpolation=cv2.INTER_NEAREST,
    )

    canvas = np.zeros((size, size), np.uint8)
    ch, cw = crop_resized.shape
    y_off = (size - ch) // 2
    x_off = (size - cw) // 2
    canvas[y_off:y_off + ch, x_off:x_off + cw] = crop_resized

    return (canvas / 255.0).astype(np.float32)


def load_templates():
    templates = {}
    for p in TEMPLATE_DIR.glob("*.png"):
        img = cv2.imread(str(p), cv2.IMREAD_GRAYSCALE)
        if img is None:
            continue
        templates[p.stem] = preprocess_symbol(img)
    return templates


def classify_symbol(crop_img, templates):
    feat = preprocess_symbol(crop_img)
    v = feat.ravel()
    best_name, best_score = None, -1.0

    for name, tarr in templates.items():
        t = tarr.ravel()
        denom = (np.linalg.norm(v) * np.linalg.norm(t) + 1e-8)
        score = float(np.dot(v, t) / denom)
        if score > best_score:
            best_score = score
            best_name = name

    return best_name, best_score


def capture_templates():
    img = cv2.imread(PAGE_IMG)
    if img is None:
        raise RuntimeError(f"Could not read {PAGE_IMG}")

    rois = cv2.selectROIs(
        "Select symbol templates (draw box, ENTER to confirm, ESC when done)",
        img,
        showCrosshair=True,
        fromCenter=False,
    )
    cv2.destroyAllWindows()

    print("Selected", len(rois), "ROIs")

    for i, (x, y, w, h) in enumerate(rois):
        crop = img[y:y + h, x:x + w]
        cv2.imshow("ROI", crop)
        cv2.waitKey(1)
        label = input(f"Label for ROI #{i + 1}: ")
        if not label:
            label = f"symbol_{i + 1}"
        out_path = TEMPLATE_DIR / f"{label}.png"
        cv2.imwrite(str(out_path), crop)
        print("Saved", out_path)
    cv2.destroyAllWindows()


def test_matching():
    img = cv2.imread(PAGE_IMG)
    if img is None:
        raise RuntimeError(f"Could not read {PAGE_IMG}")

    templates = load_templates()
    if not templates:
        print("No templates found in", TEMPLATE_DIR)
        return

    print("Loaded templates:", list(templates.keys()))

    r = cv2.selectROI(
        "Select ONE symbol to classify",
        img,
        showCrosshair=True,
        fromCenter=False,
    )
    cv2.destroyAllWindows()

    x, y, w, h = map(int, r)
    crop = img[y:y + h, x:x + w]

    best_name, best_score = classify_symbol(crop, templates)
    print(f"Predicted: {best_name}, score={best_score:.3f}")

    best_template = templates[best_name]
    best_template_vis = (best_template * 255).astype(np.uint8)

    crop_norm = (preprocess_symbol(crop) * 255).astype(np.uint8)

    vis = np.hstack([crop_norm, best_template_vis])
    cv2.imshow(f"Left: query, Right: best template ({best_name})", vis)
    cv2.waitKey(0)
    cv2.destroyAllWindows()


if __name__ == "__main__":
    capture_templates()
    #test_matching()

