import { defineConfig } from 'vite'

// GitHub Pages serves the site from https://preethammukundan.github.io/PMDStudio/,
// so production builds use that sub-path. The dev server keeps using "/".
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/PMDStudio/' : '/'
}))
