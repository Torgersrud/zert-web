#!/usr/bin/env bash
#
# build-assets.sh — Zert asset pipeline (dev-only tooling; the site itself
# stays a zero-dependency static page and never runs this).
#
# What it does, end to end:
#   1. Snapshots checksums of every licensed master (originals live OUTSIDE
#      the repo and are never written to).
#   2. Converts the photo masters to 800/1600/2400px WebP variants in
#      static/ (ImageMagick crop/resize with -strip, piped to cwebp -q 80).
#   3. Renders static/og-image.webp (1200x630) from the Lofoten master with
#      the white kjennemerke on a dark plate.
#   4. Subsets IBM Plex Sans (brand TTF masters) and IBM Plex Mono (fetched
#      once from the google/fonts OFL release into $VENDOR) to WOFF2 in
#      static/fonts/, latin+latin-ext so AE/OE/AA (Aa Oo Aa) are covered,
#      and commits the OFL license texts next to the fonts.
#   5. Copies the brand logo mark PNGs into static/.
#   6. Verifies everything (Seam 2): outputs exist, are valid WebP
#      (webpinfo), dimensions match the variant widths, files sit inside the
#      size budget, the subset fonts contain AE/OE/AA, the unlicensed legacy
#      assets are gone, and the masters are checksum-identical to the
#      snapshot taken in step 1.
#
# Usage:
#   tools/build-assets.sh          full run: convert + subset + verify
#   tools/build-assets.sh verify   assertions only, no conversion
#
# Exit codes: 0 = all good, 1 = at least one assertion failed,
#             2 = missing dependency or unreadable input.
#
# Requirements on the dev machine (not in the repo):
#   ImageMagick (convert), cwebp + webpinfo (libwebp-tools),
#   python3 with fontTools + brotli (apt: python3-fonttools python3-brotli),
#   curl, sha256sum, awk.
#
# Rerun after changing masters or recipes: tools/build-assets.sh
# Override the vendor-fonts dir with ZERT_VENDOR_FONTS=/path.

set -u

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$REPO/static"
FONTS_OUT="$OUT/fonts"
VENDOR="${ZERT_VENDOR_FONTS:-/tmp/opencode/vendor-fonts}"

# Google Fonts OFL release (canonical upstream for Plex Mono masters).
GF_BASE="https://raw.githubusercontent.com/google/fonts/main/ofl"

# Photo cast: semantic name | master | crop height % (top-anchored, blank =
# no crop) | saturation % (blank = untouched). Crops/recipes follow the
# exploration notes: the Lofoten red sky is tamed (crop 12% off the top,
# saturation 60), the fjell is desaturated and cropped above the beach cove,
# and bluetime is cropped to a 74% band (keeps its 2400px variant on budget).
PHOTO_NAMES=(lofoten utviklere operaen fjell bluetime)
PHOTO_MASTERS=(
  /home/user/zert/Bilder/Norge/AdobeStock_375071190.jpeg
  /home/user/zert/Bilder/Kontor/AdobeStock_1512844086.jpeg
  /home/user/zert/Bilder/Norge/AdobeStock_522592599.jpeg
  /home/user/zert/Bilder/Norge/AdobeStock_218207786.jpeg
  /home/user/zert/Bilder/Norge/AdobeStock_520603046.jpeg
)
PHOTO_CROPS=(88 "" "" 55 74)
PHOTO_SATS=(60 "" "" 35 "")
WIDTHS=(800 1600 2400)

LOGO_HVIT=/home/user/zert/Logo/PNG/Zert_Kjennemerke_DempetHvit.png
LOGO_SORT=/home/user/zert/Logo/PNG/Zert_Kjennemerke_DempetSort.png

SANS_DIR=/home/user/zert/Typografi/static
SANS_WEIGHTS="Regular:regular Medium:medium SemiBold:semibold Bold:bold"
MONO_WEIGHTS="Regular:regular Medium:medium"

# latin + latin-ext (incl. AE OE AA ae oe aa), general punctuation, euro, trademark, minus.
SUBSET_UNICODES="U+0020-00FF,U+0100-024F,U+2000-206F,U+20AC,U+2122,U+2212"

