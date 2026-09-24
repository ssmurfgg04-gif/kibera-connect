#!/bin/bash
# KiberaConnect demo video narration — TTS segments
set -e
OUT=/home/z/my-project/assets/audio
mkdir -p "$OUT"

SEG1="Meet KiberaConnect — the platform that turns a thirty second report from any phone into real, trackable action for Kibera, Nairobi. Africa's largest informal settlement is home to a quarter of a million people, and every one of them sees problems long before the system does."

SEG2="This is the live community map. Over twenty reports across eleven villages, each one triaged by severity. Tap any marker, and the full story opens: what's happening, who's affected, and the AI assessment with concrete next steps."

SEG3="Reporting takes thirty seconds. Pick a category, name your village, describe it like you'd tell a neighbour — and post anonymously if you choose."

SEG4="Then something remarkable happens. The AI reads the report with Kibera specific context — density, drainage, fire risk, and health networks."

SEG5="Within seconds: severity scored as high, eight hundred residents estimated affected, and four concrete actions naming real local actors — from Nairobi Water, to village elders, to community health volunteers. With a clear urgency note attached."

SEG6="One tap posts it to the community map. Neighbours upvote, elders verify, and every status change stays public until the issue is resolved. No black holes."

SEG7="The insights dashboard shows the community exactly where the friction is — by category, by village, over time. And the response pipeline proves that reports actually move."

SEG8="KiberaConnect. Every voice in Kibera — heard, and answered. Pamoja tunasonga. Together, we move."

declare -a SEGS=("$SEG1" "$SEG2" "$SEG3" "$SEG4" "$SEG5" "$SEG6" "$SEG7" "$SEG8")

for i in "${!SEGS[@]}"; do
  n=$((i+1))
  echo ">>> Segment $n"
  z-ai tts -i "${SEGS[$i]}" -o "$OUT/seg$n.wav" --voice jam --speed 1.0 --format wav
done

echo "All segments generated:"
for f in "$OUT"/seg*.wav; do
  d=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$f")
  echo "$f  ${d}s"
done
