#!/bin/bash
# KiberaConnect demo video narration. Kenyan voice, no em dashes.
# Resume support: a segment is regenerated only when its text changed.
set -e
OUT=/home/z/my-project/assets/audio
mkdir -p "$OUT"

SEG1="The water pipe in Gatwekera broke three weeks ago. Nobody came. KiberaConnect is how twenty neighbours changed that, with one photo each."

SEG2="This is the live map of Kibera, right now. Every dot is a neighbour. Grey means waiting. Orange means someone is on it. And every green dot is proof."

SEG3="Reporting takes thirty seconds. One photo, a few words. English, Kiswahili or Sheng, all fine. No account, no forms. GPS tags itself."

SEG4="Then the analyst reads it the way Kibera would. The density, the drainage, who is downstream, and who can actually fix it."

SEG5="In seconds: severity scored high, fifteen hundred residents affected, and next steps that name real people. The village elders. Nairobi Water. Community health volunteers."

SEG6="You were never the only one. Twelve neighbours already reported the same pipe. Fifty reports is not noise anymore. It is a work order."

SEG7="And the numbers stay honest, by village, by week. Reported Tuesday. Fixed Thursday. That receipt goes straight to the WhatsApp group."

SEG8="KiberaConnect. See a problem. Get people behind it. See what happens. Don't just report it. Follow it."

declare -a SEGS=("$SEG1" "$SEG2" "$SEG3" "$SEG4" "$SEG5" "$SEG6" "$SEG7" "$SEG8")

for i in "${!SEGS[@]}"; do
  n=$((i+1))
  text="${SEGS[$i]}"
  hash=$(printf '%s' "$text" | md5sum | cut -d' ' -f1)
  meta="$OUT/seg$n.meta"

  # resume: skip when audio exists AND narration text is unchanged
  if [ -f "$OUT/seg$n.wav" ] && [ -f "$meta" ] && [ "$(cat "$meta")" = "$hash" ]; then
    echo "== seg$n unchanged, keeping existing audio"
    continue
  fi

  echo ">>> Segment $n"
  z-ai tts -i "$text" -o "$OUT/seg$n.wav" --voice jam --speed 1.0 --format wav
  printf '%s' "$hash" > "$meta"
done

echo "All segments ready:"
for f in "$OUT"/seg*.wav; do
  d=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$f")
  echo "$f  ${d}s"
done