BUDGET_IMG=409600  # bytes, per full-bleed hero variant and og-image
BUDGET_FONT=81920  # bytes, per subset WOFF2

FAILS=0
ok()   { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAILS=$((FAILS + 1)); }
die()  { printf 'ERROR %s\n' "$1" >&2; exit 2; }

# --- dependencies -----------------------------------------------------------

for tool in convert cwebp webpinfo python3 sha256sum awk; do
  command -v "$tool" >/dev/null 2>&1 || die "missing dependency: $tool"
done
python3 -c 'import fontTools, brotli' 2>/dev/null \
  || die "python3 needs fontTools + brotli (sudo apt-get install -y python3-fonttools python3-brotli)"

# --- helpers ----------------------------------------------------------------

# webp_dims FILE -> "W H" via webpinfo (fails if not a valid WebP)
webp_dims() {
  webpinfo "$1" 2>/dev/null | awk '
    /Width:/  { w = $2 }
    /Height:/ { h = $2 }
    END { if (w == "" || h == "") exit 1; print w, h }'
}

# img_dims FILE -> "W H" via ImageMagick identify
img_dims() { identify -format "%w %h" "$1" 2>/dev/null; }

# subset_font SRC OUT — pyftsubset as a module (no bare pyftsubset on PATH)
subset_font() {
  python3 -m fontTools.subset "$1" \
    --unicodes="$SUBSET_UNICODES" \
    --flavor=woff2 \
    --output-file="$2" || return 1
}

# font_covers_nordic FILE — exit 0 if AEOEAA aeoeaa are all in the cmap
font_covers_nordic() {
  python3 - "$1" <<'PY'
import sys
from fontTools.ttLib import TTFont
cmap = TTFont(sys.argv[1]).getBestCmap()
need = [0x00C6, 0x00D8, 0x00C5, 0x00E6, 0x00F8, 0x00E5]  # AE Oe AA ae oe aa
missing = [hex(c) for c in need if c not in cmap]
if missing:
    print("missing codepoints:", " ".join(missing), file=sys.stderr)
    sys.exit(1)
PY
}

# --- masters list -----------------------------------------------------------

MASTER_FILES=("${PHOTO_MASTERS[@]}" "$LOGO_HVIT" "$LOGO_SORT")
for pair in $SANS_WEIGHTS; do
  MASTER_FILES+=("$SANS_DIR/IBMPlexSans-${pair%%:*}.ttf")
done

CHECKSUMS="$(mktemp)"
trap 'rm -f "$CHECKSUMS"' EXIT

# --- build ------------------------------------------------------------------

