import '@fontsource-variable/jost/wght.css'
import 'lenis/dist/lenis.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/secoes.css'
import './sections/carga.css'
import './sections/nav.css'
import './sections/voo.css'
import './sections/folha.css'
import './sections/fora.css'
import './sections/reserva.css'
import './sections/rodape.css'

import conteudo from './conteudo/chale-do-vale.js'
import { MIDIA_RETRATO } from './conteudo/midia.js'
import { rolagem } from './motion/rolagem.js'
import { voo } from './motion/voo.js'
import { carga } from './motion/carga.js'
import { nav } from './motion/nav.js'
import { entradas } from './motion/entradas.js'
import { form } from './motion/form.js'
import { barra } from './motion/barra.js'

const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches

const rol = rolagem({ reduzido })
carga(voo({ conteudo: conteudo.voo, rolagem: rol, midiaRetrato: MIDIA_RETRATO, reduzido }), {
  rolagem: rol,
})
nav({ rolagem: rol })
entradas()
form({ reserva: conteudo.reserva, contato: conteudo.contato })
barra({ rolagem: rol })
