#!/usr/bin/env python3
"""
Hussey/Draper Parts Catalog Extractor
Processes PDF catalogs page by page using Claude's vision API
Extracts part numbers, descriptions, prices, and crops individual part images
"""

import anthropic
import base64
import json
import os
import sys
import time
from pathlib import Path

# You'll need to install these:
# pip install anthropic pdf2image pillow

try:
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError:
    print("Missing dependencies. Run:")
    print("  pip install anthropic pdf2image pillow")
    print("\nAlso need poppler installed:")
    print("  brew install poppler")
    sys.exit(1)


EXTRACTION_PROMPT = """Analyze this parts catalog page and extract all part information.

First, identify the page type:
- GRID: Parts displayed in a grid with images (like 3x3 layouts)
- TABLE: Parts in a table/list format with columns (description, part #, price)
- SINGLE: Single product showcase with large image(s)
- OTHER: Mixed or different format

Then extract ALL parts found on this page. For each part, provide:
- part_number: The part number (P/N, Part #, etc.)
- description: The part description/name
- price: Price if shown (null if not visible)
- category: Category or model number from page header if present
- has_image: true if this part has an associated image on the page
- image_bbox: The bounding box of the PHOTOGRAPH/IMAGE of the part (NOT the text label). See detailed instructions below.
- notes: Any additional notes, quantities needed, or specifications

CRITICAL - image_bbox instructions:
- Capture the ENTIRE part cell: the product photo AND the text label (P/N + description) below it
- The bbox should include everything from the TOP of the product image down to the BOTTOM of the text label
- This keeps the part number visible in the cropped image for easy identification
- Format: [x1, y1, x2, y2] as PERCENTAGES (0-100) of page dimensions
- x1,y1 = top-left corner (start above the product image)
- x2,y2 = bottom-right corner (end below the text label)
- Add a small margin (2-3%) on all sides to avoid cutting anything off
- If a part has no photo (like in table/list rows), set has_image to false and image_bbox to null

Example for a grid layout with 3x3 parts:
- Top-left part cell might be [3, 8, 32, 42] - includes image + "P/N 12345" + "description" below
- Make sure to capture the FULL image from top edge, don't cut off the top of the product photo

Also extract:
- page_category: The main category/model shown in the header (e.g., "Model 300", "MAXAM")
- vendor: The vendor name if visible (e.g., "Hussey", "Draper")

Return valid JSON in this exact format:
{
    "page_type": "GRID|TABLE|SINGLE|OTHER",
    "page_category": "category or model name",
    "vendor": "vendor name or null",
    "parts": [
        {
            "part_number": "1001061",
            "description": "skirt board hinge",
            "price": null,
            "category": "Model 300",
            "has_image": true,
            "image_bbox": [5, 10, 30, 35],
            "notes": null
        }
    ]
}

Extract EVERY part on the page. Be thorough. Return ONLY valid JSON, no other text."""


def encode_image_to_base64(image_path: str) -> str:
    """Convert image file to base64 string."""
    with open(image_path, "rb") as f:
        return base64.standard_b64encode(f.read()).decode("utf-8")


def pdf_to_images(pdf_path: str, output_dir: str, dpi: int = 150) -> list[str]:
    """Convert PDF pages to images."""
    print(f"Converting PDF to images (this may take a moment)...")

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    images = convert_from_path(pdf_path, dpi=dpi)
    image_paths = []

    for i, image in enumerate(images):
        image_path = os.path.join(output_dir, f"page_{i+1:04d}.jpg")
        image.save(image_path, "JPEG", quality=85)
        image_paths.append(image_path)
        print(f"  Converted page {i+1}/{len(images)}")

    return image_paths


def crop_part_image(page_image_path: str, bbox: list, output_path: str) -> bool:
    """
    Crop a part image from a page using percentage-based bounding box.

    Args:
        page_image_path: Path to the full page image
        bbox: [x1, y1, x2, y2] as percentages (0-100)
        output_path: Where to save the cropped image

    Returns:
        True if successful, False otherwise
    """
    try:
        with Image.open(page_image_path) as img:
            width, height = img.size

            # Use Claude's coordinates directly with small padding
            padding = 1  # 1% padding on all sides

            # Convert percentages to pixels
            x1 = int(((bbox[0] - padding) / 100) * width)
            y1 = int(((bbox[1] - padding) / 100) * height)
            x2 = int(((bbox[2] + padding) / 100) * width)
            y2 = int(((bbox[3] + padding) / 100) * height)

            # Ensure valid coordinates
            x1 = max(0, min(x1, width))
            y1 = max(0, min(y1, height))
            x2 = max(0, min(x2, width))
            y2 = max(0, min(y2, height))

            # Ensure x2 > x1 and y2 > y1
            if x2 <= x1 or y2 <= y1:
                print(f"    Warning: Invalid bbox {bbox}, skipping crop")
                return False

            # Crop and save
            cropped = img.crop((x1, y1, x2, y2))
            cropped.save(output_path, "JPEG", quality=90)
            return True

    except Exception as e:
        print(f"    Warning: Could not crop image: {e}")
        return False


