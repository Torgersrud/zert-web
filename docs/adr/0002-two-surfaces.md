# 0002 — To flater: styret først, utvikleren på sin egen side

## Status

Godtatt 2026-10-28. Gylder strukturen på zert.no og alle senere endringer på begge flater.

## Kontekst

Zert selger to ansikter av samme produkt: styret og CISOen vil ha en runtime de kan godkjenne, utvikleren vil ha et verktøy han faktisk bruker. Merkevaren er bygget på denne tosidige historien (`GLOSSARY.md`). Frem til nå er den levert som én blandet side — og begge flatene lander halvveis: styremedlemmet faller over CLI, repo-lenker og «harness» midt i løypa, mens utvikleren får et sidepanel i stedet for et pitch. Innkjøperen er likevel styret; utvikleren er publikummet som skal overbevises etterpå.

## Beslutning

**Nettstedet deles i to flater.** zert.no taler med én stemme, kun til ledelsen: scenen (KI-agenten), den dobbelte risikoen, de dokumenterte faktaene, løsningen, Beviset, Veien videre og en styrerett pilotinvitasjon. Utviklerflaten bor på zert.no/utviklere (`utviklere.html`) og tar for seg det beviste salgsapparatet i utviklerspråk — harness, terminal, karantenen innenfra, install og åpen kildekode.

**Headern er døren.** Lenken «Utvikler» på styreflaten og «For ledelsen» på utviklerflaten er hele overgangen — diskret og uten salg. Den besøkende går gjennom selv. Ventelisteformen registrerer stille hvilken dør som ble brukt (skjult felt: «leder» henholdsvis «utvikler»), uten å spørre.

## Konsekvenser

- «harness», terminalregister og lenker til kildekoden lever kun på utviklerflaten. Styreflaten kaller hele fenomenet KI-agenten og skal ikke brytes med utviklerspråk.
- Kuttlisten på styreflaten er vedtatt: de tre fortellingene på styresiden, dataklassifiseringspyramiden, Palantir-kickeren og de synlige dørvalgene i skjemaet skal ikke gjeninnsettes uten ny drøfting.
- De to «skjedte hos oss»-fortellingene (slettingen, den stille rettighetseskaleringen) er ikke publisert og skal ikke skrives før eieren har bekreftet hendelsene som presentert.
- Skjemaet spør ikke lenger hvem som sender henvendelsen; døren er besvart før spørsmålet kunne ha oppstått.
- Skjermbilde-verktøyet (`tools/shot.py`) dekker begge flatene i alle pass; ADR 0001 gjelder uforkortet på begge.

## Alternativer veid

1. **Blandet én side** — begge publikum i samme løype, med utviklerpanel ved CTA-en. Forkastet. Det er nettopp blandingen som gjør at begge ansiktene lander halvveis: registeret brytes for styret, og utvikleren får aldri en side skrevet til seg.
2. **Utvikleren først** — verktøysiden som forside, styrehistorien som underside. Forkastet. Innkjøperen er styret; den tosidige historien presenteres styret først, og utviklerflaten er landingsstedet for den som allerede er overbevist.