build() {
  local i name master crop sat w h expected wh

  mkdir -p "$OUT" "$FONTS_OUT" "$VENDOR"
  sha256sum "${MASTER_FILES[@]}" >"$CHECKSUMS" 2>/dev/null \
    || die "a master file is unreadable (see list in the script header)"

  # Photos: crop/desaturate per recipe, resize to each width, strip metadata,
  # pipe losslessly to cwebp. Originals are only ever read.
  for i in "${!PHOTO_NAMES[@]}"; do
    name="${PHOTO_NAMES[$i]}"; master="${PHOTO_MASTERS[$i]}"
    crop="${PHOTO_CROPS[$i]}"; sat="${PHOTO_SATS[$i]}"
    for w in "${WIDTHS[@]}"; do
      convert "$master" \
        ${crop:+-gravity North -crop "100x${crop}%+0+0" +repage} \
        ${sat:+-modulate "100,${sat}"} \
        -resize "${w}x" -strip png:- \
        | cwebp -quiet -q 80 -o "$OUT/$name-$w.webp" -- - \
        || die "conversion failed: $name-$w"
    done
  done

  # og:image: Lofoten cast cover-cropped to 1200x630, white kjennemerke on a
  # small dark plate (brand rule: no mark over a busy bright area without a
  # plate), bottom-left.
  convert "${PHOTO_MASTERS[0]}" \
    -gravity North -crop "100x${PHOTO_CROPS[0]}%+0+0" +repage \
    -modulate "100,${PHOTO_SATS[0]}" \
    -resize "1200x630^" -gravity Center -extent 1200x630 \
    \( -size 148x100 xc:'rgba(25,25,25,0.75)' \) \
    -gravity SouthWest -geometry +40+40 -composite \
    \( "$LOGO_HVIT" -resize 60x60 \) \
    -gravity SouthWest -geometry +84+60 -composite \
    -strip png:- | cwebp -quiet -q 80 -o "$OUT/og-image.webp" -- - \
    || die "conversion failed: og-image"

  # Mono masters: fetched once into the vendor dir (outside the repo), from
  # the google/fonts OFL release. Already-present files are kept untouched.
  for pair in $MONO_WEIGHTS; do
    local f="$VENDOR/IBMPlexMono-${pair%%:*}.ttf"
    [[ -f "$f" ]] || curl -fsSL "$GF_BASE/ibmplexmono/$(basename "$f")" -o "$f" \
      || die "download failed: $(basename "$f")"
    sha256sum "$f" >>"$CHECKSUMS"
  done
  for fam in ibmplexmono ibmplexsans; do
    local lic="$VENDOR/${fam}.OFL.txt"
    [[ -f "$lic" ]] || curl -fsSL "$GF_BASE/$fam/OFL.txt" -o "$lic" \
      || die "download failed: $fam OFL.txt"
  done

  # Subset WOFF2 (only the weights the site uses) + ship the OFL licenses.
  for pair in $SANS_WEIGHTS; do
    subset_font "$SANS_DIR/IBMPlexSans-${pair%%:*}.ttf" \
      "$FONTS_OUT/ibm-plex-sans-${pair##*:}.woff2" \
      || die "subset failed: sans ${pair%%:*}"
  done
  for pair in $MONO_WEIGHTS; do
    subset_font "$VENDOR/IBMPlexMono-${pair%%:*}.ttf" \
      "$FONTS_OUT/ibm-plex-mono-${pair##*:}.woff2" \
      || die "subset failed: mono ${pair%%:*}"
  done
  cp "$VENDOR/ibmplexsans.OFL.txt" "$FONTS_OUT/OFL-IBM-Plex-Sans.txt"
  cp "$VENDOR/ibmplexmono.OFL.txt" "$FONTS_OUT/OFL-IBM-Plex-Mono.txt"

  # Logo mark masters into the repo (byte-exact copies, never transformed).
  cp "$LOGO_HVIT" "$OUT/Zert_Kjennemerke_DempetHvit.png"
  cp "$LOGO_SORT" "$OUT/Zert_Kjennemerke_DempetSort.png"
}

# --- verify (Seam 2) --------------------------------------------------------

