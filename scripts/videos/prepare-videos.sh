#!/usr/bin/env bash
# Prépare les vidéos de démonstration d'exercices pour Progressa.
#
# Entrée  : ./sources/<slug>.mp4   (fichiers bruts téléchargés, gros)
# Sortie  : ./public/exercises/<slug>.webm + .mp4 + <slug>-poster.jpg
#
# Une vidéo de stock brute pèse 20 à 80 Mo. Servie telle quelle, elle rend
# l'app inutilisable en 4G. Ce script la ramène à ~150-300 Ko.
#
#   bash prepare-videos.sh                  # tout le dossier sources/
#   bash prepare-videos.sh gainage-lateral  # un seul exercice
#
# Réglages : START = seconde de début, DUR = durée conservée.

set -euo pipefail

SRC_DIR="${SRC_DIR:-sources}"
OUT_DIR="${OUT_DIR:-public/exercises}"
START="${START:-0}"
DUR="${DUR:-5}"
W=540          # largeur finale (assez pour un mobile en 2x)
H=720          # format 3:4, vertical, comme le lecteur de séance

command -v ffmpeg >/dev/null || { echo "ffmpeg manquant"; exit 1; }
mkdir -p "$OUT_DIR"

process() {
  local src="$1"
  local slug
  slug="$(basename "${src%.*}")"
  echo "→ $slug"

  # Recadrage centré au format 3:4 puis mise à l'échelle.
  local VF="crop='min(iw,ih*3/4)':'min(ih,iw*4/3)',scale=${W}:${H},fps=24"

  ffmpeg -loglevel error -y -ss "$START" -t "$DUR" -i "$src" \
    -vf "$VF" -an \
    -c:v libvpx-vp9 -b:v 0 -crf 40 -row-mt 1 \
    "$OUT_DIR/$slug.webm"

  ffmpeg -loglevel error -y -ss "$START" -t "$DUR" -i "$src" \
    -vf "$VF" -an \
    -c:v libx264 -profile:v main -crf 30 -preset slow -movflags +faststart -pix_fmt yuv420p \
    "$OUT_DIR/$slug.mp4"

  # Image de couverture : prise à 1 s pour éviter une première image floue.
  ffmpeg -loglevel error -y -ss "$((START + 1))" -i "$src" \
    -vf "$VF" -frames:v 1 -q:v 4 \
    "$OUT_DIR/$slug-poster.jpg"

  printf "   %-28s webm %6s | mp4 %6s | poster %6s\n" "$slug" \
    "$(du -h "$OUT_DIR/$slug.webm" | cut -f1)" \
    "$(du -h "$OUT_DIR/$slug.mp4"  | cut -f1)" \
    "$(du -h "$OUT_DIR/$slug-poster.jpg" | cut -f1)"
}

if [ $# -gt 0 ]; then
  process "$SRC_DIR/$1.mp4"
else
  shopt -s nullglob
  for f in "$SRC_DIR"/*.mp4 "$SRC_DIR"/*.mov "$SRC_DIR"/*.webm; do process "$f"; done
fi

echo
echo "Terminé. Déclare les slugs dans lib/exercises/exercise-media.ts :"
echo '  "mon-slug": "/exercises/mon-slug.mp4",'
