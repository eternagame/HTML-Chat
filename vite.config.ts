import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import dts from 'unplugin-dts/vite';

export default defineConfig(({ mode }) => {
  const isWebComponent = mode === 'wc';

  return {
    plugins: [
      vue({ features: { customElement: isWebComponent } }),
      dts({
        tsconfigPath: 'tsconfig.app.json',
        exclude: isWebComponent ? ['src/main.ts'] : ['src/main.wc.ts'],
        bundleTypes: true,
      }),
      // Required for `irc-framework`
      nodePolyfills(),
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
            fileName: '[name]',
            formats: ['es'],
          },
          cssCodeSplit: false,
          sourcemap: true,
          minify: false,
          emptyOutDir: true,
        }
      : { outDir: 'dist' },
  };
});
