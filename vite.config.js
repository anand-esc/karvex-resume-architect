import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'KARVEX | Editorial Resume Core',
        short_name: 'KARVEX',
        description: 'AI-Powered Career Intelligence and Resume Architect.',
        theme_color: '#556b2f',
        background_color: '#ffffff',
        display: 'standalone',
        // Here is where that specific icons array belongs!
        icons: [
          {
            src: 'icon.svg', 
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});