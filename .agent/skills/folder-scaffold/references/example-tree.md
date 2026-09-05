# Canonical Example: Neargrab Frontend Tree (annotated)

This is a real, shipped project tree that this skill's pattern is extracted from.
Use it as ground truth when in doubt about where something goes.

```
project-root/
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vercel.json
├── vite.config.js
├── README.md
├── public/                          # static assets served as-is
│   ├── assets/
│   │   ├── <FeatureName>/           # public-facing images grouped by feature
│   │   │   └── hero.webp
│   │   └── Landing/
│   │       ├── Hero.png
│   │       └── icons/
│   ├── logo.png
│   ├── og-image.png
│   ├── robots.txt
│   └── sitemap.xml
└── src/
    ├── App.jsx                      # root component, wraps router + providers
    ├── main.jsx                     # ReactDOM.createRoot entry point
    ├── router.jsx                   # SINGLE FILE, all routes declared here
    ├── index.css                    # Tailwind base + global CSS vars
    │
    ├── assets/                      # bundled (imported) assets, mirrors public/assets
    │   └── <FeatureName>/
    │
    ├── components/                  # TRUE global, cross-cutting components only
    │   ├── SEO.jsx                  # e.g. react-helmet wrapper
    │   └── StructuredData.jsx       # e.g. JSON-LD injector
    │   (keep this folder tiny — almost everything belongs in a feature or shared/)
    │
    ├── features/                    # <-- the heart of the architecture
    │   └── <feature-name>/          # lowercase-kebab, e.g. "cart", "shop", "search"
    │       ├── components/         # components used ONLY within this feature
    │       ├── pages/              # route-level components (mounted by router.jsx)
    │       ├── services/           # API calls for this feature (calls shared/apiClient)
    │       ├── data/                # OPTIONAL: mock/temp JSON or static data
    │       ├── hooks/                # OPTIONAL: feature-scoped custom hooks
    │       └── layout/               # OPTIONAL: feature has its own header/sidebar/shell
    │                                  # (only bigger features like "shopkeeper" need this)
    │
    ├── shared/                      # cross-feature, reusable, NOT feature-specific
    │   ├── components/
    │   │   ├── layout/              # app-wide layout pieces (Navbar, modals)
    │   │   ├── ui/                  # design-system primitives
    │   │   │   ├── Button.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   ├── Skeleton.jsx
    │   │   │   ├── InitialsAvatar.jsx
    │   │   │   └── index.js         # barrel file re-exporting all ui/ primitives
    │   │   ├── Rating.jsx           # shared domain component used by 2+ features
    │   │   └── ReviewCard.jsx
    │   ├── services/
    │   │   ├── apiClient.js         # axios/fetch wrapper, base URL, interceptors
    │   │   ├── supabase.js          # 3rd-party client init (or firebase.js, etc.)
    │   │   └── mediaService.js      # e.g. image upload/compression helper
    │   └── utils/
    │       ├── cn.js                # classnames/tailwind-merge helper
    │       ├── logger.js
    │       ├── mappers.js           # API <-> UI data shape transforms
    │       └── mappers.test.js      # co-located unit test
    │
    └── store/                       # global state, ONE FLAT FOLDER (not nested per feature)
        ├── useAuthStore.js          # naming: use<Domain>Store.js (Zustand convention)
        ├── useCartStore.js
        └── useLocationStore.js
```

## Real feature examples from this project (for pattern-matching)

- **`auth`** — smallest shape: `components/`, `pages/`, `services/` only.
- **`search`** — adds `hooks/` (`useSearchFilters.js`) for feature-scoped logic.
- **`explore`** — adds `data/temp.json` for mock data during early development.
- **`shopkeeper`** — the largest feature: adds `layout/` (its own header/sidebar since
  it's effectively a mini-app inside the app) and nests `components/` by sub-domain
  (`dashboard/`, `onboarding/`, `products/`, `profile/`).
- **`shop`** vs **`shopkeeper`** — note these are deliberately separate features:
  `shop` = public-facing shop profile pages, `shopkeeper` = the owner's private dashboard.
  Don't merge customer-facing and owner-facing concerns into one feature.
- **`landing`** — holds marketing pages (About, FAQ, Terms, Privacy) that don't need
  their own top-level features; grouped under `landing/pages/`.

## Rules of thumb (when deciding where something goes)

1. **Used by exactly one feature?** → `features/<name>/components/`
2. **Used by 2+ features, still visually/behaviorally specific?** → `shared/components/`
3. **A generic, unstyled-by-content UI primitive (button, modal, input)?** → `shared/components/ui/`
4. **A route the user navigates to directly?** → goes in that feature's `pages/`, and gets
   registered in `router.jsx`.
5. **Talks to an API/DB?** → `services/` (feature-level if feature-specific data, `shared/services/`
   if it's a base client like `apiClient.js` or a 3rd-party SDK init).
6. **Global app state that survives navigation?** → flat file in `store/`, named `use<X>Store.js`.
7. **A pure function with no side effects (formatting, mapping, className merging)?** → `shared/utils/`.
8. New feature doesn't need `data/`, `hooks/`, or `layout/` unless it actually has mock data,
   feature-specific hooks, or its own sub-navigation shell. Don't pre-create empty folders.
