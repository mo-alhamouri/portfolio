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

// Interactive receipt & split demo (project-deposits.html only). Sample data.
(function () {
    var root = document.querySelector('.dp');
    if (!root) return;
    var $ = function (s) { return root.querySelector(s); };
    var bind = function (n) { return root.querySelector('[data-bind="' + n + '"]'); };
    var WIRES = [
        { id: 1, amt: 400000, org: 'Prime Housing LLC', notes: 'File Number: NCS-1082018-Chi2 (BB) Property: MOB, Land, OH', rec: '7/20/2021', bank: 'The Oklahoma Stockyards National Bank', ref: '011220743', acct: '3022880000 - Primary Deposit Disbursement Account' },
        { id: 2, amt: 80000, org: 'ABC Acquisition', notes: 'Earnest money, order 425616', rec: '7/19/2021', bank: 'Premier Blue Bank', ref: '011220518', acct: '3022880000 - Primary Deposit Disbursement Account' },
        { id: 3, amt: 1241019.72, org: 'International Development Services, Inc.', notes: 'NCS-1072958EO-Chi2 NML 344333', rec: '7/16/2021', bank: 'South Western Bank Inc.', ref: '011219962', acct: 'HI Deposit Disbursement Account' },
        { id: 4, amt: 2000000, org: 'Ultimate Insurance', notes: 'File Number NCS-1066857-Chi1', rec: '7/15/2021', bank: 'First American Trust', ref: '011219440', acct: 'VA Deposit Disbursement Account' }
    ];
    var ORDERS = ['425616, 22 North Sangamon Street', '425633, 102 Sherlock Campus', '425640, 2338 West Bellview'];
    var FROM = ['Buyer', 'Buyer’s Attorney', 'Buyer’s Broker', 'New Lender', 'Seller', 'Other'];
    var REP = ['Earnest Money Deposit', 'Initial Deposit', 'Additional Deposit', 'Closing Costs', 'Funds for Closing', 'Loan Proceeds', 'Miscellaneous Deposit'];
    var CREDIT = ['Buyer', 'Seller', 'Other'];
    var MAX = 4;
    var state, toastT, lastFocus, menuOpen = null, qTimer;

    function money(n) { return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    function cents(n) { return Math.round(n * 100); }
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function opts(list, sel) { return '<option value="">Select…</option>' + list.map(function (o) { return '<option' + (o === sel ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join(''); }

    function show(name) {
        root.querySelectorAll('.dp-screen').forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-screen') === name); });
        var top = root.querySelector('.dp-win').getBoundingClientRect().top;
        if (top < 0) window.scrollBy(0, top - 90);
    }
    function step(n) {
        root.querySelectorAll('.dp-steps li').forEach(function (li) {
            var s = +li.getAttribute('data-s');
            li.classList.toggle('is-on', s === n); li.classList.toggle('is-done', s < n);
            if (s === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        });
    }
    function say(msg, info) {
        var t = $('.dp-toast'); t.textContent = msg; t.classList.toggle('is-info', !!info); t.classList.add('is-on');
        clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
    }
    function modal(name, open) {
        var m = root.querySelector('[data-modal="' + name + '"]');
        if (open) {
            lastFocus = document.activeElement; m.hidden = false;
            var r = m.querySelector('.dp-dialog').getBoundingClientRect();
            if (r.top < 70 || r.bottom > window.innerHeight) window.scrollBy(0, r.top - (window.innerHeight - r.height) / 2);
            var b = m.querySelector('input, .dp-primary'); if (b) b.focus({ preventScroll: true });
        }
        else { m.hidden = true; if (lastFocus && lastFocus.focus && document.body.contains(lastFocus)) lastFocus.focus(); }
    }

    // ----- Screen 1: incoming wires -----
    function wire() { return WIRES.filter(function (w) { return w.id === state.sel; })[0]; }
    function renderWires() {
        bind('wires').innerHTML = WIRES.map(function (w) {
            var st = state.status[w.id], off = st !== 'pending';
            var label = { pending: 'Pending', excluded: 'Excluded', receipted: 'Receipted' }[st];
            return '<div class="dp-tr dp-row' + (state.sel === w.id ? ' is-sel' : '') + (off ? ' is-off' : '') + '" data-wire="' + w.id + '">' +
                '<span><input type="radio" class="dp-radio" name="dp-wire" value="' + w.id + '" aria-label="' + esc(money(w.amt) + ' from ' + w.org + ', received ' + w.rec + ', ' + label) + '"' + (state.sel === w.id ? ' checked' : '') + (off ? ' disabled' : '') + '></span>' +
                '<span class="amt">' + money(w.amt) + '</span><span class="trunc" title="' + esc(w.org) + '">' + esc(w.org) + '</span><span class="trunc" title="' + esc(w.notes) + '">' + esc(w.notes) + '</span><span>' + w.rec + '</span>' +
                '<span><span class="dp-st' + (st === 'pending' ? ' pend' : st === 'receipted' ? ' ok' : '') + '">' + label + '</span></span>' +
                '<span class="dp-dots"><button type="button" aria-haspopup="true" aria-expanded="false" aria-label="Actions for ' + esc(money(w.amt)) + ' wire" data-menu="' + w.id + '">•••</button></span></div>';
        }).join('');
        var ok = state.sel && state.status[state.sel] === 'pending';
        $('[data-act="pick"]').disabled = !ok;
        $('#dp-tip1').classList.toggle('is-armed', !ok);
    }
    function closeMenu() { if (menuOpen) { menuOpen.remove(); menuOpen = null; root.querySelectorAll('[data-menu][aria-expanded="true"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); } }
    function openMenu(btn) {
        closeMenu();
        var id = +btn.getAttribute('data-menu'), st = state.status[id];
        var m = document.createElement('div'); m.className = 'dp-menu'; m.setAttribute('role', 'menu');
        m.innerHTML = '<button type="button" role="menuitem" data-wact="receipt" data-id="' + id + '"' + (st !== 'pending' ? ' disabled' : '') + '>Receipt to this order</button>' +
            '<button type="button" role="menuitem" data-wact="' + (st === 'excluded' ? 'recover' : 'exclude') + '" data-id="' + id + '"' + (st === 'receipted' ? ' disabled' : '') + '>' + (st === 'excluded' ? 'Recover' : 'Exclude') + '</button>';
        btn.parentNode.appendChild(m); btn.setAttribute('aria-expanded', 'true'); menuOpen = m;
        var first = m.querySelector('button:not([disabled])'); if (first) first.focus();
    }

    // ----- Screen 2: details & splits -----
    function blank() { return { order: state.splits.length ? '' : ORDERS[0], amt: '', from: '', payor: wire().org, rep: '', credit: '', touched: false }; }
    function renderWire() {
        var w = wire();
        bind('wire').innerHTML = '<div><dt>Received</dt><dd>' + w.rec + '</dd></div><div><dt>Amount</dt><dd>' + money(w.amt) + '</dd></div><div><dt>Type</dt><dd>Wire</dd></div><div><dt>Ref #</dt><dd>' + w.ref + '</dd></div>' +
            '<div><dt>Originator</dt><dd>' + esc(w.org) + '</dd></div><div><dt>Sending Bank</dt><dd>' + esc(w.bank) + '</dd></div><div style="grid-column:span 2"><dt>Notes</dt><dd>' + esc(w.notes) + '</dd></div>';
    }
    function field(i, key, label, html) {
        var s = state.splits[i], missing = s.touched && !String(s[key]).trim();
        return '<label class="dp-f' + (missing ? ' is-err' : '') + '"><span>' + label + ' *</span>' + html + '</label>';
    }
    function renderSplits() {
        var n = state.splits.length;
        bind('count').textContent = 'Deposits (' + n + ')';
        bind('splits').innerHTML = state.splits.map(function (s, i) {
            var id = 'dp-s' + i;
            return '<div class="dp-card" data-split="' + i + '"><div class="dp-card-h"><span>Deposit Details' + (n > 1 ? ' - Split ' + (i + 1) : '') + '</span>' +
                (n > 1 ? '<button type="button" class="dp-x" data-act="remove" data-i="' + i + '" aria-label="Remove split ' + (i + 1) + '">✕</button>' : '') + '</div><div class="dp-grid">' +
                field(i, 'order', 'Order', '<select data-k="order" id="' + id + 'o">' + opts(ORDERS, s.order) + '</select>') +
                field(i, 'amt', 'Amount', '<input data-k="amt" inputmode="decimal" autocomplete="off" placeholder="$0.00" value="' + esc(s.amt) + '">') +
                field(i, 'from', 'Received From', '<select data-k="from">' + opts(FROM, s.from) + '</select>') +
                field(i, 'payor', 'Payor', '<input data-k="payor" autocomplete="off" value="' + esc(s.payor) + '">') +
                field(i, 'rep', 'Representing', '<select data-k="rep">' + opts(REP, s.rep) + '</select>') +
                field(i, 'credit', 'For Credit To', '<select data-k="credit">' + opts(CREDIT, s.credit) + '</select>') +
                '</div></div>';
        }).join('');
        $('[data-act="add"]').disabled = n >= MAX;
        totals();
    }
    function num(v) { var x = parseFloat(String(v).replace(/[^0-9.]/g, '')); return isNaN(x) ? 0 : x; }
    function complete(s) { return ['order', 'amt', 'from', 'payor', 'rep', 'credit'].every(function (k) { return String(s[k]).trim(); }) && num(s.amt) > 0; }
    function totals() {
        var w = wire(), alloc = 0, ready = 0;
        state.splits.forEach(function (s) { alloc += cents(num(s.amt)); if (complete(s)) ready++; });
        var total = cents(w.amt), rem = total - alloc;
        bind('total').textContent = money(w.amt);
        bind('alloc').textContent = money(alloc / 100);
        var r = bind('remain'); r.textContent = (rem < 0 ? '−' : '') + money(Math.abs(rem) / 100); r.classList.toggle('neg', rem < 0);
        bind('ready').textContent = ready + (ready === 1 ? ' Deposit' : ' Deposits') + ' Ready to Receipt';
        var why = '';
        if (ready < state.splits.length) why = 'Fill in all required fields';
        else if (rem > 0) why = 'Allocate the remaining ' + money(rem / 100);
        else if (rem < 0) why = 'Splits add up to more than the wire';
        var orders = state.splits.map(function (s) { return s.order; });
        if (!why && orders.some(function (o, i) { return orders.indexOf(o) !== i; })) why = 'Each split needs a different order';
        $('[data-act="review"]').disabled = !!why;
        bind('why').textContent = why || 'Review the deposits';
        bind('why').classList.toggle('is-armed', !!why);
    }

    // ----- Screen 3 & 4 -----
    function review() {
        var n = state.splits.length, w = wire();
        bind('mtext').textContent = n > 1 ? 'You are about to split this incoming wire into ' + n + ' deposits. Please review and confirm before proceeding.' : 'You are about to receipt this incoming wire into one order. Please review and confirm before proceeding.';
        bind('mlist').innerHTML = state.splits.map(function (s, i) { return '<li><span>' + (n > 1 ? 'Split ' + (i + 1) + ' - ' : '') + esc(s.order) + '</span><span>' + money(num(s.amt)) + '</span></li>'; }).join('') +
            '<li class="tot"><span>Wire total</span><span>' + money(w.amt) + '</span></li>';
        bind('ack').checked = false; $('[data-act="receipt"]').disabled = true;
        modal('confirm', true); step(3);
    }
    function receipt() {
        var btn = $('[data-act="receipt"]'); btn.classList.add('is-busy'); btn.disabled = true;
        setTimeout(function () {
            btn.classList.remove('is-busy'); modal('confirm', false);
            var w = wire();
            state.splits.forEach(function (s) { state.deps.unshift({ amt: num(s.amt), order: s.order.split(',')[0], payor: s.payor, rep: s.rep }); });
            state.status[w.id] = 'receipted';
            renderDeps(); show('done'); step(4);
            say(state.splits.length > 1 ? 'Wire receipted as ' + state.splits.length + ' deposits' : 'Deposit receipted');
            queue(state.splits.length);
        }, 900);
    }
    function renderDeps() {
        bind('dcount').textContent = 'Deposits (' + state.deps.length + ')';
        bind('deps').innerHTML = state.deps.map(function (d) {
            return '<div class="dp-tr dp-dep"><span class="amt">' + money(d.amt) + '</span><span>' + esc(d.order) + '</span><span class="trunc" title="' + esc(d.payor) + '">' + esc(d.payor) + '</span><span>Wire</span><span><span class="dp-st ok">Receipted</span></span><span class="trunc">' + esc(d.rep) + '</span><span></span></div>';
        }).join('');
    }
    function queue(n) {
        var q = bind('queue'); q.hidden = false; q.classList.remove('is-ready');
        bind('qtitle').textContent = 'Generating Receipts…';
        bind('qlist').innerHTML = state.deps.slice(0, n).map(function (d) {
            return '<div class="dp-qi"><span class="pdf" aria-hidden="true">PDF</span><div><b>' + esc(d.rep) + '</b>Receipt ' + money(d.amt) + '</div><button type="button" data-act="view" disabled title="Available once the receipt is ready">View</button></div>';
        }).join('');
        clearTimeout(qTimer);
        qTimer = setTimeout(function () {
            q.classList.add('is-ready'); bind('qtitle').textContent = 'Receipts Ready';
            q.querySelectorAll('[data-act="view"]').forEach(function (b) { b.disabled = false; b.removeAttribute('title'); });
        }, 2200);
    }

    function reset(keepDeps) {
        state = { sel: null, splits: [], status: {}, deps: keepDeps ? state.deps : [] };
        WIRES.forEach(function (w) { state.status[w.id] = 'pending'; });
        if (keepDeps) keepDeps.forEach(function (id) { state.status[id] = 'receipted'; });
        bind('queue').hidden = true; clearTimeout(qTimer);
        root.querySelectorAll('.dp-modal').forEach(function (m) { m.hidden = true; });
        closeMenu(); renderWires(); show('wires'); step(1);
    }

    // ----- Events -----
    root.addEventListener('click', function (e) {
        var mb = e.target.closest('[data-menu]');
        if (mb) { e.stopPropagation(); if (menuOpen && menuOpen.parentNode === mb.parentNode) closeMenu(); else openMenu(mb); return; }
        var wa = e.target.closest('[data-wact]');
        if (wa) {
            var id = +wa.getAttribute('data-id'), a = wa.getAttribute('data-wact'); closeMenu();
            if (a === 'exclude') { state.pendingX = id; modal('exclude', true); }
            else if (a === 'recover') { state.status[id] = 'pending'; renderWires(); say('Wire recovered. It is pending again'); }
            else if (a === 'receipt') { state.sel = id; renderWires(); start(); }
            return;
        }
        if (menuOpen && !e.target.closest('.dp-menu')) closeMenu();
        var row = e.target.closest('.dp-row');
        if (row && !row.classList.contains('is-off') && !e.target.closest('.dp-dots')) { state.sel = +row.getAttribute('data-wire'); renderWires(); var r = root.querySelector('.dp-radio[value="' + state.sel + '"]'); if (r) r.focus(); return; }
        var b = e.target.closest('[data-act]');
        if (!b) return;
        var act = b.getAttribute('data-act');
        if (act === 'pick') start();
        else if (act === 'add') { if (state.splits.length < MAX) { state.splits.push(blank()); renderSplits(); var c = root.querySelectorAll('[data-split]'); c[c.length - 1].querySelector('select').focus(); } }
        else if (act === 'remove') { state.splits.splice(+b.getAttribute('data-i'), 1); renderSplits(); say('Split removed', true); $('[data-act="add"]').focus(); }
        else if (act === 'review') review();
        else if (act === 'mcancel') { modal('confirm', false); step(2); }
        else if (act === 'receipt') receipt();
        else if (act === 'xcancel') modal('exclude', false);
        else if (act === 'xconfirm') { state.status[state.pendingX] = 'excluded'; if (state.sel === state.pendingX) state.sel = null; modal('exclude', false); renderWires(); say('Wire excluded. Use ••• to recover it'); }
        else if (act === 'view') say('In ClarityFirst the receipt PDF opens in a new tab', true);
        else if (act === 'again') { var done = WIRES.filter(function (w) { return state.status[w.id] === 'receipted'; }).map(function (w) { return w.id; }); reset(done); }
        else if (act === 'restart') { reset(); say('Demo restarted', true); }
    });
    function start() {
        if (!state.sel || state.status[state.sel] !== 'pending') return;
        state.splits = []; state.splits.push(blank()); renderWire(); renderSplits(); show('details'); step(2);
        var first = root.querySelector('[data-split] select, [data-split] input'); if (first) first.focus();
    }
    root.addEventListener('change', function (e) {
        if (e.target.name === 'dp-wire') { state.sel = +e.target.value; renderWires(); var r = root.querySelector('.dp-radio[value="' + state.sel + '"]'); if (r) r.focus(); return; }
        if (e.target === bind('ack')) { $('[data-act="receipt"]').disabled = !e.target.checked; return; }
        upd(e);
    });
    root.addEventListener('input', upd);
    function upd(e) {
        var k = e.target.getAttribute && e.target.getAttribute('data-k'); if (!k) return;
        var card = e.target.closest('[data-split]'); var i = +card.getAttribute('data-split');
        state.splits[i][k] = e.target.value; totals();
        var f = e.target.closest('.dp-f'); if (f && e.target.value.trim()) f.classList.remove('is-err');
    }
    // Leaving a split card with something filled marks its empty required fields (as in the Figma spec)
    root.addEventListener('focusout', function (e) {
        var card = e.target.closest && e.target.closest('[data-split]'); if (!card) return;
        setTimeout(function () {
            if (card.contains(document.activeElement)) return;
            var i = +card.getAttribute('data-split'), s = state.splits[i]; if (!s) return;
            var any = ['amt', 'from', 'rep', 'credit'].some(function (k) { return String(s[k]).trim(); });
            if (any && !s.touched) { s.touched = true; card.querySelectorAll('[data-k]').forEach(function (el) { if (!el.value.trim()) el.closest('.dp-f').classList.add('is-err'); }); }
        }, 0);
    });
    root.addEventListener('blur', function (e) {
        if (e.target.getAttribute && e.target.getAttribute('data-k') === 'amt' && num(e.target.value) > 0) {
            e.target.value = money(num(e.target.value)).slice(1); var i = +e.target.closest('[data-split]').getAttribute('data-split'); state.splits[i].amt = e.target.value; totals();
        }
    }, true);
    root.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (menuOpen) { var b = menuOpen.parentNode.querySelector('[data-menu]'); closeMenu(); b.focus(); return; }
            var open = root.querySelector('.dp-modal:not([hidden])');
            if (open) { var n = open.getAttribute('data-modal'); modal(n, false); if (n === 'confirm') step(2); }
        }
        if (menuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            var items = [].slice.call(menuOpen.querySelectorAll('button:not([disabled])')); var i = items.indexOf(document.activeElement);
            if (items.length) { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
        }
    });
    document.addEventListener('click', function (e) { if (menuOpen && !root.contains(e.target)) closeMenu(); });
    reset();
})();
