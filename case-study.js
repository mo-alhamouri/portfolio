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

// Interactive key request demo (project-api.html only)
(function () {
    var root = document.querySelector('.kp');
    if (!root) return;
    var form = root.querySelector('[data-screen="form"]');
    var confirmBtn = form.querySelector('[data-act="confirm"]');
    var tip = form.querySelector('.kp-tip');
    var toast = root.querySelector('.kp-toast');
    var toastT;
    var email = '';
    var lastFocus = null;

    function show(name) {
        root.querySelectorAll('.kp-screen').forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-screen') === name); });
    }
    function step(n) {
        root.querySelectorAll('.kp-steps li').forEach(function (li) {
            var s = +li.getAttribute('data-s');
            li.classList.toggle('is-on', s === n);
            li.classList.toggle('is-done', s < n);
            if (s === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        });
    }
    function say(msg) {
        toast.textContent = msg; toast.classList.add('is-on');
        clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 2200);
    }
    function modal(name, open) {
        var m = root.querySelector('[data-modal="' + name + '"]');
        if (open) { lastFocus = document.activeElement; m.hidden = false; var b = m.querySelector('button.kp-btn:last-child') || m.querySelector('button'); if (b) b.focus(); }
        else { m.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
    }
    function valid() {
        var ok = true;
        form.querySelectorAll('input, select').forEach(function (el) { if (!el.value.trim()) ok = false; });
        var e = form.querySelector('[name="email"]');
        if (e.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value)) { ok = false; e.setAttribute('aria-invalid', 'true'); }
        else e.removeAttribute('aria-invalid');
        return ok;
    }
    function anyFilled() {
        var any = false;
        form.querySelectorAll('input, select').forEach(function (el) { if (el.value.trim()) any = true; });
        return any;
    }
    function refresh() {
        var ok = valid();
        confirmBtn.disabled = !ok;
        tip.classList.toggle('is-armed', !ok);
    }
    function rand(n) {
        var c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789', s = '';
        for (var i = 0; i < n; i++) s += c.charAt(Math.floor(Math.random() * c.length));
        return s;
    }
    function reset() {
        form.reset(); refresh(); show('form'); step(1); root.querySelector('[data-bind="authed"]').hidden = true;
        root.querySelectorAll('.kp-modal').forEach(function (m) { m.hidden = true; });
    }

    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!valid()) return;
        email = form.querySelector('[name="email"]').value.trim();
        confirmBtn.classList.add('is-busy'); confirmBtn.disabled = true;
        setTimeout(function () {
            confirmBtn.classList.remove('is-busy');
            root.querySelector('[data-bind="email"]').textContent = email;
            show('verify'); step(2);
        }, 900);
    });
    root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act], [data-copy]');
        if (!b) return;
        var act = b.getAttribute('data-act');
        if (b.hasAttribute('data-copy')) {
            var txt = root.querySelector('[data-bind="' + b.getAttribute('data-copy') + '"]').textContent;
            try { navigator.clipboard.writeText(txt).catch(function () {}); } catch (err) {}
            say('Copied to clipboard');
            return;
        }
        if (act === 'cancel') { if (anyFilled()) modal('cancel', true); else say('Nothing to cancel yet'); }
        else if (act === 'goback') modal('cancel', false);
        else if (act === 'exit') { modal('cancel', false); reset(); say('Form cleared'); }
        else if (act === 'resend') say('Verification email sent again');
        else if (act === 'verify') {
            root.querySelector('[data-bind="key"]').textContent = 'pk_test_' + rand(32);
            root.querySelector('[data-bind="secret"]').textContent = 'sk_test_' + rand(40);
            show('docs'); step(3); modal('key', true);
        }
        else if (act === 'keydone') { modal('key', false); step(4); root.querySelector('[data-bind="authed"]').hidden = false; say('You are authorized to try the API'); }
        else if (act === 'again') modal('expired', true);
        else if (act === 'closeexp') modal('expired', false);
        else if (act === 'restart') { reset(); say('Demo restarted'); }
    });
    root.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var open = root.querySelector('.kp-modal:not([hidden])');
        if (open) modal(open.getAttribute('data-modal'), false);
    });
    refresh();
})();

