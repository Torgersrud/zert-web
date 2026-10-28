# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary — the decision door:** board members, CISOs, compliance officers and auditors at large Norwegian companies and GNF operators (virksomheter med samfunnskritiske funksjoner) with high data-security requirements. They are trained to stress-test claims; their job is to approve or reject AI use for sensitive work on evidence that survives a due-diligence conversation. The **Compliance Consumer** is the named recipient of Zert's evidence: Zert delivers a scoped extract per customer; there is no self-serve portal.
- **Secondary — the developer door:** developers at those same organizations. Their job is to use AI, including coding agents, on real repos without shipping code abroad, through a fast open-source CLI they would choose even if it were not mandated.
- Both audiences convert through one waitlist (form records door = utvikler | leder); onboarding is manual, with users added by hand. The story is presented board-first (the two-faced story, per `GLOSSARY.md`).

## Product Purpose

Zert is a Norwegian sovereign KI-sandbox: ephemeral VMs in a Norwegian data center whose only route out is the KI-endepunktet running in the same building. It exists to remove the double risk of shadow AI — data ut (sensitive code and data pasted into foreign providers) and agenter inn (agents holding authority on company machines) — by physical architecture rather than policy. zert.no persuades both doors of one product and produces qualified waitlist signups that lead to joint, manual pilot onboarding. Success is pilot customers approved on facts, not on trust.

## Positioning

Containment is defined by what is physically possible for the sandbox, not by what a policy forbids: exactly one egress, to open-weight models inferenced on Norwegian soil under Norwegian jurisdiction, with a per-customer audit trail as the approval artifact. A neighboring product could copy features, but cannot truthfully copy the combination: inference in the same building as the VMs, Norwegian-owned infrastructure (Blix Solutions, Oslo), and a public claims posture (ADR-0001) where every present-tense sentence on the site is true at launch and honest limits are published instead of hidden. For GNF and CISO audiences, the tested limitation is the strongest selling point.

## Operating Context

- **Developer session (factual workflow):** `zert login` → `zert vm` / `zert ./repo` raises a VM in the Norwegian data center and copies the repo in; work happens against open-weight models inside; `zert extract` brings results out; the developer pushes from their own machine. Leaving a session never kills the VM: a detached VM waits out its Idle window (4 hours after last connection); only `zert kill` or an expired Idle window ends it. Attach restores the same tmux session; a single connection is capped at 8 hours (cap detaches, does not kill).
- **Evidence workflow:** an auditor asks "who did what to whose VM, and were they allowed"; Zert answers from a per-customer hendelsesspor (12 event types), 12-month queryable retention enforced in the storage engine, automated cross-tenant isolation checks (36 checks), and failed-login/BYOK-by-key-ID logging. Auditors receive extracts from Zert; they never log in themselves.
- **Sales ritual:** pitch deck (retold in `narrative.md`) → waitlist → Zert onboards each customer personally, a few at a time.
- **The site itself:** one Norwegian single-page narrative — hero → Problemet → Løsningen (to dører) → Slik virker det → Infrastrukturen → Beviset → Veien videre → Kom i gang. Everything in Beviset must survive a technical due-diligence call; everything not yet built belongs only in Veien videre.

## Capabilities and Constraints

**Live / real today (confirmed 2026-10-28):**

- CLI client is public, MIT-licensed Go: `github.com/Torgersrud/zert-cli` — one static binary, `brew tap Torgersrud/zert && brew install zert`, SSH with the user's own key, tokens never in argv or URLs, prebuilt release binaries.
- Waitlist API is live and functioning: POST JSON `{name, company, email, door}` to `https://api.zert.no/v1/waitlist`.
- Access is gated: no self-service; users are added manually, so very few accounts exist.
- The Beviset facts are built and in drift-free operation per ADR-0001's launch posture: the 12-type audit trail, 12-month retention, tenant isolation enforced in the storage layer, Gap Policy as written and tested policy.
- Models served (open weights): Qwen3.8 Flash Next FP8 (tekst og bilde), GLM 5.3 FP4 (512k context · 32k output), DeepSeek V4 Flash. Weights may be global; what is written never leaves Norway.
- Infrastructure partner: Blix Solutions' Norwegian-owned, ISO 27001-certified data center in Oslo — inference and VMs in the same building.

**Not built (may appear only in Veien videre, locked by ADR-0001):** network cut in the switch layer; DMZ inspecting for prompt injection; export of digitally signed audit evidence. New roadmap content requires a new or amended ADR.

**Absolute bans (ADR-0001, "must not say," never on the site in any wording):** tamper-proof/cryptographically guaranteed audit history; any Zert-held framework certification or control mapping (ISO 27001, NIST, SOC 2, Norwegian standards); "we see every command run inside the VM"; a self-serve auditor portal; "no telemetry is ever lost" (only the verbatim Gap Policy quote is defensible); any existing-customer or scale claim. ISO 27001 appears only as Blix's attribute, phrased «datasenteret er ISO 27001-sertifisert — Zert er det ikke».

