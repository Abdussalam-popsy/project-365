#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

usage() {
  echo "Usage: $0 <template> <name>"
  echo ""
  echo "Templates: vanilla, react-vite, canvas"
  echo "Example:   $0 react-vite magnetic-button"
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

echo "Created: $TARGET_DIR"

if [[ -f "$TARGET_DIR/package.json" ]]; then
  echo "Installing dependencies..."
  (cd "$TARGET_DIR" && npm install)
fi

echo ""
echo "Ready! cd into your new interaction:"
echo "  cd $TARGET_DIR"
