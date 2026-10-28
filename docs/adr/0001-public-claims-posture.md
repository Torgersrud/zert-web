# 0001 — Public claims posture: presens for det som er sant ved lansering

## Status

Godtatt 2026-10-28. Gylder all offentlig kopi på zert.no, inkludert tittel, meta- og OG-tagger.

## Kontekst

Zert er et helt nytt produkt: en norsk soberen KI-sandbox med karantene og kundespesifikt bevislag. Nettstedet skal selge to ansikter — et verktøy utviklere vil bruke, og en runtime styret og CISOen kan godkjenne — til publikum som er trent til å etterprøve påstander: revisorer, CISOer og styremedlemmer.

GRC-forskningen (`zert-grc-research.md`) vurderer hver påstand individuelt: sann i dag og testet, delvis sann og må presiseres, eller det motsatte — «must not say». De siste er absolutte forbud. Samtidig krever merkevaren (`DESIGN.md`): lov bare det vi kan levere, vær transparent, korte og faktiske setninger, ingen overdrivelser.

Spennet: produktet er i kjernen en beslutning — arkitektur og hensikt — mens troverdigheten hos dette publikummet beror på at ingen setning kollapser under første due diligence-samtale.

## Beslutning

**Presens brukes kun om fakta som er under Zerts kontroll og sanne ved lansering.** Alt annet — det som er designet, delvis bygget eller bare planlagt — lever i et synlig, designet roadmap-avsnitt («Veien videre»), tydelig merket som veien videre og avgrenset til det som faktisk er i planen: kutt ved switch-laget ved produksjonslansering, DMZ med prompt injection-inspeksjon, signerte evidence exports. Ikke noe mer.

To strenge datteregler:

1. Hver setning i Beviset og Infrastrukturen kontrolleres linje for linje mot presensvurderingen i forskningsfilen før publisering.
2. En setning som ikke kan forsvaras i presens, flyttes til Veien videre eller forkastes. Den skal ikke myknes opp.

## Absolute forbud

Disse påstandene skal aldri forekomme på nettstedet, uansett formulering (fra GRC-forskningen, «must not say»):

- **Ikke tamper-proof eller kryptografisk garantert** revisjonshistorikk. Vår grad er committet retention: garantien er prosess, append-only logging og gap-deteksjon — ikke krypto.
- **Ingen rammeverkssertifisering eller kontrollmapping som Zert selv holder** — verken ISO 27001, NIST, SOC 2 eller norske standarder, og ingen påstand om at Zerts kontroll(er) er kartlagt mot et rammeverk.
- **«Se hver kommando utviklerne kjører inne i VM-en» er feil.** Revisjonsgrensen er livsløps-, autentiserings-, kvote- og nøkkelhendelser; aktivitet inne i VM-en er utenfor.
- **Ikke self-service portel for revisorer** med SSO og innlogging hjemmefra. Revisorsynet leveres av Zert, ikke som en offentlig portal.
- **Ikke «ingen telemetri tapes noen sinne».** Infrastrukturmetrikker prioriteres ned under brudd, men tapet blir tellt. Det forsvarbare utsagnet er Gap Policy, sitert som policy.
- **Ikke påstander om skala eller eksisterende kunder** («kunder stoler på oss med revisjoner») — ikke underbygd.

## ISO-regelen

ISO 27001 forekommer på nettstedet **kun som et attributt ved Blix' datasenter**, formulert slik:

> «datasenteret er ISO 27001-sertifisert — Zert er det ikke.»

Ingen andre ISO-påstander, ingen antydninger om at Zert selv er sertifisert eller kartlagt mot rammeverk.

## Alternativer veid

1. **Selge visjonen** — skriv kopien som om produktet var ferdig og alt var bygget. Forkastet. Publikum er CISOer og revisorer; én uholdbar påstand (tamper-proof-log, kontrollmapping) dreper hele pitchet ved første etterprøving, og bruddet ville vært i direkte strid med merkevarens løfte om å bare love det vi kan levere.
2. **Strengt dagens-bilde** — ikke si noe som ikke allerede er bygget og testet. Forkastet. Det underselger produktet: kjernen er en bevisst beslutning om karantene og bevislag, ikke en feature-liste, og styret må se hele historien for å si ja. Dessuten er en ærlig roadmap en tillitsressurs denne holdningen ville skjult.
3. **Arkitektur-først-framing** — beskriv arkitekturen som om den var implementert, og la leseren sette likhetstegn mellom designet og bygget. Forkastet. Det utvisker nettopp skillet mellom bygget og planlagt som holdningen skal beskytte; en revisor kan ikke skille «slik det er» fra «slik det blir».

Valgt holdning ligger mellom 1 og 2: presens for lanseringskontrollerte fakta, synlig roadmap for resten.

## Konsekvenser

- Nettstedet kan ikke vise funksjoner vi er sikre på at vi bygger, som eksisterende. Konkurrenter som lover mer, låter bedre i en feature-liste. Det er akseptert: tillit er produktet.
- Roadmap blir en designet, vakker seksjon («Veien videre») — ærlighet om grenser er mer troverdig enn uhrenselighet, og researchen viser at testede begrensninger er sterkest hos dette publikummet.
- Hver senere kopi-endring arver denne holdningen og `GLOSSARY.md` i stedet for å glide mot hype. ADR-en er autoritativ ved tvil; er tvilen reel, vinner presens-kravet.
- «Veien videre» låses til de tre roadmap-punktene over; nytt innhold krever en ny ADR eller en presisering av denne.
- Copy som verken er sann i dag eller et av de tre roadmap-punktene, har ingen plass på nettstedet.
