/*
  zert.no — all JavaScript. Vanilla ES5-stil, ett IIFE, ingen avhengigheter.

  Struktur:
    1. BEHAVIOR:core            — classen html.js, helpers (eiet av skeleton)
    2. BEHAVIOR:scroll-reveal   — rise-reveals på omtrent 600 ms, én gang
    3. BEHAVIOR:nav-sync        — aktiv lenke følger seksjonen i viewport
    4. BEHAVIOR-blokker per handling — tomme fra denne ticketen; hver senere
       akt eier sin blokk og endrer kun der.

  Kontrakter for HTML (allerede i index.html):
    - [data-reveal]            element som rises inn når det når viewport
    - [data-reveal-group]      container som staggerer barna sine (120 ms)
    - .site-nav a[href^="#"]   navlenker som synces mot seksjons-ID-ene
    - Uten JavaScript: html.js settes ikke, alt innhold er synlig statisk.
    - prefers-reduced-motion: CSS viser alt statisk; JS blander ikke inn.
*/

/*
 * WAITLIST_ENDPOINT — én linje å endre: URL-en til venteliste-API-et
 * (POST /v1/waitlist, JSON {name, company, email, door}).
 * Backend er et eget ticket og ennå ikke deployet; så lenge endepunktet
 * ikke svarer, viser skjemaet mailto-fallbacken i stedet — aldri stille tap.
 * Ved lokal testing: pek denne på en stub (se ticket #12).
 */
var WAITLIST_ENDPOINT = 'https://api.zert.no/v1/waitlist';

