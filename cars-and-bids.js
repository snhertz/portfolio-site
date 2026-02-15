// ===================================
// Cars & Bids Case Study
// Slide deck navigation + demo animations
// ===================================

document.addEventListener('DOMContentLoaded', function () {

    var totalSlides = document.querySelectorAll('.slide').length;
    var currentSlide = 0;
    var track = document.getElementById('slidesTrack');
    var dotsContainer = document.getElementById('slideDots');
    var counter = document.getElementById('slideCounter');
    var prevBtn = document.getElementById('prevSlide');
    var nextBtn = document.getElementById('nextSlide');

    // Build dots
    for (var i = 0; i < totalSlides; i++) {
        var dot = document.createElement('div');
        dot.className = 'slide-dot' + (i === 0 ? ' active' : '');
        dot.dataset.slide = i;
        dot.addEventListener('click', function () {
            goToSlide(parseInt(this.dataset.slide));
        });
        dotsContainer.appendChild(dot);
    }

    function goToSlide(n) {
        if (n < 0 || n >= totalSlides) return;
        currentSlide = n;
        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
        updateNav();
    }

    function updateNav() {
        // Dots
        var dots = dotsContainer.querySelectorAll('.slide-dot');
        dots.forEach(function (d, i) {
            d.classList.toggle('active', i === currentSlide);
        });
        // Counter
        counter.textContent = (currentSlide + 1) + ' / ' + totalSlides;
        // Arrows
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;
    }

    prevBtn.addEventListener('click', function () {
        goToSlide(currentSlide - 1);
    });

    nextBtn.addEventListener('click', function () {
        goToSlide(currentSlide + 1);
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
        if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    });

    updateNav();


    // ===================================
    // Demo bid animation on auction card
    // ===================================

    var bidEl = document.getElementById('demoBid');
    if (bidEl) {
        var baseBid = 42250;
        var bidInterval = setInterval(function () {
            baseBid += Math.floor(Math.random() * 500) + 250;
            bidEl.textContent = '$' + baseBid.toLocaleString();
        }, 4000);
    }


    // ===================================
    // Nav active state on scroll
    // ===================================

    var navLinks = document.querySelectorAll('.page-nav-link');
    var wireframeSection = document.getElementById('wireframe');

    function updateActiveNav() {
        if (!wireframeSection) return;
        var wireframeTop = wireframeSection.getBoundingClientRect().top;
        var threshold = window.innerHeight * 0.4;

        navLinks.forEach(function (link) {
            link.classList.remove('active');
        });

        if (wireframeTop < threshold) {
            document.querySelector('.page-nav-link[data-section="wireframe"]').classList.add('active');
        } else {
            document.querySelector('.page-nav-link[data-section="deck"]').classList.add('active');
        }
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

});
