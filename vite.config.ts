// Vercel deployment config for TanStack Start
// Replaces @lovable.dev/vite-tanstack-config (Cloudflare-specific)
import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    preset: 'vercel',
  },
  vite: {
    plugins: [
      tsConfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
    ],
  },
})
