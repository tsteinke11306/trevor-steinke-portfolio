// ============================================
// Hero typing animation (CLI-style)
// Respects prefers-reduced-motion
// ============================================
(function() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        hero.classList.remove('hero-typing');
        return;
    }

    const badge = hero.querySelector('.availability-badge');
    const title = hero.querySelector('.hero-title');
    const subtitle = hero.querySelector('.hero-subtitle');
    const description = hero.querySelector('.hero-description');
    const button = hero.querySelector('.btn-primary');

    // Store original text content
    const elements = [
        { el: badge, text: badge.textContent.trim(), delay: 0, speed: 30 },
        { el: title, text: title.textContent.trim(), delay: 400, speed: 50 },
        { el: subtitle, text: subtitle.textContent.trim(), delay: 1200, speed: 40 },
        { el: description, text: description.textContent.trim(), delay: 1900, speed: 25 },
    ];

    // Create cursor element
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';

    function typeElement(el, text, speed) {
        return new Promise(resolve => {
            el.innerHTML = '';
            el.style.visibility = 'visible';
            el.appendChild(cursor);
            cursor.classList.remove('hidden');
            let i = 0;
            function type() {
                if (i < text.length) {
                    cursor.remove();
                    el.textContent = text.substring(0, i + 1);
                    el.appendChild(cursor);
                    i++;
                    setTimeout(type, speed + Math.random() * 30);
                } else {
                    cursor.remove();
                    resolve();
                }
            }
            type();
        });
    }

    async function runTyping() {
        // Small initial delay for page settle
        await new Promise(r => setTimeout(r, 300));

        for (const item of elements) {
            await new Promise(r => setTimeout(r, item.delay === 0 ? 0 : 200));
            await typeElement(item.el, item.text, item.speed);
        }

        // Show button with a fade-in
        await new Promise(r => setTimeout(r, 400));
        button.style.visibility = 'visible';
        button.style.opacity = '0';
        button.style.transition = 'opacity 0.4s ease';
        requestAnimationFrame(() => {
            button.style.opacity = '1';
        });

        // Remove typing class (allows re-display if needed)
        hero.classList.remove('hero-typing');
    }

    // Start after fonts load (or immediately if already loaded)
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(runTyping);
    } else {
        runTyping();
    }
})();

// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Dark Mode Toggle - dark B&W is default
const themeToggle = document.getElementById('theme-toggle');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

// Check for saved theme preference. Default = dark.
const currentTheme = localStorage.getItem('theme') ||
    (prefersLight.matches ? 'light' : 'dark');

// Apply theme on page load
if (currentTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');

    if (currentTheme === 'light') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background change on scroll
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
// Respects prefers-reduced-motion, and defaults to visible if JS fails or reduced motion is set
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply fade-in animation to sections (skip if reduced motion)
if (!prefersReducedMotion) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// Contact form handling - sends to API
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        const statusDiv = document.getElementById('form-status');
        statusDiv.className = 'form-status';
        statusDiv.textContent = '';
        
        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                statusDiv.className = 'form-status success';
                statusDiv.textContent = 'Thank you for your message! I\'ll get back to you soon.';
                contactForm.reset();
            } else {
                statusDiv.className = 'form-status error';
                statusDiv.textContent = 'Error: ' + (result.error || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            statusDiv.className = 'form-status error';
            statusDiv.textContent = 'Failed to send message: ' + error.message + '. Please try again later.';
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Add active state to nav links based on scroll position
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                navLink.classList.add('active');
            }
        }
    });
});

// Analytics tracking
(function() {
    const ANALYTICS_ENDPOINT = 'https://api.trevorsteinke.com:8443/api/analytics';
    
    // Track page view
    function trackPageView() {
        const data = {
            path: window.location.pathname,
            referrer: document.referrer || null
        };
        
        // Use sendBeacon with Blob for proper Content-Type
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
        } else {
            // Fallback to fetch
            fetch(ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                keepalive: true
            }).catch(() => {}); // Silently fail
        }
    }
    
    // Track on page load
    if (document.readyState === 'complete') {
        trackPageView();
    } else {
        window.addEventListener('load', trackPageView);
    }
})();