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
