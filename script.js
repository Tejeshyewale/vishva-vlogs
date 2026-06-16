document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu ---
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
            });
        });
    }

    // --- Active Link Highlight, Scroll Progress, & Scrolled Navbar ---
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const scrollProgress = document.getElementById('scrollProgress');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });

        // Scroll Progress
        if (scrollProgress) {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalHeight > 0 ? (window.pageYOffset / totalHeight) * 100 : 0;
            scrollProgress.style.width = `${progress}%`;
        }

        // Scrolled Navbar
        if (navbar) {
            if (window.pageYOffset > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // --- Stats Counter Animation ---
    const stats = document.querySelectorAll('.count');
    let hasAnimatedStats = false;

    const animateStats = () => {
        stats.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const speed = 120; // Animation speed
            const increment = target / speed;

            const updateCount = () => {
                const countVal = +counter.innerText.replace('+', '');
                if (countVal < target) {
                    counter.innerText = Math.ceil(countVal + increment);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target + (target >= 1000 ? '+' : '');
                }
            };
            updateCount();
        });
    };

    // --- Thumbnail Loader Helper ---
    const initThumbnails = () => {
        document.querySelectorAll('.lazy-youtube').forEach(el => {
            const id = el.getAttribute('data-video-id');
            if (id) {
                el.style.backgroundImage = `url(https://img.youtube.com/vi/${id}/hqdefault.jpg)`;
                el.classList.add('loaded');
            }
        });
    };
    initThumbnails();

    // --- Dynamic Content Fetching (RSS) ---
    const loadVideoData = async () => {
        const channelId = 'UCVO1tVecLqpGxgY6cL3lM2A';
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.status !== 'ok' || !data.items) throw new Error('No content found');

            const entries = data.items;
            if (entries.length === 0) return;

            // Extract ID from URL helper
            const getYoutubeId = (url) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
            };

            const setVideoIdAndThumb = (elementId, videoId) => {
                const element = document.getElementById(elementId);
                if (element && videoId) {
                    element.setAttribute('data-video-id', videoId);
                    element.style.backgroundImage = `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`;
                    element.classList.add('loaded');
                }
            };

            // 1. Update Latest Video (First entry)
            const latestVideoId = getYoutubeId(entries[0].link);
            if (latestVideoId) {
                setVideoIdAndThumb('latestVideo', latestVideoId);
            }

            // 2. Update second and third videos if they exist in feed
            if (entries[1]) {
                const secondId = getYoutubeId(entries[1].link);
                if (secondId) setVideoIdAndThumb('mostViewedVideo', secondId);
            }
            if (entries[2]) {
                const thirdId = getYoutubeId(entries[2].link);
                if (thirdId) setVideoIdAndThumb('creatorPickVideo', thirdId);
            }

            console.log("YouTube videos updated dynamically via RSS feed.");

        } catch (error) {
            console.warn("Could not fetch YouTube feed. Using fallback videos.", error);
        }
    };

    loadVideoData();

    // --- Intersection Observer for Scroll Animations ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animation for Stats / Impact Section
                if ((entry.target.id === 'impact' || entry.target.querySelector('.count')) && !hasAnimatedStats) {
                    animateStats();
                    hasAnimatedStats = true;
                }
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    document.querySelectorAll('.timeline-row').forEach(item => {
        observer.observe(item);
    });

    // --- Accessibility: Focus Trapping ---
    const handleFocusTrap = (e, modal) => {
        if (e.key !== 'Tab') return;
        const focusableEls = modal.querySelectorAll('button, [tabindex="0"]');
        if (focusableEls.length === 0) return;
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstEl) {
                lastEl.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastEl) {
                firstEl.focus();
                e.preventDefault();
            }
        }
    };

    // --- Single Video Lightbox ---
    const videoLightbox = document.getElementById('videoLightbox');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxVideoContainer = videoLightbox ? videoLightbox.querySelector('.lightbox-video-container') : null;
    let videoTriggerElement = null;

    const openVideoLightbox = (videoId) => {
        if (!videoLightbox || !lightboxVideoContainer) return;
        videoTriggerElement = document.activeElement;

        // Inject Iframe
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.title = 'Featured Video Player';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;

        lightboxVideoContainer.innerHTML = '';
        lightboxVideoContainer.appendChild(iframe);

        // Show Lightbox
        videoLightbox.classList.add('active');
        videoLightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        // Focus close button
        setTimeout(() => {
            if (lightboxClose) lightboxClose.focus();
        }, 50);
    };

    const closeVideoLightbox = () => {
        if (!videoLightbox || !lightboxVideoContainer) return;
        
        // Destroy Iframe
        lightboxVideoContainer.innerHTML = '';
        videoLightbox.classList.remove('active');
        videoLightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        // Return focus
        if (videoTriggerElement) {
            videoTriggerElement.focus();
        }
    };

    // Attach Lightbox triggers to all featured video cards & Play button in hero
    document.querySelectorAll('.lazy-youtube').forEach(btn => {
        btn.addEventListener('click', () => {
            const videoId = btn.getAttribute('data-video-id');
            if (videoId) openVideoLightbox(videoId);
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const videoId = btn.getAttribute('data-video-id');
                if (videoId) openVideoLightbox(videoId);
            }
        });
    });

    const heroPlayBtn = document.getElementById('heroPlayBtn');
    if (heroPlayBtn) {
        heroPlayBtn.addEventListener('click', () => {
            const videoId = heroPlayBtn.getAttribute('data-video-id');
            if (videoId) openVideoLightbox(videoId);
        });
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeVideoLightbox);
    }
    if (videoLightbox) {
        videoLightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeVideoLightbox);
        videoLightbox.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeVideoLightbox();
            handleFocusTrap(e, videoLightbox);
        });
    }

    // --- FAQ Accordion Logic ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = faqItem.classList.contains('active');

            // Close all other accordion items
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    item.querySelector('.faq-answer').style.maxHeight = null;
                    item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
                    item.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
                }
            });

            // Toggle active state on current item
            if (isActive) {
                faqItem.classList.remove('active');
                answer.style.maxHeight = null;
                question.setAttribute('aria-expanded', 'false');
                answer.setAttribute('aria-hidden', 'true');
            } else {
                faqItem.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                question.setAttribute('aria-expanded', 'true');
                answer.setAttribute('aria-hidden', 'false');
            }
        });
    });

    // --- Back to Top FAB Logic ---
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Newsletter Form Submission Handler ---
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterEmail = document.getElementById('newsletterEmail');
    const newsletterStatus = document.getElementById('newsletterStatus');
    const newsletterSubmitBtn = document.getElementById('newsletterSubmitBtn');

    if (newsletterForm && newsletterEmail && newsletterStatus && newsletterSubmitBtn) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Honeypot spam bot check
            const hpValue = newsletterForm.querySelector('input[name="website_hp"]').value;
            if (hpValue) {
                console.warn("Spam detection triggered.");
                return;
            }

            // Input email validation
            const emailValue = newsletterEmail.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(emailValue)) {
                newsletterStatus.className = 'newsletter-status error';
                newsletterStatus.innerText = 'Please enter a valid email address.';
                return;
            }

            // Disable button and add loading state
            newsletterSubmitBtn.classList.add('loading');
            newsletterSubmitBtn.disabled = true;

            const formData = new FormData(newsletterForm);

            try {
                const response = await fetch(newsletterForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    newsletterStatus.className = 'newsletter-status success';
                    newsletterStatus.innerText = 'Thanks! We\'ll notify you 🎉';
                    newsletterForm.reset();
                } else {
                    throw new Error('Newsletter submission failed');
                }
            } catch (error) {
                console.error(error);
                newsletterStatus.className = 'newsletter-status error';
                newsletterStatus.innerText = 'Oops! Something went wrong. Try again.';
            } finally {
                newsletterSubmitBtn.classList.remove('loading');
                newsletterSubmitBtn.disabled = false;
                setTimeout(() => {
                    newsletterStatus.innerText = '';
                    newsletterStatus.className = 'newsletter-status';
                }, 4000);
            }
        });
    }

    // --- Contact Form Submission Handler ---
    const contactForm = document.getElementById('contactForm');
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const contactMessage = document.getElementById('contactMessage');
    const contactSubmitBtn = document.getElementById('contactSubmitBtn');
    const contactStatus = document.getElementById('contactStatus');

    if (contactForm && contactName && contactEmail && contactMessage && contactSubmitBtn && contactStatus) {
        const inputs = [contactName, contactEmail, contactMessage];
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.remove('error');
                const errSpan = document.getElementById(`${input.id}Error`);
                if (errSpan) {
                    errSpan.innerText = '';
                    errSpan.classList.remove('visible');
                }
            });
        });

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let hasErrors = false;

            // Reset previous validation styles
            inputs.forEach(input => {
                input.classList.remove('error');
                const errSpan = document.getElementById(`${input.id}Error`);
                if (errSpan) {
                    errSpan.innerText = '';
                    errSpan.classList.remove('visible');
                }
            });
            contactStatus.className = 'contact-status';
            contactStatus.innerText = '';

            // 1. Name Validation
            if (contactName.value.trim() === '') {
                contactName.classList.add('error');
                const errSpan = document.getElementById('contactNameError');
                if (errSpan) {
                    errSpan.innerText = 'Name is required.';
                    errSpan.classList.add('visible');
                }
                hasErrors = true;
            }

            // 2. Email Validation
            const emailVal = contactEmail.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailVal === '') {
                contactEmail.classList.add('error');
                const errSpan = document.getElementById('contactEmailError');
                if (errSpan) {
                    errSpan.innerText = 'Email is required.';
                    errSpan.classList.add('visible');
                }
                hasErrors = true;
            } else if (!emailRegex.test(emailVal)) {
                contactEmail.classList.add('error');
                const errSpan = document.getElementById('contactEmailError');
                if (errSpan) {
                    errSpan.innerText = 'Please enter a valid email address.';
                    errSpan.classList.add('visible');
                }
                hasErrors = true;
            }

            // 3. Message Validation
            if (contactMessage.value.trim() === '') {
                contactMessage.classList.add('error');
                const errSpan = document.getElementById('contactMessageError');
                if (errSpan) {
                    errSpan.innerText = 'Message is required.';
                    errSpan.classList.add('visible');
                }
                hasErrors = true;
            }

            if (hasErrors) return;

            contactSubmitBtn.classList.add('loading');
            contactSubmitBtn.disabled = true;

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    contactStatus.className = 'contact-status success';
                    contactStatus.innerText = "Message sent! I'll get back to you soon 🎉";
                    contactForm.reset();
                } else {
                    throw new Error('Contact form submission failed');
                }
            } catch (error) {
                console.error(error);
                contactStatus.className = 'contact-status error';
                contactStatus.innerText = 'Something went wrong, try again or DM me on Instagram';
            } finally {
                contactSubmitBtn.classList.remove('loading');
                contactSubmitBtn.disabled = false;
            }
        });
    }

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch((error) => {
                    console.error('ServiceWorker registration failed: ', error);
                });
        });
    }

});
