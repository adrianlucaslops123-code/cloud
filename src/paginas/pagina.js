/**
 * Escreve o HTML das seções a partir do conteúdo (src/conteudo/*.js).
 * Roda no build e no servidor de desenvolvimento (plugin em vite.config.js),
 * então a página chega pronta: sem texto montado no navegador.
 */
import { linhaDoTempo } from '../conteudo/tempo.js'
import { MIDIA_RETRATO } from '../conteudo/midia.js'

const esc = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** "Linha um / linha dois" → uma <span> por linha (com índice de entrada). */
const linhas = (texto, inicio = null) =>
  texto
    .split(' / ')
    .map((l, n) => {
      const i = inicio === null ? '' : ` anima" style="--i:${inicio + n}`
      return `<span class="linha${i}">${esc(l)}</span>`
    })
    .join('')

const seta = '<span class="seta" aria-hidden="true">→</span>'

const botao = ({ texto, alvo }, estilo, extra = '') =>
  `<a class="botao botao--${estilo}${extra}" href="${esc(alvo)}">${esc(texto)} ${seta}</a>`

const digitos = (s) => String(s).replace(/\D/g, '')

function contatos(contato) {
  const itens = []
  if (contato.whatsapp)
    itens.push({ texto: 'WhatsApp', href: `https://wa.me/55${digitos(contato.whatsapp)}`, externo: true })
  if (contato.airbnb) itens.push({ texto: 'Anúncio no Airbnb', href: contato.airbnb, externo: true })
  if (contato.instagram) itens.push({ texto: 'Instagram', href: contato.instagram, externo: true })
  if (contato.email) itens.push({ texto: contato.email, href: `mailto:${contato.email}` })
  return itens
}

/* ---------------------------------------------------------------- voo --- */

function marco(cena, indice) {
  const ativo = indice === 0
  const classes = ['marco', `marco--${cena.posicao}`]
  if (cena.grande) classes.push('marco--grande')
  classes.push(ativo ? 'is-in' : 'is-antes')

  let i = 0
  const partes = []
  partes.push(`<p class="rotulo anima" style="--i:${i++}">${esc(cena.rotulo)}</p>`)
  const nLinhas = cena.titulo.split(' / ').length
  const tag = cena.posicao === 'hero' ? 'h1' : 'h2'
  partes.push(`<${tag} class="marco__titulo">${linhas(cena.titulo, i)}</${tag}>`)
  i += nLinhas
  if (cena.linha) partes.push(`<p class="marco__linha anima" style="--i:${i++}">${esc(cena.linha)}</p>`)
  if (cena.botao)
    partes.push(
      `<p class="marco__acao anima" style="--i:${i++}">${botao(cena.botao, 'claro')}</p>`,
    )

  const lado = cena.lado
    ? `<ul class="marco__lado" aria-label="Destaques">${cena.lado
        .map((item, n) => `<li class="rotulo anima" style="--i:${n + 1}">${esc(item)}</li>`)
        .join('')}</ul>`
    : ''

  return `
      <div class="${classes.join(' ')}" data-de="${cena.de}"${ativo ? '' : ' inert'}>
        <div class="marco__bloco">${partes.join('')}</div>${lado}
        <p class="sr">${esc(cena.descricao)}</p>
      </div>`
}

function voo(c) {
  const tempo = linhaDoTempo(c.voo)
  const [primeira] = tempo.cenas
  return `
    <section class="voo" id="topo" data-voo aria-label="${esc(c.voo.rotuloSecao)}" style="--telas:${tempo.telas}">
      <div class="voo__palco">
        <picture class="voo__poster">
          <source media="${MIDIA_RETRATO}" srcset="${esc(primeira.foto.mobile)}">
          <img src="${esc(primeira.foto.desktop)}" alt="" fetchpriority="high" decoding="async">
        </picture>
        <canvas class="voo__tela" aria-hidden="true"></canvas>
        <div class="voo__veu" aria-hidden="true"></div>
        <div class="voo__textos">${tempo.cenas.map(marco).join('')}
        </div>
      </div>
    </section>`
}

/* -------------------------------------------------------------- folha --- */

