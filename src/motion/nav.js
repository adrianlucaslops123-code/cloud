/**
 * A nav fica clara (fundo da página, fio embaixo, texto escuro) quando o topo
 * da folha passa da metade dela; volta a ser transparente sobre o voo.
 * Mede no resize e compara com a rolagem a cada quadro (sem ler o DOM).
 */
export function nav({ rolagem }) {
  const el = document.querySelector('[data-nav]')
  const folha = document.querySelector('[data-clara]')
  if (!el || !folha) return

  let folhaTopo = 0
  let meio = 0
  const medir = () => {
    folhaTopo = folha.getBoundingClientRect().top + rolagem.posicao()
    meio = el.offsetHeight / 2
  }
  medir()
  addEventListener('resize', medir)
  new ResizeObserver(medir).observe(document.body)

  let clara = null
  rolagem.aCadaQuadro((_, __, y) => {
    const agora = folhaTopo - y <= meio
    if (agora !== clara) {
      clara = agora
      el.classList.toggle('is-clara', agora)
    }
  })
}
