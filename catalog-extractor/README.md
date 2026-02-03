# Parts Catalog Extractor

Extracts part numbers, descriptions, prices, and images from PDF catalogs using Claude's vision AI.

## Quick Setup

1. **Install poppler** (needed to read PDFs):
   ```
   brew install poppler
   ```

2. **Install Python packages**:
   ```
   cd ~/catalog-extractor
   pip3 install -r requirements.txt
   ```

3. **Get your Anthropic API key**:
   - Go to: https://console.anthropic.com/
   - Create account or sign in
   - Go to API Keys, create a new key
   - Copy the key (starts with `sk-ant-...`)

4. **Set your API key**:
   ```
   export ANTHROPIC_API_KEY="sk-ant-your-key-here"
   ```

## Usage

**Basic usage:**
```
python3 extract_catalog.py /path/to/catalog.pdf
```

**With options:**
```
python3 extract_catalog.py /path/to/catalog.pdf --output ./my-output --delay 2
```

**Resume from a specific page (if interrupted):**
```
python3 extract_catalog.py /path/to/catalog.pdf --start 50
```

**Process only specific pages:**
```
python3 extract_catalog.py /path/to/catalog.pdf --start 1 --end 10
```

## Output Files

After running, you'll get:
- `extracted_parts.jsonl` - Detailed results for each page
- `all_parts.json` - All parts combined
- `all_parts.csv` - Spreadsheet-friendly format
- `pages/` - Images of each PDF page

## Cost Estimate

- ~$0.01-0.02 per page
- 100 page catalog ≈ $1-2
- 500 page catalog ≈ $5-10

## Troubleshooting

**"poppler not found"** - Run `brew install poppler`

**"No API key"** - Set your key: `export ANTHROPIC_API_KEY="sk-ant-..."`

**Rate limited** - Increase delay: `--delay 3`

**Want to resume after stopping** - Use `--start N` where N is the next page to process
