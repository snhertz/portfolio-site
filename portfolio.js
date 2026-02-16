/* ===================================
   PORTFOLIO PAGE - INTERACTIONS
   Card toggle, scroll reveal, counter animation
   =================================== */

(function () {
    'use strict';

    // ---- Card expand/collapse ----
    document.querySelectorAll('.star-card-header').forEach(function (header) {
        header.addEventListener('click', function () {
            var card = header.closest('.star-card');
            var isExpanded = card.classList.contains('expanded');

            // Close all other cards
            document.querySelectorAll('.star-card.expanded').forEach(function (open) {
                if (open !== card) {
                    open.classList.remove('expanded');
                    open.querySelector('.star-card-header').setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle this card
            card.classList.toggle('expanded');
            header.setAttribute('aria-expanded', String(!isExpanded));
        });
    });

    // ---- Scroll reveal (staggered) ----
    var revealTargets = document.querySelectorAll('.star-card, .metric-card');

    if ('IntersectionObserver' in window) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    // Stagger based on position among siblings
                    var el = entry.target;
                    var siblings = Array.from(el.parentElement.children).filter(function (c) {
                        return c.classList.contains(el.classList[0]);
                    });
                    var index = siblings.indexOf(el);
                    el.style.transitionDelay = (index * 0.08) + 's';
                    el.classList.add('visible');
                    revealObserver.unobserve(el);
                }
            });
        }, { threshold: 0.1 });

        revealTargets.forEach(function (el) {
            revealObserver.observe(el);
        });
    } else {
        // Fallback: show everything
        revealTargets.forEach(function (el) {
            el.classList.add('visible');
        });
    }

    // ---- Metrics counter animation ----
    var metricValues = document.querySelectorAll('.metric-value[data-target]');

    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        if (isNaN(target)) return;

        // 0% metric: just set it
        if (target === 0) {
            el.textContent = '0';
            return;
        }

        var duration = 1200;
        var start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            // Ease-out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    if ('IntersectionObserver' in window && metricValues.length > 0) {
        var counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        metricValues.forEach(function (el) {
            counterObserver.observe(el);
        });
    } else {
        // Fallback: set final values
        metricValues.forEach(function (el) {
            el.textContent = el.getAttribute('data-target');
        });
    }

})();
