#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CATALOG="$REPO_ROOT/catalog.json"

usage() {
  echo "Usage: $0 <name> <tags> <description>"
  echo ""
  echo "  name         Interaction name (e.g., magnetic-button)"
  echo "  tags         Comma-separated tags (e.g., hover,react,spring)"
  echo "  description  Short description in quotes"
  echo ""
  echo "Example: $0 magnetic-button \"hover,react,spring\" \"Button that follows the cursor with spring physics\""
  exit 1
}

if [[ $# -ne 3 ]]; then
  usage
fi

NAME="$1"
TAGS="$2"
DESCRIPTION="$3"

DATE="$(date +%Y-%m-%d)"
DATE_PATH="$(date +%Y/%m)"
DAY="$(date +%d)"
DIR_PATH="$DATE_PATH/${DAY}-${NAME}"

# Find the template by checking what exists in the directory
FULL_PATH="$REPO_ROOT/$DIR_PATH"
if [[ ! -d "$FULL_PATH" ]]; then
  echo "Error: Directory $DIR_PATH not found. Create the interaction first with new.sh"
  exit 1
fi

# Detect template
if [[ -f "$FULL_PATH/package.json" ]]; then
  TEMPLATE="react-vite"
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
    "tags": $TAGS_JSON,
    "template": "$TEMPLATE",
    "description": "$DESCRIPTION"
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
