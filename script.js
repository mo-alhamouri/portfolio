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
    el.style.transition = `opacity 0.8s ease ${index * 0.1}s, transform 0.8s ease ${index * 0.1}s`;
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

console.log('Portfolio loaded — Mo Alhamouri | Bold & Experimental');
