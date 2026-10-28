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

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
      if (el.className.indexOf(REVEALED_CLASS) === -1) {
        el.className += (el.className ? ' ' : '') + REVEALED_CLASS;
      }
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

    // Bare den smale midtsonen av viewport telles, slik at hoyst én
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

  /* Ticket #5: animert karantene-diagram (inline SVG + engangsanimasjon).
     All JS for diagrammet hører hjemme i denne blokken. */

  /* ===== /BEHAVIOR:hero-diagram ===== */

  /* ===== BEHAVIOR:problemet ===== */

  /* Problemet-akten trenger ingen egen atferd: åpningen, de to risikoene og
     avslutningen er statisk innhold, og revealene håndteres av
     BEHAVIOR:scroll-reveal. Ingen interaktive elementer i akten. */

  /* ===== /BEHAVIOR:problemet ===== */

  /* ===== BEHAVIOR:losningen ===== */

  /* Losningen-ticketen eier denne blokken. */

  /* ===== /BEHAVIOR:losningen ===== */

  /* ===== BEHAVIOR:slik-virker-det ===== */

  /* Slik-virker-det-ticketen eier denne blokken: iscenesatt autoplay-terminal
     som skriver seg selv én gang (scrollutløst eller engangspass), aldri løkke. */

  /* ===== /BEHAVIOR:slik-virker-det ===== */

  /* ===== BEHAVIOR:infrastrukturen ===== */

  /* Infrastrukturen-ticketen eier denne blokken. */

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

  /* Kom-i-gang-ticketen eier denne blokken: venteliste-skjema, POST til
     /v1/waitlist via en konfigurerbar endepunktskonstant, mailto-fallback. */

  /* ===== /BEHAVIOR:kom-i-gang ===== */

  /* ===== BEHAVIOR:footer ===== */

  /* Footer-ticketen eier denne blokken. */

  /* ===== /BEHAVIOR:footer ===== */

}());
