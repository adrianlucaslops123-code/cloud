/**
 * Letras feitas de partículas que reagem ao mouse.
 *
 * Como funciona, em três passos:
 *
 * 1. AMOSTRAR: o texto é escrito num <canvas> 2D escondido e lido pixel a
 *    pixel. Onde tem tinta vira um ponto. Para as letras terem corpo (não
 *    serem um papel chapado), os pontos são empilhados em camadas na
 *    profundidade: a frente e o fundo cheios, as camadas do meio só com a
 *    borda, como uma letra extrudada.
 *
 * 2. FÍSICA (a função `passo`): cada ponto tem uma casa (o lugar dele na
 *    letra), um deslocamento e uma velocidade. A cada quadro:
 *      - perto do cursor, o ponto pega a velocidade do mouse (o "pente") e
 *        leva um empurrão leve para fora;
 *      - apertando o botão, tudo em volta explode para longe e, enquanto o
 *        botão fica apertado, o buraco fica aberto;
 *      - uma mola puxa o ponto de volta para casa, com pouco amortecimento,
 *        então ele passa do lugar e balança antes de assentar (o "ímã").
 *
 * 3. DESENHAR: um só THREE.Points com um shader pequeno. Ponto rápido
 *    acende (fica mais branco e maior), então o rastro do mouse brilha.
 *
 * Uso: const cdc = particulas({ alvo, eventos, texto: 'CDC' })
 *   alvo     elemento onde o <canvas> entra (ocupa 100% dele)
 *   eventos  elemento que escuta o mouse (normalmente a seção inteira)
 */

import * as THREE from 'three'

// ---------- ajustes (mexa aqui) ----------
const AJUSTE = {
  largura: 10, // largura do texto no mundo 3D
  espessura: 0.9, // profundidade das letras
  camadas: 7, // camadas na profundidade (frente e fundo cheios, meio só borda)
  pontosPC: 58000, // quantidade alvo no computador
  pontosCel: 30000, // no celular
  cores: ['#9fd0ff', '#e9f2ff', '#ffb38a', '#ff5a1a'], // da esquerda para a direita

  raio: 1.05, // alcance do mouse (unidades do mundo)
  pega: 14, // quanto o ponto copia a velocidade do mouse
  empurra: 26, // empurrão para fora perto do cursor
  raioClique: 3.2, // alcance da explosão do clique
  explosao: 26, // força da explosão
  segura: 90, // força que mantém o buraco aberto enquanto aperta

  mola: 55, // força que puxa para casa (mais alto = volta mais rápido)
  atrito: 2.6, // amortecimento (mais baixo = balança mais)

  inclina: 0.38, // quanto o bloco todo gira seguindo o mouse
}

const VERT = /* glsl */ `
  attribute vec3 aCor;
  attribute float aTam;
  attribute float aEnergia;
  uniform float uPx;
  varying vec3 vCor;
  varying float vAlfa;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float e = clamp(aEnergia, 0.0, 1.0);
    gl_PointSize = max(1.0, aTam * uPx / -mv.z * (1.0 + e * 0.9));
    vCor = mix(aCor, vec3(1.0, 0.97, 0.93), e * 0.75);
    vAlfa = 0.92 + e * 0.08;
  }
`

const FRAG = /* glsl */ `
  varying vec3 vCor;
  varying float vAlfa;
  void main() {
    vec2 p = abs(gl_PointCoord - 0.5);
    if (max(p.x, p.y) > 0.44) discard; // quadradinho com respiro
    gl_FragColor = vec4(vCor, vAlfa);
  }
`

const limitar = (v, a, b) => Math.min(b, Math.max(a, v))
const misturar = (a, b, p) => a + (b - a) * p

function corNoGradiente(stops, u) {
  const n = stops.length - 1
  const i = Math.min(n - 1, Math.floor(u * n))
  const p = u * n - i
  return stops[i].clone().lerp(stops[i + 1], p)
}

