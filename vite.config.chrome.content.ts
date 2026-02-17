import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      input: {
        content: 'src/content/index.ts',
      },
      output: [
        {
          entryFileNames: 'js/[name].js',
          assetFileNames: 'assets/[name].[ext]',
          format: 'cjs',
          inlineDynamicImports: true,
        },
      ],
    },
  }
})
