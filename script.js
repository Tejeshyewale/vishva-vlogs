document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu ---
    const menuBtn = document.querySelector('.menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuBtn.querySelector('i').classList.remove('fa-times');
                menuBtn.querySelector('i').classList.add('fa-bars');
            });
        });
    }

    // --- Active Link Highlight on Scroll, Scroll Progress & Scrolled Navbar ---
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
            const speed = 200; // Lower is faster
            const increment = target / speed;

            const updateCount = () => {
                const constcount = +counter.innerText;
                if (constcount < target) {
                    counter.innerText = Math.ceil(constcount + increment);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target + (target > 100 ? '+' : '');
                }
            };
            updateCount();
        });
    };

    // --- Progress Bar Animation ---
    const progressBar = document.querySelector('.progress-bar-fill');
    let hasAnimatedProgress = false;

    const animateProgress = () => {
        if (progressBar) {
            const width = progressBar.getAttribute('data-width');
            progressBar.style.width = width;
        }
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
        // Using rss2json.com proxy for better GitHub Pages compatibility
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            // Check if status is ok and items exist
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

            // 2. Update Shorts (Entries 2-5)
            const shortFrames = ['short1', 'short2', 'short3', 'short4'];

            for (let i = 0; i < shortFrames.length; i++) {
                if (entries[i + 1]) {
                    const videoId = getYoutubeId(entries[i + 1].link);
                    if (videoId) {
                        setVideoIdAndThumb(shortFrames[i], videoId);
                    }
                }
            }

            console.log("Videos updated via rss2json!");

        } catch (error) {
            console.warn("Could not fetch YouTube feed. Using fallback videos.", error);
        }
    };

    // Call the function
    loadVideoData();

    // --- Intersection Observer for Scroll Animations ---
    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animation for Stats
                if (entry.target.id === 'stats' && !hasAnimatedStats) {
                    animateStats();
                    hasAnimatedStats = true;
                }

                // Animation for About (Progress Bar)
                if (entry.target.id === 'about' && !hasAnimatedProgress) {
                    setTimeout(animateProgress, 500); // Slight delay
                    hasAnimatedProgress = true;
                }

                // Generic Fade Up
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    document.querySelectorAll('.timeline-fade').forEach(item => {
        observer.observe(item);
    });

    // --- Preloader Logic ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const preloaderShown = sessionStorage.getItem('preloader_shown');
        if (preloaderShown) {
            preloader.style.display = 'none';
        } else {
            sessionStorage.setItem('preloader_shown', 'true');
            // Allow animation to play then fade out
            setTimeout(() => {
                preloader.classList.add('fade-out');
            }, 1200);
        }
    }

    // --- Interactive Background Glow (Aurora) ---
    const glowWrapper = document.querySelector('.bg-glow-wrapper');
    if (glowWrapper) {
        window.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const dx = (e.clientX - window.innerWidth / 2) * 0.05;
            const dy = (e.clientY - window.innerHeight / 2) * 0.05;
            glowWrapper.style.setProperty('--bg-dx', `${dx}px`);
            glowWrapper.style.setProperty('--bg-dy', `${dy}px`);
        });
    }

    // --- Custom Cursor & LERP Trail ---
    const cursor = document.getElementById('customCursor');
    const trail = document.getElementById('customCursorTrail');
    
    if (cursor && trail) {
        let cx = 0, cy = 0;
        let tx = 0, ty = 0;
        let targetX = 0, targetY = 0;
        let isMoving = false;

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            if (!isMoving) {
                isMoving = true;
                // Position initially to avoid sudden jump
                if (cx === 0 && cy === 0) {
                    cx = targetX;
                    cy = targetY;
                    tx = targetX;
                    ty = targetY;
                }
            }
        });

        // Hover states on interactive components
        const hoverTargets = document.querySelectorAll('a, button, .social-icon, .btn, .cat-card, .short-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });

        const updateCursor = () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                cursor.style.display = 'none';
                trail.style.display = 'none';
                return;
            }

            if (isMoving) {
                // Immediate position for main pointer dot
                cx = targetX;
                cy = targetY;
                document.documentElement.style.setProperty('--cursor-x', `${cx}px`);
                
                // Linear Interpolation (LERP) for trail following
                tx += (targetX - tx) * 0.15;
                ty += (targetY - ty) * 0.15;
                document.documentElement.style.setProperty('--trail-x', `${tx}px`);
                document.documentElement.style.setProperty('--trail-y', `${ty}px`);
            }

            requestAnimationFrame(updateCursor);
        };
        requestAnimationFrame(updateCursor);

        // Hide cursor when leaving page window bounds
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            trail.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
            trail.style.opacity = '1';
        });
    }

    // --- Hero Typewriter / Cycling Text Animation ---
    const typewriter = document.getElementById('typewriter');
    if (typewriter) {
        const phrases = ["Engineering Struggles", "Daily Chaos", "Bakchodi w/ Friends", "Ghumakkad Vibes"];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const type = () => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                typewriter.innerText = phrases.join(', ');
                return;
            }
            const currentPhrase = phrases[phraseIndex];
            if (isDeleting) {
                typewriter.innerText = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriter.innerText = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 50 : 100;
            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2000; // Pause at end of text
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500; // Pause before typing next phrase
            }
            
            setTimeout(type, typeSpeed);
        };
        type();
    }

    // --- Magnetic Hover Buttons ---
    const primaryBtns = document.querySelectorAll('.btn-primary');
    primaryBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px) scale(1.05)`;
            btn.style.transition = 'transform 0.1s ease-out';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
            btn.style.transition = 'transform 0.3s ease-out';
        });
    });

    // --- Category Filter Chips ---
    const filterChips = document.querySelectorAll('.filter-chip');
    const shortCards = document.querySelectorAll('.short-card');

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Update active state on chips
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filterValue = chip.getAttribute('data-filter');

            shortCards.forEach(card => {
                const category = card.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
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
    const latestVideoBtn = document.getElementById('latestVideo');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxVideoContainer = videoLightbox ? videoLightbox.querySelector('.lightbox-video-container') : null;
    let videoTriggerElement = null;

    const openVideoLightbox = (videoId) => {
        if (!videoLightbox || !lightboxVideoContainer) return;
        videoTriggerElement = document.activeElement;

        // Inject Iframe
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        iframe.title = 'Latest Drop Video Player';
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

    if (latestVideoBtn) {
        latestVideoBtn.addEventListener('click', () => {
            const videoId = latestVideoBtn.getAttribute('data-video-id');
            if (videoId) openVideoLightbox(videoId);
        });

        latestVideoBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const videoId = latestVideoBtn.getAttribute('data-video-id');
                if (videoId) openVideoLightbox(videoId);
            }
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

    // --- Reels-Style Shorts Lightbox ---
    const shortsLightbox = document.getElementById('shortsLightbox');
    const shortsClose = document.getElementById('shortsClose');
    const shortsMuteBtn = document.getElementById('shortsMuteBtn');
    const shortsPrevBtn = document.getElementById('shortsPrevBtn');
    const shortsNextBtn = document.getElementById('shortsNextBtn');
    const shortsVideoContainer = shortsLightbox ? shortsLightbox.querySelector('.shorts-video-container') : null;

    let currentShortIndex = 0;
    let isMuted = true; // Autoplay policy requires initial mute
    let shortsTriggerElement = null;

    const getActiveShorts = () => {
        return Array.from(document.querySelectorAll('.short-card:not(.hidden) .lazy-youtube'));
    };

    const loadShort = (index) => {
        const activeShorts = getActiveShorts();
        if (activeShorts.length === 0 || !shortsVideoContainer) return;

        // Looping wrap-around
        currentShortIndex = (index + activeShorts.length) % activeShorts.length;
        const targetShort = activeShorts[currentShortIndex];
        const videoId = targetShort.getAttribute('data-video-id');

        // Destroy old iframe and inject new one
        const iframe = document.createElement('iframe');
        // Loop is enabled by setting loop=1 and playlist={video_id}
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? '1' : '0'}&loop=1&playlist=${videoId}`;
        iframe.title = `Short Video Player ${currentShortIndex + 1}`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;

        shortsVideoContainer.innerHTML = '';
        shortsVideoContainer.appendChild(iframe);
    };

    const openShortsLightbox = (triggerEl) => {
        if (!shortsLightbox) return;
        shortsTriggerElement = triggerEl;

        const activeShorts = getActiveShorts();
        const index = activeShorts.indexOf(triggerEl);

        shortsLightbox.classList.add('active');
        shortsLightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        // Mute state representation setup
        const muteIcon = shortsMuteBtn.querySelector('i');
        if (isMuted) {
            muteIcon.className = 'fas fa-volume-mute';
            shortsMuteBtn.setAttribute('aria-label', 'Unmute audio');
        } else {
            muteIcon.className = 'fas fa-volume-up';
            shortsMuteBtn.setAttribute('aria-label', 'Mute audio');
        }

        loadShort(index !== -1 ? index : 0);

        setTimeout(() => {
            if (shortsClose) shortsClose.focus();
        }, 50);
    };

    const closeShortsLightbox = () => {
        if (!shortsLightbox || !shortsVideoContainer) return;
        shortsVideoContainer.innerHTML = '';

        shortsLightbox.classList.remove('active');
        shortsLightbox.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        if (shortsTriggerElement) {
            shortsTriggerElement.focus();
        }
    };

    const navigateShorts = (direction) => {
        loadShort(currentShortIndex + direction);
    };

    // Attach click listeners to all shorts
    document.querySelectorAll('.short-card .lazy-youtube').forEach(shortEl => {
        shortEl.addEventListener('click', () => openShortsLightbox(shortEl));
        shortEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openShortsLightbox(shortEl);
            }
        });
    });

    if (shortsClose) {
        shortsClose.addEventListener('click', closeShortsLightbox);
    }
    if (shortsMuteBtn) {
        shortsMuteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            const muteIcon = shortsMuteBtn.querySelector('i');
            if (isMuted) {
                muteIcon.className = 'fas fa-volume-mute';
                shortsMuteBtn.setAttribute('aria-label', 'Unmute audio');
            } else {
                muteIcon.className = 'fas fa-volume-up';
                shortsMuteBtn.setAttribute('aria-label', 'Mute audio');
            }
            // Reload with updated parameter
            loadShort(currentShortIndex);
        });
    }

    if (shortsPrevBtn) shortsPrevBtn.addEventListener('click', () => navigateShorts(-1));
    if (shortsNextBtn) shortsNextBtn.addEventListener('click', () => navigateShorts(1));

    if (shortsLightbox) {
        shortsLightbox.querySelector('.lightbox-backdrop').addEventListener('click', closeShortsLightbox);
        
        // Key controls & focus trap
        shortsLightbox.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeShortsLightbox();
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                navigateShorts(-1);
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                navigateShorts(1);
            }
            handleFocusTrap(e, shortsLightbox);
        });

        // Touch swipe support
        let touchStartY = 0;
        let touchEndY = 0;

        shortsLightbox.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        shortsLightbox.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            const diff = touchStartY - touchEndY;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    navigateShorts(1); // Swipe up -> Next
                } else {
                    navigateShorts(-1); // Swipe down -> Prev
                }
            }
        }, { passive: true });
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

    // --- Vibe vs Pro Mode Tone Toggle Logic ---
    const toneToggleBtns = document.querySelectorAll('.tone-toggle-btn');
    
    const setTone = (tone) => {
        if (tone === 'pro') {
            document.documentElement.classList.add('pro-mode');
            localStorage.setItem('vv_tone', 'pro');
            toneToggleBtns.forEach(btn => {
                btn.classList.add('pro-active');
                btn.setAttribute('aria-checked', 'true');
                btn.querySelector('.toggle-label-text').innerText = '💼 Pro';
            });
        } else {
            document.documentElement.classList.remove('pro-mode');
            localStorage.setItem('vv_tone', 'vibe');
            toneToggleBtns.forEach(btn => {
                btn.classList.remove('pro-active');
                btn.setAttribute('aria-checked', 'false');
                btn.querySelector('.toggle-label-text').innerText = '🤙 Vibe';
            });
        }
    };

    // Apply tone immediately on start to align DOM elements
    const savedTone = localStorage.getItem('vv_tone') || 'vibe';
    setTone(savedTone);

    toneToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isCurrentlyPro = document.documentElement.classList.contains('pro-mode');
            setTone(isCurrentlyPro ? 'vibe' : 'pro');
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const isCurrentlyPro = document.documentElement.classList.contains('pro-mode');
                setTone(isCurrentlyPro ? 'vibe' : 'pro');
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
                return; // Silently discard bot submission
            }

            // Input email validation
            const emailValue = newsletterEmail.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(emailValue)) {
                newsletterStatus.className = 'newsletter-status error';
                newsletterStatus.innerText = 'Please enter a valid email address.';
                return;
            }

            // Disable button and add loading class
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
                // Automatically clear status message after 4 seconds
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
        // Clear error highlights on input interaction
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

            // Trigger submit states
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
