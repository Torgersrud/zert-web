
## 1. Merkevare i korte trekk
 
| | |
|---|---|
| **Essens** | En helnorsk pionér som kombinerer banebrytende teknologi med riktig sikkerhetsnivå – forankret i norske verdier og standarder |
| **Visjon** | Et Norge som er selvforsynt på digitale løsninger for sikker behandling av sensitiv data |
| **Verdiforslag** | Fremtidens norske løsning for sikker behandling av sensitiv data – der banebrytende KI møter nasjonal datasuverenitet |
| **Kjerneverdier** | Tillitskapende · Troverdig · Disruptiv |
| **Personlighet** | Den Vise (smart, presis) + Skaperen (innovativ, visjonær) – en visjonær mentor |
| **målgruppe** | Store norske virksomheter og GNF-er med høye krav til datasikkerhet |
 
**Uttrykk:** moderne og seriøst. Rolig, presist og selvsikkert, med energi fra gradering og bilder. Aldri leken, aldri overfylt. ALDRI BRUK EMOJIES
 
**Språk:** norsk (bokmål). Bruk «KI», ikke «AI».
 
---
 
## 2. Logo
 
- **Hvit logo på mørke flater. Sort logo på lyse flater.**
- Plassering: øvre venstre hjørne, med god luft rundt.
- Logoen skal ikke strekkes, roteres, få effekter eller farges med sekundærfarger.
---
 
## 3. Farger
 
### Primærfarger – tekst og bakgrunner
| Navn | Hex | Bruk |
|---|---|---|
| Dempet sort | `#191919` | Mørk bakgrunn, tekst på lyse flater |
| Dempet hvit | `#fcfcfc` | Lys bakgrunn, tekst på mørke flater |
 
Rent sort (`#000000`) og rent hvitt (`#ffffff`) finnes i gråskalaen, men standard bakgrunner er de «dempede» variantene.
 
### Sekundærfarger – grafikk og infografikk
Fire farger med tre toner hver. **Bruk i de fleste tilfeller bare én fargefamilie om gangen.**
 
| Familie | Sterk | Medium | Lys |
|---|---|---|---|
| Blå | `#0075e7` | `#8ec2ff` | `#c3deff` |
| Oransje/rød | `#ff5c38` | `#ff9078` | `#ffc4bc` |
| Gul | `#ffc04e` | `#ffd385` | `#ffe8c0` |
| Grønn | `#00a368` | `#46d387` | `#a8edb3` |
 
### Tertiærfarger – gråtoner
Til digitale bakgrunner, grafer og annet der primær- og sekundærfarger ikke egner seg.
 
`#000000` · `#191919` · `#606060` · `#909090` · `#d4d4d4` · `#f5f5f5` · `#fcfcfc` · `#ffffff`
 
### Gradering (profilbilde)
- Mykt, uskarpt fargeforløp: svart/mørk marineblå → lys cyan → hvit → oransje → mørk rød.
- Brukes **som et bilde**. Ta ulike utsnitt etter behov for å variere hvilken del som vises.
- Fungerer som blikkfang mot de rene sorte og hvite flatene.
### Tokens (anbefaling)
```css
:root {
  --zert-black:  #191919;
  --zert-white:  #fcfcfc;
 
  --blue-500:   #0075e7;  --blue-300:   #8ec2ff;  --blue-100:   #c3deff;
  --orange-500: #ff5c38;  --orange-300: #ff9078;  --orange-100: #ffc4bc;
  --yellow-500: #ffc04e;  --yellow-300: #ffd385;  --yellow-100: #ffe8c0;
  --green-500:  #00a368;  --green-300:  #46d387;  --green-100:  #a8edb3;
 
  --gray-900: #191919; --gray-600: #606060; --gray-400: #909090;
  --gray-200: #d4d4d4; --gray-100: #f5f5f5;
}
```
 
### Kontrast (anbefaling)
- Mørke slides: tekst `#fcfcfc`, sekundærtekst/etikett `#909090`.
- Lyse slides: tekst `#191919`, sekundærtekst/etikett `#606060` eller `#909090`.
- Sekundærfarger brukes til former og grafikk, ikke til løpende brødtekst.
---
 
## 4. Typografi
 
