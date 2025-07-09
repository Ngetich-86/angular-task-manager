# Vue 3 + Vite + Tailwind CSS v4 Starter

This project is a starter template for building Vue 3 applications using Vite and Tailwind CSS v4.

> **Note:** This project uses [pnpm](https://pnpm.io/) as the package manager. Please ensure you have pnpm installed globally:
>
> ```bash
> npm install -g pnpm
> ```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (see above)

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start the Development Server

```bash
pnpm dev
```

The app will be available at [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

### 3. Build for Production

```bash
pnpm build
```

### 4. Preview the Production Build

```bash
pnpm preview
```

## Tailwind CSS v4 Setup

This project is pre-configured with Tailwind CSS v4.

- **Tailwind config:** See `tailwind.config.js`
- **PostCSS config:** See `postcss.config.js`
- **Main CSS:** Tailwind is imported in `src/assets/main.css` and loaded in `src/main.ts`

#### Example Tailwind Usage

You can use Tailwind utility classes directly in your Vue components. For example, see `src/App.vue`:

```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
    <h1 class="text-4xl font-bold text-amber-600">🚀 Tailwind is working!</h1>
  </div>
</template>
```

#### Tailwind Directives in `main.css`

```css
@import "tailwindcss/preflight";
@tailwind utilities;
```

> **Note:** If you want to use more Tailwind features, you can add `@tailwind base;` and `@tailwind components;` as needed.

## Configuration

### `tailwind.config.js`
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### `postcss.config.js`
```js
// postcss.config.js
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss(), // <- must have () — it's now a function
    autoprefixer(),
  ],
}
```

### `src/assets/main.css`
```css
@import "tailwindcss/preflight";
@tailwind utilities;
```

## Project Structure

- `src/` - Vue source files
- `src/assets/main.css` - Main CSS file with Tailwind imports
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration for Tailwind
- `vite.config.ts` - Vite configuration

## Linting & Formatting

- Lint: `pnpm lint`
- Format: `pnpm format`

## Testing

- Unit tests: `pnpm test:unit`


#### folder structure
```src/
├── assets/              # Tailwind CSS, images, icons, etc.
│   └── main.css
├── components/          # Reusable UI components
│   ├── Navbar.vue
│   ├── TaskCard.vue
│   └── Loader.vue
├── composables/         # Composable functions (reusable logic)
│   └── useAuth.ts
├── layouts/             # AppShells like MainLayout, AuthLayout
│   └── MainLayout.vue
├── pages/               # Views for routing
│   ├── auth/
│   │   ├── Login.vue
│   │   └── Register.vue
│   ├── dashboard/
│   │   ├── Tasks.vue
│   │   └── Profile.vue
│   └── NotFound.vue
├── router/              # Vue Router config
│   └── index.ts
├── services/            # API calls or firebase logic
│   └── authService.ts
├── stores/              # Pinia stores
│   ├── authStore.ts
│   └── taskStore.ts
├── types/               # TypeScript interfaces and types
│   ├── task.ts
│   └── user.ts
├── utils/               # Helper functions
│   └── validateEmail.ts
├── App.vue              # Root component
├── main.ts              # App entry point
└── tailwind.config.js
└── postcss.config.js
```
```