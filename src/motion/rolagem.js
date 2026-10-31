import Lenis from 'lenis'

/**
 * Rolagem da página.
 * - Lenis dá a maciez da roda do mouse (no toque, a rolagem é a nativa).
 *   Com movimento reduzido, nada de Lenis: rolagem nativa pura.
 * - Um único requestAnimationFrame para todos os módulos (aCadaQuadro).
 * - .is-scrolling no <html> enquanto a página anda: o CSS não acende hover
 *   com o cursor parado debaixo do conteúdo que passa.
 * - Âncoras ficam com o voo.js (anchors: false).
 */
export function rolagem({ reduzido = false } = {}) {
  const html = document.documentElement
  const lenis = reduzido
    ? null
    : new Lenis({ autoRaf: false, anchors: false, lerp: 0.1, smoothWheel: true, syncTouch: false })

  const tarefas = new Set()
  let anterior = 0
  let ultimoY = -1
  let mexeuEm = 0

  const posicao = () => (lenis ? lenis.scroll : window.scrollY)

  function quadro(agora) {
    lenis?.raf(agora)
    const dt = anterior ? Math.min(0.1, (agora - anterior) / 1000) : 1 / 60
    anterior = agora

    const y = posicao()
    if (y !== ultimoY) {
      if (ultimoY !== -1) html.classList.add('is-scrolling')
      ultimoY = y
      mexeuEm = agora
    } else if (mexeuEm && agora - mexeuEm > 160) {
      html.classList.remove('is-scrolling')
      mexeuEm = 0
    }

    for (const tarefa of tarefas) tarefa(agora, dt, y)
    requestAnimationFrame(quadro)
  }
  requestAnimationFrame(quadro)

  const suave = (t) => 1 - Math.pow(1 - t, 4)

  return {
    lenis,
    reduzido,
    posicao,
    /** Registra uma função chamada a cada quadro: (agora, dt, y). Devolve o cancelamento. */
    aCadaQuadro(fn) {
      tarefas.add(fn)
      return () => tarefas.delete(fn)
    },
    irPara(y, { imediato = false, duracao = 1.2, aoTerminar } = {}) {
      if (lenis) {
        lenis.scrollTo(y, {
          immediate: imediato,
          force: true,
          lock: !imediato,
          duration: duracao,
          easing: suave,
          onComplete: aoTerminar,
        })
      } else {
        window.scrollTo({ top: y, behavior: 'instant' })
        aoTerminar?.()
      }
    },
    parar() {
      if (lenis) lenis.stop()
      else html.style.overflow = 'hidden'
    },
    soltar() {
      if (lenis) lenis.start()
      else html.style.overflow = ''
    },
    atualizar() {
      lenis?.resize()
    },
  }
}
