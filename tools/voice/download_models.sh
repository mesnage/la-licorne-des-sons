#!/usr/bin/env bash
# Télécharge (une seule fois) la voix française et la reconnaissance vocale utilisées par build_voice.py.
# Environ 60 Mo pour la voix + 600 Mo pour la reconnaissance vocale. Rangé dans tools/voice/models/ (ignoré par git).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p models && cd models
REL=https://github.com/k2-fsa/sherpa-onnx/releases/download
if [ ! -d vits-piper-fr_FR-siwis-medium ]; then
  echo "Téléchargement de la voix française (siwis)…"
  curl -L "$REL/tts-models/vits-piper-fr_FR-siwis-medium.tar.bz2" | tar xj
fi
if [ ! -d sherpa-onnx-whisper-small ]; then
  echo "Téléchargement de la reconnaissance vocale (Whisper small)…"
  curl -L "$REL/asr-models/sherpa-onnx-whisper-small.tar.bz2" | tar xj
fi
echo "Prêt."
