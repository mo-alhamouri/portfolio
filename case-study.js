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

// Interactive ISOQAR portal demo (project-ai-compliance.html only). Sample data.
(function () {
    var root = document.querySelector('.iq');
    if (!root) return;
    var MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var COL = { 'Certificate': '#0F9996', 'Invoice': '#00804A', 'Site visit': '#3C2869', 'Registration': '#FBCB21' };
    var ICON = {
        'Certificate': '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m9 12 2 2 4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
        'Invoice': '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m9 13 2 2 4-4" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
        'Site visit': '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 3v4M16 3v4M4 10h16" stroke="currentColor" stroke-width="2"/></svg>',
        'Registration': '<svg viewBox="0 0 24 24"><path d="M6 4h9l3 3v13H6Z M9 11h6M9 15h6" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
    };
    var today = new Date(); today.setHours(0, 0, 0, 0);
    function add(d) { var x = new Date(today); x.setDate(x.getDate() + d); return x; }
    function fmt(d) { return d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear(); }
    var CERTS = [['Stage 3', 'ISO 9001'], ['Recertification 2023', 'ISO 22301'], ['Annex 2023', 'ISO 22301'], ['Appendix 2023', 'ISO 9001'], ['ETS Site 24/26', 'ISO 44001'], ['Stage 2', 'ISO 22301'], ['Recertification 2022', 'ISO 9001'], ['Annex 2022', 'ISO 45001']];
    var state, filter = 'all';
    var toast = root.querySelector('.iq-toast'), toastT;
    function say(m) { toast.textContent = m; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 2200); }
    function $(b) { return root.querySelector('[data-bind="' + b + '"]'); }

    function reset() {
        state = {
            bookings: [{ d: add(24), site: 'Head office, London', std: 'ISO 9001', st: 'Scheduled' }, { d: add(9), site: 'Bristol', std: 'ISO 22301', st: 'Scheduled' }, { d: add(40), site: 'Glasgow', std: 'ISO 45001', st: 'Scheduled' }],
            updates: [
                { t: 'Certificate', n: 'ISO 22301 - Stage 2', d: add(-2) },
                { t: 'Invoice', n: 'Partial Credit for Audit', d: add(-6) },
                { t: 'Site visit', n: 'New site booking - Bristol', d: add(-9) },
                { t: 'Registration', n: '20113 - Demo Group PLC - ISO 22301', d: add(-14) },
                { t: 'Invoice', n: 'Cancellation fee', d: add(-20) },
                { t: 'Certificate', n: 'ISO 22301 - Recertification', d: add(-31) }
            ],
            notes: [{ c: '#0F9996', t: 'New certificate available', s: 'ISO 22301 - Stage 2' }, { c: '#3C2869', t: 'Site booking confirmed', s: 'Bristol' }],
            unread: 2, sel: null
        };
        filter = 'all';
        root.querySelectorAll('.iq-chips button').forEach(function (b) { b.setAttribute('aria-checked', b.getAttribute('data-filter') === 'all' ? 'true' : 'false'); });
        $('certq').value = '';
        root.querySelector('.iq-fly').hidden = true; root.querySelector('.iq-bell').setAttribute('aria-expanded', 'false');
        root.querySelector('.iq-modal').hidden = true;
        go('home'); render();
    }
    function go(v) {
        root.querySelectorAll('.iq-nav button').forEach(function (b) { var on = b.getAttribute('data-view') === v; b.classList.toggle('is-on', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
        root.querySelectorAll('.iq-view').forEach(function (el) { el.classList.toggle('is-on', el.getAttribute('data-view') === v); });
    }
    function render() {
        var next = state.bookings.filter(function (b) { return b.d >= today; }).sort(function (a, b) { return a.d - b.d; })[0];
        var days = Math.round((next.d - today) / 864e5);
        $('days').textContent = days + (days === 1 ? ' day' : ' days');
        $('auditdate').textContent = fmt(next.d) + ' · ' + next.site + ' · ' + next.std;
        // updates
        var list = state.updates.filter(function (u) { return filter === 'all' || u.t === filter; });
        $('updates').innerHTML = list.map(function (u, i) {
            return '<li><span class="iq-tile" style="--c:' + COL[u.t] + '">' + ICON[u.t] + '</span><span><em>' + u.t + '</em><a data-act="open" data-name="' + u.n + '">' + u.n + '</a></span><span class="iq-date">' + fmt(u.d) + '</span><button type="button" class="iq-dl" data-act="dl" data-name="' + u.n + '" aria-label="Download ' + u.n + '">⤓</button></li>';
        }).join('') || '<li><span></span><span class="iq-small">Nothing here yet.</span></li>';
        // mini calendar (current month)
        var y = today.getFullYear(), m = today.getMonth(), first = new Date(y, m, 1), start = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate();
        var has = {}; state.bookings.forEach(function (b) { if (b.d.getMonth() === m && b.d.getFullYear() === y) has[b.d.getDate()] = b; });
        var h = '<span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>';
        for (var i = 0; i < start; i++) h += '<span></span>';
        for (var d = 1; d <= dim; d++) h += has[d] ? '<button type="button" class="has' + (state.sel === d ? ' is-sel' : '') + '" data-act="day" data-day="' + d + '" aria-label="' + d + ' ' + MON[m] + ': site visit">' + d + '</button>' : '<button type="button" tabindex="-1" disabled>' + d + '</button>';
        $('mcal').innerHTML = h;
        $('mcalnote').textContent = state.sel && has[state.sel] ? has[state.sel].site + ' · ' + has[state.sel].std + ' · ' + has[state.sel].st : MON[m] + ': highlighted dates have a site visit. Pick one.';
        // bookings table
        $('bookings').innerHTML = state.bookings.slice().sort(function (a, b) { return a.d - b.d; }).map(function (b) {
            return '<tr><td>' + fmt(b.d) + '</td><td>' + b.site + '</td><td>' + b.std + '</td><td><span class="iq-state' + (b.st !== 'Scheduled' ? ' is-req' : '') + '">' + b.st + '</span></td></tr>';
        }).join('');
        // certificates
        var q = $('certq').value.trim().toLowerCase();
        var rows = CERTS.filter(function (c) { return !q || (c[0] + ' ' + c[1]).toLowerCase().indexOf(q) > -1; });
        $('certcount').textContent = rows.length + ' files';
        $('certs').innerHTML = rows.map(function (c, i) { return '<tr><td><a data-act="dl" data-name="' + c[0] + '">' + c[0] + '</a></td><td>' + fmt(add(-10 - i * 23)) + '</td><td>' + c[1] + '</td><td><button type="button" class="iq-dl" data-act="dl" data-name="' + c[0] + '" aria-label="Download ' + c[0] + '">⤓</button></td></tr>'; }).join('') || '<tr><td colspan="4" class="iq-small">No certificates match “' + q + '”.</td></tr>';
        // notifications
        $('count').textContent = state.unread ? state.unread : '';
        $('notes').innerHTML = state.notes.map(function (n) { return '<li><i style="--c:' + n.c + '"></i><span>' + n.t + '<small>' + n.s + '</small></span></li>'; }).join('');
    }
    var modal = root.querySelector('.iq-modal'), form = modal.querySelector('form'), sendBtn = form.querySelector('[type="submit"]'), lastFocus;
    function openModal() { lastFocus = document.activeElement; form.reset(); sendBtn.disabled = true; var d = form.querySelector('[name="date"]'); d.min = add(1).toISOString().slice(0, 10); modal.hidden = false; form.querySelector('select').focus(); }
    function closeModal() { modal.hidden = true; if (lastFocus) lastFocus.focus(); }
    form.addEventListener('input', function () { sendBtn.disabled = !form.checkValidity(); });
    form.addEventListener('submit', function (e) {
        e.preventDefault(); if (!form.checkValidity()) return;
        var p = form.querySelector('[name="date"]').value.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
        var site = form.site.value, std = form.std.value;
        state.bookings.push({ d: d, site: site, std: std, st: 'Requested' });
        state.updates.unshift({ t: 'Site visit', n: 'New site booking - ' + site, d: today });
        state.notes.unshift({ c: '#3C2869', t: 'Booking requested', s: site + ' · ' + fmt(d) }); state.unread++;
        closeModal(); render(); go('bookings'); say('Booking requested. ISOQAR will confirm the date.');
    });
    root.addEventListener('click', function (e) {
        var nb = e.target.closest('.iq-nav button'); if (nb) { go(nb.getAttribute('data-view')); return; }
        var ch = e.target.closest('.iq-chips button');
        if (ch) { filter = ch.getAttribute('data-filter'); ch.parentNode.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', b === ch ? 'true' : 'false'); }); render(); return; }
        var b = e.target.closest('[data-act]'); if (!b) return;
        var a = b.getAttribute('data-act');
        if (a === 'dl' || a === 'open') say('Downloading ' + b.getAttribute('data-name') + ' (demo)');
        else if (a === 'book') openModal();
        else if (a === 'cancel') closeModal();
        else if (a === 'day') { state.sel = +b.getAttribute('data-day'); render(); }
        else if (a === 'bell') { var f = root.querySelector('.iq-fly'); f.hidden = !f.hidden; b.setAttribute('aria-expanded', f.hidden ? 'false' : 'true'); if (!f.hidden) { state.unread = 0; render(); } }
        else if (a === 'reset') { reset(); say('Portal reset'); }
    });
    $('certq').addEventListener('input', render);
    root.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!modal.hidden) closeModal(); var f = root.querySelector('.iq-fly'); if (!f.hidden) { f.hidden = true; root.querySelector('.iq-bell').setAttribute('aria-expanded', 'false'); } } });
    reset();
})();

