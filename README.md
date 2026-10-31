# Chalé do Vale

Site de uma casa de temporada: as fotos do chalé presas ao scroll, do dia à
noite, e a saída por uma janela em A desenhada como a fachada.

Estrutura adaptada do projeto "Maison" (voo preso ao scroll + folha com
janela). Sem vídeo do chalé, o voo é feito de fotos reais, com um movimento de
câmera lento (só escala e posição) e dissolução entre as cenas.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/, que sobe em qualquer hospedagem estática
npm run preview  # confere o dist/
```

## Onde está cada coisa

| Caminho | O que é |
|---|---|
| `src/conteudo/chale-do-vale.js` | **Tudo o que é do chalé**: textos, cenas do voo, fotos, câmera, contato |
| `src/paginas/pagina.js` | Escreve o HTML das seções a partir do conteúdo (no build) |
| `src/motion/` | `voo` (scroll → tempo, parede, cortes), `filme` (fotos no canvas), `carga`, `rolagem`, `nav`, `entradas`, `form`, `barra` |
| `src/styles/` | `tokens` (cores, tipo, medidas da janela), `base`, `secoes` |
| `src/sections/` | Um CSS por seção: `carga`, `nav`, `voo`, `folha`, `fora`, `reserva`, `rodape` |
| `public/fotos/{externo,interno}` | Fotos já recortadas, por ambiente |
| `ferramentas/preparar-fotos.sh` | Recorta os prints do anúncio (`fotos-fonte/NN.png`, fora do git) |
| `docs/curadoria.md` | Avaliação de cada foto recebida e o que ainda falta |

## Trocar de propriedade

1. Recortar as fotos novas para `public/fotos/` (ajustar a lista do script).
2. Copiar `src/conteudo/chale-do-vale.js`, trocar textos, fotos e enquadramentos,
   e apontar para ele em `vite.config.js` e `src/main.js`.
3. Se a casa tiver outro desenho de janela, mudar `janela()` em
   `src/paginas/pagina.js` (hoje: o A da fachada).

Com um vídeo contínuo da casa, o `filme.js` pode ser trocado por quadros de
vídeo sem mexer no `voo.js`: ele só pede `desenhar(t, cena)`.

## Pendências (dados que não foram inventados)

- Número de WhatsApp em `contato.whatsapp`. Sem ele o formulário funciona em
  modo demonstração e não envia nada.
- Link do anúncio, Instagram, e-mail; endereço do site (`marca.endereco`).
- Capacidade, camas, horários, estadia mínima, pets, se a jacuzzi é aquecida.
- Fotos originais em alta resolução: as atuais vêm de prints do app
  (≈1060 px de largura) e perdem nitidez em telas grandes.
