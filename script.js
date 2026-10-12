// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Header background on scroll
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.background = 'rgba(10, 10, 10, 0.95)';
        header.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    } else {
        header.style.background = 'rgba(10, 10, 10, 0.8)';
        header.style.borderColor = 'rgba(255, 255, 255, 0.05)';
    }
});

// Reveal on scroll with stagger
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections and cards for reveal
document.querySelectorAll('.section, .project-card, .timeline-item').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
    observer.observe(el);
});

// Mouse parallax effect for floating bubbles
const floatingBubbles = document.querySelectorAll('.floating-bubble');

document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    floatingBubbles.forEach((bubble, index) => {
        const factor = (index % 3 + 1) * 0.5;
        bubble.style.setProperty('--parallax-x', `${x * factor}px`);
        bubble.style.setProperty('--parallax-y', `${y * factor}px`);
    });
});

// Industry filter: highlights matching clients, dims the rest (grid stays stable)
(function () {
    const grid = document.getElementById('clientGrid');
    if (!grid) return;
    const chips = document.querySelectorAll('.clients .industry-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const f = chip.dataset.filter;
            chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
            grid.classList.toggle('is-filtered', f !== 'all');
            grid.querySelectorAll('.client-card').forEach(card => {
                card.classList.toggle('is-match', card.dataset.industry === f);
            });
        });
    });
})();

// Project filter: hides non-matching cards; featured cards join the main grid when filtering
(function () {
    const chips = document.querySelectorAll('#work .industry-chip');
    const cards = document.querySelectorAll('#work .pcard');
    const featuredGrid = document.getElementById('featuredGrid');
    if (!featuredGrid) return;
    const empty = document.getElementById('emptyNote');
    chips.forEach(chip => chip.addEventListener('click', () => {
        const f = chip.dataset.filter;
        chips.forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
        let shown = 0;
        cards.forEach(card => {
            const match = f === 'all' || card.dataset.cat.split(' ').includes(f);
            card.hidden = !match;
            if (match) shown++;
        });
        featuredGrid.hidden = ![...featuredGrid.children].some(c => !c.hidden);
        empty.hidden = shown > 0;
    }));
})();

// Show all testimonials
(function () {
    const btn = document.getElementById('showMore');
    if (!btn) return;
    btn.addEventListener('click', () => {
        document.querySelectorAll('#quoteGrid .quote.is-hidden').forEach(q => q.classList.remove('is-hidden'));
        btn.setAttribute('aria-expanded', 'true');
        btn.parentElement.hidden = true;
    });
})();

// Contact form: captcha check, then send to Formspree without leaving the page
(function () {
    const codeEl = document.getElementById('captchaCode');
    const input = document.getElementById('captchaInput');
    const form = document.getElementById('contactForm');
    if (!form) return;
    const status = document.getElementById('formStatus');
    const btn = document.getElementById('submitBtn');
    let current = '';
    function gen() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        current = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        codeEl.textContent = current;
    }
    function setStatus(msg, type) {
        status.textContent = msg;
        status.className = 'form-status' + (type ? ' is-' + type : '');
    }
    gen();
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (input.value.trim().toUpperCase() !== current) {
            setStatus('Incorrect security code. Please try the new one.', 'error');
            gen(); input.value = ''; input.focus();
            return;
        }
        btn.disabled = true; btn.textContent = 'Sending…';
        setStatus('');
        try {
            const data = new FormData(form);
            const res = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
            if (res.ok) {
                form.reset(); gen();
                setStatus("Thanks! Your message has been sent. I'll get back to you soon.", 'success');
            } else {
                const body = await res.json().catch(() => ({}));
                const msg = body.errors ? body.errors.map(x => x.message).join(', ') : 'Something went wrong.';
                setStatus(msg + ' Please try again, or reach me on LinkedIn.', 'error');
            }
        } catch (err) {
            setStatus('Network error. Please try again, or reach me on LinkedIn.', 'error');
        } finally {
            btn.disabled = false; btn.textContent = 'Send Message';
        }
    });
})();

console.log('Portfolio loaded — Mo Alhamouri | Bold & Experimental');
