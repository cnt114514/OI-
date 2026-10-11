import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // GitHub Pages 项目页部署路径：cnt114514.github.io/OI-/
  base: '/OI-/',
  plugins: [react(), tailwindcss()],
  build: { target: 'es2020' },
});
