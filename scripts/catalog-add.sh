#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CATALOG="$REPO_ROOT/catalog.json"

usage() {
  echo "Usage: $0 <name> <language> <tags> <description> [date]"
  echo ""
  echo "  name         Interaction name (e.g., magnetic-button)"
  echo "  language     Language used (e.g., typescript, python, go)"
  echo "  tags         Comma-separated tags (e.g., hover,react,spring)"
  echo "  description  Short description in quotes"
  echo "  date         Optional. Date in YYYY-MM-DD format (defaults to today)"
  echo ""
  echo "Examples:"
  echo "  $0 magnetic-button typescript \"hover,react,spring\" \"Button that follows the cursor\""
  echo "  $0 signature-writer typescript \"react,canvas\" \"Signature animation\" 2026-03-08"
  exit 1
}

if [[ $# -lt 4 ]] || [[ $# -gt 5 ]]; then
  usage
fi

NAME="$1"
LANGUAGE="$2"
TAGS="$3"
DESCRIPTION="$4"
CUSTOM_DATE="${5:-}"

if [[ -n "$CUSTOM_DATE" ]]; then
  DATE="$CUSTOM_DATE"
  DATE_PATH="$(echo "$CUSTOM_DATE" | sed 's/-/\//g' | sed 's/\/[0-9][0-9]$//')"
  DAY="$(echo "$CUSTOM_DATE" | sed 's/.*-//')"
else
  DATE="$(date +%Y-%m-%d)"
  DATE_PATH="$(date +%Y/%m)"
  DAY="$(date +%d)"
fi

DIR_PATH="$DATE_PATH/${DAY}-${NAME}"

# Find the template by checking what exists in the directory
FULL_PATH="$REPO_ROOT/$DIR_PATH"
if [[ ! -d "$FULL_PATH" ]]; then
  echo "Error: Directory $DIR_PATH not found. Create the interaction first with new.sh"
  exit 1
fi

# Detect template
if [[ -f "$FULL_PATH/package.json" ]]; then
  if grep -q '"next"' "$FULL_PATH/package.json" 2>/dev/null; then
    TEMPLATE="next"
  else
    TEMPLATE="react-vite"
  fi
elif [[ -f "$FULL_PATH/index.html" ]] && grep -q "canvas" "$FULL_PATH/index.html" 2>/dev/null; then
  TEMPLATE="canvas"
else
  TEMPLATE="vanilla"
fi

# Convert comma-separated tags to JSON array
TAGS_JSON=$(echo "$TAGS" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')

# Build the new entry
ENTRY=$(cat <<EOF
{
    "date": "$DATE",
    "name": "$NAME",
    "path": "$DIR_PATH",
    "url": "",
    "tags": $TAGS_JSON,
    "template": "$TEMPLATE",
    "language": "$LANGUAGE",
    "description": "$DESCRIPTION",
    "status": "local"
  }
EOF
)

# Add entry to catalog.json
EXISTING=$(cat "$CATALOG")
if [[ "$EXISTING" == "["* ]] && [[ "$(echo "$EXISTING" | tr -d '[:space:]')" == "[]" ]]; then
  # Empty array — insert first entry
  echo "[
  $ENTRY
]" > "$CATALOG"
else
  # Append to existing entries
  sed -i '' '$ s/]//' "$CATALOG"
  echo ",$ENTRY
]" >> "$CATALOG"
fi

echo "Added '$NAME' to catalog.json"
