#!/usr/bin/env bash
# Scaffold a new feature module following the feature-first pattern.
#
# Usage:
#   ./scaffold_feature.sh <feature-name> [options]
#
# Options:
#   --root <path>       Path to src/ directory (default: ./src)
#   --pages <Names>      Comma-separated PascalCase page names, e.g. "Cart,Checkout"
#                         (each becomes pages/<Name>Page.jsx). Default: "<Feature>"
#   --hooks               Also create a hooks/ folder with a starter hook
#   --data                Also create a data/ folder with a temp.json stub
#   --layout              Also create a layout/ folder (for feature-as-mini-app cases)
#   --dry-run             Print what would be created without writing anything
#
# Example:
#   ./scaffold_feature.sh wishlist --pages "Wishlist" --hooks
#   ./scaffold_feature.sh shopkeeper-billing --pages "Invoices,InvoiceDetail" --layout --data

set -euo pipefail

FEATURE=""
SRC_ROOT="./src"
PAGES=""
WITH_HOOKS=0
WITH_DATA=0
WITH_LAYOUT=0
DRY_RUN=0

pascal_case() {
  # "some-feature-name" -> "SomeFeatureName"
  echo "$1" | awk -F'[-_ ]' '{ for(i=1;i<=NF;i++){ $i=toupper(substr($i,1,1)) substr($i,2) } print }' OFS=''
}
camel_case() {
  local p; p=$(pascal_case "$1")
  echo "${p:0:1}" | tr '[:upper:]' '[:lower:]'
  echo "${p:1}"
}
camel() { local a b; a=$(camel_case "$1" | head -1); b=$(camel_case "$1" | tail -1); echo "${a}${b}"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root) SRC_ROOT="$2"; shift 2 ;;
    --pages) PAGES="$2"; shift 2 ;;
    --hooks) WITH_HOOKS=1; shift ;;
    --data) WITH_DATA=1; shift ;;
    --layout) WITH_LAYOUT=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    *)
      if [[ -z "$FEATURE" ]]; then FEATURE="$1"; shift;
      else echo "Unknown arg: $1" >&2; exit 1; fi
      ;;
  esac
done

if [[ -z "$FEATURE" ]]; then
  echo "Usage: $0 <feature-name> [--root src] [--pages Name1,Name2] [--hooks] [--data] [--layout]" >&2
  exit 1
fi

FEATURE_PASCAL=$(pascal_case "$FEATURE")
FEATURE_CAMEL="$(echo "${FEATURE_PASCAL:0:1}" | tr '[:upper:]' '[:lower:]')${FEATURE_PASCAL:1}"
FEATURE_DIR="$SRC_ROOT/features/$FEATURE"

if [[ -z "$PAGES" ]]; then PAGES="$FEATURE_PASCAL"; fi

run() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] $*"
  else
    eval "$@"
  fi
}

echo "Scaffolding feature '$FEATURE' at $FEATURE_DIR"

run "mkdir -p '$FEATURE_DIR/components'"
run "mkdir -p '$FEATURE_DIR/pages'"
run "mkdir -p '$FEATURE_DIR/services'"
[[ "$WITH_HOOKS" -eq 1 ]] && run "mkdir -p '$FEATURE_DIR/hooks'"
[[ "$WITH_DATA" -eq 1 ]] && run "mkdir -p '$FEATURE_DIR/data'"
[[ "$WITH_LAYOUT" -eq 1 ]] && run "mkdir -p '$FEATURE_DIR/layout'"

# services stub
SERVICE_FILE="$FEATURE_DIR/services/${FEATURE_CAMEL}Service.js"
if [[ "$DRY_RUN" -eq 0 && ! -f "$SERVICE_FILE" ]]; then
cat > "$SERVICE_FILE" <<EOF
import apiClient from '../../../shared/services/apiClient';

export async function get${FEATURE_PASCAL}List(params = {}) {
  const { data } = await apiClient.get('/${FEATURE}', { params });
  return data;
}

export async function get${FEATURE_PASCAL}ById(id) {
  const { data } = await apiClient.get(\`/${FEATURE}/\${id}\`);
  return data;
}
EOF
  echo "  created $SERVICE_FILE"
else
  echo "  [dry-run] would create $SERVICE_FILE"
fi

# pages
IFS=',' read -ra PAGE_LIST <<< "$PAGES"
for RAW_PAGE in "${PAGE_LIST[@]}"; do
  PAGE=$(echo "$RAW_PAGE" | xargs) # trim whitespace
  PAGE_PASCAL=$(pascal_case "$PAGE")
  PAGE_FILE="$FEATURE_DIR/pages/${PAGE_PASCAL}Page.jsx"
  if [[ "$DRY_RUN" -eq 0 ]]; then
cat > "$PAGE_FILE" <<EOF
import { useEffect, useState } from 'react';

export default function ${PAGE_PASCAL}Page() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // fetch data via ../services/${FEATURE_CAMEL}Service if needed
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">${PAGE_PASCAL}</h1>
    </div>
  );
}
EOF
    echo "  created $PAGE_FILE"
  else
    echo "  [dry-run] would create $PAGE_FILE"
  fi
done

# hook stub
if [[ "$WITH_HOOKS" -eq 1 && "$DRY_RUN" -eq 0 ]]; then
  HOOK_FILE="$FEATURE_DIR/hooks/use${FEATURE_PASCAL}.js"
  cat > "$HOOK_FILE" <<EOF
import { useState, useCallback } from 'react';

export function use${FEATURE_PASCAL}() {
  const [state, setState] = useState(null);

  const update = useCallback((value) => setState(value), []);

  return { state, update };
}
EOF
  echo "  created $HOOK_FILE"
fi

# data stub
if [[ "$WITH_DATA" -eq 1 && "$DRY_RUN" -eq 0 ]]; then
  DATA_FILE="$FEATURE_DIR/data/temp.json"
  echo '[]' > "$DATA_FILE"
  echo "  created $DATA_FILE"
fi

# components/.gitkeep so empty dir is tracked
[[ "$DRY_RUN" -eq 0 ]] && touch "$FEATURE_DIR/components/.gitkeep"

echo ""
echo "Done. Next steps:"
echo "  1. Add real components under $FEATURE_DIR/components/"
echo "  2. Register each page's route in $SRC_ROOT/router.jsx, e.g.:"
echo "     import ${FEATURE_PASCAL}Page from './features/$FEATURE/pages/${FEATURE_PASCAL}Page';"
echo "     { path: '/$FEATURE', element: <${FEATURE_PASCAL}Page /> },"
[[ "$WITH_LAYOUT" -eq 1 ]] && echo "  3. Build $FEATURE_DIR/layout/ if this feature needs its own shell (header/sidebar)."
