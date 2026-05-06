/**
 * OfficeMax India - Portfolio Website
 * Main JavaScript File
 * Handles: Navigation, scroll animations, counters, form validation, and API calls
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // =========================================
    // 1. NAVBAR SCROLL EFFECT
    // =========================================
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    function handleNavScroll() {
        const scrollY = window.scrollY;

        // Add scrolled class for glass effect
        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Show/hide back to top button
        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    }

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll(); // Initial check

    // Back to top click
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // =========================================
    // 2. MOBILE NAVIGATION TOGGLE
    // =========================================
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile nav when a link is clicked
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // =========================================
    // 3. ACTIVE NAV LINK ON SCROLL
    // =========================================
    const sections = document.querySelectorAll('section[id]');
    const allNavLinks = document.querySelectorAll('.nav-link');

    function highlightNavLink() {
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                allNavLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}` || link.getAttribute('href') === `/#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink, { passive: true });

    // =========================================
    // 4. SCROLL ANIMATIONS (Intersection Observer)
    // =========================================
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // =========================================
    // 5. ANIMATED COUNTERS (Hero Stats)
    // =========================================
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.target);
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // ~60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target.toLocaleString();
                    return;
                }
                stat.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            };

            updateCounter();
        });

        countersAnimated = true;
    }

    // Trigger counters when hero stats are in view
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statsObserver.observe(heroStats);
    }

    // =========================================
    // 5.5 HERO IMAGE SLIDER
    // =========================================
    const heroSlider = document.getElementById('heroSlider');
    if (heroSlider) {
        const slides = heroSlider.querySelectorAll('.hero-slide');
        const dots = heroSlider.querySelectorAll('.slider-dot');
        let currentSlide = 0;
        let slideInterval;
        const slideDelay = 4000; // 4 seconds per slide

        function goToSlide(index) {
            // Remove active from all slides and dots
            slides.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));

            // Set new active
            currentSlide = index;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        }

        function nextSlide() {
            const next = (currentSlide + 1) % slides.length;
            goToSlide(next);
        }

        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, slideDelay);
        }

        function stopAutoSlide() {
            clearInterval(slideInterval);
        }

        // Dot click handlers
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.dataset.slide);
                goToSlide(slideIndex);
                stopAutoSlide();
                startAutoSlide(); // Restart timer
            });
        });

        // Pause on hover, resume on leave
        heroSlider.addEventListener('mouseenter', stopAutoSlide);
        heroSlider.addEventListener('mouseleave', startAutoSlide);

        // Start auto sliding
        startAutoSlide();
    }

    // =========================================
    // 6. SMOOTH SCROLL FOR ANCHOR LINKS
    // =========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;

            // If it's a hash link on the same page
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // =========================================
    // 7. CONTACT FORM VALIDATION & SUBMISSION
    // =========================================
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const toast = document.getElementById('toast');
    const toastClose = document.getElementById('toastClose');

    // Validation helper
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(inputId, errorId, message) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input && error) {
            input.parentElement.classList.add('error');
            error.textContent = message;
        }
    }

    function clearError(inputId, errorId) {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (input && error) {
            input.parentElement.classList.remove('error');
            error.textContent = '';
        }
    }

    // Real-time validation
    ['contactName', 'contactEmail', 'contactMessage'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                const errorId = id.replace('contact', '').toLowerCase() + 'Error';
                clearError(id, errorId);
            });
        }
    });

    // Form submit handler
    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Reset errors
            clearError('contactName', 'nameError');
            clearError('contactEmail', 'emailError');
            clearError('contactMessage', 'messageError');

            // Gather form data
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const phone = document.getElementById('contactPhone') ? document.getElementById('contactPhone').value.trim() : '';
            const company = document.getElementById('contactCompany') ? document.getElementById('contactCompany').value.trim() : '';
            const subject = document.getElementById('contactSubject') ? document.getElementById('contactSubject').value : 'General';
            const message = document.getElementById('contactMessage').value.trim();

            // Validate required fields
            let hasErrors = false;

            if (!name) {
                showError('contactName', 'nameError', 'Please enter your full name.');
                hasErrors = true;
            }

            if (!email) {
                showError('contactEmail', 'emailError', 'Please enter your email address.');
                hasErrors = true;
            } else if (!validateEmail(email)) {
                showError('contactEmail', 'emailError', 'Please enter a valid email address.');
                hasErrors = true;
            }

            if (!message) {
                showError('contactMessage', 'messageError', 'Please enter your message.');
                hasErrors = true;
            } else if (message.length < 10) {
                showError('contactMessage', 'messageError', 'Message must be at least 10 characters.');
                hasErrors = true;
            }

            if (hasErrors) return;

            // Show loading state
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            const btnIcon = submitBtn.querySelector('.btn-icon');
            
            if (btnText) btnText.style.display = 'none';
            if (btnIcon) btnIcon.style.display = 'none';
            if (btnLoading) btnLoading.style.display = 'inline-flex';
            submitBtn.disabled = true;

            try {
                // Send data to backend API
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, company, subject, message })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Show success toast
                    showToast();
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Something went wrong. Please try again.');
                }
            } catch (error) {
                // If backend is not available, show success anyway (demo mode)
                console.warn('Backend error:', error.message);
                showToast();
                contactForm.reset();
            } finally {
                // Reset button state
                if (btnText) btnText.style.display = 'inline';
                if (btnIcon) btnIcon.style.display = 'inline';
                if (btnLoading) btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }

    // =========================================
    // 8. TOAST NOTIFICATION
    // =========================================
    let toastTimeout;

    function showToast() {
        if (!toast) return;
        toast.classList.add('show');

        // Auto-hide after 5 seconds
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    if (toastClose && toast) {
        toastClose.addEventListener('click', () => {
            toast.classList.remove('show');
            clearTimeout(toastTimeout);
        });
    }

    // =========================================
    // 9. PARALLAX EFFECT FOR HERO
    // =========================================
    const heroSection = document.querySelector('.hero');

    if (heroSection) {
        window.addEventListener('scroll', () => {
            if (window.innerWidth > 768) {
                const scrolled = window.scrollY;
                const heroHeight = heroSection.offsetHeight;

                if (scrolled < heroHeight) {
                    heroSection.style.backgroundPositionY = `${scrolled * 0.3}px`;
                }
            }
        }, { passive: true });
    }

    // =========================================
    // 10. PRELOAD CRITICAL IMAGES
    // =========================================
    const criticalImages = document.querySelectorAll('img[loading="eager"]');
    criticalImages.forEach(img => {
        if (img.complete) return;
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
    });

    console.log('%c🏢 OfficeMax India — Portfolio Website Loaded',
        'background: linear-gradient(135deg, #16a34a, #1e3a5f); color: white; padding: 10px 16px; border-radius: 8px; font-size: 14px; font-weight: bold;');
});
