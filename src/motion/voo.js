import { filme as criarFilme } from './filme.js'
import { linhaDoTempo, tempoDaRolagem } from '../conteudo/tempo.js'

/**
 * O voo: as fotos do chalé presas à tela enquanto a seção rola.
 *
 * Vídeo por scroll, texto por tempo:
 * - a rolagem dá um tempo-alvo; o filme segue esse alvo colado na rolagem,
 *   com teto de velocidade (velocidadeMax segundos de filme por segundo);
 * - os textos trocam pelo tempo em que o filme está, e entram e saem por
 *   transição (CSS), nunca arrastados pela rolagem;
 * - rolando rápido, o voo vira um "play" pelas cenas e a página só sai dele
 *   quando o filme chega ao último quadro (a parede);
 * - para trás e longe demais, num pulo (teclado, barra) ou num link que
 *   atravessa o voo, o filme corta por um fade curto direto para lá.
 *
 * Contrato com o HTML/CSS: ver a seção "voo" em src/paginas/pagina.js e
 * src/sections/voo.css (.is-vivo, .is-in, .is-antes, .is-saltando,
 * .is-acendendo, .is-imediato, .is-coberto, inert nos marcos fora de cena).
 */

const VOLTA_LONGA = 2.5 // segundos de filme: voltar mais que isso corta
const PULO = 1.5 // telas num único quadro: é um pulo, não uma rolagem
const HISTERESE = 0.04 // segundos: evita o texto piscar na fronteira
const FADE_SAI = 220 // ms (igual ao CSS de .is-saltando)
const FADE_ENTRA = 600 // ms (igual ao CSS de .is-acendendo)

