#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HTML="$ROOT_DIR/cv/VinhLuu_Forward_Deployed_Engineer_Wonderful_AI.html"
OUT_DIR="$ROOT_DIR/output/pdf"
PDF="$OUT_DIR/VinhLuu_Forward_Deployed_Engineer_Wonderful_AI.pdf"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

mkdir -p "$OUT_DIR"

if [[ ! -x "$CHROME" ]]; then
  echo "Google Chrome not found at $CHROME" >&2
  exit 1
fi

"$CHROME" \
  --headless \
  --disable-gpu \
  --no-sandbox \
  --print-to-pdf="$PDF" \
  --no-pdf-header-footer \
  --print-to-pdf-no-header \
  "file://$HTML"

echo "$PDF"
