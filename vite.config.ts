import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import path from 'path';
import tsconfigConfig from './tsconfig.json';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'babel-plugin-transform-typescript-metadata',
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    }),
    tsconfigPaths(),
    dts(),
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: Object.entries(tsconfigConfig.compilerOptions.paths).reduce((result, [key, paths]) => {
      const matchPath = paths[0].match(/(.*)\//)?.[1] || paths[0];
      result[key] = path.join(__dirname, matchPath);
      return result;
    }, {}),
  },
});