**Font: IBM Plex Sans** (full støtte for Æ Ø Å). Klar, lesbar, kraftfull med et tydelig digitalt preg.
 
- **Overskrifter:** uttrykksfulle og markerende.
- **Brødtekst:** balansert og funksjonell.
- **Nivåer skilles med ulike snitt** (vekter), ikke med ulike fonter.
- Store bokstaver fungerer til knapper og korte etiketter.
- Reserve hvis IBM Plex Sans ikke er tilgjengelig: Arial / Helvetica.
### Typografisk skala for 1920×1080 (anbefaling)
 
| Nivå | Størrelse | Vekt | Linjehøyde |
|---|---|---|---|
| Tittelslide-overskrift | 72–88 px | Medium/SemiBold | 1.1 |
| Slide-overskrift | 48–56 px | Medium | 1.15 |
| Ingress / understrek | 28–32 px | Regular | 1.35 |
| Brødtekst | 22–26 px | Regular | 1.45 |
| Etikett / bildetekst / URL | 16–18 px | Regular, evt. versaler | 1.3 |
 
Venstrejustert for tekst, midtjustert for headers. Maks ca. 60 tegn per linje. Hold overskrifter til to linjer.

---
 
## 5. Designelementet (kjennemerket som layout)
 
Kjennemerket fra logoen **videreføres som designelement** og kan **blåses opp og brukes aktivt i layout**.
 
**Form:** to par bueformer (kvartsirkel-lignende «blader») i et 2×2-rutenett, adskilt av en smal vertikal spiss i midten (nordstjerne-formen). Den mørke/lyse bakgrunnen skjærer seg inn mellom bildeflatene.
 
**Prinsipper**
- Elementet **fylles med innhold**: bilde, gradering eller en sekundærfarge.
- Elementet kan **falle utenfor kanten** (utfallende) på mørke slides, eller stå **med marg rundt** på lyse slides.
- Det skal være **stort og dristig**, vanligvis på høyre halvdel av slidens flate, med tekst til venstre.
- Fyll aldri elementet med flere sekundærfarger samtidig.
**Seks varianter å bygge videre på**
 
| Bakgrunn | Variant |
|---|---|
| Mørk (`#191919`) | 1. Bybilde i elementet (utfallende) |
| | 2. Gradering i elementet |
| | 3. Stor, utsnittet gradering som dekker flere felt |
| | 4. Gradering som full bakgrunn med elementet som tonet «vindu» |
| | 5. Tone-i-tone: elementet i mørke grånyanser, uten bilde |
| | 6. Personer i arbeid i elementet |
| Lys (`#fcfcfc`) | Samme seks varianter, med marg rundt elementet; tone-i-tone med `#f5f5f5` |
 
---

## 8. Tone of voice
 
- **Sage:** presis, kunnskapsrik, saklig. Ingen overdrivelser.
- **Creator:** visjonær, nyskapende, fremtidsrettet.
- **Tillitskapende og troverdig:** lov bare det vi kan levere. Vær transparent.
- Korte, tydelige setninger. Aktiv form.
- Gjenbrukbare formuleringer:
  - «En ny æra for sikker behandling av sensitiv data»
  - «– der banebrytende KI møter nasjonal datasuverenitet.»
  - «Beskytter samfunnets mest kritiske informasjon»
**Nøkkelbudskap (differensiering)**
- 100 % norsk løsning utviklet for nasjonal sikkerhet
- Kombinasjon av kunstig intelligens og riktig datasikkerhetsnivå
- Utviklet i tråd med norske forskrifter og regulatoriske krav
---
 
## 9. Gjør / ikke gjør
 
**Gjør**
- Bruk mye luft og store flater i `#191919` eller `#fcfcfc`
- La designelementet være et dristig grep på hver nøkkelslide
- Én sekundærfarge om gangen
- Bilder av Norge, med mennesker og infrastruktur
- IBM Plex Sans, variert på vekt
**Ikke gjør**
- Ikke bruk flere sekundærfarger på samme slide
- Ikke legg tekst over travle deler av bilder uten mørk flate bak
- Ikke strekk, roter eller omfarg logoen
- Ikke bruk andre fonter eller dekorative effekter (skygger, glød, 3D)
- Ikke fyll slides med punktlister – én idé per slide
- Ikke bruk bilder som ikke er norske eller samfunnsrelevante
---

