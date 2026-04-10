import { defineConfig } from 'vite';

// Минимальный конфиг без плагинов
export default defineConfig({
  // Можно настроить esbuild под React, но в простом случае и так ок
  esbuild: {
    jsx: 'automatic', // использовать новый JSX runtime (react-jsx)
  },
  server: {
    port: 5173,
    open: false,
  },
});