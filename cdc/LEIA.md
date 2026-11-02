# CDC Capacitação em Qualidade · site

Site da CDC (treinamento para Inspetor de Soldagem Nível 1, Maracanã, RJ),
com o conteúdo real de cdccursos.com.br e uma camada cinematográfica:

- **Hero:** o logo real da CDC feito de ~50 mil partículas de metal (24 mil no celular).
  O mouse funciona como um maçarico: aquece o metal (laranja → amarelo → branco → azul do
  arco) e deixa um rastro que esfria. O clique "abre o arco": clarão, tremor de câmera e
  faíscas com gravidade que quicam no chão. Rolando, a câmera atravessa o logo e ele vira brasa.
- **Abertura:** o logo enche de metal fundido enquanto fontes e partículas carregam.
- **Prova por prova:** cena presa na tela, uma prova por passo de rolagem, cada uma com a
  sua ilustração animada (gráfico de tratamento térmico com leitura de temperatura, símbolo
  de soldagem se desenhando, lupa sobre o cordão, batidas de dureza, estufa aquecendo…).
- **Estrutura:** fita de fotos reais do centro de treinamento andando na horizontal.
- Rolagem suave (Lenis), títulos que sobem por linha, manifesto que acende palavra por
  palavra, números que contam, cartões que inclinam com luz, botões magnéticos, cursor próprio,
  progresso desenhado como um cordão de solda, som opcional sintetizado (botão na barra).
- Pré-inscrição que abre o WhatsApp da Rose com a mensagem pronta.
- `prefers-reduced-motion`: tudo aparece parado, sem física nem cenas presas.

## Rodar

```bash
cd cdc
npm install
npm run dev              # http://localhost:5174
npm run build            # gera cdc/dist/ (site completo, sobe em qualquer hospedagem)
npm run build:artefato   # gera cdc/dist-artefato/ (bibliotecas pelo CDN; usado no artefato)
```

## Onde mexer

| O quê | Onde |
|---|---|
| Textos, preços, links, contatos | `index.html` (seções na ordem da página) |
| Cores, fontes, raios, curvas | `src/estilo/tokens.css` |
| Logo de partículas (cores, quantidade, força do maçarico, faíscas) | bloco `AJUSTE` no topo de `src/fogo/particulas.js` |
| Formato do logo | `public/marca/cdc-mascara.png` (branco sobre transparente) |
| Provas e ilustrações | `index.html` (`.prova`) + `src/cenas/provas.js` (`ANIMACOES`) |
| Som | `src/motor/som.js` |
| Fotos | `public/fotos/*.webp` |

## Estrutura do código

```
src/
  main.js            liga tudo na ordem certa
  fogo/              particulas.js (logo 3D + calor + faíscas), brasas.js (fundo do fecho)
  motor/             rolagem, texto, interacao (cursor, magnético, inclinar), som, carga
  cenas/             hero, provas, estrutura, depoimentos, contato (form, dúvidas, menu, fecho)
  estilo/            tokens, base, topo, secoes, provas, fim
```

## Fonte do conteúdo

Tudo veio das páginas de cdccursos.com.br (início, A CDC, treinamentos, cursos oferecidos,
material, hospedagem, mural, depoimentos, contato, área do aluno). As fotos são as fotos
reais do centro de treinamento que estão no site. As fotos de banco de imagem do modelo Wix
(pessoas na página de depoimentos e de equipe) não foram usadas.
