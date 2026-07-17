// ============================================
// Hero scramble/decode animation (Hermes desktop style)
// Each character cycles through random chars before resolving
// left-to-right. All lines run simultaneously.
// Respects prefers-reduced-motion
// ============================================
(function() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        hero.classList.remove('hero-typing');
        document.querySelector('.navbar').style.transform = 'none';
        document.querySelector('.navbar').style.animation = 'none';
        return;
    }

    const badge = hero.querySelector('.availability-badge');
    const title = hero.querySelector('.hero-title');
    const subtitle = hero.querySelector('.hero-subtitle');
    const description = hero.querySelector('.hero-description');
    const button = hero.querySelector('.btn-primary');

    // Characters to cycle through during scramble (even-width mono set)
    const SCRAMBLE_CHARS = '/\\|-_=+<>~:*';
    const TICK_MS = 50;
    // How many characters ahead of the cursor are actively scrambling
    const SCRAMBLE_AHEAD = 3;

    function scrambleText(text, resolvedCount) {
        return Array.from(text, (ch, i) => {
            if (ch === ' ') return ' ';
            if (i < resolvedCount) return ch;           // resolved: show real char
            if (i >= resolvedCount + SCRAMBLE_AHEAD) return ' ';  // far ahead: blank
            return SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];  // trail: scramble
        }).join('');
    }

    function scrambleElement(el, text, preserveChild, charsPerTick, tickMs) {
        return new Promise(resolve => {
            let childToPreserve = null;
            if (preserveChild) {
                childToPreserve = el.querySelector('.status-dot');
            }
            el.style.visibility = 'visible';

            // Sweep clip-path open (500ms), slightly faster than scramble
            el.style.transition = 'clip-path 0.4s ease-out';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    el.style.clipPath = 'inset(0 0% 0 0)';
                });
            });

            const tick = tickMs || TICK_MS;
            let resolved = 0;
            let hold = 0;

            const id = setInterval(() => {
                if (resolved >= text.length) {
                    hold++;
                    if (hold > 3) {
                        clearInterval(id);
                        if (childToPreserve) {
                            el.textContent = '';
                            el.appendChild(childToPreserve);
                            el.appendChild(document.createTextNode(' ' + text));
                        } else {
                            el.textContent = text;
                        }
                        resolve();
                        return;
                    }
                    if (childToPreserve) {
                        el.textContent = '';
                        el.appendChild(childToPreserve);
                        el.appendChild(document.createTextNode(' ' + text));
                    } else {
                        el.textContent = text;
                    }
                    return;
                }

                resolved += charsPerTick;
                const rc = Math.floor(resolved);
                const scrambled = scrambleText(text, rc);

                if (childToPreserve) {
                    el.textContent = '';
                    el.appendChild(childToPreserve);
                    el.appendChild(document.createTextNode(' ' + scrambled));
                } else {
                    el.textContent = scrambled;
                }
            }, tick);
        });
    }

    // Titles to cycle through
    const titles = [
        'AI/ML Research Engineer',
        'AI Security Researcher',
        'Red Team Operator',
        'Penetration Tester',
        'Self-Hosted Infrastructure Engineer',
    ];

    // Backspace + retype effect for cycling titles
    function backspaceTo(el, targetLen, speedMs) {
        return new Promise(resolve => {
            const id = setInterval(() => {
                const current = el.textContent;
                if (current.length <= targetLen) {
                    clearInterval(id);
                    resolve();
                    return;
                }
                el.textContent = current.slice(0, -1);
            }, speedMs);
        });
    }

    function typeText(el, text, speedMs) {
        return new Promise(resolve => {
            let i = 0;
            const id = setInterval(() => {
                if (i >= text.length) {
                    clearInterval(id);
                    resolve();
                    return;
                }
                el.textContent = text.substring(0, i + 1);
                i++;
            }, speedMs);
        });
    }

    async function cycleTitles() {
        let currentIdx = 0;
        const currentText = subtitle.textContent.trim();
        // Find which title we start at
        const startIdx = titles.findIndex(t => t === currentText);
        currentIdx = startIdx >= 0 ? startIdx : 0;

        while (true) {
            await new Promise(r => setTimeout(r, 5000));
            currentIdx = (currentIdx + 1) % titles.length;
            const nextTitle = titles[currentIdx];

            // Backspace current title
            await backspaceTo(subtitle, 0, 30);
            // Type new title
            await typeText(subtitle, nextTitle, 50);
        }
    }

    async function runScramble() {
        // Small initial delay for page settle
        await new Promise(r => setTimeout(r, 200));

        const elements = [
            { el: badge, text: badge.textContent.trim(), preserveChild: true, charsPerTick: 0.7 },
            { el: title, text: title.textContent.trim(), preserveChild: false, charsPerTick: 0.4 },
            { el: subtitle, text: subtitle.textContent.trim(), preserveChild: false, charsPerTick: 0.4 },
            { el: description, text: description.textContent.trim(), preserveChild: false, charsPerTick: 1.2 },
        ];

        // All lines scramble simultaneously (25ms tick for hero, faster cycling)
        const promises = elements.map(item =>
            scrambleElement(item.el, item.text, item.preserveChild, item.charsPerTick, 25)
        );
        await Promise.all(promises);

        // Show button with left-to-right draw-on (clip-path reveal)
        await new Promise(r => setTimeout(r, 200));
        button.style.transition = 'opacity 0.2s ease, clip-path 0.5s ease';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                button.style.opacity = '1';
                button.style.clipPath = 'inset(0 0% 0 0)';
            });
        });

        // Scramble the button text (fast but visible, matches clip-path timing)
        const buttonText = button.textContent.trim();
        await scrambleElement(button, buttonText, false, 1);

        // Remove typing class
        hero.classList.remove('hero-typing');

        // Start cycling titles every 5 seconds
        cycleTitles();
    }

    // Start after fonts load (or immediately if already loaded)
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(runScramble);
    } else {
        runScramble();
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