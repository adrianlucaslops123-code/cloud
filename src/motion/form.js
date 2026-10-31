/**
 * Formulário de reserva, sem servidor.
 * - WhatsApp formatado enquanto digita: (11) 98765-4321 / (11) 3456-7890.
 * - Ao enviar: campo que falta ganha o fio de baixo e o rótulo em terracota,
 *   e um aviso aparece embaixo.
 * - Completo: abre o WhatsApp do chalé com a mensagem pronta (se o número
 *   estiver no conteúdo) e troca o formulário pelo agradecimento.
 */

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

const digitos = (s) => String(s).replace(/\D/g, '')

export function formatarTelefone(valor) {
  const d = digitos(valor).slice(0, 11)
  if (!d) return ''
  if (d.length < 3) return `(${d}`
  const ddd = d.slice(0, 2)
  const resto = d.slice(2)
  if (resto.length <= 4) return `(${ddd}) ${resto}`
  const corte = resto.length > 8 ? 5 : 4
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`
}

const telefoneValido = (valor) => {
  const d = digitos(valor)
  return (d.length === 10 || d.length === 11) && d[0] !== '0'
}

const isoLocal = (data) => {
  const z = (n) => String(n).padStart(2, '0')
  return `${data.getFullYear()}-${z(data.getMonth() + 1)}-${z(data.getDate())}`
}

const lerData = (valor) => {
  const [a, m, d] = valor.split('-').map(Number)
  return a && m && d ? new Date(a, m - 1, d) : null
}

const dia = (d) => (d.getDate() === 1 ? '1º' : String(d.getDate()))

export function periodo(chegada, saida, hoje = new Date()) {
  const ano = (d) => (d.getFullYear() !== hoje.getFullYear() ? ` de ${d.getFullYear()}` : '')
  const [m1, m2] = [chegada.getMonth(), saida.getMonth()]
  if (chegada.getFullYear() !== saida.getFullYear())
    return `de ${dia(chegada)} de ${MESES[m1]} de ${chegada.getFullYear()} a ${dia(saida)} de ${MESES[m2]} de ${saida.getFullYear()}`
  if (m1 === m2) return `de ${dia(chegada)} a ${dia(saida)} de ${MESES[m1]}${ano(chegada)}`
  return `de ${dia(chegada)} de ${MESES[m1]} a ${dia(saida)} de ${MESES[m2]}${ano(chegada)}`
}

const preencher = (modelo, dados) => modelo.replace(/\{(\w+)\}/g, (_, k) => dados[k] ?? '')

export function form({ reserva, contato }) {
  const el = document.querySelector('[data-form]')
  if (!el) return
  const aviso = el.querySelector('[data-aviso]')
  const obrigado = document.querySelector('[data-obrigado]')
  const campos = {
    nome: el.elements.nome,
    whatsapp: el.elements.whatsapp,
    chegada: el.elements.chegada,
    saida: el.elements.saida,
  }

  const hoje = new Date()
  const hojeIso = isoLocal(hoje)
  campos.chegada.min = hojeIso
  campos.saida.min = isoLocal(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1))

  // Máscara do WhatsApp, mantendo o cursor depois do mesmo número de dígitos.
  campos.whatsapp.addEventListener('input', () => {
    const entrada = campos.whatsapp
    const antes = digitos(entrada.value.slice(0, entrada.selectionStart ?? entrada.value.length)).length
    const formatado = formatarTelefone(entrada.value)
    entrada.value = formatado
    let pos = 0
    for (let vistos = 0; pos < formatado.length && vistos < antes; pos++) {
      if (/\d/.test(formatado[pos])) vistos++
    }
    if (document.activeElement === entrada) entrada.setSelectionRange(pos, pos)
  })

  campos.chegada.addEventListener('change', () => {
    const c = lerData(campos.chegada.value)
    if (!c) return
    const minimo = new Date(c.getFullYear(), c.getMonth(), c.getDate() + 1)
    campos.saida.min = isoLocal(minimo)
    const s = lerData(campos.saida.value)
    if (s && s <= c) campos.saida.value = ''
  })

  const marcar = (nomes) => {
    for (const [nome, entrada] of Object.entries(campos)) {
      const errado = nomes.includes(nome)
      entrada.closest('.campo').classList.toggle('is-erro', errado)
      entrada.setAttribute('aria-invalid', String(errado))
    }
  }

  for (const entrada of Object.values(campos)) {
    entrada.addEventListener('input', () => {
      entrada.closest('.campo').classList.remove('is-erro')
      entrada.removeAttribute('aria-invalid')
      if (!el.querySelector('.campo.is-erro')) aviso.textContent = ''
    })
  }

  el.addEventListener('submit', (e) => {
    e.preventDefault()
    const valores = Object.fromEntries(Object.entries(campos).map(([k, c]) => [k, c.value.trim()]))

    const faltando = Object.keys(valores).filter((k) => !valores[k] || (k === 'nome' && valores[k].length < 2))
    let erro = null
    let errados = faltando
    if (faltando.length) erro = reserva.erros.faltando
    else if (!telefoneValido(valores.whatsapp)) [erro, errados] = [reserva.erros.whatsapp, ['whatsapp']]
    else {
      const chegada = lerData(valores.chegada)
      const saida = lerData(valores.saida)
      const zero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
      if (chegada < zero) [erro, errados] = [reserva.erros.passado, ['chegada']]
      else if (saida <= chegada) [erro, errados] = [reserva.erros.ordem, ['saida']]
    }

    marcar(errados)
    if (erro) {
      aviso.textContent = erro
      campos[errados[0]]?.focus()
      return
    }
    aviso.textContent = ''

    const nomeCompleto = valores.nome.replace(/\s+/g, ' ')
    const primeiro = nomeCompleto.split(' ')[0]
    const quando = periodo(lerData(valores.chegada), lerData(valores.saida))
    const numero = digitos(contato.whatsapp)

    if (numero) {
      const texto = preencher(reserva.mensagem, {
        nome: nomeCompleto,
        periodo: quando,
        whatsapp: formatarTelefone(valores.whatsapp),
      })
      window.open(`https://wa.me/55${numero}?text=${encodeURIComponent(texto)}`, '_blank', 'noopener')
    }

    obrigado.textContent = preencher(numero ? reserva.obrigado : reserva.obrigadoDemo, {
      nome: primeiro,
      periodo: quando,
    })
    el.classList.add('is-enviado')
    setTimeout(() => {
      el.hidden = true
      obrigado.hidden = false
      requestAnimationFrame(() => obrigado.classList.add('is-in'))
      obrigado.focus({ preventScroll: true })
    }, 450)
  })
}
