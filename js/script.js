document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('ph-list', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Check initial scroll position
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                navLinks.classList.remove('active');
                if(mobileToggle) {
                    mobileToggle.querySelector('i').classList.replace('ph-x', 'ph-list');
                }
                
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for fade-up animations
    const animatedElements = document.querySelectorAll('.animate-fade-up');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
});

// Services Carousel
const track = document.getElementById('servicesTrack');
if (track) {
    const dots = document.getElementById('carouselDots');
    const cards = track.querySelectorAll('.service-card');

    // Create navigation dots
    cards.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.onclick = () => {
            const w = cards[0].offsetWidth + 24;
            track.scrollTo({ left: i * w, behavior: 'smooth' });
        };
        dots.appendChild(d);
    });

    // Update dots on scroll
    let scrollTimeout;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const w = cards[0].offsetWidth + 24;
            const current = Math.round(track.scrollLeft / w);
            dots.querySelectorAll('.dot').forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }, 50);
    });

    // Navigation buttons
    document.getElementById('prevBtn').onclick = () => {
        const w = cards[0].offsetWidth + 24;
        track.scrollBy({ left: -w, behavior: 'smooth' });
    };
    document.getElementById('nextBtn').onclick = () => {
        const w = cards[0].offsetWidth + 24;
        track.scrollBy({ left: w, behavior: 'smooth' });
    };
}

// Contact Form Submission
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: contactForm.querySelector('[name="name"]').value,
            email: contactForm.querySelector('[name="email"]').value,
            phone: contactForm.querySelector('[name="phone"]').value,
            service: contactForm.querySelector('[name="service"]').value,
            message: contactForm.querySelector('[name="message"]').value
        };

        fetch('https://script.google.com/macros/s/AKfycbw5DwFAlRINSP8p3XBK54NOGRLLo5T4p4AJnpZENYxsrDcjt750Qiz8w0dt1xjy_18EQw/exec', {
            method: 'POST',
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            contactForm.reset();
            alert('✅ Message sent! We will get back to you soon.');
        })
        .catch(error => {
            alert('❌ Something went wrong. Please try again.');
        });
    });
}
