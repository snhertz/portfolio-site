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
        // Create status element for inline feedback
        const formStatus = document.createElement('div');
        formStatus.className = 'form-status';
        contactForm.appendChild(formStatus);

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const submitBtnText = submitBtn.textContent;

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                formStatus.textContent = 'Please fill out all fields.';
                formStatus.className = 'form-status error';
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                formStatus.textContent = 'Please enter a valid email address.';
                formStatus.className = 'form-status error';
                return;
            }

            // Set loading state
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
            submitBtn.textContent = 'Sending...';
            formStatus.className = 'form-status';
            formStatus.textContent = '';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                const data = await response.json();

                if (data.success) {
                    formStatus.textContent = 'Thanks for reaching out! I\'ll be in touch shortly.';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                } else {
                    formStatus.textContent = data.error || 'Something went wrong. Please try again.';
                    formStatus.className = 'form-status error';
                }
            } catch (err) {
                formStatus.textContent = 'Unable to send message. Please try again later.';
                formStatus.className = 'form-status error';
            } finally {
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = submitBtnText;
            }
        });
    }
});
