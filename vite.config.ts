// Vercel deployment using Nitro adapter + TanStack Start
// Based on official TanStack Start examples/react/start-basic pattern
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { nitro } from 'nitro/vite'

export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({
      srcDirectory: 'src',
    }),
    viteReact(),
    nitro({ preset: 'vercel' }),
  ],
})