**Terminology:** `GLOSSARY.md` is authoritative for all copy — KI-endepunktet (definite form), KI-sandbox, KI-agenten (board surface) vs. harness (developer surface only), Karantene/containment, data ut / agenter inn, Compliance Consumer, Idle window, Gap Policy, designelementet, dual-dør, Beviset, Veien videre.

**Copy rules:** Norwegian bokmål; «KI», never «AI»; no emojis anywhere, ever; short, active, factual sentences; presens only per ADR-0001 (present tense is earned at launch, anything else moves to Veien videre or is cut — never softened).

**Site technology constraint:** pure static HTML/CSS/vanilla JS, no build step, no dependencies, self-hosted IBM Plex fonts. The waitlist form degrades to a prefilled mailto to jp@zert.no without JS.

**Open facts (recorded, not decided):**

- Production launch timing is not dated; the site's present tense means "true at launch" per ADR-0001.
- The site's GitHub link shows a `github.com/zert` placeholder (marked TODO); the real public repo is `github.com/Torgersrud/zert-cli`. Where the public link should finally point (org rename vs. Torgersrud) is undecided.
- The developer surface zert.no/utviklere is a confirmed concept in `GLOSSARY.md` (dual-dør) but is not built; only the single page exists.
- The Blix logo awaits Blix' approval; text naming stands alone until then (one-file swap noted in the HTML).

## Brand Commitments

- `DESIGN.md` is authoritative and binding for look and tone: muted black `#191919` / white `#fcfcfc` surfaces, one secondary color family at a time, IBM Plex Sans / Plex Mono with level separated by weight, the nordstjerne designelementet used as an active layout device (read as Zert, never as decoration), Norwegian/society-relevant imagery, logo never stretched/rotated/recolored.
- Voice: Sage + Creator — calm, precise, self-assured. Only promise what can be delivered; be transparent; no hype, no exaggeration.
- Company facts: Zert AS, Norway. Oskar Torgersrud, teknisk ansvarlig. Contact: jp@zert.no.
- The two-faced story structure is confirmed: same product, two doors, board first, identical truth in both languages.
- The staged terminal demo keeps its «Iscenesatt opptak» label; honesty labels on demonstrations are a commitment, not decoration.

## Evidence on Hand

- `docs/adr/0001-public-claims-posture.md` — the authoritative claims posture with its absolute bans.
- `GLOSSARY.md` — authoritative domain language; `narrative.md` — retelling of the 28-slide sales deck (three true agent incidents: rm -rf, poisoned README, silent privilege escalation).
- Verbatim Gap Policy quote; the 12 audit event types; the 36 cross-tenant checks; the 12-month retention figure.
- Public MIT-licensed CLI repo (`Torgersrud/zert-cli`) with tested Go code; live waitlist API (`api.zert.no/v1/waitlist`).
- Assets: `static/Zert_Kjennemerke_DempetHvit.png` and `_DempetSort.png` (logo, both grounds), `static/og-image.webp`, 31 licensed Norwegian stock photos as responsive WebP sets, self-hosted IBM Plex woff2 set, `tools/` asset-build and screenshot pipeline.
- **Absent — future work must not fabricate:** customers, testimonials, case studies, benchmarks, scale or uptime numbers, certifications of any kind for Zert, Blix logo approval, pricing.

## Product Principles

1. **Tillit er produktet.** Every sentence must survive the first due-diligence conversation; one collapsing claim kills the whole pitch with this audience.
2. **Presens er opptjent, roadmap er synlig.** Present tense only for launch-controlled facts; everything else stands openly in Veien videre, marked as what it is. Honest limits outperform polish with CISOs and auditors.
3. **Arkitektur før policy.** Safety claims point to what is physically possible for the sandbox, never to what a rulebook merely forbids.
4. **To dører, én sannhet.** Board/CISO first, developer second; the same facts in styrets språk (KI-agenten) and utviklerspråk (harness) — never two versions of the product.
5. **Norsk som faktum, ikke fuss.** Sovereignty is geographic, legal and architectural — inference in the same Norwegian building as the VMs; Norwegian imagery expresses that fact, never decorates for mood.

## Accessibility & Inclusion

No formally mandated conformance level (confirmed 2026-10-28); the operative durable standard is the current good-practice floor, to be kept or improved by every change: semantic HTML landmarks and headings, skip link, visible focus styles, motion that respects reduced-motion, full content readable without JavaScript, and a form that falls back to prefilled mail. Norwegian bokmål throughout, with Æ Ø Å fully supported by the font stack.