// A janela de aço desenhada como a fachada do chalé (foto 54): o triângulo,
// o montante do vértice até a viga do mezanino e os vidros embaixo.
// Coordenadas em % da caixa da janela; a espessura vem do CSS.
const VIGA = 56
function janela() {
  const borda = (y) => 50 * (y / 100) // meia largura do A na altura y
  const vEsq = 50 - borda(VIGA)
  const vDir = 50 + borda(VIGA)
  const montantes = [100 / 3, 50, 200 / 3]
    .map((x) => `<line class="janela__vidro" x1="${x.toFixed(3)}" y1="${VIGA}" x2="${x.toFixed(3)}" y2="100"/>`)
    .join('')
  return `
        <div class="janela" aria-hidden="true">
          <svg class="janela__aco" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            <line class="janela__montante" x1="50" y1="0" x2="50" y2="${VIGA}"/>
            ${montantes}
            <line class="janela__viga" x1="${vEsq}" y1="${VIGA}" x2="${vDir}" y2="${VIGA}"/>
            <polygon class="janela__caixilho" points="50,0 100,100 0,100"/>
          </svg>
          <i class="janela__peitoril"></i>
        </div>`
}

function folha(c) {
  const { esquerda, direita } = c.folha
  return `
    <div class="folha" data-clara>
      <div class="folha__janela">${janela()}
        <div class="folha__lado folha__lado--esq">
          <p class="rotulo">${esc(esquerda.rotulo)}</p>
          <p class="folha__nome">${esc(esquerda.texto)}</p>
        </div>
        <div class="folha__lado folha__lado--dir">
          <p class="rotulo">${esc(direita.rotulo)}</p>
          <p class="folha__nome">${esc(direita.texto)}</p>
        </div>
      </div>
      ${chale(c.chale)}
    </div>`
}

function chale(s) {
  const topicos = s.topicos
    .map((t) => `<div class="chale__topico"><dt>${esc(t.titulo)}</dt><dd>${esc(t.texto)}</dd></div>`)
    .join('')
  return `<section class="chale" id="${s.id}" tabindex="-1" aria-labelledby="${s.id}-titulo">
        <h2 class="titulo-secao titulo-secao--centro entra" id="${s.id}-titulo">${linhas(s.titulo)}</h2>
        <div class="chale__grade">
          <figure class="chale__foto entra entra--foto">
            <img src="${esc(s.foto.src)}" alt="${esc(s.foto.alt)}" width="${s.foto.largura}" height="${s.foto.altura}" loading="lazy" decoding="async">
          </figure>
          <div class="chale__esq entra">
            <p class="chale__destaque">${esc(s.destaque)}</p>
            <p class="chale__texto">${esc(s.texto)}</p>
            ${botao(s.botao, 'escuro')}
          </div>
          <div class="chale__dir entra">
            <dl class="chale__topicos">${topicos}</dl>
            <p class="chale__numero"><span class="chale__valor" aria-hidden="true">${esc(s.numero.valor)}</span><span class="rotulo">${esc(s.numero.rotulo)}</span></p>
          </div>
        </div>
      </section>`
}

/* ------------------------------------------------------------ seções --- */

function topo(id, titulo, texto) {
  return `<div class="secao__topo">
        <h2 class="titulo-secao entra" id="${id}-titulo">${linhas(titulo)}</h2>
        <p class="secao__texto entra">${esc(texto)}</p>
      </div>`
}

function fora(s) {
  const celulas = s.itens
    .map(
      (item, n) => `
        <li class="fora__celula">
          <a class="fora__link" href="${esc(s.alvo)}">
            <span class="fora__foto"><img src="${esc(item.foto.src)}" alt="${esc(item.foto.alt)}" width="${item.foto.largura}" height="${item.foto.altura}" loading="lazy" decoding="async"></span>
            <span class="fora__num">${String(n + 1).padStart(2, '0')}</span>
            <span class="fora__nome">${esc(item.nome)}</span>
            <span class="fora__dados">${esc(item.dados)}</span>
            <span class="rotulo fora__chamada"><span class="sublinha">${esc(s.chamada)}</span> ${seta}</span>
          </a>
        </li>`,
    )
    .join('')
  const nos = [0, 1, 2, 3]
    .flatMap((col) => ['cima', 'baixo'].map((lin) => `<i class="fora__no fora__no--${lin}" style="--col:${col}"></i>`))
    .join('')
  return `
    <section class="fora" id="${s.id}" tabindex="-1" aria-labelledby="${s.id}-titulo">
      ${topo(s.id, s.titulo, s.texto)}
      <div class="fora__grade entra">
        <ul class="fora__lista">${celulas}
        </ul>
        <div class="fora__nos" aria-hidden="true">${nos}</div>
      </div>
    </section>`
}

