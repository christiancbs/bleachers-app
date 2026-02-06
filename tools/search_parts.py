#!/usr/bin/env python3
"""
Simple parts catalog search tool.
Search by keyword, part number, or category.

Usage:
    python search_parts.py "seat slat"
    python search_parts.py "2110177"
    python search_parts.py "wheel" --category "MISC. ROLLOUT PARTS"
    python search_parts.py --list-categories
"""

import csv
import argparse
import sys

CATALOG_FILE = "/Users/christianbs/catalog-extractor/hussey_parts_cleaned.csv"

def load_catalog():
    """Load the parts catalog into memory."""
    parts = []
    with open(CATALOG_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            parts.append(row)
    return parts

def search_parts(parts, query, category=None, limit=25):
    """Search parts by keyword in name, description, or part number."""
    query_lower = query.lower()
    results = []

    for part in parts:
        # Skip if category filter doesn't match
        if category and category.lower() not in part.get('Category', '').lower():
            continue

        # Search in multiple fields
        searchable = ' '.join([
            part.get('Part Number', ''),
            part.get('Product Name', ''),
            part.get('Description', ''),
            part.get('Category', ''),
            part.get('Model Info', ''),
            part.get('Parent Assembly', '')
        ]).lower()

        if query_lower in searchable:
            results.append(part)

    return results[:limit]

def list_categories(parts):
    """List all unique categories."""
    categories = set()
    for part in parts:
        cat = part.get('Category', '').strip()
        if cat:
            categories.add(cat)
    return sorted(categories)

def format_result(part, index):
    """Format a single search result for display."""
    price = part.get('Price 2025', 'N/A')
    if price and price != 'Call for Price':
        price = f"${price}"

    lines = [
        f"\n{'='*60}",
        f"  [{index}] {part.get('Product Name', 'N/A')}",
        f"      Part #: {part.get('Part Number', 'N/A') or '(no part #)'}",
        f"      Price:  {price}",
    ]

    if part.get('Category'):
        lines.append(f"      Category: {part.get('Category')}")

    if part.get('Parent Assembly'):
        lines.append(f"      Assembly: {part.get('Parent Assembly')}")

    if part.get('Model Info'):
        lines.append(f"      Model: {part.get('Model Info')}")

    return '\n'.join(lines)

def main():
    parser = argparse.ArgumentParser(description='Search Hussey parts catalog')
    parser.add_argument('query', nargs='?', help='Search term (keyword or part number)')
    parser.add_argument('--category', '-c', help='Filter by category')
    parser.add_argument('--limit', '-l', type=int, default=25, help='Max results (default: 25)')
    parser.add_argument('--list-categories', action='store_true', help='List all categories')

    args = parser.parse_args()

    # Load catalog
    try:
        parts = load_catalog()
        print(f"Loaded {len(parts)} parts from catalog\n")
    except FileNotFoundError:
        print(f"Error: Catalog file not found at {CATALOG_FILE}")
        print("Run clean_hussey_csv.py first to generate it.")
        sys.exit(1)

    # List categories mode
    if args.list_categories:
        categories = list_categories(parts)
        print("Categories:")
        for cat in categories:
            count = sum(1 for p in parts if p.get('Category') == cat)
            print(f"  - {cat} ({count} parts)")
        return

    # Search mode
    if not args.query:
        parser.print_help()
        return

    results = search_parts(parts, args.query, args.category, args.limit)

    if not results:
        print(f"No results found for '{args.query}'")
        if args.category:
            print(f"  (filtered by category: {args.category})")
        return

    print(f"Found {len(results)} results for '{args.query}':")

    for i, part in enumerate(results, 1):
        print(format_result(part, i))

    print(f"\n{'='*60}")
    print(f"Showing {len(results)} of {len(results)} results")

if __name__ == "__main__":
    main()
