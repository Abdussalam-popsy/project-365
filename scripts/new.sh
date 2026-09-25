#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

usage() {
  echo "Usage: $0 <template> <name>"
  echo ""
  echo "Templates: vanilla, react-vite, canvas, threejs"
  echo "Example:   $0 threejs floating-particles"
  exit 1
}

if [[ $# -ne 2 ]]; then
  usage
fi

TEMPLATE="$1"
NAME="$2"
TEMPLATE_DIR="$REPO_ROOT/templates/$TEMPLATE"

if [[ ! -d "$TEMPLATE_DIR" ]]; then
  echo "Error: Template '$TEMPLATE' not found."
  echo "Available templates: $(ls "$REPO_ROOT/templates/" | tr '\n' ' ')"
  exit 1
fi

DATE_PATH="$(date +%Y/%m)"
DAY="$(date +%d)"
TARGET_DIR="$REPO_ROOT/$DATE_PATH/${DAY}-${NAME}"

if [[ -d "$TARGET_DIR" ]]; then
  echo "Error: $TARGET_DIR already exists."
  exit 1
fi

mkdir -p "$TARGET_DIR"
cp -r "$TEMPLATE_DIR"/. "$TARGET_DIR"
mkdir -p "$TARGET_DIR/.devin/rules"
cp "$REPO_ROOT/templates/.devin/rules/learning.md" "$TARGET_DIR/.devin/rules/learning.md"
if [[ ! -f "$TARGET_DIR/lessons.md" ]]; then
  cp "$REPO_ROOT/templates/.devin/lesson-template.md" "$TARGET_DIR/lessons.md"
fi

echo "Created: $TARGET_DIR"

# Detect language from template
LANGUAGE="typescript"
if [[ "$TEMPLATE" == "vanilla" ]] || [[ "$TEMPLATE" == "canvas" ]]; then
  LANGUAGE="javascript"
fi

# Write project.json so generate-catalog.js can pick it up automatically
cat > "$TARGET_DIR/project.json" <<EOF
{
  "name": "$NAME",
  "tags": [],
  "template": "$TEMPLATE",
  "language": "$LANGUAGE",
  "description": "",
  "status": "local"
}
EOF

if [[ -f "$TARGET_DIR/package.json" ]]; then
  echo "Installing dependencies..."
  (cd "$TARGET_DIR" && npm install)
fi

echo ""
echo "Ready! cd into your new interaction:"
echo "  cd $TARGET_DIR"
echo ""
echo "Fill in project.json (tags + description) before pushing."