(function () {
  'use strict';

  /* ===== BEHAVIOR:core ===== */

  var doc = document;
  var rootEl = doc.documentElement;

  // Signalerer at JS kjører, slik CSS får lov til å åpne reveal-animasjonen.
  rootEl.className = rootEl.className ? rootEl.className + ' js' : 'js';

  function each(list, fn) {
    var i;
    for (i = 0; i < list.length; i++) { fn(list[i], i); }
  }

  // Hold --header-h i takt med den faktiske headerhøyden (headeren wrapper
  // på smale bredder). [id] sin scroll-margin-top leses via tokenen, slik
  // at ankerlandlinger ikke lander under headeren — heller ikke over den
  // lyse Beviset-seksjonen.
  function syncHeaderHeight() {
    var header = doc.querySelector('.site-header');
    if (!header || !header.getBoundingClientRect || !rootEl.style.setProperty) { return; }
    var height = Math.ceil(header.getBoundingClientRect().height);
    if (height > 0) { rootEl.style.setProperty('--header-h', height + 'px'); }
  }
  syncHeaderHeight();
  if (window.addEventListener) { window.addEventListener('resize', syncHeaderHeight, false); }
  if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) { doc.fonts.ready.then(syncHeaderHeight); }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function hasClass(el, name) { return el.className.indexOf(name) !== -1; }
  function addClass(el, name) {
    if (!hasClass(el, name)) { el.className += (el.className ? ' ' : '') + name; }
  }
  function removeClass(el, name) {
    el.className = (' ' + el.className + ' ').replace(' ' + name + ' ', ' ').replace(/^ | $/g, '');
  }

  /* ===== BEHAVIOR:scroll-reveal ===== */

  (function () {
    var REVEAL_SELECTOR = '[data-reveal]';
    var GROUP_SELECTOR = '[data-reveal-group]';
    var REVEALED_CLASS = 'is-revealed';
    var STAGGER_MS = 120;

    var items = doc.querySelectorAll(REVEAL_SELECTOR);
    if (!items.length) { return; }

    function reveal(el, delayMs) {
      if (delayMs > 0) { el.style.transitionDelay = delayMs + 'ms'; }
      addClass(el, REVEALED_CLASS);
    }

    // Redusert bevegelse: CSS holder alt statisk fullstendig. Ingen klasser nødvendig.
    if (reducedMotion()) { return; }

    // Ingen IntersectionObserver (gammel nettleser): vis alt med en gang.
    if (!('IntersectionObserver' in window)) {
      each(items, function (el) { reveal(el, 0); });
      return;
    }

    function inGroup(el) {
      var node = el.parentNode;
      while (node && node !== doc) {
        if (node.nodeType === 1 && node.hasAttribute('data-reveal-group')) { return true; }
        node = node.parentNode;
      }
      return false;
    }

    var observer = new IntersectionObserver(function (entries) {
      var i, entry;
      for (i = 0; i < entries.length; i++) {
        entry = entries[i];
        if (!entry.isIntersecting) { continue; }
        observer.unobserve(entry.target); // kun én gang
        if (entry.target.hasAttribute('data-reveal-group')) {
          each(entry.target.querySelectorAll(REVEAL_SELECTOR), function (child, index) {
            reveal(child, index * STAGGER_MS);
          });
        } else {
          reveal(entry.target, 0);
        }
      }
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    each(doc.querySelectorAll(GROUP_SELECTOR), function (group) {
      observer.observe(group);
    });
    each(items, function (el) {
      if (!inGroup(el)) { observer.observe(el); }
    });
  }());

  /* ===== BEHAVIOR:nav-sync ===== */

  (function () {
    var linkById = {};
    var orderedIds = [];

    each(doc.querySelectorAll('.site-nav a[href^="#"]'), function (a) {
      var id = a.getAttribute('href').slice(1);
      if (!id || linkById[id]) { return; }
      linkById[id] = a;
      orderedIds.push(id);
    });

    if (!orderedIds.length || !('IntersectionObserver' in window)) { return; }

    function setActive(activeId) {
      var i, link;
      for (i = 0; i < orderedIds.length; i++) {
        link = linkById[orderedIds[i]];
        if (orderedIds[i] === activeId) {
          link.className = 'is-active';
          link.setAttribute('aria-current', 'true');
        } else {
          link.className = '';
          link.removeAttribute('aria-current');
        }
      }
    }

    // Bare den smale midtsonen av viewport telles, slik at høyst én
    // seksjon er aktiv om gangen.
    var visible = {};
    var observer = new IntersectionObserver(function (entries) {
      var i, entry;
      for (i = 0; i < entries.length; i++) {
        entry = entries[i];
        visible[entry.target.id] = entry.isIntersecting;
      }
      for (i = 0; i < orderedIds.length; i++) {
        if (visible[orderedIds[i]]) { setActive(orderedIds[i]); return; }
      }
      setActive(null); // over første lenkeseksjon (hero) eller under footer
    }, { threshold: 0, rootMargin: '-45% 0px -50% 0px' });

    each(orderedIds, function (id) {
      var el = doc.getElementById(id);
      if (el) { observer.observe(el); }
    });
  }());

  /* ===== BEHAVIOR:hero-diagram ===== */

  /* Karantene-diagrammet: starter engangsanimasjonen første gang diagrammet
     er i visningen (og aldri igjen), og velger hvelvform via ?vault=rect|leaf
     (dev-parameter; standard: firblad). Formvalget venter på endelig
     gjennomgang hos brukeren; tapervarianten fjernes ved den endelige
     poleringen. All styling og hele animasjonstidslinjen ligger i CSS;
     denne blokken legger bare på klasser én gang. */

  (function () {
    var diagrams = doc.querySelectorAll('.hero__diagram');
    if (!diagrams.length) { return; }

    var DRAWN_CLASS = 'is-drawn';
    var DONE_CLASS = 'is-done';
    var LEAF_CLASS = 'hero__diagram--leaf';
    var PASS_MS = 1700; // hele einepasseringen; + margin for bytte til sluttstate

    // Dev-only hvelvvalg: firblad er standard; ?vault=rect bytter tilbake.
    // Formvalget venter på endelig gjennomgang hos brukeren; tapervarianten
    // fjernes ved den endelige poleringen. Variant byttes kun på classen.
    var search = window.location && window.location.search ? window.location.search : '';
    var vault = search.match(/[?&]vault=(rect|leaf)(?:&|$)/);

    each(diagrams, function (el) {
      if (vault && vault[1] === 'rect') { removeClass(el, LEAF_CLASS); }
      else { addClass(el, LEAF_CLASS); }

      function arm() {
        addClass(el, DRAWN_CLASS);
        // Ett eneste pass: når animasjonstidslinjen er spilt ferdig,
        // bytter vi til den statiske slutttilstanden (is-done). Da kan
        // animasjonen verken loope eller starte på ny (f.eks. ved at
        // viewportstørrelsen endres) — slutttilstanden er basen i CSS.
        window.setTimeout(function () {
          removeClass(el, DRAWN_CLASS);
          addClass(el, DONE_CLASS);
        }, PASS_MS);
      }

      // Redusert bevegelse: CSS viser den fulle statiske komposisjonen
      // uten animasjon — da aktiverer vi ikke diagrammet i det hele tatt.
      if (reducedMotion()) { return; }

      // Ingen IntersectionObserver: vis den ferdige komposisjonen med en gang.
      if (!('IntersectionObserver' in window)) { arm(); return; }

      // Første sikt: da aktiverer vi animasjonen — og slår observatoren av for godt.
      var observer = new IntersectionObserver(function (entries) {
        var i;
        for (i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            observer.unobserve(entries[i].target);
            arm();
          }
        }
      }, { threshold: 0.2 });
      observer.observe(el);
    });
  }());

  /* ===== /BEHAVIOR:hero-diagram ===== */

  /* ===== BEHAVIOR:problemet ===== */

  /* Problemet-akten trenger ingen egen atferd: åpningen, de to risikoene og
     avslutningen er statisk innhold, og revealene håndteres av
     BEHAVIOR:scroll-reveal. Ingen interaktive elementer i akten. */

  /* ===== /BEHAVIOR:problemet ===== */

  /* ===== BEHAVIOR:losningen ===== */

  /* Losningen eier denne blokken. Akten er bevisst uten egen atferd:
     budskapet er statisk, og avdukingen håndteres av BEHAVIOR:scroll-reveal
     via data-reveal / data-reveal-group i HTML. Ingen terminal i denne akten. */

  /* ===== /BEHAVIOR:losningen ===== */

  /* ===== BEHAVIOR:slik-virker-det ===== */

  /* Iscenesatt autoplay-terminal. Scrollutløst, skriver seg selv én gang
     og blir så stående på den komplette sesjonen. Aldri løkke, aldri
     interaktiv. Redusert bevegelse, ingen IntersectionObserver eller ingen
     JavaScript: den komplette terminaltranskripsjonen står statisk i
     HTML-en, og denne blokken blander seg ikke inn. */

  (function () {
    var term = doc.querySelector('[data-term]');
    if (!term) { return; }
    if (reducedMotion()) { return; }
    if (!('IntersectionObserver' in window)) { return; }

    var TYPE_MS = 12;       // millisekunder per tegn i kommandolinjene
    var FINALIZE_MS = 6000; // sikkerhetsnett: fullendt senest da

    var lines = [];
    each(term.querySelectorAll('.term__line'), function (el) { lines.push(el); });
    if (!lines.length) { return; }

    var caret = term.querySelector('.term__caret');
    var lastLine = lines[lines.length - 1];
    var done = false;
    var index = 0;

    // Kommandoene tas ut av DOM-en før skrivningen starter.
    each(term.querySelectorAll('.term__cmd'), function (el) {
      el.setAttribute('data-cmd', el.textContent);
    });

    term.className += ' term--replay';

    function finish() {
      if (done) { return; }
      done = true;
      var i, cmd;
      for (i = 0; i < lines.length; i++) {
        lines[i].className += ' is-shown';
        cmd = lines[i].querySelector('.term__cmd');
        if (cmd) { cmd.textContent = cmd.getAttribute('data-cmd'); }
      }
      if (caret && lastLine) { lastLine.appendChild(caret); }
      term.className += ' term--done';
    }

    function type(el, text, at) {
      if (done) { return; }
      el.textContent = text.slice(0, at);
      if (at >= text.length) { step(); return; }
      setTimeout(function () { type(el, text, at + 1); }, TYPE_MS);
    }

    function step() {
      if (done) { return; }
      if (index >= lines.length) { finish(); return; }
      var line = lines[index];
      index += 1;
      var pause = parseInt(line.getAttribute('data-pause'), 10) || 0;
      setTimeout(function () {
        if (done) { return; }
        var cmd = line.querySelector('.term__cmd');
        line.className += ' is-shown';
        if (caret) { line.appendChild(caret); }
        if (cmd && cmd.getAttribute('data-cmd')) {
          type(cmd, cmd.getAttribute('data-cmd'), 0);
        } else {
          step();
        }
      }, pause);
    }

    var observer = new IntersectionObserver(function (entries) {
      var i;
      for (i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) { continue; }
        observer.unobserve(term); // én gangs avspilling — aldri omstart
        setTimeout(finish, FINALIZE_MS);
        step();
        return;
      }
    }, { threshold: 0, rootMargin: '0px 0px 12% 0px' });

    observer.observe(term);
  }());

  /* ===== /BEHAVIOR:slik-virker-det ===== */

  /* ===== BEHAVIOR:infrastrukturen ===== */

  /* Infrastrukturen-ticketen eier denne blokken. Handlingen trenger ingen
     egen JS: fotoet er et stillbilde, og tekst og modellkort rises inn av
     BEHAVIOR:scroll-reveal via data-reveal / data-reveal-group. */

  /* ===== /BEHAVIOR:infrastrukturen ===== */

  /* ===== BEHAVIOR:beviset ===== */

  /* Beviset er statisk: dokumentet trenger ingen egen atferd. Avduking
     skjer via BEHAVIOR:scroll-reveal, og prefers-reduced-motion dekkes av
     kjerne-CSS. Ingen hendelsesdata genereres i nettleseren — radene er
     faktatekst, ikke simulering. */

  /* ===== /BEHAVIOR:beviset ===== */

  /* ===== BEHAVIOR:veien-videre ===== */

  /* Veien-videre-ticketen eier denne blokken. Akten er statisk: fjell-
     bakgrunnen skjøtes av CSS og reveal av BEHAVIOR:scroll-reveal.
     Ingen egen atferd per i dag. */

  /* ===== /BEHAVIOR:veien-videre ===== */

  /* ===== BEHAVIOR:kom-i-gang ===== */

  /* Venteliste med dual-dør. Plain fetch POST-er JSON {name, company,
     email, door} til WAITLIST_ENDPOINT. Ingen optimistisk kvittering:
     takkemeldingen vises bare når endepunktet svarer 2xx. Nettverksfeil
     eller ikke-2xx avslører mailto-fallbacken med feltene ferdig utfylt —
     interessen skal aldri forsvinne stille. Dobbelsending er blokkert av
     en sending-flagg, og knappen er deaktivert mens sendinga pågår. */

  (function () {
    var form = doc.getElementById('venteliste');
    var takk = doc.getElementById('venteliste-takk');
    var feil = doc.getElementById('venteliste-feil');
    if (!form || !takk || !feil) { return; }

    var knapp = form.querySelector('.kig__send');
    var feilLenke = feil.querySelector('a');
    var knappetekst = knapp ? knapp.textContent : '';
    var sender = false;

    function verdi(navn) {
      var el = form.querySelector('[name="' + navn + '"]');
      return el ? el.value.replace(/^\s+|\s+$/, '') : '';
    }

    function dør() {
      var el = form.querySelector('[name="door"]:checked');
      return el ? el.value : '';
    }

    function settSending(på) {
      sender = på;
      if (!knapp) { return; }
      knapp.disabled = på;
      knapp.textContent = på ? 'Sender …' : knappetekst;
    }

    // Fallbacklenka bærer med alt brukeren har skrevet inn, slik at
    // e-posten er ferdig utfylt når den åpnes.
    function mailtoLenke() {
      var tekst = 'Navn: ' + verdi('name') +
        '\nSelskap: ' + verdi('company') +
        '\nE-post: ' + verdi('email') +
        '\nKommer som: ' + dør();
      return 'mailto:jp@zert.no?subject=' + encodeURIComponent('Venteliste Zert') +
        '&body=' + encodeURIComponent(tekst);
    }

    function visTakk() {
      feil.hidden = true;
      form.hidden = true;
      takk.hidden = false;
    }

    function visFeil() {
      if (feilLenke) { feilLenke.href = mailtoLenke(); }
      takk.hidden = true;
      feil.hidden = false;
      settSending(false); // tillat forsøk igjen — fallbacken står uansett fram
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (sender) { return; }

      var melding = {
        name: verdi('name'),
        company: verdi('company'),
        email: verdi('email'),
        door: dør()
      };

      settSending(true);

      // Gammel nettleser utan fetch: fallback med en gang, aldri stille tap.
      if (!('fetch' in window)) { visFeil(); return; }

      fetch(WAITLIST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(melding)
      }).then(function (svar) {
        if (svar.ok) { visTakk(); } else { visFeil(); }
      })['catch'](function () {
        visFeil();
      });
    });
  }());

  /* ===== /BEHAVIOR:kom-i-gang ===== */

  /* ===== BEHAVIOR:footer ===== */

  /* Footer-ticketen eier denne blokken. */

  /* ===== /BEHAVIOR:footer ===== */

}());