export function voo({ conteudo, rolagem, midiaRetrato, reduzido = false }) {
  const secao = document.querySelector('[data-voo]')
  const folha = document.querySelector('[data-clara]')
  const marcos = [...secao.querySelectorAll('.marco')]
  const inicios = marcos.map((m) => Number(m.dataset.de))
  const tempo = linhaDoTempo(conteudo)
  const { duracao, pontos, telasFilme } = tempo
  secao.style.setProperty('--telas', tempo.telas)

  const f = criarFilme({
    canvas: secao.querySelector('.voo__tela'),
    cenas: tempo.cenas,
    dissolver: conteudo.dissolver,
    midiaRetrato,
    reduzido,
  })

  /* --- medidas (posições no documento) --- */
  let topo = 0 // início da seção
  let parede = 0 // rolagem em que a folha encosta no pé da tela
  let folhaTopo = 0
  let solta = 0 // rolagem em que o palco se solta (a janela já saiu por cima)

  function medir() {
    const y = rolagem.posicao()
    topo = secao.getBoundingClientRect().top + y
    folhaTopo = folha.getBoundingClientRect().top + y
    parede = folhaTopo - window.innerHeight
    solta = topo + secao.offsetHeight - window.innerHeight
  }

  const tempoAlvo = (y) => {
    const u = ((y - topo) / Math.max(1, parede - topo)) * telasFilme
    return tempoDaRolagem(pontos, Math.min(Math.max(u, 0), telasFilme))
  }

  /* --- estado --- */
  let t = 0
  let ativo = 0
  let liberado = false
  let cortando = false
  let naParede = false
  let yAntes = 0

  function indice(tf) {
    let i = ativo
    while (i < marcos.length - 1 && tf >= inicios[i + 1]) i++
    while (i > 0 && tf < inicios[i] - HISTERESE) i--
    return i
  }

  function ativar(i, { imediato = false } = {}) {
    if (imediato) secao.classList.add('is-imediato')
    marcos.forEach((m, k) => {
      const atual = k === i
      m.classList.toggle('is-in', atual)
      m.classList.toggle('is-antes', k > i)
      m.inert = !atual
    })
    ativo = i
    if (imediato) {
      // Dois quadros: o navegador aplica o estado novo sem transição antes de
      // devolver as transições.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => secao.classList.remove('is-imediato')),
      )
    }
  }

  /** Corta por fade: apaga, faz a troca (pulo de rolagem, se houver), acende. */
  function cortar(trocar) {
    if (cortando) return
    cortando = true
    secao.classList.add('is-saltando')
    setTimeout(() => {
      trocar?.()
      const y = rolagem.posicao()
      t = tempoAlvo(y)
      ativar(indice(t), { imediato: true })
      f.desenhar(t, ativo, performance.now(), { imediato: true })
      yAntes = y
      secao.classList.remove('is-saltando')
      secao.classList.add('is-acendendo')
      setTimeout(() => secao.classList.remove('is-acendendo'), FADE_ENTRA)
      cortando = false
    }, FADE_SAI)
  }

  function segurarNaParede() {
    if (!naParede) {
      naParede = true
      rolagem.parar()
    }
    rolagem.irPara(parede, { imediato: true })
  }

  function soltarDaParede() {
    naParede = false
    rolagem.soltar()
  }

  /* --- quadro a quadro --- */
  rolagem.aCadaQuadro((agora, dt, y) => {
    if (!liberado || cortando) {
      f.desenhar(t, ativo, agora)
      return
    }

    const dy = y - yAntes
    yAntes = y
    const alvo = tempoAlvo(y)
    const tocaOVoo = Math.min(y, y - dy) < solta

    if (reduzido) {
      t = alvo
    } else if (tocaOVoo && Math.abs(dy) > PULO * window.innerHeight) {
      cortar()
      return
    } else if (alvo < t - VOLTA_LONGA) {
      cortar()
      return
    } else {
      const passo = conteudo.velocidadeMax * dt
      t += Math.max(-passo, Math.min(passo, alvo - t))
    }

    if (!reduzido) {
      const noFim = t >= duracao - 1e-3
      if (y > parede + 1 && !noFim) {
        // Arrastando a barra, a parede brigaria com a mão: corta para o fim.
        if (document.documentElement.classList.contains('is-arrastando')) return cortar()
        segurarNaParede()
      } else if (naParede && noFim) soltarDaParede()
    }

    const i = indice(t)
    if (i !== ativo) ativar(i)
    secao.classList.toggle('is-coberto', folhaTopo - y < window.innerHeight / 2)
    f.desenhar(t, ativo, agora)
  })

  /* --- links internos: âncoras são daqui (o Lenis não cuida delas) --- */
  function irPara(destino, foco) {
    const y = rolagem.posicao()
    const focar = () => foco?.focus({ preventScroll: true })
    const atravessa = Math.min(y, destino) < solta - 1
    if (reduzido || !atravessa) {
      rolagem.irPara(destino, { imediato: reduzido, aoTerminar: focar })
      return
    }
    if (naParede) soltarDaParede()
    cortar(() => {
      rolagem.irPara(destino, { imediato: true })
      focar()
    })
  }

  function destinoDe(id) {
    if (id === 'topo') return { y: 0, el: null }
    const el = document.getElementById(id)
    if (!el) return null
    return { y: el.getBoundingClientRect().top + rolagem.posicao(), el }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]')
    if (!a || e.defaultPrevented || e.button !== 0) return
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const destino = destinoDe(a.getAttribute('href').slice(1))
    if (!destino) return
    e.preventDefault()
    irPara(destino.y, destino.el)
  })

  /* --- início --- */
  medir()
  addEventListener('resize', medir)
  new ResizeObserver(medir).observe(document.body)

  f.pronto.then(() => secao.classList.add('is-vivo'))

  // O primeiro texto espera embaixo e entra junto com a saída do loader.
  ativar(0, { imediato: true })
  marcos[0].classList.replace('is-in', 'is-antes')
  marcos[0].inert = true

  addEventListener('site:pronta', () => {
    medir()
    liberado = true
    yAntes = rolagem.posicao()
    t = tempoAlvo(yAntes)
    ativar(indice(t))
    const alvoInicial = location.hash && destinoDe(location.hash.slice(1))
    if (alvoInicial) irPara(alvoInicial.y, alvoInicial.el)
  })

  return {
    progresso: f.progresso,
    aoProgredir: f.aoProgredir,
    pronto: f.pronto,
    irPara,
  }
}
