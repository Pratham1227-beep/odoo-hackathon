# File Templates

Use these as starting boilerplate when creating new files. Adapt names/props to the
actual request — these are skeletons, not to be copy-pasted verbatim without adjusting
the actual content the user asked for.

## Feature page (`features/<feature>/pages/<Name>Page.jsx`)

```jsx
import { useEffect, useState } from 'react';
// import { get<Thing> } from '../services/<feature>Service';

export default function <Name>Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch data here
    setLoading(false);
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold">{'<Name>'}</h1>
    </div>
  );
}
```

## Feature component (`features/<feature>/components/<Name>.jsx`)

```jsx
export default function <Name>({ /* props */ }) {
  return (
    <div>
      {/* TODO */}
    </div>
  );
}
```

## Feature service (`features/<feature>/services/<feature>Service.js`)

```js
import apiClient from '../../../shared/services/apiClient';

export async function get<Things>(params = {}) {
  const { data } = await apiClient.get('/<things>', { params });
  return data;
}

export async function get<Thing>ById(id) {
  const { data } = await apiClient.get(`/<things>/${id}`);
  return data;
}

export async function create<Thing>(payload) {
  const { data } = await apiClient.post('/<things>', payload);
  return data;
}
```

## Zustand store (`store/use<Feature>Store.js`)

```js
import { create } from 'zustand';

const use<Feature>Store = create((set, get) => ({
  // state
  items: [],
  isLoading: false,
  error: null,

  // actions
  setItems: (items) => set({ items }),
  reset: () => set({ items: [], isLoading: false, error: null }),
}));

export default use<Feature>Store;
```

## Feature hook (`features/<feature>/hooks/use<Name>.js`)

```js
import { useState, useCallback } from 'react';

export function use<Name>() {
  const [state, setState] = useState(null);

  const update = useCallback((value) => {
    setState(value);
  }, []);

  return { state, update };
}
```

## Shared UI primitive (`shared/components/ui/<Name>.jsx`)

```jsx
import { cn } from '../../utils/cn';

export default function <Name>({ className, children, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
```

Remember to add new UI primitives to `shared/components/ui/index.js`:
```js
export { default as <Name> } from './<Name>.jsx';
```

## Router registration (append to `src/router.jsx`)

```jsx
import <Name>Page from './features/<feature>/pages/<Name>Page';

// inside the routes array/children:
{ path: '/<route-path>', element: <<Name>Page /> },
```

## apiClient base (`shared/services/apiClient.js`) — only for brand-new projects

```js
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
```

## cn utility (`shared/utils/cn.js`) — only for brand-new projects

```js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```
