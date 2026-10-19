// Shared behaviour for all case study pages (project-*.html)
// Reading progress
(function () {
    const bar = document.getElementById('progress');
    const update = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    };
    addEventListener('scroll', update, { passive: true }); update();
})();

// Reveal on scroll
// Content is visible by default; the fade-in is an enhancement on top. Only chapters that
// start below the fold are prepared, and anchors, printing, reduced motion and automated
// browsers always get the content without waiting for the animation.
(function () {
    const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || reduce || navigator.webdriver || location.hash) return;
    const els = [...document.querySelectorAll('.reveal')].filter(e => e.getBoundingClientRect().top > innerHeight * 0.9);
    const show = e => e.classList.remove('pre');
    const showAll = () => els.forEach(show);
    els.forEach(e => e.classList.add('pre'));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    els.forEach(e => io.observe(e));
    addEventListener('hashchange', showAll);
    document.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) showAll(); });
    addEventListener('beforeprint', showAll);
    addEventListener('scroll', () => els.forEach(e => { if (e.getBoundingClientRect().top < innerHeight) show(e); }), { passive: true });
})();

// Table of contents: highlight current chapter
(function () {
    const links = [...document.querySelectorAll('.toc a')];
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { links.forEach(a => a.removeAttribute('aria-current')); map.get(e.target.id)?.setAttribute('aria-current', 'true'); }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

// Lightbox: opens the original full-resolution PNG
(function () {
    const lb = document.getElementById('lightbox');
    const img = lb.querySelector('img');
    const closeBtn = lb.querySelector('.lb-close');
    let lastFocus = null;
    function open(src, alt) {
        lastFocus = document.activeElement;
        img.src = src; img.alt = alt || '';
        lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.scrollTop = 0;
        closeBtn.focus();
    }
    function close() {
        lb.classList.remove('open'); document.body.style.overflow = ''; img.removeAttribute('src');
        if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('.is-zoomable').forEach(shot => {
        const go = () => open(shot.dataset.full, shot.querySelector('img').alt);
        shot.querySelector('img').addEventListener('click', go);
        shot.querySelector('.zoom').addEventListener('click', go);
    });
    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
})();

// Interactive design system playground (project-design-systems.html only)
(function () {
    var root = document.querySelector('.ds-play');
    if (!root) return;
    var T = {
        en: {
            'banner-warning': 'Your next session is due today.',
            'banner-error': 'We couldn’t save your progress. Please try again.',
            'banner-info': 'New exercises were added to your plan.',
            'banner-success': 'Great work! Session complete.',
            'reset': 'Show banner again',
            'meta': 'Daily playlist · 15 min',
            'title': 'Lower back mobility',
            'today': 'Today',
            'ex1': 'Cat-cow stretch',
            'ex2': 'Bird dog',
            'ex3': 'Glute bridge',
            'acc-q': 'How do I do this exercise?',
            'acc-a': 'Move slowly and stop if you feel sharp pain. Your coach can adjust your plan.',
            'cta': 'Start session',
            'cta2': 'Skip for today'
        },
        fr: {
            'banner-warning': 'Votre prochaine séance est prévue aujourd’hui.',
            'banner-error': 'Impossible d’enregistrer votre progression. Veuillez réessayer.',
            'banner-info': 'De nouveaux exercices ont été ajoutés à votre programme.',
            'banner-success': 'Bravo ! Séance terminée.',
            'reset': 'Afficher à nouveau la bannière',
            'meta': 'Playlist du jour · 15 min',
            'title': 'Mobilité du bas du dos',
            'today': 'Aujourd’hui',
            'ex1': 'Étirement chat-vache',
            'ex2': 'Extension bras-jambe opposés à quatre pattes',
            'ex3': 'Pont fessier',
            'acc-q': 'Comment réaliser correctement cet exercice ?',
            'acc-a': 'Bougez lentement et arrêtez-vous si vous ressentez une douleur vive. Votre coach peut adapter votre programme.',
            'cta': 'Commencer la séance',
            'cta2': 'Passer pour aujourd’hui'
        }
    };
    var state = { lang: 'en', banner: 'warning', variant: 'primary', disabled: false };
    var screen = root.querySelector('.ds-screen');
    var banner = root.querySelector('.ds-banner');
    var bannerText = root.querySelector('.ds-bt');
    var reset = root.querySelector('.ds-reset');
    var cta = root.querySelector('.ds-bar .ds-btn');
    var btns = root.querySelectorAll('.ds-bar .ds-btn');

    function render() {
        var t = T[state.lang];
        screen.setAttribute('lang', state.lang);
        root.querySelectorAll('[data-i18n]').forEach(function (el) {
            var k = el.getAttribute('data-i18n');
            if (t[k]) el.textContent = t[k];
        });
        banner.setAttribute('data-type', state.banner);
        bannerText.textContent = t['banner-' + state.banner];
        cta.setAttribute('data-variant', state.variant);
        btns.forEach(function (b) { b.disabled = state.disabled; });
    }
    function seg(attr, key) {
        root.querySelectorAll('.ds-seg [' + attr + ']').forEach(function (b) {
            b.addEventListener('click', function () {
                state[key] = b.getAttribute(attr);
                b.parentNode.querySelectorAll('button').forEach(function (o) { o.setAttribute('aria-checked', o === b ? 'true' : 'false'); });
                if (key === 'banner') { banner.hidden = false; reset.hidden = true; }
                render();
            });
        });
    }
    seg('data-variant', 'variant');
    seg('data-banner', 'banner');
    seg('data-lang', 'lang');
    root.querySelector('[data-disabled]').addEventListener('change', function (e) { state.disabled = e.target.checked; render(); });
    root.querySelector('.ds-x').addEventListener('click', function () { banner.hidden = true; reset.hidden = false; reset.focus(); });
    reset.addEventListener('click', function () { banner.hidden = false; reset.hidden = true; });
    var acc = root.querySelector('.ds-acc button');
    acc.addEventListener('click', function () {
        var open = acc.getAttribute('aria-expanded') === 'true';
        acc.setAttribute('aria-expanded', open ? 'false' : 'true');
        document.getElementById('ds-acc-body').hidden = open;
    });
    render();
})();
