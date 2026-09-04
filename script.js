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
        'IT Operations Engineer',
        'Penetration Tester',
        'Self-Hosted Infrastructure Engineer',
    ];

    // Backspace effect for cycling titles
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

    async function cycleTitles() {
        let currentIdx = 0;
        const currentText = subtitle.textContent.trim();
        const startIdx = titles.findIndex(t => t === currentText);
        currentIdx = startIdx >= 0 ? startIdx : 0;

        while (true) {
            await new Promise(r => setTimeout(r, 3000));
            currentIdx = (currentIdx + 1) % titles.length;
            const nextTitle = titles[currentIdx];

            // Backspace current title
            await backspaceTo(subtitle, 0, 30);
            // Type new title with scramble effect
            await scrambleElement(subtitle, nextTitle, false, 0.4, 25);
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

// Scroll to top on page load/refresh
window.addEventListener('load', function() {
    window.scrollTo(0, 0);
});

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

/* ============================================
   Motion Rail carousels (drag + momentum, 3D lite)
   Replaces the rotateY ring: neighbors stay readable,
   strip is draggable with a fling, wraps infinitely.
   Cards can expose a slide-out drawer (sub-menu)
   that shifts the rail left while open.
   ============================================ */
(function () {
    'use strict';

    const MAXD = 3;   // neighbors visible per side
    const GAP_DESKTOP = 440;
    const DRAWER_SHIFT = 190;   // px the rail slides left when a drawer is open

    /* ---------- drawer data (add new findings here) ---------- */
    const DRAWER_DATA = {
        'recon-findings': {
            items: [
                { title: 'Cross-user session context disclosure in PDF Spaces', sev: 'High', meta: 'Adobe · Intigriti · CVSS 7.1', link: null },
                { title: 'GraphQL schema mapping via error-message inference', sev: 'Info', meta: 'HackerOne · recon technique', link: null },
                { title: 'F5 BigIP load balancer bypass attempts', sev: 'Info', meta: 'HackerOne · edge probing', link: null },
                { title: 'API endpoint enumeration across 40+ subdomains', sev: 'Info', meta: 'HackerOne · content discovery', link: null }
            ]
        }
    };

    function renderDrawerItems(listEl, data) {
        data.items.forEach((it) => {
            const f = document.createElement('div');
            f.className = 'finding';
            const sev = document.createElement('span');
            sev.className = 'finding-sev s-' + it.sev.toLowerCase();
            sev.textContent = it.sev;
            const head = document.createElement('div');
            head.className = 'finding-head';
            const t = document.createElement('span');
            t.className = 'finding-title';
            t.textContent = it.title;
            head.appendChild(t);
            head.appendChild(sev);
            f.appendChild(head);
            if (it.meta || it.link) {
                const m = document.createElement('div');
                m.className = 'finding-meta';
                if (it.link) {
                    const a = document.createElement('a');
                    a.href = it.link;
                    a.textContent = it.meta || 'link';
                    a.target = '_blank';
                    a.rel = 'noopener';
                    m.appendChild(a);
                } else {
                    m.textContent = it.meta;
                }
                f.appendChild(m);
            }
            listEl.appendChild(f);
        });
    }

    function initRail(id, opts) {
        const carousel = document.getElementById(id);
        if (!carousel) return;
        const compact = !!(opts && opts.compact);
        const viewport = carousel.querySelector('.carousel-viewport');
        const track = carousel.querySelector('.carousel-track');
        const cards = Array.from(track.children);
        const dotsWrap = carousel.querySelector('.carousel-dots');
        const ticker = document.getElementById((opts && opts.tickerId) || '');
        const n = cards.length;
        if (!n) return;

        let pos = 0;        // float position (animated)
        let target = 0;     // index the spring is heading to
        let raf = null;
        let drawerCard = null;      // card whose drawer is open
        let backdrop = null;
        let shiftCur = 0;           // animated rail shift (drawer push)
        let shiftTarget = 0;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /* ---------- a11y parity with the old ring ---------- */
        cards.forEach((c, i) => {
            const d = document.createElement('button');
            d.type = 'button';
            d.className = 'car-dot';
            d.setAttribute('aria-label', 'Go to card ' + (i + 1) + ' of ' + n);
            d.addEventListener('click', () => { go(i); sync(false); });
            dotsWrap.appendChild(d);
        });
        const dots = Array.from(dotsWrap.children);
        viewport.setAttribute('aria-roledescription', 'carousel');
        if (!viewport.getAttribute('aria-label')) viewport.setAttribute('aria-label', 'Card carousel');

        function wrapDist(d) {
            d = ((d % n) + n) % n;
            if (d > n / 2) d -= n;
            return d;
        }

        function gap() {
            if (window.innerWidth < 768) return Math.round(window.innerWidth * 0.84);
            return compact ? 450 : GAP_DESKTOP;
        }

        function render() {
            const shift = shiftCur;
            for (let i = 0; i < n; i++) {
                const d = wrapDist(i - pos);
                const ad = Math.abs(d);
                const c = cards[i];
                const rz = Math.max(-1, Math.min(1, d)) * -14;   // deg, toward center
                const z = -Math.min(ad, MAXD) * 170;             // push back
                const o = ad >= MAXD + 0.5 ? 0 : 1 - (ad / (MAXD + 0.6)) * 0.75;
                const bl = ad <= 0.5 ? 0 : Math.min((ad - 0.5) * 2.2, 4);
                const xShift = (d === 0 && shift) ? shift : (d !== 0 ? shift * Math.max(0, 1 - ad / 2) : 0);
                c.style.transform = 'translate3d(' + (d * gap() + xShift) + 'px,' + (ad * 14) + 'px,' + z + 'px) rotateY(' + rz + 'deg)';
                c.style.opacity = o.toFixed(3);
                c.style.filter = bl ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
                c.style.zIndex = (drawerCard === c) ? '300' : String(100 - Math.round(ad * 10));
                const active = ad <= 0.5;
                c.classList.toggle('is-active', active);
                // visible cards must accept clicks (click-to-center) and drags;
                // only fully faded cards beyond the visibility horizon opt out
                c.style.pointerEvents = ad <= MAXD ? 'auto' : 'none';
                if (active) {
                    c.removeAttribute('aria-hidden');
                    c.removeAttribute('inert');
                } else {
                    c.setAttribute('aria-hidden', 'true');
                    c.setAttribute('inert', '');
                }
            }
            const cur = ((Math.round(pos) % n) + n) % n;
            dots.forEach((d, j) => d.classList.toggle('is-active', j === cur));
            if (ticker) ticker.textContent = cards[cur].querySelector('.project-title').textContent;
        }

        function loop() {
            raf = null;
            let animating = false;
            const dPos = target - pos;
            if (Math.abs(dPos) >= 0.0005) {
                pos += dPos * 0.14;
                animating = true;
            } else {
                pos = target;
            }
            const dShift = shiftTarget - shiftCur;
            if (Math.abs(dShift) >= 0.5) {
                shiftCur += dShift * 0.16;
                animating = true;
            } else {
                shiftCur = shiftTarget;
            }
            render();
            if (animating) raf = requestAnimationFrame(loop);
        }

        function queue() { if (!raf) raf = requestAnimationFrame(loop); }

        function sync(scrollImmediate) {
            if (reduceMotion && scrollImmediate) {
                // native snap row: bring the active card into view manually
                const cur = ((target % n) + n) % n;
                cards[cur].scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
                render();
                return;
            }
            queue();
        }

        function go(i) {
            target = Math.round(target) + wrapDist(i - Math.round(target));
            sync(true);
        }

        /* ---------- slide-out drawer (sub-menu) ---------- */
        function closeDrawer() {
            if (!drawerCard) return;
            const c = drawerCard;
            drawerCard = null;
            shiftTarget = 0;
            c.classList.remove('card-drawer-open');
            const btn = c.querySelector('[data-drawer-open]');
            const panel = c.querySelector('.car-drawer');
            if (btn) btn.setAttribute('aria-expanded', 'false');
            if (panel) panel.setAttribute('aria-hidden', 'true');
            if (backdrop) backdrop.classList.remove('on');
            queue();
        }

        function openDrawer(card) {
            if (drawerCard === card) return;
            closeDrawer();
            drawerCard = card;
            const wide = window.innerWidth > 900;
            shiftTarget = wide ? -DRAWER_SHIFT : 0;
            card.classList.add('card-drawer-open');
            const btn = card.querySelector('[data-drawer-open]');
            const panel = card.querySelector('.car-drawer');
            if (btn) btn.setAttribute('aria-expanded', 'true');
            if (panel) panel.setAttribute('aria-hidden', 'false');
            if (!wide && !backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'car-drawer-backdrop';
                backdrop.addEventListener('click', closeDrawer);
                viewport.appendChild(backdrop);
            }
            if (backdrop && !wide) backdrop.classList.add('on');
            queue();
        }

        cards.forEach((card) => {
            const openBtn = card.querySelector('[data-drawer-open]');
            if (!openBtn) return;
            const panel = card.querySelector('.car-drawer');
            if (panel) {
                const list = panel.querySelector('[data-drawer-list]');
                const key = panel.id;
                if (list && DRAWER_DATA[key]) renderDrawerItems(list, DRAWER_DATA[key]);
            }
            openBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (drawerCard === card) closeDrawer(); else openDrawer(card);
            });
            const closeBtn = card.querySelector('[data-drawer-close]');
            if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeDrawer(); });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawerCard) closeDrawer();
        });

        /* ---------- pointer drag with momentum ----------
           No setPointerCapture: it would retarget the post-release click to the
           viewport, killing click-to-center on side cards. Window-level
           move/up listeners give the same drag continuity. */
        let dragging = false, moved = 0, lastX = 0, vel = 0, lastT = 0, startTarget = 0;

        function onMove(e) {
            if (!dragging) return;
            const dx = e.clientX - lastX;
            const dt = Math.max(1, e.timeStamp - lastT);
            lastX = e.clientX;
            lastT = e.timeStamp;
            moved += Math.abs(dx);
            vel = 0.8 * vel + 0.2 * (dx / dt);        // px/ms, smoothed
            target -= dx / gap();
            const floor = startTarget - 2, ceil = startTarget + 2;
            target = Math.max(floor, Math.min(ceil, target));
            queue();
        }

        function onUp() {
            if (!dragging) return;
            dragging = false;
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            viewport.classList.remove('dragging');
            if (moved > 6) {
                // momentum: ~180ms of carried velocity, at most 2 cards of throw
                let t = Math.round(target - (vel * 180) / gap());
                t = Math.max(Math.round(target) - 2, Math.min(Math.round(target) + 2, t));
                target = t;
            } else {
                target = Math.round(target);
            }
            queue();
        }

        viewport.addEventListener('pointerdown', (e) => {
            if (reduceMotion) return;                 // native scroll instead
            if (drawerCard && !drawerCard.contains(e.target)) return;  // drawer open: drags off-card disabled
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            dragging = true; moved = 0; lastX = e.clientX; vel = 0; lastT = e.timeStamp;
            startTarget = Math.round(target);
            viewport.classList.add('dragging');
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
        });

        // a drag is not a click: suppress link activation after real drags.
        // Click-to-center is geometric: side cards carry `inert` (a11y parity
        // with the old ring, no tab stops) so they are invisible to
        // hit-testing; map the click x back to a card index instead.
        viewport.addEventListener('click', (e) => {
            if (moved > 6) { e.preventDefault(); e.stopPropagation(); return; }
            if (drawerCard) {
                // clicks inside the open drawer's card are its own; elsewhere: close
                if (!drawerCard.contains(e.target)) { closeDrawer(); }
                return;
            }
            const vr = viewport.getBoundingClientRect();
            const d = Math.round((e.clientX - (vr.left + vr.width / 2)) / gap());
            if (d !== 0 && Math.abs(d) <= MAXD) {
                e.preventDefault();
                go(Math.round(target) + d);
            }
        });

        /* ---------- keyboard (matches old ring behavior) ---------- */
        function inView() {
            const r = carousel.getBoundingClientRect();
            return r.top < window.innerHeight * 0.75 && r.bottom > window.innerHeight * 0.25;
        }
        document.addEventListener('keydown', (e) => {
            if (e.altKey || e.ctrlKey || e.metaKey) return;
            const t = e.target;
            if (t && t instanceof Element && (t.matches('input, textarea, select') || t.isContentEditable)) return;
            if (drawerCard) return;                   // drawer open: keyboard stays in the panel
            if (!inView()) return;
            if (e.key === 'ArrowLeft') { go(Math.round(target) - 1); e.preventDefault(); }
            if (e.key === 'ArrowRight') { go(Math.round(target) + 1); e.preventDefault(); }
        });

        window.addEventListener('resize', () => {
            if (drawerCard) {
                const wide = window.innerWidth > 900;
                shiftTarget = wide ? -DRAWER_SHIFT : 0;
                if (backdrop) backdrop.classList.toggle('on', !wide);
            }
            render();
        });
        render();
    }

    initRail('projects-carousel', { tickerId: 'projects-ticker' });
    initRail('homelab-carousel', { compact: true, tickerId: 'homelab-ticker' });
})();
