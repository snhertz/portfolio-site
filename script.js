// ===================================
// Typed.js Animation
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Desktop typing animation
    new Typed('#typed-output', {
        strings: [
            'Growth Leader',
            'Product Marketer',
            'MarTech Expert',
            'Web Developer',
            'Marketing Strategist'
        ],
        typeSpeed: 50,
        backSpeed: 25,
        backDelay: 2000,
        startDelay: 500,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // Mobile typing animation
    new Typed('#typed-output-mobile', {
        strings: [
            'Growth Leadership',
            'Product Marketing',
            'MarTech Expertise',
            'Web Development',
            'Marketing Strategy'
        ],
        typeSpeed: 50,
        backSpeed: 25,
        backDelay: 2000,
        startDelay: 500,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });

    // ===================================
    // Smooth Scroll with Offset
    // ===================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;

            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const offset = 100;
                const top = targetElement.offsetTop - offset;

                window.scrollTo({
                    top: top,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===================================
    // Contact Form Handling
    // ===================================

    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill out all fields');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // For now, just show success message
            // TODO: Set up actual form submission backend
            alert('Thanks for reaching out! I will be in touch shortly.');
            contactForm.reset();

            // In production, you would send this to a backend:
            // fetch('/api/contact', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ name, email, message })
            // });
        });
    }
});
