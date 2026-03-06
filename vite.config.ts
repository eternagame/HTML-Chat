import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    vue(),
    // Required for `irc-framework`
    nodePolyfills(),
  ],
  resolve: {
    alias: {
      // Required for `irc-framework`
      stream: import.meta.resolve('stream-browserify'),
    },
  },
});
