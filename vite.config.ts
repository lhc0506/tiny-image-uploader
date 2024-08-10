import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/lib/index.ts',
      name: 'TinyImageUploader',
      fileName: (format) => `tiny-image-uploader.${format}.js`,
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
