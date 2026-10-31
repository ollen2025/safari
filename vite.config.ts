import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Phaser alene fylder ~1,2 MB, så standardgrænsen på 500 kB giver altid en advarsel
    chunkSizeWarningLimit: 1500,
  },
});
