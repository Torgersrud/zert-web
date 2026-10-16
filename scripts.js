(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Navbar scroll effect
    var navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Mobile menu
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    navToggle.addEventListener('click', function () {
        var open = navMenu.classList.toggle('open');
        navbar.classList.toggle('nav-open', open);
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        navToggle.setAttribute('aria-label', open ? 'Lukke meny' : 'Åpne meny');
    });
    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navMenu.classList.remove('open');
            navbar.classList.remove('nav-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Reveal on scroll
    if (!reducedMotion && 'IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.reveal').forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        document.querySelectorAll('.reveal').forEach(function (el) {
            el.classList.add('in');
        });
    }

    // Terminal typing
    var terminal = document.getElementById('terminal');
    if (terminal) {
        var lines = Array.prototype.slice.call(terminal.querySelectorAll('.t-line'));
        var targets = lines.map(function (line) {
            var node = line.firstChild;
            return { node: node, full: node ? node.nodeValue : '' };
        });

        if (!reducedMotion && 'IntersectionObserver' in window) {
            targets.forEach(function (t) { t.node.nodeValue = ''; });

            var termObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    termObserver.disconnect();
                    typeLine(0);
                });
            }, { threshold: 0.3 });
            termObserver.observe(terminal);

            function typeLine(index) {
                if (index >= targets.length) return;
                var t = targets[index];
                var i = 0;
                var interval = setInterval(function () {
                    i += 1;
                    t.node.nodeValue = t.full.slice(0, i);
                    if (i >= t.full.length) {
                        clearInterval(interval);
                        setTimeout(function () { typeLine(index + 1); }, t.full.startsWith('$') ? 420 : 150);
                    }
                }, 22);
            }
        }
    }

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var text = btn.closest('.codeblock').querySelector('code').textContent;
            function done() {
                btn.textContent = 'Kopiert';
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.textContent = 'Kopier';
                    btn.classList.remove('copied');
                }, 2000);
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done);
            } else {
                var area = document.createElement('textarea');
                area.value = text;
                area.style.position = 'fixed';
                area.style.opacity = '0';
                document.body.appendChild(area);
                area.select();
                document.execCommand('copy');
                document.body.removeChild(area);
                done();
            }
        });
    });
})();
