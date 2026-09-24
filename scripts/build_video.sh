#!/bin/bash
# KiberaConnect demo video builder. Ken Burns + TTS narration.
# RESUME SUPPORT: every encoded segment leaves a .done marker after a
# ffprobe validation pass. Re-running this script skips finished segments
# and continues from the first missing one. Pass --force to rebuild all.
set -e
V=/home/z/my-project/assets/video
A=/home/z/my-project/assets/audio
W=/home/z/my-project/assets/video/work
OUT=/home/z/my-project/download/kiberaconnect-demo.mp4
mkdir -p "$W"
[ "$1" = "--force" ] && rm -rf "$W" && echo ">> forced rebuild"

FPS=30
HEAD=0.35
TAIL=0.75

build_seg () {
  local idx=$1 img=$2 aud=$3 dir=$4
  local out="$W/seg$(printf '%02d' $idx).mp4"
  local done="$W/seg$(printf '%02d' $idx).done"

  # resume: skip if previously encoded and still valid
  if [ -f "$done" ] && [ -f "$out" ]; then
    echo "== seg$idx already done, skipping"
    return
  fi
  rm -f "$out" "$done"

  local dur
  if [ "$aud" = "none" ]; then
    dur=$5
    ffmpeg -y -loop 1 -framerate $FPS -i "$img" -f lavfi -i anullsrc=r=48000:cl=stereo \
      -filter_complex "[0:v]scale=2400:-2,zoompan=z='min(1.0+0.0006*on,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=$FPS,format=yuv420p[v];[1:a]aformat=sample_fmts=fltp[a]" \
      -map "[v]" -map "[a]" -t "$dur" -c:v libx264 -preset faster -crf 20 -c:a aac -b:a 192k -ar 48000 "$out" -loglevel error
    echo "seg$idx (silent ${dur}s) encoded"
  else
    dur=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$aud")
    local total=$(python3 -c "print(round($dur + $HEAD + $TAIL, 2))")

    if [ "$dir" = "in" ]; then
      Z="min(1.0+0.0009*on,1.14)"
    else
      Z="max(1.14-0.0009*on,1.0)"
    fi

    ffmpeg -y -loop 1 -framerate $FPS -i "$img" -i "$aud" \
      -filter_complex "[0:v]scale=2400:-2,zoompan=z='${Z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=$FPS,format=yuv420p[v];[1:a]adelay=$(python3 -c "print(int($HEAD*1000))")|$(python3 -c "print(int($HEAD*1000))"),aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad[a]" \
      -map "[v]" -map "[a]" -t "$total" -c:v libx264 -preset faster -crf 20 -c:a aac -b:a 192k -ar 48000 "$out" -loglevel error
    echo "seg$idx (${total}s) encoded"
  fi

  # validate before marking done
  local check
  check=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$out" 2>/dev/null || echo 0)
  if python3 -c "exit(0 if float('$check') > 0.5 else 1)"; then
    touch "$done"
  else
    echo "!! seg$idx failed validation, will retry on next run" >&2
    exit 1
  fi
}

# ── storyboard ──
build_seg 1  "$V/card-title.png"     none          in  2.6
build_seg 2  "$V/v1-hero.png"        "$A/seg1.wav" in
build_seg 3  "$V/v2-map-detail.png"  "$A/seg2.wav" out
build_seg 4  "$V/v3-report-form.png" "$A/seg3.wav" in
build_seg 5  "$V/v4-ai-thinking.png" "$A/seg4.wav" out
build_seg 6  "$V/v5-final.png"       "$A/seg5.wav" in
build_seg 7  "$V/v6-posted-b.png"    "$A/seg6.wav" out
build_seg 8  "$V/v7-insights.png"    "$A/seg7.wav" in
build_seg 9  "$V/v9-footer.png"      none          out 3.0
build_seg 10 "$V/card-end.png"       "$A/seg8.wav" out

# ── concat (resumable: reuse concat if all segments unchanged) ──
: > "$W/list.txt"
for f in $(ls "$W"/seg[0-9][0-9].mp4 | sort); do echo "file '$f'" >> "$W/list.txt"; done

if [ ! -f "$W/concat.done" ] || [ ! -f "$W/concat.mp4" ]; then
  ffmpeg -y -f concat -safe 0 -i "$W/list.txt" -c copy "$W/concat.mp4" -loglevel error
  touch "$W/concat.done"
  echo ">> concat done"
else
  echo "== concat already done, skipping"
fi

# ── final master: fades + loudness normalize ──
if [ -f "$OUT" ] && [ -f "$W/final.done" ]; then
  echo "== final already done: $OUT"
else
  TOTAL=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$W/concat.mp4")
  FADEOUT=$(python3 -c "print(round($TOTAL - 1.4, 2))")
  ffmpeg -y -i "$W/concat.mp4" \
    -vf "fade=t=in:st=0:d=0.7,fade=t=out:st=${FADEOUT}:d=1.4" \
    -af "afade=t=in:st=0:d=0.5,afade=t=out:st=${FADEOUT}:d=1.4,loudnorm=I=-16:TP=-1.5:LRA=11" \
    -c:v libx264 -preset faster -crf 20 -c:a aac -b:a 192k -movflags +faststart \
    "$OUT" -loglevel error
  touch "$W/final.done"
  echo "FINAL: $OUT (${TOTAL}s)"
fi
