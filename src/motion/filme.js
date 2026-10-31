/**
 * O "filme" do voo, feito de fotos reais.
 *
 * Desenha num <canvas> a foto da cena atual com um movimento de câmera lento
 * guiado pelo tempo do filme (que segue a rolagem): só escala e posição, a
 * foto sempre cobrindo a tela, nunca esticada nem deformada. Quando a cena
 * muda, a foto nova entra por dissolução no tempo (não na rolagem), então a
 * rolagem nunca para no meio de uma dupla exposição.
 *
 * Cada cena tem uma foto e um enquadramento para o computador e outro para a
 * tela em pé (celular), trocados pelo mesmo media query do <picture>.
 */

const limitar = (v, min, max) => Math.min(max, Math.max(min, v))
const misturar = (a, b, p) => a + (b - a) * p
const suave = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

export function filme({ canvas, cenas, dissolver = 0.7, midiaRetrato, reduzido = false }) {
  const ctx = canvas.getContext('2d', { alpha: false })
  const buffer = document.createElement('canvas')
  const bctx = buffer.getContext('2d', { alpha: false })
  const retrato = matchMedia(midiaRetrato)
  let variante = retrato.matches ? 'mobile' : 'desktop'

  const imagens = new Map() // src → imagem decodificada
  const pendentes = new Map() // src → promessa
  const ouvintes = new Set()
  let progresso = 0

  let largura = 0
  let altura = 0
  let cenaDesenhada = -1
  let tDesenhado = -1
  let sujo = true
  let dissolvendo = false
  let inicioDissolve = 0

  let avisarPronto
  const pronto = new Promise((r) => (avisarPronto = r))
  let jaPronto = false

  /* --- carga das fotos --- */

  function carregar(src) {
    if (imagens.has(src)) return Promise.resolve(imagens.get(src))
    if (pendentes.has(src)) return pendentes.get(src)
    const img = new Image()
    img.decoding = 'async'
    img.src = src
    const promessa = img
      .decode()
      .then(() => {
        imagens.set(src, img)
        sujo = true
        return img
      })
      .catch(() => null)
      .finally(() => pendentes.delete(src))
    pendentes.set(src, promessa)
    return promessa
  }

  async function carregarVariante(v) {
    const fontes = [...new Set(cenas.map((c) => c.foto[v]))]
    let feitas = 0
    const contar = () => {
      feitas++
      if (v !== variante) return
      progresso = feitas / fontes.length
      for (const fn of ouvintes) fn(progresso)
    }
    // A primeira foto antes de tudo; as outras em paralelo.
    await carregar(fontes[0]).then(contar)
    await Promise.all(fontes.slice(1).map((src) => carregar(src).then(contar)))
  }

  retrato.addEventListener('change', (e) => {
    variante = e.matches ? 'mobile' : 'desktop'
    progresso = 0
    sujo = true
    carregarVariante(variante)
  })

  /* --- tamanho --- */

  function medir() {
    const caixa = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(1, Math.round(caixa.width * dpr))
    const h = Math.max(1, Math.round(caixa.height * dpr))
    if (w === largura && h === altura) return
    largura = canvas.width = buffer.width = w
    altura = canvas.height = buffer.height = h
    for (const c of [ctx, bctx]) {
      c.imageSmoothingEnabled = true
      c.imageSmoothingQuality = 'high'
    }
    ctx.fillStyle = '#12100d'
    ctx.fillRect(0, 0, w, h)
    dissolvendo = false
    sujo = true
  }
  new ResizeObserver(medir).observe(canvas)

  /* --- desenho --- */

  // Se a foto da cena ainda não chegou, usa a mais próxima que já chegou.
  function imagemDa(i) {
    const propria = imagens.get(cenas[i].foto[variante])
    if (propria) return { img: propria, cena: cenas[i] }
    for (let d = 1; d < cenas.length; d++) {
      for (const k of [i - d, i + d]) {
        const img = k >= 0 && k < cenas.length && imagens.get(cenas[k].foto[variante])
        if (img) return { img, cena: cenas[k] }
      }
    }
    return null
  }

  function pintar(i, t) {
    const achada = imagemDa(i)
    if (!achada) return false
    const { img, cena } = achada
    const [[x0, y0, z0], [x1, y1, z1]] = cena.camera[variante]
    const ultima = i === cenas.length - 1
    const p = reduzido ? (ultima ? 1 : 0) : limitar((t - cena.de) / (cena.ate - cena.de), 0, 1)

    const iw = img.naturalWidth
    const ih = img.naturalHeight
    const escala = Math.max(largura / iw, altura / ih) * Math.max(1, misturar(z0, z1, p))
    const dw = iw * escala
    const dh = ih * escala
    const x = limitar(largura / 2 - misturar(x0, x1, p) * dw, largura - dw, 0)
    const y = limitar(altura / 2 - misturar(y0, y1, p) * dh, altura - dh, 0)
    ctx.drawImage(img, x, y, dw, dh)
    return true
  }

  /**
   * Desenha o tempo t (segundos de filme) na cena i (o voo decide a cena,
   * para o texto e a foto trocarem juntos).
   */
  function desenhar(t, i, agora, { imediato = false } = {}) {
    if (!largura) medir()
    if (i !== cenaDesenhada) {
      if (cenaDesenhada >= 0 && !imediato && dissolver > 0 && !reduzido) {
        bctx.drawImage(canvas, 0, 0)
        dissolvendo = true
        inicioDissolve = agora
      } else {
        dissolvendo = false
      }
      cenaDesenhada = i
      sujo = true
    }
    if (!sujo && !dissolvendo && t === tDesenhado) return

    let k = 1
    if (dissolvendo) {
      k = limitar((agora - inicioDissolve) / (dissolver * 1000), 0, 1)
      ctx.globalAlpha = 1
      ctx.drawImage(buffer, 0, 0)
      ctx.globalAlpha = suave(k)
    }
    const desenhou = pintar(i, t)
    ctx.globalAlpha = 1
    if (k >= 1) dissolvendo = false

    tDesenhado = t
    sujo = !desenhou
    if (desenhou && !jaPronto) {
      jaPronto = true
      avisarPronto()
    }
  }

  carregarVariante(variante)

  return {
    desenhar,
    medir,
    pronto,
    progresso: () => progresso,
    aoProgredir(fn) {
      ouvintes.add(fn)
      fn(progresso)
      return () => ouvintes.delete(fn)
    },
  }
}
