/**
 * Loader: fundo escuro, o nome no centro e uma linha que enche conforme as
 * fotos do voo chegam. Sai quando a fonte está pronta e metade das fotos
 * carregou (teto de 12 s), nunca antes de 0,7 s. A rolagem fica travada
 * enquanto ele está na tela. Ao sair, põe .is-pronta no <html> e dispara
 * 'site:pronta', que libera o voo.
 */
export function carga(voo, { rolagem, minimo = 700, teto = 12000, saida = 650 } = {}) {
  const html = document.documentElement
  const el = document.querySelector('[data-carga]')
  const linha = el?.querySelector('b')
  const inicio = performance.now()
  let fonteOk = false
  let saiu = false

  html.classList.add('is-carregando')
  rolagem.parar()
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)

  const fonte = document.fonts
    ? Promise.race([
        document.fonts.load('300 1em "Jost Variable"').then(() => document.fonts.ready),
        new Promise((r) => setTimeout(r, teto)),
      ])
    : Promise.resolve()

  fonte.then(() => {
    fonteOk = true
    verificar()
  })

  voo.aoProgredir((p) => {
    if (linha) linha.style.transform = `scaleX(${p})`
    verificar()
  })

  const limite = setTimeout(sair, teto)

  function verificar() {
    if (fonteOk && voo.progresso() >= 0.5) sair()
  }

  function sair() {
    if (saiu) return
    saiu = true
    clearTimeout(limite)
    const falta = Math.max(0, minimo - (performance.now() - inicio))
    setTimeout(() => {
      el?.classList.add('is-saindo')
      html.classList.remove('is-carregando')
      html.classList.add('is-pronta')
      rolagem.soltar()
      window.dispatchEvent(new Event('site:pronta'))
      setTimeout(() => el?.remove(), saida + 100)
    }, falta)
  }
}
