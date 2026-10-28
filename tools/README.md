# tools/

Dev-only tooling. Nothing here runs in the browser; the site itself stays a
zero-dependency static page.

## build-assets.sh

Reproducible asset pipeline: licensed Adobe Stock and typography masters
(outside this repo, under `/home/user/zert/`) in, small WebP images and subset
WOFF2 fonts in `static/` out. Originals are only ever read; the script asserts
their checksums are unchanged after each run.

```sh
tools/build-assets.sh          # convert + subset + verify (the normal run)
tools/build-assets.sh verify   # assertions only (Seam 2 checks on static/)
```

Exit codes: 0 ok, 1 an assertion failed, 2 missing dependency or input.

Requirements (dev machine): ImageMagick, `cwebp`/`webpinfo`, python3 with
fontTools + brotli (`sudo apt-get install -y python3-fonttools python3-brotli`),
curl, sha256sum. IBM Plex Mono TTF masters and the OFL texts are fetched once
into a vendor dir outside the repo (`ZERT_VENDOR_FONTS`, default
`/tmp/opencode/vendor-fonts`); only the subset WOFF2s and the license files are
committed. Photo recipes (crops/desaturation) live in the script header.

## shot.py

Screenshot harness (Seam 3 — the implementor's eyes). Serves the site on a
random localhost port and captures it with headless Chromium: full page and
one screenshot per section (`[data-act]`), at 1440px and 390px, plus a
`prefers-reduced-motion: reduce` pass. It doubles as the page-health gate and
fails the run on any console error, page error, failed request, HTTP >= 400
response or third-party (non-localhost) request. Screenshots are only ever
written under `/tmp` — never commit them. Read every screenshot as an image
and verify against `DESIGN.md`; the loop is edit -> re-render -> re-look.

```sh
tools/shot.py                  # all passes (desktop 1440, mobile 390, reduced-motion)
tools/shot.py --only desktop   # single pass: desktop | mobile | reduced
tools/shot.py --out /tmp/opencode/shots/t4
```

Exit codes: 0 all rendered and page clean, 1 harness/render failure,
2 missing dependency or bad arguments, 3 rendered but the page had
console/network errors (listed in the output).

Requirements (dev machine): `pip3 install --user --break-system-packages
playwright && python3 -m playwright install --with-deps chromium`.
