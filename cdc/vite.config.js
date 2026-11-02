import { defineConfig } from 'vite'

export default defineConfig({
  // caminhos relativos: o dist/ funciona na raiz de um domínio ou numa subpasta
  base: './',
  build: { target: 'es2020' },
})
