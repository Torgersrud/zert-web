# Glossary

Domenspråket til Zert. Begrepene her er autoritative for all kopi og all videre dokumentasjon på zert.no. Dette er en ordliste — ikke implementasjonsdetaljer. Ton og formulering følger `DESIGN.md`; holdlinjen for hva vi kan si i presens, ligger i `docs/adr/0001`.

## KI-endepunktet

Den eneste utveien en KI-sandbox har til omverdenen: KI-serveren som kjører i norsk datasenter. All KI-trafikk går hit, og ingenting annet går ut. Skriv «KI-endepunktet» med bestemt form — det er ett bestemt punkt, ikke en vilkårlig URL.

## KI-sandbox

Et midlertidig, isolert virtuelt miljø der utviklere jobber med KI-modeller. Startes fra kommandolinjen, lever så lenge arbeidet gjør det, og avsluttes automatisk. Sensitiv data holdes inne; resultatene tas ut.

## Karantene (containment)

Tilstanden en KI-sandbox er i: den kan nå KI-endepunktet, og ingenting annet. Karantene handler om hva som er fysisk mulig for sandboxen, ikke om hva politikken sier den ikke får gjøre.

## Data ut / agenter inn

Den dobbelte risikoen skyggebruken av KI skaper for en virksomhet: følsom data sendes ut til utenlandske tilbydere (data ut), mens KI-agenter kjører med autoritet på bedriftens egne maskiner (agenter inn). Begrepene brukes sammen, som ett bilde på samme problem.

## Den tosidige historien (the two-faced story)

Fortellergrepet på zert.no: samme produkt har to ansikter mot to publikum — utvikleren vil ha verktøyet, styret og CISOen vil ha en runtime de kan godkjenne. Nettoproduktet svarer på begge. Historien presenteres styret først; utvikleren er publikummet som må bli overbevist etterpå.

## Compliance Consumer

Den personen Zert bygger bevislaget for: CISO, revisor eller styremedlem som mottar bevisene for én kunde — hendelser, tilganger og nektede handlinger — uten å bygge noe selv. Ikke en utvikler, ikke en sluttbruker; mottakeren av bevis.

## Idle window

Tidsvinduet en KI-sandbox står ubrukt før den avsluttes automatisk. Idle window gjør sandboxen midlertidig av natur: VM-en lever ikke videre etter at arbeidet er slutt.

## Gap Policy

Zerts skriftlige policy for hva som skjer med revisjonsdata under brudd: *«infra metrics may be marked lost during outages; audit events are never lost while the stack host's own disk holds.»* Policyen siteres verbatim, og alltid som det den er: en skrevet og testet policy med en grense, ikke en uendelig garanti.

## designelementet

Merkevarens kjennetegn fra logoen — nordstjerne-formen: to par bueformer i et 2×2-rutenett — brukt som aktivt layoutgrep: fylt med innhold, stort og dristig. Se `DESIGN.md` seksjon 5. Elementet skal leses som Zert, aldri som dekorasjon.

## dual-dør (waitlist)

Påmeldingsformen med to dører: utvikler eller leder. Den besøkende velger selv hvilken dør å gå gjennom. Da vet Zert fra første steg hvilket ansikt henvendelsen skal ha.

## Beviset

Avsnittet på zert.no der Zert viser hva som er sant i dag. Alt som står i Beviset, må tåle en teknisk due diligence-samtale. Det som ennå ikke er bygget, hører til i Veien videre, ikke her.

## Veien videre

Det synlige, designede roadmap-avsnittet på zert.no. Her — og bare her — står det som er planlagt, designet eller delvis bygget, tydelig merket som veien videre. Veien videre er et tillitsgrep, ikke en unnskyldning.