verify() {
  local i name master w mw mh dw dh expected wh size src

  printf '\n-- Seam 2: asset pipeline assertions --\n'

  # 1. Photo variants: exist, valid WebP, width = variant, height within
  #    tolerance of the expected aspect, under the size budget.
  for i in "${!PHOTO_NAMES[@]}"; do
    name="${PHOTO_NAMES[$i]}"; master="${PHOTO_MASTERS[$i]}"
    crop="${PHOTO_CROPS[$i]}"
    read -r mw mh <<<"$(img_dims "$master")"
    for w in "${WIDTHS[@]}"; do
      src="$OUT/$name-$w.webp"
      if [[ ! -f "$src" ]]; then fail "$src missing"; continue; fi
      if ! wh="$(webp_dims "$src")"; then fail "$src is not a valid WebP"; continue; fi
      read -r dw dh <<<"$wh"
      expected="$(awk -v mw="$mw" -v mh="$mh" -v pct="$crop" -v W="$w" \
        'BEGIN { hh = mh; if (pct != "") hh = int(mh * pct / 100 + 0.5);
                 print int(hh * W / mw + 0.5) }')"
      if (( dw != w )); then fail "$name-$w: width $dw, expected $w"
      elif (( dh < expected - 3 || dh > expected + 3 )); then
        fail "$name-$w: height $dh, expected $expected (+/-3)"
      else ok "$name-$w: WebP ${dw}x${dh}"
      fi
      size="$(stat -c %s "$src")"
      if (( size > BUDGET_IMG )); then fail "$name-$w: ${size} B over ${BUDGET_IMG} B budget"
      else ok "$name-$w: ${size} B (budget ${BUDGET_IMG} B)"; fi
    done
  done

  # 2. og-image: exact social-preview dimensions, valid WebP, budget.
  src="$OUT/og-image.webp"
  if [[ -f "$src" ]] && wh="$(webp_dims "$src")" && [[ "$wh" == "1200 630" ]]; then
    size="$(stat -c %s "$src")"
    if (( size <= BUDGET_IMG )); then ok "og-image.webp: WebP 1200x630, ${size} B"
    else fail "og-image.webp: ${size} B over ${BUDGET_IMG} B budget"; fi
  else
    fail "og-image.webp missing, invalid, or not 1200x630"
  fi

  # 3. Fonts: exist, are WOFF2, cover AE OE AA ae oe aa, under font budget.
  local spec prefix weights
  for spec in "ibm-plex-sans:$SANS_WEIGHTS" "ibm-plex-mono:$MONO_WEIGHTS"; do
    prefix="${spec%%:*}"; weights="${spec#*:}"
    for pair in $weights; do
      src="$FONTS_OUT/$prefix-${pair##*:}.woff2"
      if [[ ! -f "$src" ]]; then fail "$src missing"; continue; fi
      if [[ "$(head -c 4 "$src")" != "wOF2" ]]; then fail "$src is not WOFF2"; continue; fi
      if ! font_covers_nordic "$src"; then fail "$src lacks AE/OE/AA coverage"; continue; fi
      size="$(stat -c %s "$src")"
      if (( size > BUDGET_FONT )); then fail "$src: ${size} B over ${BUDGET_FONT} B"
      else ok "$prefix-${pair##*:}.woff2: WOFF2 with AE OE AA, ${size} B"; fi
    done
  done
  for lic in OFL-IBM-Plex-Sans.txt OFL-IBM-Plex-Mono.txt; do
    [[ -s "$FONTS_OUT/$lic" ]] && ok "fonts/$lic present" || fail "fonts/$lic missing"
  done

  # 4. Logo marks present; unlicensed legacy assets gone.
  for pair in "Zert_Kjennemerke_DempetHvit.png:$LOGO_HVIT" "Zert_Kjennemerke_DempetSort.png:$LOGO_SORT"; do
    cmp -s "$OUT/${pair%%:*}" "${pair#*:}" \
      && ok "${pair%%:*} matches the brand master" || fail "${pair%%:*} missing or altered"
  done
  for gone in image.webp telenor_ai_factory_some_refined.png \
              Selmer-logo-RGB-Korall.webp jp.webp oskar.webp \
              komplisert.webp lett.webp zert.png; do
    [[ -e "$OUT/$gone" ]] && fail "unlicensed asset still present: static/$gone" \
      || ok "static/$gone removed from the repo"
  done

  # 5. Masters untouched (only meaningful after a full run, which snapshots
  #    the checksums before writing anything).
  if [[ -s "$CHECKSUMS" ]]; then
    if sha256sum -c --quiet "$CHECKSUMS" 2>/dev/null; then
      ok "all masters checksum-identical after the run"
    else
      fail "a master changed on disk — investigate immediately"
    fi
  else
    printf 'SKIP  master checksums (verify-only run; do a full run to check)\n'
  fi

  printf -- '-- %d assertion(s) failed --\n' "$FAILS"
  (( FAILS == 0 )) || exit 1
}

# --- main -------------------------------------------------------------------

case "${1:-build}" in
  build)  build; verify ;;
  verify) mkdir -p "$OUT"; : >"$CHECKSUMS"; verify ;;
  *)      printf 'usage: %s [build|verify]\n' "$0" >&2; exit 2 ;;
esac

ok "asset pipeline finished"
exit 0
