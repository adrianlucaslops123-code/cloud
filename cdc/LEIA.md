# CDC · landing page

As letras **CDC** feitas de ~50 mil quadradinhos de luz (30 mil no celular).

- **Passar o mouse** penteia os pontos: eles pegam a velocidade do cursor e balançam de volta.
- **Clicar (ou tocar)** explode os pontos em volta; segurando, o buraco fica aberto; soltando, voltam como um ímã.
- O bloco inteiro gira de leve seguindo o mouse.
- `prefers-reduced-motion`: as letras ficam paradas.

## Rodar

```bash
cd cdc
npm install
npm run dev      # http://localhost:5174
npm run build    # gera cdc/dist/, sobe em qualquer hospedagem estática
```

## Onde mexer

- **O efeito:** `src/particulas.js`. No topo tem o bloco `AJUSTE` com tudo comentado
  (cores, quantidade de pontos, alcance do mouse, força da explosão, mola e atrito).
- **O texto das partículas:** `src/main.js` → `texto: 'CDC'`.
- **Os textos da página:** `index.html` (cada trecho a trocar está marcado com `TROCAR`).
- **Cores e visual da página:** `src/style.css` (variáveis no `:root`).
