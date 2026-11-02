import '@fontsource/archivo-black/400.css'
import '@fontsource-variable/geist'
import './style.css'
import { particulas } from './particulas.js'

const fonte = "'Archivo Black', 'Arial Black', sans-serif"

// espera a fonte grossa carregar antes de desenhar as letras (até 2,5 s)
async function fonteCarregada() {
  try {
    await Promise.race([document.fonts.load(`400 200px ${fonte}`), new Promise((r) => setTimeout(r, 2500))])
  } catch {}
}

const palco = document.querySelector('.hero__palco')
const hero = document.querySelector('.hero')

fonteCarregada().then(() => {
  try {
    const cdc = particulas({ alvo: palco, eventos: hero, texto: 'CDC', fonte })
    document.documentElement.classList.add('is-pronto')
    window.__cdc = cdc
  } catch (erro) {
    // sem WebGL: mostra as letras em CSS
    console.warn('Partículas desligadas:', erro)
    palco.classList.add('is-sem-gl')
    palco.textContent = 'CDC'
    document.documentElement.classList.add('is-pronto')
  }
})

// formulário de contato (só confere o e-mail; ligue no seu serviço depois)
const form = document.querySelector('.form')
const msg = form.querySelector('.form__msg')
form.addEventListener('submit', (e) => {
  e.preventDefault()
  const email = form.email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    form.classList.remove('is-erro')
    void form.offsetWidth
    form.classList.add('is-erro')
    msg.textContent = 'Confere o e-mail? Faltou alguma coisa.'
    form.email.focus()
    return
  }
  form.classList.remove('is-erro')
  form.classList.add('is-enviado')
  msg.textContent = 'Recebido! A gente responde logo.'
})