// Interactive Conquest dashboard demo (project-machine-learning.html only). Sample data.
(function () {
    var root = document.querySelector('.cq');
    if (!root) return;
    var BASE = {
        on:  { retirement: 105, education: 100, car: 89, vacation: 100, legacy: 1.2 },
        off: { retirement: 80,  education: 92,  car: 64, vacation: 100, legacy: 0.8 }
    };
    var STRAT = {
        portfolio: { title: 'Implement the Recommended portfolio', why: 'One of the most important ways to ensure financial success is to invest wisely. Adopting the recommended portfolio raises the return your plan can expect.', goal: 'retirement', d: 8 },
        education: { title: 'Save $500 Monthly', why: 'Setting aside a fixed amount each month keeps the education fund on track without changing your lifestyle.', goal: 'education', d: 6 },
        greece:    { title: 'Save $5,000 from your tax refund each year', why: 'Saving part of your annual tax refund grows the travel fund without taking a bite out of your monthly cash flow.', goal: 'vacation', d: 5 },
        tfsa:      { title: 'Take advantage of a TFSA', why: 'Tax-free growth on savings you already make.', goal: 'retirement', d: 6 },
        tfsa2:     { title: 'Contribute more to your TFSA', why: 'Raising contributions compounds the tax-free growth.', goal: 'retirement', d: 4 },
        earlier:   { title: 'Retire earlier', why: 'Shifting savings forward lets you retire sooner at the same lifestyle.', goal: 'retirement', d: 3 }
    };
    var state, current;
    var rec = root.querySelector('[data-rec]');
    var toast = root.querySelector('.cq-toast'), toastT;
    var bars = root.querySelector('.cq-bars');
    var results = root.querySelector('.cq-results');

    function say(m) { toast.textContent = m; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 2200); }
    function val(goal) { var v = BASE[rec.checked ? 'on' : 'off'][goal]; return goal === 'legacy' ? v : v + (state.boost[goal] || 0); }
    function render(changed) {
        root.querySelector('[data-bind="recstate"]').textContent = rec.checked ? 'ON' : 'OFF';
        root.querySelector('[data-bind="recnote"]').textContent = rec.checked
            ? 'The charts below show your ability to achieve your goals if you follow the recommendations.'
            : 'The charts below show your ability to achieve your goals on your current path, without the recommendations.';
        root.querySelectorAll('.cq-goals li').forEach(function (li) {
            var g = li.getAttribute('data-goal'), v = val(g), out = li.querySelector('.cq-val');
            var pct = g === 'legacy' ? Math.round(v / 1.4 * 100) : Math.min(v, 100);
            li.querySelector('.cq-arc').style.strokeDashoffset = (201 - 201 * pct / 100).toFixed(1);
            out.textContent = g === 'legacy' ? '$' + v.toFixed(1) + 'M' : v + '%';
            out.classList.toggle('is-good', g !== 'legacy' && v >= 100);
            if (changed === g) { out.classList.remove('is-up'); void out.offsetWidth; out.classList.add('is-up'); }
        });
        var r = val('retirement'), html = '';
        for (var i = 0; i <= 40; i++) {
            var retired = i >= 18, inc, wd = 0, sf = 0;
            if (!retired) inc = 55 + i * 1.6 + (i % 3) * 2;
            else { inc = 18 + (i % 4) * 2; wd = 52 + (i % 5) * 3; sf = Math.max(0, (100 - r) * 0.9 - (40 - i) * 0.4); wd = Math.max(10, wd - sf); }
            html += '<span><em style="height:' + inc + '%;background:#4A90E2"></em><em style="height:' + wd + '%;background:#B5B5B5"></em><em style="height:' + sf + '%;background:#E05252"></em></span>';
        }
        bars.innerHTML = html;
        var ul = root.querySelector('[data-bind="planned"]');
        ul.innerHTML = state.planned.length ? state.planned.map(function (t) { return '<li>✓ ' + t + '</li>'; }).join('') : '<li class="cq-empty">Nothing added yet. Apply a strategy from SAM.</li>';
    }
    function view(v) { root.querySelectorAll('.cq-sam-view').forEach(function (el) { el.classList.toggle('is-on', el.getAttribute('data-view') === v); }); }
    function open(key) {
        current = key; var s = STRAT[key];
        root.querySelector('[data-bind="stitle"]').textContent = s.title;
        root.querySelector('[data-bind="swhy"]').textContent = s.why;
        root.querySelector('[data-bind="simpact"]').textContent = 'Goal impact: ' + s.goal.charAt(0).toUpperCase() + s.goal.slice(1) + ' +' + s.d + '%';
        var applied = state.planned.indexOf(s.title) > -1, b = root.querySelector('[data-act="apply"]');
        b.disabled = applied; b.textContent = applied ? 'Applied' : 'Apply';
        view('strategy');
    }
    function apply(key) {
        var s = STRAT[key];
        if (state.planned.indexOf(s.title) > -1) return false;
        state.planned.push(s.title);
        state.boost[s.goal] = (state.boost[s.goal] || 0) + s.d;
        render(s.goal); say('Added to your plan: ' + s.title);
        return true;
    }
    function reset() {
        state = { boost: {}, planned: [] };
        rec.checked = true; results.innerHTML = ''; root.querySelector('#cq-q').value = ''; view('next'); render();
    }

    rec.addEventListener('change', function () { render(); say(rec.checked ? 'Showing your plan with recommendations' : 'Showing your current path'); });
    root.addEventListener('click', function (e) {
        var b = e.target.closest('[data-act]'); if (!b) return;
        var a = b.getAttribute('data-act');
        if (a === 'open') open(b.getAttribute('data-strategy'));
        else if (a === 'back') view('next');
        else if (a === 'apply') { if (apply(current)) { b.disabled = true; b.textContent = 'Applied'; } }
        else if (a === 'add') { if (apply(b.getAttribute('data-strategy'))) { b.disabled = true; b.textContent = '✓'; b.setAttribute('aria-label', 'Added'); } }
        else if (a === 'reset') { reset(); say('Dashboard reset'); }
    });
    root.querySelector('.cq-ask').addEventListener('submit', function (e) {
        e.preventDefault();
        var q = root.querySelector('#cq-q').value.toLowerCase();
        var keys = /retire|earl/.test(q) ? ['earlier', 'portfolio'] : ['tfsa', 'tfsa2'];
        results.innerHTML = '<li class="cq-k" style="border:0">Some strategies I found…</li>' + keys.map(function (k) {
            var s = STRAT[k], done = state.planned.indexOf(s.title) > -1;
            return '<li><span>' + s.title + '<small>Goal impact: +' + s.d + '%</small></span><button type="button" data-act="add" data-strategy="' + k + '" aria-label="Add ' + s.title + '"' + (done ? ' disabled>✓' : '>+') + '</button></li>';
        }).join('');
    });
    reset();
})();
