import { defineConfig } from 'vite'
import conteudo from './src/conteudo/chale-do-vale.js'
import { renderizar } from './src/paginas/pagina.js'

// Escreve as seções no index.html a partir do arquivo de conteúdo.
// Ao editar o conteúdo, o Vite reinicia (é dependência desta config) e a
// página recarrega já com o texto novo.
function pagina() {
  return {
    name: 'pagina-do-conteudo',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const { cabeca, corpo } = renderizar(conteudo)
        return html.replace('<!--cabeca-->', cabeca).replace('<!--corpo-->', corpo)
      },
    },
  }
}

export default defineConfig({
  // caminhos relativos: o dist/ funciona na raiz de um domínio ou numa subpasta
  base: './',
  plugins: [pagina()],
  optimizeDeps: { entries: ['index.html'] },
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
