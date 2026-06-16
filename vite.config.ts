import vue from '@vitejs/plugin-vue';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, parse, resolve } from 'node:path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import dts from 'unplugin-dts/vite';

function readPackageLock(): Record<string, unknown> {
  let checkDir = process.cwd();
  const { root } = parse(checkDir);
  while (checkDir !== root) {
    if (existsSync(join(checkDir, 'package-lock.json'))) {
      return JSON.parse(
        readFileSync(join(checkDir, 'package-lock.json'), { encoding: 'utf-8' }),
      ) as Record<string, unknown>;
    }
    checkDir = dirname(checkDir);
  }

  throw new Error('package-lock.json not found');
}

function getAllDeps() {
  const lockfile = readPackageLock();
  if (!lockfile['packages'] || typeof lockfile['packages'] !== 'object') throw new Error();
  const resolvedPaths = Object.keys(lockfile['packages']);
  return (
    resolvedPaths
      // Omit paths that map elsewhere within our project - if we use them, they'll also wind up
      // in node_modules anyways
      .filter((path) => path.startsWith('node_modules'))
      // Valid import strings start with anything that maps into node_modules
      .map((path) => path.replace(/node_modules\//, ''))
      // We want to match `<packagename>/*` not just `<packagename>`, or else when we deep import,
      // the deep imports will be bundled
      .map((dep) => new RegExp(`^${dep}(/.*)?$`))
  );
}

export default defineConfig(({ mode }) => {
  const isWebComponent = mode === 'wc';

  return {
    plugins: [
      vue({ features: { customElement: isWebComponent } }),
      dts({
        tsconfigPath: 'tsconfig.app.json',
        exclude: isWebComponent ? ['src/main.ts'] : ['src/main.wc.ts'],
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
            name: 'EternaChat',
            fileName: '[name]',
            formats: ['es'],
          },
          cssCodeSplit: false,
          sourcemap: true,
          minify: false,
          rolldownOptions: {
            output: {
              preserveModules: true,
            },
            external: getAllDeps(),
          },
          emptyOutDir: true,
        }
      : { outDir: 'dist' },
  };
});