function reserva(s) {
  const campo = (nome, tipo, extra = '') => `
          <label class="campo">
            <span class="campo__rotulo">${esc(s.campos[nome])}</span>
            <input class="campo__entrada" name="${nome}" type="${tipo}" required${extra}>
          </label>`
  return `
    <section class="reserva" id="${s.id}" tabindex="-1" aria-labelledby="${s.id}-titulo">
      ${topo(s.id, s.titulo, s.texto)}
      <form class="reserva__form entra" data-form novalidate>
        <div class="reserva__faixa">${campo('nome', 'text', ' autocomplete="name" autocapitalize="words"')}${campo(
          'whatsapp',
          'tel',
          ` inputmode="tel" autocomplete="tel-national" placeholder="${esc(s.exemploWhatsapp)}" maxlength="15"`,
        )}${campo('chegada', 'date')}${campo('saida', 'date')}
          <button class="botao botao--escuro reserva__enviar" type="submit">${esc(s.botao)} ${seta}</button>
        </div>
        <p class="reserva__aviso" data-aviso aria-live="assertive"></p>
      </form>
      <p class="reserva__obrigado" data-obrigado tabindex="-1" aria-live="polite" hidden></p>
    </section>`
}

function rodape(s, contato, marca) {
  const extras = contatos(contato)
    .map(
      (c) =>
        `<li><a class="sublinha" href="${esc(c.href)}"${c.externo ? ' target="_blank" rel="noopener"' : ''}>${esc(c.texto)}</a></li>`,
    )
    .join('')
  return `
  <footer class="rodape" id="${s.id}" tabindex="-1">
    <div class="rodape__grade">
      <nav class="rodape__links" aria-label="Seções">
        ${s.links.map((l) => `<a href="${esc(l.alvo)}">${esc(l.texto)}</a>`).join('\n        ')}
      </nav>
      <div class="rodape__info">
        <div class="rodape__bloco">
          <p class="rotulo">${esc(s.reservas.rotulo)}</p>
          <ul>
            <li><a class="sublinha" href="#reserva">${esc(s.reservas.pedido)}</a></li>${extras}
          </ul>
        </div>
      </div>
    </div>
    <div class="rodape__base">
      <p class="rodape__marca">${esc(marca.nome)}</p>
      <p>${esc(s.nota)}</p>
    </div>
  </footer>`
}

function nav(n, marca) {
  return `
  <a class="pular" href="${esc(n.pular.alvo)}">${esc(n.pular.texto)}</a>
  <header class="nav" data-nav>
    <a class="nav__marca" href="#topo" aria-label="${esc(marca.nome)}, início">${esc(marca.nome)}</a>
    <nav class="nav__links" aria-label="Seções">
      ${n.links.map((l) => `<a class="sublinha" href="${esc(l.alvo)}">${esc(l.texto)}</a>`).join('\n      ')}
    </nav>
    ${botao(n.botao, 'fio', ' nav__botao')}
  </header>`
}

/* ------------------------------------------------------------ página --- */

export function renderizar(c) {
  const [primeira] = c.voo.cenas
  const cabeca = `
  <title>${esc(c.marca.tituloPagina)}</title>
  <meta name="description" content="${esc(c.marca.descricao)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(c.marca.nome)}">
  <meta property="og:description" content="${esc(c.marca.descricao)}">
  <meta property="og:image" content="${esc((c.marca.endereco || '').replace(/\/$/, '') + c.marca.imagemCompartilhar)}">${
    c.marca.endereco ? `\n  <meta property="og:url" content="${esc(c.marca.endereco)}">` : ''
  }
  <meta name="theme-color" content="#12100d">
  <link rel="preload" as="image" href="${esc(primeira.foto.desktop)}" media="not all and ${MIDIA_RETRATO}" fetchpriority="high">
  <link rel="preload" as="image" href="${esc(primeira.foto.mobile)}" media="${MIDIA_RETRATO}" fetchpriority="high">`

  const corpo = `
  <div class="carga" data-carga aria-hidden="true">
    <p class="carga__marca">${esc(c.marca.nome)}</p>
    <i class="carga__linha"><b></b></i>
  </div>
  <noscript><style>.carga{display:none}.entra{opacity:1;transform:none}</style></noscript>
  ${nav(c.nav, c.marca)}
  <main>
    ${voo(c)}
    ${folha(c)}
    ${fora(c.fora)}
    ${reserva(c.reserva)}
  </main>
  ${rodape(c.rodape, c.contato, c.marca)}`

  return { cabeca, corpo }
}