// Escreve o texto num canvas escondido e devolve os pontos das letras.
function amostrar(texto, fonte, alvoPontos) {
  const W = 1800
  const H = 700
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d', { willReadFrequently: true })

  let tam = 560
  ctx.font = `${tam}px ${fonte}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(tam * 0.03)}px`
  let m = ctx.measureText(texto)
  const escala = Math.min((W * 0.94) / m.width, (H * 0.86) / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent))
  tam = Math.floor(tam * escala)
  ctx.font = `${tam}px ${fonte}`
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${Math.round(tam * 0.03)}px`
  m = ctx.measureText(texto)
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(texto, W / 2, H / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2)

  const dados = ctx.getImageData(0, 0, W, H).data
  const cheio = (x, y) => {
    x |= 0
    y |= 0
    if (x < 0 || y < 0 || x >= W || y >= H) return false
    return dados[(y * W + x) * 4 + 3] > 127
  }

  // mede a área pintada e o retângulo das letras
  let area = 0
  let x0 = W, x1 = 0, y0 = H, y1 = 0
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (dados[(y * W + x) * 4 + 3] > 127) {
        area += 4
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }

  // frente + fundo cheios; o meio só a borda (≈ 18% da área cada)
  const L = AJUSTE.camadas
  const pesoTotal = 2 + (L - 2) * 0.22
  const passo = Math.max(1.6, Math.sqrt((area * pesoTotal) / alvoPontos))
  const borda = passo * 1.6

  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const pxPorUnidade = (x1 - x0) / AJUSTE.largura
  const pontos = []

  for (let gy = y0; gy <= y1; gy += passo) {
    for (let gx = x0; gx <= x1; gx += passo) {
      const x = gx + (Math.random() - 0.5) * passo * 0.7
      const y = gy + (Math.random() - 0.5) * passo * 0.7
      if (!cheio(x, y)) continue
      const naBorda = !cheio(x + borda, y) || !cheio(x - borda, y) || !cheio(x, y + borda) || !cheio(x, y - borda)
      const u = (x - x0) / (x1 - x0)
      for (let l = 0; l < L; l++) {
        const face = l === 0 || l === L - 1
        if (!face && !naBorda) continue
        const z = misturar(-AJUSTE.espessura / 2, AJUSTE.espessura / 2, l / (L - 1))
        pontos.push({
          x: (x - cx) / pxPorUnidade,
          y: -(y - cy) / pxPorUnidade,
          z,
          u,
          camada: l / (L - 1), // 0 = fundo, 1 = frente
          borda: naBorda,
        })
      }
    }
  }

  return { pontos, tamanho: passo / pxPorUnidade, altura: (y1 - y0) / pxPorUnidade }
}

export function particulas({ alvo, eventos = alvo, texto = 'CDC', fonte = "'Archivo Black', 'Arial Black', sans-serif" }) {
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches
  const celular = matchMedia('(hover: none), (max-width: 700px)').matches

  // ---------- cena ----------
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  alvo.appendChild(renderer.domElement)

  const cena = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200)
  const grupo = new THREE.Group()
  cena.add(grupo)

  // ---------- pontos ----------
  const { pontos, tamanho, altura } = amostrar(texto, fonte, celular ? AJUSTE.pontosCel : AJUSTE.pontosPC)
  const N = pontos.length
  const casa = new Float32Array(N * 3)
  const pos = new Float32Array(N * 3)
  const off = new Float32Array(N * 3) // deslocamento da casa
  const vel = new Float32Array(N * 3)
  const cor = new Float32Array(N * 3)
  const tam = new Float32Array(N)
  const energia = new Float32Array(N)
  const atraso = new Float32Array(N)

  const stops = AJUSTE.cores.map((c) => new THREE.Color(c))
  for (let i = 0; i < N; i++) {
    const p = pontos[i]
    casa[i * 3] = p.x
    casa[i * 3 + 1] = p.y
    casa[i * 3 + 2] = p.z

    // cor: gradiente na largura, fundo mais escuro, borda da frente mais acesa
    const c = corNoGradiente(stops, p.u)
    let luz = misturar(0.32, 1, p.camada) * (0.88 + Math.random() * 0.2)
    if (p.camada === 1 && p.borda) luz *= 1.18
    if (p.camada > 0 && p.camada < 1) luz *= 0.82
    cor[i * 3] = Math.min(1, c.r * luz)
    cor[i * 3 + 1] = Math.min(1, c.g * luz)
    cor[i * 3 + 2] = Math.min(1, c.b * luz)
    tam[i] = tamanho * (0.85 + Math.random() * 0.35)

    // abertura: começa espalhado e chega varrendo da esquerda para a direita
    if (!reduzido) {
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(2 * Math.random() - 1)
      const r = 5 + Math.random() * 9
      off[i * 3] = Math.sin(b) * Math.cos(a) * r
      off[i * 3 + 1] = Math.sin(b) * Math.sin(a) * r * 0.6
      off[i * 3 + 2] = Math.cos(b) * r * 0.5 + 3
      atraso[i] = 0.1 + p.u * 0.7 + Math.random() * 0.6
    }
  }

  const geo = new THREE.BufferGeometry()
  const atrPos = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage)
  const atrEnergia = new THREE.BufferAttribute(energia, 1).setUsage(THREE.DynamicDrawUsage)
  geo.setAttribute('position', atrPos)
  geo.setAttribute('aCor', new THREE.BufferAttribute(cor, 3))
  geo.setAttribute('aTam', new THREE.BufferAttribute(tam, 1))
  geo.setAttribute('aEnergia', atrEnergia)
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50)

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uPx: { value: 1 } },
    transparent: true,
    depthWrite: true,
  })
  grupo.add(new THREE.Points(geo, material))

  // ---------- tamanho da tela ----------
  let largura = 1
  let alturaTela = 1
  function medir() {
    const r = alvo.getBoundingClientRect()
    largura = Math.max(1, r.width)
    alturaTela = Math.max(1, r.height)
    renderer.setSize(largura, alturaTela, false)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    camera.aspect = largura / alturaTela

    // distância da câmera para o texto ocupar ~80% da largura (92% no celular)
    // sem passar de ~52% da altura
    const t = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const ocupa = largura < 700 ? 0.92 : 0.8
    const dLarg = AJUSTE.largura / ocupa / (2 * t * camera.aspect)
    const dAlt = altura / 0.52 / (2 * t)
    const d = Math.max(dLarg, dAlt)
    camera.position.set(0, 0, d)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    grupo.position.y = 2 * d * t * 0.035 // um pouco acima do centro

    material.uniforms.uPx.value = (alturaTela * renderer.getPixelRatio()) / (2 * t)
  }
  medir()
  const ro = new ResizeObserver(medir)
  ro.observe(alvo)

  // ---------- mouse ----------
  const ndc = new THREE.Vector2(0, 0) // cursor de -1 a 1
  let dentro = false
  let apertado = false
  let ultimoMovimento = -10
  let clique = null // explosão pendente, aplicada no próximo quadro

  function lerCursor(e) {
    const r = alvo.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  }
  const aoMover = (e) => {
    lerCursor(e)
    dentro = true
    ultimoMovimento = performance.now() / 1000
  }
  const aoSair = () => {
    dentro = false
    apertado = false
  }
  const aoApertar = (e) => {
    if (e.button !== undefined && e.button !== 0) return
    lerCursor(e)
    dentro = true
    apertado = true
    clique = true
    ultimoMovimento = performance.now() / 1000
  }
  const aoSoltar = () => {
    apertado = false
    if (matchMedia('(hover: none)').matches) dentro = false
  }
  eventos.addEventListener('pointermove', aoMover, { passive: true })
  eventos.addEventListener('pointerdown', aoApertar)
  eventos.addEventListener('pointerleave', aoSair)
  addEventListener('pointerup', aoSoltar)
  addEventListener('pointercancel', aoSoltar)
  addEventListener('blur', aoSair)

  // cursor no plano das letras, já descontando a inclinação do bloco
  const raio = new THREE.Raycaster()
  const plano = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const inversa = new THREE.Matrix4()
  const local = new THREE.Vector3()
  const mouse = { x: 0, y: 0, vx: 0, vy: 0, ok: false }
  function cursorNoPlano(dt) {
    raio.setFromCamera(ndc, camera)
    grupo.updateMatrixWorld()
    inversa.copy(grupo.matrixWorld).invert()
    raio.ray.applyMatrix4(inversa)
    if (!raio.ray.intersectPlane(plano, local)) return
    if (mouse.ok) {
      // velocidade do cursor, suavizada para não dar tranco
      const k = 1 - Math.exp(-dt * 18)
      mouse.vx = misturar(mouse.vx, (local.x - mouse.x) / dt, k)
      mouse.vy = misturar(mouse.vy, (local.y - mouse.y) / dt, k)
    }
    mouse.x = local.x
    mouse.y = local.y
    mouse.ok = true
  }

  // ---------- física ----------
  let t = 0
  const giro = { x: 0, y: 0, vx: 0, vy: 0 }

  function passo(dt) {
    t += dt
    cursorNoPlano(dt)
    const ativo = dentro && mouse.ok
    const R = AJUSTE.raio
    const R2 = R * R
    const RC = AJUSTE.raioClique
    const RC2 = RC * RC
    const intro = limitar(t / 3, 0, 1)
    const amort = Math.exp(-misturar(7, AJUSTE.atrito, intro) * dt)
    const pega = 1 - Math.exp(-AJUSTE.pega * dt)
    const K = AJUSTE.mola * dt
    const mvx = limitar(mouse.vx, -60, 60)
    const mvy = limitar(mouse.vy, -60, 60)

    for (let i = 0; i < N; i++) {
      const j = i * 3
      let ox = off[j], oy = off[j + 1], oz = off[j + 2]
      let vx = vel[j], vy = vel[j + 1], vz = vel[j + 2]

      if (t >= atraso[i]) {
        const hx = casa[j] + ox
        const hy = casa[j + 1] + oy

        if (ativo) {
          const dx = hx - mouse.x
          const dy = hy - mouse.y
          const d2 = dx * dx + dy * dy

          // clique: explode tudo em volta
          if (clique && d2 < RC2) {
            const d = Math.sqrt(d2) + 1e-4
            const f = (1 - d / RC) * AJUSTE.explosao * (0.6 + Math.random() * 0.8)
            vx += (dx / d) * f
            vy += (dy / d) * f
            vz += (Math.random() * 1.6 - 0.3) * f * 0.7
          }

          // segurando: mantém o buraco aberto
          if (apertado && d2 < RC2) {
            const d = Math.sqrt(d2) + 1e-4
            const f = (1 - d / RC) * AJUSTE.segura * dt
            vx += (dx / d) * f
            vy += (dy / d) * f
          }

          // pente: perto do cursor, copia a velocidade dele e leva um empurrão
          if (d2 < R2) {
            const d = Math.sqrt(d2) + 1e-4
            let f = 1 - d / R
            f *= f
            vx += (mvx - vx) * pega * f
            vy += (mvy - vy) * pega * f
            const e = AJUSTE.empurra * f * dt
            vx += (dx / d) * e
            vy += (dy / d) * e
            vz += e * 0.8
          }
        }

        // mola: volta para casa, passa do lugar e balança
        vx = (vx - ox * K) * amort
        vy = (vy - oy * K) * amort
        vz = (vz - oz * K) * amort
        ox += vx * dt
        oy += vy * dt
        oz += vz * dt
      }

      off[j] = ox
      off[j + 1] = oy
      off[j + 2] = oz
      vel[j] = vx
      vel[j + 1] = vy
      vel[j + 2] = vz

      // respiração bem leve na profundidade
      const resp = 0.035 * Math.sin(t * 1.3 + casa[j] * 0.7 + casa[j + 1] * 0.4)
      pos[j] = casa[j] + ox
      pos[j + 1] = casa[j + 1] + oy
      pos[j + 2] = casa[j + 2] + oz + resp

      const v2 = vx * vx + vy * vy + vz * vz
      energia[i] = v2 > 0.04 ? Math.min(1, Math.sqrt(v2) * 0.09) : 0
    }
    clique = null
    atrPos.needsUpdate = true
    atrEnergia.needsUpdate = true

    // o bloco inteiro tomba e vira para o cursor numa mola com embalo
    const parado = performance.now() / 1000 - ultimoMovimento > 2.5
    const alvoY = ativo && !parado ? ndc.x * AJUSTE.inclina : Math.sin(t * 0.45) * 0.16
    const alvoX = ativo && !parado ? -ndc.y * AJUSTE.inclina * 0.7 : Math.sin(t * 0.33) * 0.06
    giro.vy += ((alvoY - giro.y) * 26 - giro.vy * 6.5) * dt
    giro.vx += ((alvoX - giro.x) * 26 - giro.vx * 6.5) * dt
    giro.y += giro.vy * dt
    giro.x += giro.vx * dt
    grupo.rotation.set(giro.x, giro.y, 0)

    if (!ativo) {
      mouse.vx *= 0.8
      mouse.vy *= 0.8
    }
  }

  // ---------- laço ----------
  let visivel = true
  let antes = performance.now()
  let rodando = true

  function quadro(agora) {
    if (!rodando) return
    requestAnimationFrame(quadro)
    const dt = limitar((agora - antes) / 1000, 1 / 240, 1 / 30)
    antes = agora
    if (!visivel) return
    if (reduzido) {
      // sem física: só desenha parado
      if (t === 0) {
        pos.set(casa)
        atrPos.needsUpdate = true
        t = 1
        renderer.render(cena, camera)
      }
      return
    }
    passo(dt)
    renderer.render(cena, camera)
  }
  requestAnimationFrame(quadro)

  const io = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting
    antes = performance.now()
  })
  io.observe(alvo)

  return {
    pontos: N,
    destruir() {
      rodando = false
      io.disconnect()
      ro.disconnect()
      eventos.removeEventListener('pointermove', aoMover)
      eventos.removeEventListener('pointerdown', aoApertar)
      eventos.removeEventListener('pointerleave', aoSair)
      removeEventListener('pointerup', aoSoltar)
      removeEventListener('pointercancel', aoSoltar)
      removeEventListener('blur', aoSair)
      geo.dispose()
      material.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
