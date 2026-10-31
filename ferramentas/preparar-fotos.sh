#!/usr/bin/env bash
# Prepara as fotos do site a partir dos prints do tour de fotos do Airbnb.
#
# Entrada: fotos-fonte/NN.png — prints de iPhone (1170 × 2532) do anúncio,
#          NN = número da foto no anúncio ("NN de 63"). Ficam fora do git.
# Saída:   public/fotos/{externo,interno}/*.webp e public/og.jpg
#
# Cada print tem a foto num cartão de cantos arredondados, com a interface do
# app em volta. O recorte "limpo" tira a interface e entra 30 px em cada lado,
# o bastante para sumir com o arredondamento (medido: 28 px na diagonal).
# Nada é redesenhado, esticado ou gerado: só recorte e compressão.
#
# Uso: bash ferramentas/preparar-fotos.sh
set -euo pipefail

cd "$(dirname "$0")/.."
FONTE=fotos-fonte
SAIDA=public/fotos

if command -v magick >/dev/null 2>&1; then IM=(magick); else IM=(convert); fi

# Área limpa de cada formato de cartão (largura x altura + x + y no print).
declare -A AREA=(
  [retrato]="1062x1437+54+547"   # foto 3:4 em pé
  [vertical]="1062x1933+54+338"  # foto 9:16
  [paisagem]="1062x782+54+875"   # foto 4:3 deitada
)

# foto  formato  recorte-extra (relativo à área limpa; "-" = nenhum)  destino
# Motivos dos recortes extras:
#   41: tira a caixa de som na borda esquerda
#   03: 4:5 da parte de cima; deixa de fora as prateleiras de salgadinhos
#   15, 26, 19: 4:3 para a grade; o 26 para antes do ícone de som do vídeo,
#               o 19 para antes da marca d'água com o logo
LISTA=(
  "55 paisagem -               externo/jacuzzi-vale-dia"
  "16 retrato  -               externo/deck-dia"
  "01 retrato  -               interno/sala"
  "06 retrato  -               interno/cozinha"
  "12 vertical -               interno/banheiro"
  "22 retrato  -               externo/deck-anoitecer"
  "41 retrato  952x1437+110+0  externo/jacuzzi-noite"
  "54 retrato  -               externo/fachada-noite"
  "03 vertical 1062x1327+0+120 interno/escada-vista"
  "15 retrato  1062x796+0+380  externo/deck-guarda-sol"
  "26 retrato  1062x796+0+560  externo/fogueira-encosta"
  "19 retrato  1062x796+0+380  externo/rede-neblina"
)

mkdir -p "$SAIDA/externo" "$SAIDA/interno"

for linha in "${LISTA[@]}"; do
  read -r num formato extra destino <<<"$linha"
  origem="$FONTE/$num.png"
  [[ -f "$origem" ]] || { echo "falta $origem" >&2; exit 1; }
  passos=(-crop "${AREA[$formato]}" +repage)
  [[ "$extra" != "-" ]] && passos+=(-crop "$extra" +repage)
  "${IM[@]}" "$origem" "${passos[@]}" -strip -quality 84 \
    -define webp:method=6 "$SAIDA/$destino.webp"
  echo "$num → $SAIDA/$destino.webp ($("${IM[@]}" "$SAIDA/$destino.webp" -format '%wx%h' info:))"
done

# Imagem de compartilhamento (WhatsApp, redes): 1200 × 630 a partir da foto 55.
"${IM[@]}" "$FONTE/55.png" -crop "${AREA[paisagem]}" +repage -crop 1062x558+0+112 +repage \
  -resize 1200x630! -strip -quality 86 public/og.jpg
echo "55 → public/og.jpg"
