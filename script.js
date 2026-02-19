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

    // --- Active Link Highlight on Scroll ---
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active');
            }
        });
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
                constcount = +counter.innerText;
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

            // 1. Update Latest Video (First entry)
            // rss2json returns 'link' (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
            // We extract ID from GUID or Link
            const getYoutubeId = (url) => {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
            };

            const latestVideoId = getYoutubeId(entries[0].link);
            const latestVideoFrame = document.getElementById('latestVideo');
            if (latestVideoFrame && latestVideoId) {
                latestVideoFrame.src = `https://www.youtube.com/embed/${latestVideoId}`;
            }

            // 2. Update Shorts (Entries 2-5)
            const shortFrames = ['short1', 'short2', 'short3', 'short4'];

            for (let i = 0; i < shortFrames.length; i++) {
                if (entries[i + 1]) {
                    const videoId = getYoutubeId(entries[i + 1].link);
                    const frame = document.getElementById(shortFrames[i]);
                    if (frame && videoId) {
                        frame.src = `https://www.youtube.com/embed/${videoId}`;
                    }
                }
            }

            console.log("Videos updated via rss2json!");

        } catch (error) {
            console.warn("Could not fetch YouTube feed. Using fallback videos.", error);
            // Fallback is automatic (keeps HTML hardcoded iframes)
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

});
