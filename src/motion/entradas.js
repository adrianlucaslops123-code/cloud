/**
 * Tudo com .entra ganha .is-in ao chegar na tela (uma vez só).
 * O CSS faz o fade e a subida de 24 px; a foto do meio do "O chalé" assenta
 * de um zoom de 1,06.
 */
export function entradas() {
  const els = document.querySelectorAll('.entra')
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'))
    return
  }
  const io = new IntersectionObserver(
    (registros) => {
      for (const r of registros) {
        if (!r.isIntersecting) continue
        r.target.classList.add('is-in')
        io.unobserve(r.target)
      }
    },
    { rootMargin: '0px 0px -15% 0px' },
  )
  els.forEach((el) => io.observe(el))
}
