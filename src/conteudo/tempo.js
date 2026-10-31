/**
 * Linha do tempo do voo, derivada das cenas do conteúdo.
 * Usada no build (para escrever data-de no HTML) e no navegador (voo.js),
 * então as duas pontas sempre concordam.
 */

/**
 * @returns {{
 *   cenas: Array<object & {de: number, ate: number}>,
 *   duracao: number,      // segundos de "filme"
 *   telasFilme: number,   // telas de rolagem do primeiro ao último quadro
 *   telas: number,        // telasFilme + a tela em que a folha entra
 *   pontos: Array<[number, number]> // [telas rolada, segundos de filme]
 * }}
 */
export function linhaDoTempo(voo) {
  let t = 0
  const cenas = voo.cenas.map((cena) => {
    const de = t
    t += cena.segundos
    return { ...cena, de, ate: t }
  })
  const duracao = t

  // Rolagem → tempo, em trechos lineares: parado no começo, cada cena com a
  // sua parte da rolagem, parado no fim.
  const pontos = [[0, 0]]
  let u = voo.descansoInicio
  pontos.push([u, 0])
  for (const cena of cenas) {
    u += cena.telas
    pontos.push([u, cena.ate])
  }
  u += voo.descansoFim
  pontos.push([u, duracao])

  return { cenas, duracao, telasFilme: u, telas: u + 1, pontos }
}

/** Telas roladas → segundos de filme. */
export function tempoDaRolagem(pontos, u) {
  if (u <= pontos[0][0]) return pontos[0][1]
  for (let i = 1; i < pontos.length; i++) {
    const [u1, t1] = pontos[i]
    if (u <= u1) {
      const [u0, t0] = pontos[i - 1]
      return u1 === u0 ? t1 : t0 + ((u - u0) / (u1 - u0)) * (t1 - t0)
    }
  }
  return pontos[pontos.length - 1][1]
}

/** Segundos de filme → primeiras telas roladas em que o filme chega lá. */
export function rolagemDoTempo(pontos, t) {
  if (t <= pontos[0][1]) return 0
  for (let i = 1; i < pontos.length; i++) {
    const [u1, t1] = pontos[i]
    if (t <= t1 && t1 > pontos[i - 1][1]) {
      const [u0, t0] = pontos[i - 1]
      return u0 + ((t - t0) / (t1 - t0)) * (u1 - u0)
    }
  }
  return t <= 0 ? 0 : pontos[pontos.length - 1][0]
}
