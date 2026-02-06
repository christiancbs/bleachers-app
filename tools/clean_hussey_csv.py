#!/usr/bin/env python3
"""
Clean and normalize the Hussey CSV for searching.
Outputs a simplified CSV ready for import to Airtable or search tools.
"""

import csv
import re
import sys

INPUT_FILE = "/Users/christianbs/2025 Price Guide For BS.csv"
OUTPUT_FILE = "/Users/christianbs/catalog-extractor/hussey_parts_cleaned.csv"

def clean_price(price_str):
    """Convert price string to clean format."""
    if not price_str or price_str.strip() == "":
        return ""
    price_str = price_str.strip()
    if "Call for Price" in price_str:
        return "Call for Price"
    # Remove $ and commas, keep the number
    cleaned = re.sub(r'[$,]', '', price_str)
    try:
        return f"{float(cleaned):.2f}"
    except ValueError:
        return price_str

def clean_text(text):
    """Clean up text fields - remove excess whitespace and special chars."""
    if not text:
        return ""
    # Replace special dash characters with regular dash
    text = text.replace('—', '-').replace('–', '-').replace('�', "'")
    # Remove leading/trailing whitespace and collapse internal whitespace
    text = ' '.join(text.split())
    return text

def extract_parent_group(desc):
    """Extract parent group from description if it starts with >."""
    if desc and desc.strip().startswith('>'):
        return desc.strip().lstrip('>').strip()
    return ""

def simplify_category(raw_category):
    """Map detailed categories to simplified groups."""
    if not raw_category:
        return "Other"

    cat = raw_category.upper()

    # Power & Electrical
    if any(x in cat for x in ['POWER FRAME', 'ELECTRICAL', 'WIRING', 'HARNESS',
                               '3 PHASE', 'CIRCUIT', 'LIMIT SWITCH', 'MOTOR',
                               'REMOTE CONTROL', 'PENDANT', 'TRANSMITTER', 'RECEPTACLE',
                               'CONTROL BOX', 'KEY SWITCH', 'KEYSWITCH']):
        return "Power & Electrical"

    # Rollout Parts
    if any(x in cat for x in ['ROLLOUT', 'MX3', 'POW-R-TRAC', 'MAXAM']):
        return "Rollout Parts"

    # Hardware
    if any(x in cat for x in ['HARDWARE', 'ANCHOR', 'CONNECTOR', 'BOLT', 'NUT', 'SCREW']):
        return "Hardware"

    # Lumber & Decking
    if any(x in cat for x in ['LUMBER', 'PLYWOOD', 'DECK', 'WOOD']):
        return "Lumber & Decking"

    # Seating
    if any(x in cat for x in ['SEAT', 'CHAIR', 'COURTSIDE', 'BACK', 'CUPHOLDER']):
        return "Seating"

    # Rails & Steps
    if any(x in cat for x in ['RAIL', 'SOCKET', 'AISLE STEP', 'FRONT STEP', 'STEP']):
        return "Rails & Steps"

    # Stanchions & Standards
    if any(x in cat for x in ['STANCHION', 'STANDARD']):
        return "Stanchions"

    # Curtains
    if any(x in cat for x in ['CURTAIN', 'BLEED']):
        return "Curtains"

    # Portable & Skids
    if any(x in cat for x in ['PORTABLE', 'SKID', 'DOLLY', 'CART']):
        return "Portable & Skids"

    # Frames & Supports
    if any(x in cat for x in ['FRAME', 'SUPPORT', 'BRAC', 'RISER', 'RISE']):
        return "Frames & Supports"

    # Controls & Safety
    if any(x in cat for x in ['BRAKE', 'TIER CATCH', 'CATCH', 'LATCH', 'OUTRIGGER', 'SAFETY']):
        return "Controls & Safety"

    # Wheels & Bearings
    if any(x in cat for x in ['WHEEL', 'BEARING', 'ROLLER', 'CASTER']):
        return "Wheels & Bearings"

    # Skirt & Panels
    if any(x in cat for x in ['SKIRT', 'PANEL', 'CLOSURE']):
        return "Panels & Closures"

    # Tools
    if 'TOOL' in cat:
        return "Tools"

    # Flex Row
    if 'FLEX ROW' in cat:
        return "Flex Row Parts"

    # Everything else
    return "Other"

def main():
    rows_processed = 0
    rows_written = 0

    with open(INPUT_FILE, 'r', encoding='utf-8', errors='replace') as infile, \
         open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as outfile:

        reader = csv.DictReader(infile)

        # Output columns - Airtable-friendly names
        fieldnames = [
            'Part Number',
            'Product Name',
            'Description',
            'Price 2025',
            'Price 2024',
            'Category',
            'Subcategory',
            'Product Line',
            'Model Info',
            'Parent Assembly',
            'Vendor'
        ]

        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()

        current_parent = ""

        for row in reader:
            rows_processed += 1

            # Check if this is a parent assembly line
            desc = row.get('Product Description', '')
            if desc.strip().startswith('>'):
                current_parent = extract_parent_group(desc)

            # Get the part number
            part_num = clean_text(row.get('Part #', ''))

            # Get product name and clean it
            product_name = clean_text(row.get('Product Name', ''))

            # Skip rows that are just whitespace
            if not product_name and not part_num:
                continue

            # Build output row
            raw_category = clean_text(row.get('Spec 2', ''))
            out_row = {
                'Part Number': part_num,
                'Product Name': product_name,
                'Description': clean_text(desc.lstrip('>').strip()) if desc else '',
                'Price 2025': clean_price(row.get('Price2025', '')),
                'Price 2024': clean_price(row.get('Price2024', '')),
                'Category': simplify_category(raw_category),
                'Subcategory': raw_category,
                'Product Line': clean_text(row.get('Spec 1', '')),
                'Model Info': clean_text(row.get('Spec 3', '')),
                'Parent Assembly': current_parent if part_num else '',  # Only set for actual parts
                'Vendor': 'Hussey'
            }

            writer.writerow(out_row)
            rows_written += 1

    print(f"Processed {rows_processed} rows")
    print(f"Wrote {rows_written} rows to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
