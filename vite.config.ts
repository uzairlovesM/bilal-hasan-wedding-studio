import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.hdr', '**/*.riv'],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three-engine';
          if (id.includes('node_modules/@babylonjs')) return 'babylon-engine';
          if (id.includes('node_modules/pixi.js')) return 'pixi-engine';
          if (id.includes('node_modules/gsap') || id.includes('node_modules/animejs') || id.includes('node_modules/lenis')) return 'motion-engine';
          if (id.includes('node_modules/react')) return 'react-core';
        }
      }
    }
  },
  worker: { format: 'es' }
});
