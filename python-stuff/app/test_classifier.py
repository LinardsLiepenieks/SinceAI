from .fullExtractionClass import classify_page
from pprint import pprint

if __name__ == "__main__":
    rows = classify_page("page_008.png")
    print("\nRow summary:")
    for r in rows:
        pprint(r)

    from .fullExtractionClass import usable_rows
    print("\nUsable rows dict:")
    pprint(usable_rows)