/**
 * Barra de rolagem própria: fina e quadrada, aparece ao rolar ou com o mouse
 * perto da borda direita, e dá para arrastar. Some no toque (lá vale a nativa,
 * que o sistema mostra sozinho). A nativa fica escondida pelo CSS.
 */
export function barra({ rolagem }) {
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return
  const html = document.documentElement
  html.classList.add('tem-barra')

  const el = document.createElement('div')
  el.className = 'barra'
  el.setAttribute('aria-hidden', 'true')
  const polegar = document.createElement('i')
  el.append(polegar)
  document.body.append(el)

  let max = 1
  let curso = 0
  const medir = () => {
    const tela = window.innerHeight
    const doc = document.documentElement.scrollHeight
    max = Math.max(1, doc - tela)
    const altura = Math.max(40, (tela * tela) / Math.max(doc, tela))
    curso = tela - altura
    polegar.style.height = `${altura}px`
  }
  medir()
  addEventListener('resize', medir)
  new ResizeObserver(medir).observe(document.body)

  let perto = false
  let arrastando = false
  let ateQuando = 0
  let visivel = false
  let yPintado = -1

  addEventListener('pointermove', (e) => (perto = window.innerWidth - e.clientX < 28), { passive: true })
  document.documentElement.addEventListener('pointerleave', () => (perto = false))

  polegar.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    arrastando = true
    html.classList.add('is-arrastando')
    polegar.setPointerCapture(e.pointerId)
    const y0 = e.clientY
    const s0 = rolagem.posicao()
    const mover = (ev) => {
      const y = s0 + ((ev.clientY - y0) / Math.max(1, curso)) * max
      rolagem.irPara(Math.min(max, Math.max(0, y)), { imediato: true })
    }
    const soltar = () => {
      arrastando = false
      html.classList.remove('is-arrastando')
      polegar.removeEventListener('pointermove', mover)
      polegar.removeEventListener('pointerup', soltar)
      polegar.removeEventListener('pointercancel', soltar)
    }
    polegar.addEventListener('pointermove', mover)
    polegar.addEventListener('pointerup', soltar)
    polegar.addEventListener('pointercancel', soltar)
  })

  rolagem.aCadaQuadro((agora, _, y) => {
    if (y !== yPintado) {
      yPintado = y
      polegar.style.transform = `translate3d(0, ${(Math.min(y, max) / max) * curso}px, 0)`
    }
    if (html.classList.contains('is-scrolling')) ateQuando = agora + 900
    const mostrar = arrastando || perto || agora < ateQuando
    if (mostrar !== visivel) {
      visivel = mostrar
      el.classList.toggle('is-visivel', mostrar)
    }
  })
}
