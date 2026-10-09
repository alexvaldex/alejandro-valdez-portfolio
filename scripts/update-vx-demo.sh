#!/bin/sh
# Rebuild the embedded VX Telemetry live demo from the VX source checkout.
# Usage: scripts/update-vx-demo.sh [path-to-valdex-telemetry]
set -e
VX="${1:-$HOME/startups/valdex-telemetry}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/vx-demo"
(cd "$VX" && npx vite build --base /vx-demo/ --outDir "$OUT" --emptyOutDir)
echo "VX demo updated in $OUT"
