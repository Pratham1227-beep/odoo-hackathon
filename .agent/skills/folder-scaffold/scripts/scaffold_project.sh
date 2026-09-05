#!/usr/bin/env bash
# Bootstrap a brand-new React + Vite project with the feature-first skeleton.
# Safe to run in a hackathon: fast, minimal prompts, sane defaults.
#
# Usage:
#   ./scaffold_project.sh <project-dir> [--features "shop,cart,auth"] [--skip-install]
#
# What it does:
#   1. Runs `npm create vite@latest <project-dir> -- --template react` if no package.json exists
#   2. Installs react-router-dom, zustand, axios, clsx, tailwind-merge (+ tailwind if desired)
#   3. Lays down src/shared, src/store, src/components, src/features/<name> for each --features entry
#   4. Writes App.jsx, main.jsx, router.jsx, apiClient.js, cn.js starter content
#
# It will NOT overwrite files that already exist.

set -euo pipefail

PROJECT_DIR=""
FEATURES=""
SKIP_INSTALL=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --features) FEATURES="$2"; shift 2 ;;
    --skip-install) SKIP_INSTALL=1; shift ;;
    *)
      if [[ -z "$PROJECT_DIR" ]]; then PROJECT_DIR="$1"; shift;
      else echo "Unknown arg: $1" >&2; exit 1; fi
      ;;
  esac
done

if [[ -z "$PROJECT_DIR" ]]; then
  echo "Usage: $0 <project-dir> [--features \"shop,cart,auth\"] [--skip-install]" >&2
  exit 1
fi

if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
  echo "No package.json found, scaffolding a new Vite + React app..."
  npm create vite@latest "$PROJECT_DIR" -- --template react
fi

cd "$PROJECT_DIR"

if [[ "$SKIP_INSTALL" -eq 0 ]]; then
  echo "Installing core dependencies..."
  npm install react-router-dom zustand axios clsx tailwind-merge
fi

SRC="src"
mkdir -p "$SRC"/{features,components,assets,store}
mkdir -p "$SRC/shared/components/layout"
mkdir -p "$SRC/shared/components/ui"
mkdir -p "$SRC/shared/services"
mkdir -p "$SRC/shared/utils"

write_if_absent() {
  local path="$1"
  if [[ -f "$path" ]]; then
    echo "  skip (exists): $path"
  else
    cat > "$path"
    echo "  created: $path"
  fi
}

write_if_absent "$SRC/shared/utils/cn.js" <<'EOF'
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
EOF

write_if_absent "$SRC/shared/services/apiClient.js" <<'EOF'
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
EOF

write_if_absent "$SRC/router.jsx" <<'EOF'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Home</div>,
  },
  // register feature pages here, e.g.:
  // { path: '/shop', element: <ShopPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
EOF

write_if_absent "$SRC/App.jsx" <<'EOF'
import AppRouter from './router';

export default function App() {
  return <AppRouter />;
}
EOF

echo ""
echo "Skeleton ready in $PROJECT_DIR/$SRC"
if [[ -n "$FEATURES" ]]; then
  echo "Creating features: $FEATURES"
  IFS=',' read -ra FEAT_LIST <<< "$FEATURES"
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  for F in "${FEAT_LIST[@]}"; do
    F_TRIMMED=$(echo "$F" | xargs)
    bash "$SCRIPT_DIR/scaffold_feature.sh" "$F_TRIMMED" --root "$SRC"
  done
fi

echo ""
echo "Next steps:"
echo "  - Wire main.jsx to render <App /> (should already be default from Vite template)"
echo "  - Add Tailwind if desired: npm install -D tailwindcss @tailwindcss/vite"
echo "  - Start dev server: npm run dev"