// Interactive McAfee onboarding demo (project-cybersecurity-onboarding.html only). Sample data.
(function () {
    var root = document.querySelector('.mo');
    if (!root) return;
    var IMG = 'images/project-ai/case/cybersecurity-onboarding/demo/';
    var GOALS = {
        device:   { name: 'Device protection',   img: 'p-device',   opts: ['Download Antivirus', 'Make my Wi-Fi safer'], rec: 0, short: 'Antivirus', title: 'Get McAfee Antivirus', desc: 'Download the app and start protecting your device.', ill: 's-antivirus' },
        identity: { name: 'Identity protection', img: 'p-identity', opts: ['Monitor for identity fraud', 'Scan for breaches'], rec: 0, short: 'ID Monitoring', title: 'Start your ID Monitoring', desc: 'Check if your email address is found in data breaches.', ill: 's-id' },
        privacy:  { name: 'Privacy protection',  img: 'p-privacy',  opts: ['Secure my accounts', 'Protect my web browsing'], rec: 1, short: 'Web protection', title: 'Get web protection', desc: 'Browse the web knowing you’re protected from unsafe websites.', ill: 's-web' }
    };
    var ORDER = ['device', 'identity', 'privacy'];
    var NTH = ['first', 'second', 'third'], NUM = ['', 'one', 'two', 'three'];
    var FLOW = ['welcome', 'ways', 'goals', 'steps', 'setup', 'install', 'congrats', 'dash'];
    var state, welcomeT, installT, toastT;
    var toast = root.querySelector('.mo-toast');
    function $(b) { return root.querySelector('[data-bind="' + b + '"]'); }
    function say(m) { toast.textContent = m; toast.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('is-on'); }, 2200); }
    function picked() { return ORDER.filter(function (k) { return state.goals[k]; }); }

    function go(v, focus) {
        state.view = v;
        root.querySelectorAll('.mo-view').forEach(function (el) { el.classList.toggle('is-on', el.getAttribute('data-view') === v); });
        root.querySelector('.mo-prog i').style.width = Math.round(FLOW.indexOf(v) / (FLOW.length - 1) * 100) + '%';
        if (v === 'steps') renderRecs();
        if (v === 'setup') renderCards();
        if (v === 'dash') renderDash();
        if (focus !== false) { var h = root.querySelector('.mo-view.is-on h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } }
    }
    function renderRecs() {
        var ks = picked(), box = $('recs');
        box.style.setProperty('--n', ks.length);
        box.innerHTML = ks.map(function (k) {
            var g = GOALS[k];
            return '<div><img src="' + IMG + g.img + '.webp" alt=""><strong>' + g.name + '</strong>' + g.opts.map(function (o, i) {
                return '<span class="mo-chip' + (i === g.rec ? ' is-on' : '') + '">' + o + (i === g.rec ? '<span class="mo-sr"> (recommended)</span>' : '') + '</span>';
            }).join('') + '</div>';
        }).join('');
    }
    function renderCards() {
        var ks = picked(), box = $('cards');
        box.style.setProperty('--n', ks.length);
        box.innerHTML = ks.map(function (k, i) {
            var g = GOALS[k], done = state.done[k];
            return '<div class="mo-card"><b>Step ' + (i + 1) + '</b><div class="mo-cin"><img src="' + IMG + g.ill + '.webp" alt=""><em>Quick setup</em><strong>' + g.title + '</strong><p>' + g.desc + '</p>' +
                (done ? '<button type="button" class="mo-btn is-done" disabled aria-label="' + g.title + ': done">✓</button>'
                      : '<button type="button" class="mo-btn mo-outline" data-act="start" data-goal="' + k + '" aria-label="Get started: ' + g.title + '">Get started →</button>') + '</div></div>';
        }).join('');
    }
    function renderDash() {
        var ks = picked(), n = ks.filter(function (k) { return state.done[k]; }).length;
        var all = ks.length && n === ks.length;
        var score = all ? 900 : n ? 750 : 600;
        $('score').textContent = score;
        $('scorelabel').textContent = all ? 'Excellent' : n ? 'Good' : 'Fair';
        var arc = root.querySelector('.mo-arc');
        arc.style.strokeDashoffset = 301.6;
        requestAnimationFrame(function () { requestAnimationFrame(function () { arc.style.strokeDashoffset = (301.6 * (1 - score / 1000)).toFixed(1); }); });
        var list = ks.length ? ks : ORDER;
        $('done').innerHTML = list.map(function (k) {
            var g = GOALS[k];
            return '<li><img src="' + IMG + g.ill + '.webp" alt=""><span><b>' + g.title + '</b>' + (state.done[k] ? '<span class="ok">✓ Protected</span>' : '<button type="button" class="mo-link" data-act="start" data-goal="' + k + '">Get started →</button>') + '</span></li>';
        }).join('');
    }
    function startInstall(k) {
        var ks = picked();
        if (ks.indexOf(k) < 0) { state.goals[k] = true; syncGoals(); ks = picked(); }
        state.current = k; state.fromDash = state.view === 'dash';
        var nth = ks.filter(function (x) { return state.done[x]; }).length;
        $('ill').src = IMG + GOALS[k].ill + '.webp';
        $('installing').textContent = 'Setting up your ' + NTH[nth] + ' protection…';
        var fill = $('fill'), btn = $('donebtn');
        fill.classList.remove('is-run'); void fill.offsetWidth; btn.disabled = true;
        go('install');
        requestAnimationFrame(function () { fill.classList.add('is-run'); });
        clearTimeout(installT);
        installT = setTimeout(function () { btn.disabled = false; btn.focus({ preventScroll: true }); }, 1500);
    }
    function installed() {
        var k = state.current; state.done[k] = true;
        say('✓ ' + GOALS[k].short + ' is on');
        if (state.fromDash) { go('dash'); return; }
        var ks = picked(), left = ks.filter(function (x) { return !state.done[x]; }).length;
        if (left) { go('setup'); return; }
        $('congrats').textContent = 'Nicely done — you’ve successfully set up your first ' + (ks.length > 1 ? NUM[ks.length] + ' ' : '') + 'protection feature' + (ks.length > 1 ? 's' : '') + '. Explore your dashboard and discover more ways McAfee can protect you.';
        go('congrats');
    }
    function syncGoals() {
        root.querySelectorAll('.mo-goals .mo-chip').forEach(function (b) { b.setAttribute('aria-pressed', state.goals[b.getAttribute('data-goal')] ? 'true' : 'false'); });
        $('next').disabled = !picked().length;
    }
    function armWelcome() {
        clearTimeout(welcomeT);
        welcomeT = setTimeout(function () { if (state.view === 'welcome') go('ways', false); }, 1800);
    }
    function reset(focus) {
        clearTimeout(installT);
        state = { goals: {}, done: {}, view: 'welcome', current: null };
        syncGoals(); go('welcome', focus);
        if (seen) armWelcome();
    }

    root.addEventListener('click', function (e) {
        var chip = e.target.closest('.mo-goals .mo-chip');
        if (chip) { var k = chip.getAttribute('data-goal'); state.goals[k] = !state.goals[k]; syncGoals(); return; }
        if (state.view === 'welcome' && e.target.closest('[data-view="welcome"]')) { go('ways'); return; }
        var b = e.target.closest('[data-act]'); if (!b) return;
        var a = b.getAttribute('data-act');
        if (a === 'go') go(b.getAttribute('data-to'));
        else if (a === 'start') startInstall(b.getAttribute('data-goal'));
        else if (a === 'installed') installed();
        else if (a === 'restart') { reset(false); say('Onboarding restarted'); }
    });

    var seen = false;
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { seen = true; armWelcome(); o.disconnect(); } }, { threshold: 0.4 }).observe(root);
    } else { seen = true; }
    reset(false);
})();
