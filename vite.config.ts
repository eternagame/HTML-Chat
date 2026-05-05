import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import babel from 'vite-plugin-babel';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  const isWebComponent = mode === 'wc';

  return {
    plugins: [
      vue({ features: { customElement: isWebComponent } }),
      // Required for `irc-framework`
      nodePolyfills(),
      babel(),
    ],
    resolve: {
      alias: {
        // Required for `irc-framework`
        stream: import.meta.resolve('stream-browserify'),
      },
    },
    build: isWebComponent
      ? {
          lib: {
            entry: resolve(import.meta.dirname, './src/main.wc.ts'),
            name: 'EternaChat',
            fileName: 'eterna-chat',
            formats: ['es'],
          },
          cssCodeSplit: false,
          minify: 'terser',
        }
      : { outDir: 'dist' },
  };
});