def sanitize_filename(part_number: str) -> str:
    """Make a part number safe for use as a filename."""
    # Replace problematic characters
    safe = part_number.replace("/", "-").replace("\\", "-").replace(":", "-")
    safe = safe.replace("*", "").replace("?", "").replace('"', "")
    safe = safe.replace("<", "").replace(">", "").replace("|", "")
    safe = safe.strip()
    return safe if safe else "unknown"


def extract_parts_from_image(client: anthropic.Anthropic, image_path: str) -> dict:
    """Send image to Claude and extract parts data."""

    base64_image = encode_image_to_base64(image_path)

    # Determine media type
    ext = Path(image_path).suffix.lower()
    media_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png"

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8192,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": base64_image,
                        },
                    },
                    {
                        "type": "text",
                        "text": EXTRACTION_PROMPT
                    }
                ],
            }
        ],
    )

    # Parse the response
    response_text = message.content[0].text

    # Try to extract JSON from response
    try:
        # Handle case where response might have markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        # Clean up common JSON issues
        response_text = response_text.strip()

        # Try to fix truncated JSON by finding the last complete part entry
        if not response_text.endswith("}"):
            # Find last complete closing bracket pattern
            last_good = response_text.rfind("}]}")
            if last_good > 0:
                response_text = response_text[:last_good + 3]

        return json.loads(response_text)
    except json.JSONDecodeError as e:
        print(f"  Warning: Could not parse JSON response: {e}")
        print(f"  Response preview: {response_text[:200]}...")
        return {"error": str(e), "raw_response": response_text}


