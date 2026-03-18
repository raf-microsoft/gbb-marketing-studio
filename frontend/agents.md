# Agent Instructions

## UI Components

Use **Radix Themes** (`@radix-ui/themes`) as the primary component library. Prefer Radix Themes primitives (e.g., `Button`, `Card`, `Dialog`, `Flex`, `Grid`, `Text`, `Heading`, `Badge`, `Avatar`, etc.) over building custom components from scratch.

- Import components from `@radix-ui/themes`
- Wrap the app with `<Theme>` provider if not already present
- Use Radix Themes design tokens and props for spacing, color, and typography where possible

## Layout & Containers

Use Radix Themes **`Flex`** and **`Box`** components instead of plain `<div>` elements for all layout and container needs.

- Use `<Flex>` for any flexbox layout — prefer its props (`direction`, `align`, `justify`, `gap`, `wrap`) over Tailwind flex utilities
- Use `<Box>` for generic block containers — prefer its props (`p`, `px`, `py`, `m`, `mx`, `my`) over Tailwind spacing utilities
- Only fall back to a plain `<div>` when neither `Flex` nor `Box` is appropriate (e.g., semantic HTML requirements)
- Compose layouts by nesting `Flex` and `Box` rather than stacking Tailwind class strings

## Styling

Use **Tailwind CSS** for any additional styling that Radix Themes does not cover.

- Prefer Radix Themes props first (e.g., `size`, `variant`, `color`, `radius`, `gap`, `p`, `m`)
- Use Tailwind utility classes only for styles not expressible via Radix props (e.g., custom widths, borders, transitions)
- Avoid writing custom CSS unless absolutely necessary

## Toast Notifications

Use **React Toastify** (`react-toastify`) for all toast and notification messages.

- Import `toast` from `react-toastify`
- Ensure `<ToastContainer />` is mounted in the app root (e.g., `_app.js`)
- Import the default styles: `import 'react-toastify/dist/ReactToastify.css'`
- Use appropriate toast types: `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`

## Icons

Use **Tabler Icons** (`@tabler/icons-react`) for all icons throughout the application.

- Import individual icons from `@tabler/icons-react` (e.g., `import { IconHome, IconUser } from '@tabler/icons-react'`)
- Do not use other icon libraries (Heroicons, Lucide, FontAwesome, etc.)
- Prefer named imports to keep bundle size small

## State Management

Use **Zustand** for all global and shared client-side state management.

- Create stores in a `store/` directory (e.g., `store/useUserStore.js`, `store/useCartStore.js`)
- Use the `create` function from `zustand`
- Keep stores focused and single-responsibility
- Use Zustand's `persist` middleware (from `zustand/middleware`) when state needs to survive page refreshes
- Avoid prop-drilling; lift shared state into Zustand stores

## Summary

| Concern | Library |
|---|---|
| UI Components | Radix Themes (`@radix-ui/themes`) |
| Layout & Containers | Radix Themes `Flex` and `Box` |
| Styling | Tailwind CSS |
| Toast Messages | React Toastify (`react-toastify`) |
| Icons | Tabler Icons (`@tabler/icons-react`) |
| State Management | Zustand (`zustand`) |
