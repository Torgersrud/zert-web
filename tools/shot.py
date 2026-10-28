#!/usr/bin/env python3
"""Dev-only screenshot harness for zert.no (Seam 3 — the implementor's eyes).

Serves the static site locally and captures it with headless Chromium:

  * full page and one screenshot per section (every [data-act] element)
  * desktop at 1440px, mobile at 390px
  * one extra pass with prefers-reduced-motion: reduce (desktop)

The harness doubles as the Seam-1 gate: any console error, page error,
failed request, HTTP >= 400 response or third-party (non-localhost) request
is reported and fails the run.

Screenshots are only ever written under /tmp. Nothing is committed.

Usage:
  tools/shot.py                  # all passes (desktop, mobile, reduced-motion)
  tools/shot.py --only desktop   # one pass: desktop | mobile | reduced
  tools/shot.py --out /tmp/opencode/shots/t4

Exit codes:
  0  all passes rendered, page clean
  1  harness/render failure
  2  missing dependency, input or bad arguments
  3  rendered, but the page had console/network errors (see report)

Requires (dev machine only): pip install playwright --user
--break-system-packages, then python3 -m playwright install --with-deps
chromium.
"""

import argparse
import http.server
import shutil
import socket
import socketserver
import sys
import threading
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
PASSES = [
    # name,          width, height, reduced_motion
    ("desktop", 1440, 900, False),
    ("mobile", 390, 844, False),
    ("reduced", 1440, 900, True),
]
DEFAULT_OUT = Path("/tmp/opencode/zert-shots")
SETTLE_MS = 1100  # reveal duration 600 ms + stagger headroom

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.stderr.write(
        "shot.py: playwright is not installed (dev-only dependency).\n"
        "  pip3 install --user --break-system-packages playwright\n"
        "  python3 -m playwright install --with-deps chromium\n"
    )
    sys.exit(2)


def serve_static():
    """Serve the repo root on a free localhost port. Returns (server, url)."""

    class QuietHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            kwargs["directory"] = str(ROOT)
            super().__init__(*args, **kwargs)

        def log_message(self, *args):
            pass

    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]

    socketserver.TCPServer.allow_reuse_address = True
    server = socketserver.TCPServer(("127.0.0.1", port), QuietHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, "http://127.0.0.1:%d/" % port


def is_local(url):
    parts = urlparse(url)
    if parts.scheme in ("data", "blob", "about"):
        return True
    return parts.hostname in ("127.0.0.1", "localhost")


def auto_scroll(page):
    """Scroll through the page so every reveal fires once, then return to top.

    Uses instant scrolling (the page itself sets scroll-behavior: smooth)
    and waits until every [data-reveal] element is revealed — except under
    reduced motion, where CSS shows everything statically and JS never
    adds the class.
    """
    page.evaluate(
        """() => new Promise((resolve) => {
            var y = 0;
            var step = Math.round(window.innerHeight * 0.5);
            function tick() {
                window.scrollTo({ top: y, behavior: 'instant' });
                y += step;
                if (y < document.documentElement.scrollHeight) {
                    setTimeout(tick, 110);
                } else {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                    setTimeout(resolve, 300);
                }
            }
            tick();
        })"""
    )
    page.wait_for_function(
        "() => window.matchMedia('(prefers-reduced-motion: reduce)').matches"
        " || !document.querySelector('[data-reveal]:not(.is-revealed)')",
        timeout=15000,
    )
    page.wait_for_timeout(SETTLE_MS)


def capture_pass(browser, name, width, height, reduced, base_url, out_dir, problems):
    label = "%s-%d%s" % (name, width, "-reduced-motion" if reduced else "")
    pass_dir = out_dir / label
    pass_dir.mkdir(parents=True, exist_ok=True)

    context = browser.new_context(
        viewport={"width": width, "height": height},
        reduced_motion="reduce" if reduced else "no-preference",
    )
    page = context.new_page()

    def on_console(msg):
        if msg.type == "error":
            problems.append("%s: console error: %s" % (label, msg.text))

    page.on("console", on_console)
    page.on("pageerror", lambda err: problems.append("%s: page error: %s" % (label, err)))
    page.on(
        "requestfailed",
        lambda req: problems.append(
            "%s: request failed: %s (%s)" % (label, req.url, req.failure)
        ),
    )
    page.on(
        "request",
        lambda req: problems.append("%s: third-party request: %s" % (label, req.url))
        if not is_local(req.url)
        else None,
    )
    page.on(
        "response",
        lambda res: problems.append(
            "%s: HTTP %d for %s" % (label, res.status, res.url)
        )
        if res.status >= 400
        else None,
    )

    page.goto(base_url, wait_until="networkidle")
    page.evaluate("() => document.fonts.ready.then(() => true)")

    acts = page.evaluate(
        "() => Array.from(document.querySelectorAll('[data-act]'),"
        " el => el.getAttribute('data-act'))"
    )
    if not acts:
        raise RuntimeError("no [data-act] sections found in the page")

    auto_scroll(page)

    shots = []
    full_path = pass_dir / "00-full-page.png"
    page.screenshot(path=str(full_path), full_page=True)
    shots.append(full_path)

    for index, act in enumerate(acts, start=1):
        el = page.query_selector("[data-act='%s']" % act)
        el.scroll_into_view_if_needed()
        page.wait_for_timeout(SETTLE_MS)
        path = pass_dir / ("%02d-%s.png" % (index, act))
        el.screenshot(path=str(path))
        shots.append(path)

    context.close()
    return label, shots


def main():
    parser = argparse.ArgumentParser(description="Screenshot zert.no (dev tool).")
    parser.add_argument(
        "--out",
        default=str(DEFAULT_OUT),
        help="output directory, must stay under /tmp (default %s)" % DEFAULT_OUT,
    )
    parser.add_argument(
        "--only",
        choices=[p[0] for p in PASSES],
        help="run a single pass instead of all three",
    )
    args = parser.parse_args()

    out_dir = Path(args.out).resolve()
    if str(out_dir) != "/tmp" and not str(out_dir).startswith("/tmp/"):
        sys.stderr.write("shot.py: refusing to write outside /tmp (%s)\n" % out_dir)
        return 2
    if (out_dir.exists() or out_dir.is_symlink()) and out_dir.is_dir():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    passes = [p for p in PASSES if not args.only or p[0] == args.only]
    server, base_url = serve_static()
    problems = []
    total_shots = 0
    exit_code = 0

    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            for name, width, height, reduced in passes:
                label, shots = capture_pass(
                    browser, name, width, height, reduced, base_url, out_dir, problems
                )
                total_shots += len(shots)
                print("%s: %d screenshots -> %s" % (label, len(shots), out_dir / label))
            browser.close()
    except Exception as exc:  # noqa: BLE001 — report, plain exit code
        sys.stderr.write("shot.py: render failed: %s\n" % exc)
        exit_code = 1
    finally:
        server.shutdown()

    print("total screenshots: %d" % total_shots)
    if problems:
        print("page problems: %d" % len(problems))
        for problem in problems:
            print("  " + problem)
        exit_code = exit_code or 3
    elif exit_code == 0:
        print("page problems: 0 (no console errors, no third-party requests)")

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