def process_catalog(
    pdf_path: str,
    output_dir: str = None,
    api_key: str = None,
    start_page: int = 1,
    end_page: int = None,
    delay_seconds: float = 1.0,
    extract_images: bool = True
):
    """
    Process a PDF catalog and extract all parts.

    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory for output files (default: same as PDF)
        api_key: Anthropic API key (default: from ANTHROPIC_API_KEY env var)
        start_page: Page to start from (1-indexed, for resuming)
        end_page: Page to end at (inclusive, None for all)
        delay_seconds: Delay between API calls to respect rate limits
        extract_images: Whether to crop and save individual part images
    """

    # Setup
    pdf_path = os.path.abspath(pdf_path)
    if not os.path.exists(pdf_path):
        print(f"Error: PDF not found: {pdf_path}")
        sys.exit(1)

    pdf_name = Path(pdf_path).stem
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(pdf_path), f"{pdf_name}_extracted")

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # Create part_images directory
    part_images_dir = os.path.join(output_dir, "part_images")
    if extract_images:
        Path(part_images_dir).mkdir(parents=True, exist_ok=True)

    # Initialize Anthropic client
    api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: No API key provided.")
        print("Either pass --api-key or set ANTHROPIC_API_KEY environment variable")
        print("\nGet your API key at: https://console.anthropic.com/")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)

    # Convert PDF to images
    images_dir = os.path.join(output_dir, "pages")
    image_paths = pdf_to_images(pdf_path, images_dir)
    total_pages = len(image_paths)

    print(f"\nFound {total_pages} pages")

    # Adjust page range
    start_idx = start_page - 1
    end_idx = min(end_page, total_pages) if end_page else total_pages

    print(f"Processing pages {start_page} to {end_idx}")
    if extract_images:
        print(f"Part images will be saved to: {part_images_dir}")

    # Results file (append mode for resumability)
    results_file = os.path.join(output_dir, "extracted_parts.jsonl")
    all_parts_file = os.path.join(output_dir, "all_parts.json")

    all_parts = []
    pages_processed = []
    images_extracted = 0

    # Load existing results if resuming
    if os.path.exists(results_file) and start_page > 1:
        print(f"Loading existing results from {results_file}")
        with open(results_file, "r") as f:
            for line in f:
                data = json.loads(line)
                pages_processed.append(data)
                if "parts" in data:
                    all_parts.extend(data["parts"])

    # Process each page
    for i in range(start_idx, end_idx):
        page_num = i + 1
        image_path = image_paths[i]

        print(f"\nProcessing page {page_num}/{total_pages}...")

        try:
            result = extract_parts_from_image(client, image_path)
            result["page_number"] = page_num
            result["source_image"] = os.path.basename(image_path)

            # Count parts found
            parts_count = len(result.get("parts", []))
            print(f"  Found {parts_count} parts (type: {result.get('page_type', 'unknown')})")

            # Extract part images
            if extract_images and "parts" in result:
                for part in result["parts"]:
                    if part.get("has_image") and part.get("image_bbox"):
                        part_num = part.get("part_number", "unknown")
                        safe_name = sanitize_filename(part_num)

                        # Add page number to avoid duplicates
                        image_filename = f"{safe_name}_p{page_num}.jpg"
                        image_output_path = os.path.join(part_images_dir, image_filename)

                        success = crop_part_image(image_path, part["image_bbox"], image_output_path)
                        if success:
                            part["image_file"] = image_filename
                            images_extracted += 1
                            print(f"    Extracted image for part {part_num}")
                        else:
                            part["image_file"] = None
                    else:
                        part["image_file"] = None

            # Append to results file (JSONL format for easy resuming)
            with open(results_file, "a") as f:
                f.write(json.dumps(result) + "\n")

            # Track all parts
            if "parts" in result:
                for part in result["parts"]:
                    part["source_page"] = page_num
                all_parts.extend(result["parts"])

            pages_processed.append(result)

        except Exception as e:
            print(f"  Error processing page {page_num}: {e}")
            error_result = {"page_number": page_num, "error": str(e)}
            with open(results_file, "a") as f:
                f.write(json.dumps(error_result) + "\n")

        # Rate limiting
        if i < end_idx - 1:
            print(f"  Waiting {delay_seconds}s before next page...")
            time.sleep(delay_seconds)

    # Write combined results
    print(f"\n\nWriting combined results...")

    # All parts as single JSON
    with open(all_parts_file, "w") as f:
        json.dump({
            "source_pdf": pdf_name,
            "total_pages": total_pages,
            "pages_processed": len(pages_processed),
            "total_parts": len(all_parts),
            "total_images_extracted": images_extracted,
            "parts": all_parts
        }, f, indent=2)

    # CSV for easy viewing
    csv_file = os.path.join(output_dir, "all_parts.csv")
    with open(csv_file, "w") as f:
        f.write("part_number,description,price,category,vendor,has_image,image_file,source_page,notes\n")
        for part in all_parts:
            row = [
                str(part.get("part_number", "")),
                str(part.get("description", "")).replace(",", ";"),
                str(part.get("price", "")),
                str(part.get("category", "")).replace(",", ";"),
                str(part.get("vendor", "")),
                str(part.get("has_image", "")),
                str(part.get("image_file", "")),
                str(part.get("source_page", "")),
                str(part.get("notes", "")).replace(",", ";") if part.get("notes") else ""
            ]
            f.write(",".join(row) + "\n")

    print(f"\n{'='*50}")
    print(f"EXTRACTION COMPLETE")
    print(f"{'='*50}")
    print(f"Total pages processed: {len(pages_processed)}")
    print(f"Total parts extracted: {len(all_parts)}")
    print(f"Total images cropped: {images_extracted}")
    print(f"\nOutput files:")
    print(f"  - {results_file} (detailed per-page results)")
    print(f"  - {all_parts_file} (all parts as JSON)")
    print(f"  - {csv_file} (all parts as CSV)")
    print(f"  - {images_dir}/ (full page images)")
    print(f"  - {part_images_dir}/ (individual part images)")


def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="Extract parts from PDF catalogs using Claude Vision"
    )
    parser.add_argument("pdf", help="Path to the PDF catalog")
    parser.add_argument("--output", "-o", help="Output directory")
    parser.add_argument("--api-key", help="Anthropic API key (or set ANTHROPIC_API_KEY)")
    parser.add_argument("--start", type=int, default=1, help="Start page (for resuming)")
    parser.add_argument("--end", type=int, help="End page (inclusive)")
    parser.add_argument("--delay", type=float, default=1.0, help="Delay between API calls (seconds)")
    parser.add_argument("--no-images", action="store_true", help="Skip extracting individual part images")

    args = parser.parse_args()

    process_catalog(
        pdf_path=args.pdf,
        output_dir=args.output,
        api_key=args.api_key,
        start_page=args.start,
        end_page=args.end,
        delay_seconds=args.delay,
        extract_images=not args.no_images
    )


if __name__ == "__main__":
    main()
