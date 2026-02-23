// ===================================
// Community Phone Assignment Calculator
// Meta-only, simplified from multi-channel version
// ===================================

document.addEventListener('DOMContentLoaded', function () {

    // ===================================
    // DATA: Defaults & Scenarios (Meta-only)
    // ===================================

    const META_DEFAULTS = {
        weeklySpend: 5600,
        cpm: 14,
        ctr: 1.0,
        lpCvr: 5.0,
        trialCvr: 10,
        churn: 5,
        avgRevenue: 55
    };

    const SCENARIOS = {
        conservative: {
            globalGrowth: 2,
            meta: { weeklySpend: 5600, cpm: 16, ctr: 0.7, lpCvr: 3.5, trialCvr: 8, churn: 6, avgRevenue: 55 }
        },
        base: {
            globalGrowth: 5,
            meta: { weeklySpend: 5600, cpm: 14, ctr: 1.0, lpCvr: 5.0, trialCvr: 10, churn: 5, avgRevenue: 55 }
        },
        aggressive: {
            globalGrowth: 7,
            meta: { weeklySpend: 5600, cpm: 12, ctr: 1.2, lpCvr: 6.0, trialCvr: 13, churn: 4, avgRevenue: 55 }
        }
    };

    // ===================================
    // STATE
    // ===================================

    let metaConfig = { ...META_DEFAULTS };
    let globalHorizon = 12;
    let globalGrowth = 5;
    let globalSpendCap = 50000;

    // ===================================
    // CALCULATOR ENGINE
    // ===================================

    function channelModel(config, weeks, growthRate, spendCap) {
        var projections = [];
        var activeCustomers = 0;
        var totalSpend = 0;
        var totalNewCustomers = 0;
        var weeklyChurn = 1 - Math.pow(1 - config.churn / 100, 1 / 4.33);

        for (var w = 0; w < weeks; w++) {
            var weeklySpend = config.weeklySpend * Math.pow(1 + growthRate / 100, w);

            var monthlySpend = weeklySpend * 4.33;
            if (spendCap && monthlySpend > spendCap) {
                weeklySpend = spendCap / 4.33;
            }

            var impressions = (weeklySpend / config.cpm) * 1000;
            var clicks = impressions * (config.ctr / 100);
            var leads = clicks * (config.lpCvr / 100);
            var newCustomers = leads * (config.trialCvr / 100);

            activeCustomers = activeCustomers * (1 - weeklyChurn) + newCustomers;
            var weeklyMRR = activeCustomers * config.avgRevenue;
            totalSpend += weeklySpend;
            totalNewCustomers += newCustomers;

            projections.push({
                week: w + 1,
                weeklySpend: weeklySpend,
                impressions: impressions,
                clicks: clicks,
                leads: leads,
                newCustomers: newCustomers,
                activeCustomers: activeCustomers,
                weeklyMRR: weeklyMRR,
                totalSpend: totalSpend,
                totalNewCustomers: totalNewCustomers
            });
        }

        return projections;
    }

    function calculateKeyMetrics(projections, config) {
        var last = projections[projections.length - 1];
        if (!last) return null;

        var cac = last.totalNewCustomers > 0 ? last.totalSpend / last.totalNewCustomers : 0;
        var ltv = config.churn > 0 ? config.avgRevenue * (1 / (config.churn / 100)) : 0;
        var ltvCacRatio = cac > 0 ? ltv / cac : 0;
        var paybackMonths = config.avgRevenue > 0 ? cac / config.avgRevenue : 0;

        return {
            totalMRR: last.weeklyMRR,
            blendedCAC: cac,
            blendedLTV: ltv,
            ltvCacRatio: ltvCacRatio,
            paybackMonths: paybackMonths,
            totalActiveCustomers: Math.round(last.activeCustomers),
            totalSpend: last.totalSpend,
            totalNewCustomers: last.totalNewCustomers
        };
    }

    // ===================================
    // MAIN RECALCULATE
    // ===================================

    function recalculate() {
        var projections = channelModel(metaConfig, globalHorizon, globalGrowth, globalSpendCap);
        var metrics = calculateKeyMetrics(projections, metaConfig);

        if (metrics) {
            renderMetricCards(metrics);
            renderTargetIndicator(metrics.totalMRR);
            renderFunnelTable(projections);
            renderChart(projections, globalHorizon);
            updatePathBar(metrics.totalMRR);
        }
    }

    // ===================================
    // RENDERING: Metric Cards
    // ===================================

    function formatCurrency(val) {
        if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return '$' + Math.round(val).toLocaleString();
        return '$' + val.toFixed(0);
    }

    function renderMetricCards(metrics) {
        animateValue('metricMRR', metrics.totalMRR, function (v) { return formatCurrency(v); });
        animateValue('metricCAC', metrics.blendedCAC, function (v) { return formatCurrency(v); });
        animateValue('metricLTV', metrics.blendedLTV, function (v) { return formatCurrency(v); });
        animateValue('metricRatio', metrics.ltvCacRatio, function (v) { return v.toFixed(1) + 'x'; });
        animateValue('metricPayback', metrics.paybackMonths, function (v) { return v.toFixed(1) + ' mo'; });
        animateValue('metricCustomers', metrics.totalActiveCustomers, function (v) { return Math.round(v).toLocaleString(); });
    }

    var animationFrames = {};

    function animateValue(elementId, targetVal, formatter) {
        var el = document.getElementById(elementId);
        if (!el) return;

        if (animationFrames[elementId]) {
            cancelAnimationFrame(animationFrames[elementId]);
        }

        var currentText = el.textContent;
        var currentNum = parseFloat(currentText.replace(/[^0-9.\-]/g, '')) || 0;
        var startTime = performance.now();
        var duration = 400;

        function step(now) {
            var progress = Math.min((now - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = currentNum + (targetVal - currentNum) * eased;
            el.textContent = formatter(current);
            if (progress < 1) {
                animationFrames[elementId] = requestAnimationFrame(step);
            }
        }

        animationFrames[elementId] = requestAnimationFrame(step);
    }

    // ===================================
    // RENDERING: Target Indicator
    // ===================================

    function renderTargetIndicator(totalMRR) {
        var target = 5000; // $5K MRR target for 90-day plan
        var indicator = document.getElementById('targetIndicator');
        var icon = document.getElementById('targetIcon');
        var headline = document.getElementById('targetHeadline');
        var detail = document.getElementById('targetDetail');

        var pct = (totalMRR / target) * 100;

        indicator.className = 'target-indicator';

        if (pct >= 100) {
            indicator.classList.add('hit');
            icon.textContent = '\u2713';
            headline.textContent = 'Target Hit: $5K MRR achieved';
            detail.textContent = 'Projected MRR of ' + formatCurrency(totalMRR) + ' exceeds the $5K target by ' + formatCurrency(totalMRR - target);
        } else if (pct >= 70) {
            indicator.classList.add('close');
            icon.textContent = '\u2192';
            headline.textContent = 'Close: ' + Math.round(pct) + '% of $5K MRR target';
            detail.textContent = 'Projected MRR of ' + formatCurrency(totalMRR) + ' — ' + formatCurrency(target - totalMRR) + ' short. Adjust inputs to close the gap.';
        } else {
            indicator.classList.add('miss');
            icon.textContent = '\u2022';
            headline.textContent = Math.round(pct) + '% of $5K MRR target';
            detail.textContent = 'Projected MRR of ' + formatCurrency(totalMRR) + '. Consider increasing spend, improving conversion rates, or extending the planning horizon.';
        }
    }

    // ===================================
    // RENDERING: Path Bar
    // ===================================

    function updatePathBar(totalMRR) {
        var target = 5000;
        var pct = Math.min((totalMRR / target) * 100, 100);
        var fill = document.getElementById('pathBarFill');
        var value = document.getElementById('pathBarValue');

        fill.style.width = pct + '%';
        fill.className = 'path-bar-fill';
        if (pct >= 100) {
            // keep green
        } else if (pct >= 60) {
            fill.classList.add('warning');
        } else {
            fill.classList.add('danger');
        }

        value.textContent = formatCurrency(totalMRR);
    }

    // ===================================
    // RENDERING: Funnel Breakdown Table
    // ===================================

    function formatNumber(val) {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return Math.round(val).toLocaleString();
        return Math.round(val).toLocaleString();
    }

    function renderFunnelTable(projections) {
        var tbody = document.getElementById('funnelBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        var spend = 0, impressions = 0, clicks = 0, leads = 0, customers = 0;
        projections.forEach(function (week) {
            spend += week.weeklySpend;
            impressions += week.impressions;
            clicks += week.clicks;
            leads += week.leads;
            customers += week.newCustomers;
        });

        var ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(1) + '%' : '0%';
        var lpCvr = clicks > 0 ? (leads / clicks * 100).toFixed(1) + '%' : '0%';
        var trialCvr = leads > 0 ? (customers / leads * 100).toFixed(1) + '%' : '0%';

        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><span class="channel-name"><span class="channel-dot" style="background:#1877F2"></span>Meta Ads</span></td>' +
            '<td>$' + formatNumber(spend) + '</td>' +
            '<td>' + formatNumber(impressions) + '</td>' +
            '<td class="funnel-arrow"><span class="funnel-rate">' + ctr + '</span></td>' +
            '<td>' + formatNumber(clicks) + '</td>' +
            '<td class="funnel-arrow"><span class="funnel-rate">' + lpCvr + '</span></td>' +
            '<td>' + formatNumber(leads) + '</td>' +
            '<td class="funnel-arrow"><span class="funnel-rate">' + trialCvr + '</span></td>' +
            '<td>' + formatNumber(customers) + '</td>';
        tbody.appendChild(tr);
    }

    // ===================================
    // RENDERING: Revenue Chart (Canvas)
    // ===================================

    function renderChart(projections, weeks) {
        var canvas = document.getElementById('revenueChart');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var dpr = window.devicePixelRatio || 1;

        var rect = canvas.parentElement.getBoundingClientRect();
        var width = rect.width;
        var height = 400;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        var padding = { top: 20, right: 30, bottom: 50, left: 70 };
        var chartW = width - padding.left - padding.right;
        var chartH = height - padding.top - padding.bottom;

        // Max MRR for y-axis
        var maxMRR = 0;
        var mrrData = [];
        for (var w = 0; w < weeks; w++) {
            var mrr = projections[w] ? projections[w].weeklyMRR : 0;
            mrrData.push(mrr);
            if (mrr > maxMRR) maxMRR = mrr;
        }

        maxMRR = Math.ceil(maxMRR / 1000) * 1000;
        if (maxMRR === 0) maxMRR = 1000;

        // Gridlines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        var gridLines = 5;
        for (var i = 0; i <= gridLines; i++) {
            var y = padding.top + (chartH / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            var val = maxMRR - (maxMRR / gridLines) * i;
            ctx.fillStyle = '#6b6b6b';
            ctx.font = '12px Inter Tight, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(formatCurrency(val), padding.left - 10, y);
        }

        // X-axis labels
        ctx.fillStyle = '#6b6b6b';
        ctx.font = '12px Inter Tight, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        var labelInterval = weeks <= 12 ? 1 : weeks <= 20 ? 2 : 4;
        for (var w2 = 0; w2 < weeks; w2 += labelInterval) {
            var x = padding.left + (chartW / (weeks - 1)) * w2;
            ctx.fillText('W' + (w2 + 1), x, height - padding.bottom + 10);
        }

        // Y-axis label
        ctx.save();
        ctx.fillStyle = '#6b6b6b';
        ctx.font = '12px Inter Tight, sans-serif';
        ctx.textAlign = 'center';
        ctx.translate(15, padding.top + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Monthly Recurring Revenue', 0, 0);
        ctx.restore();

        // Draw MRR line
        ctx.beginPath();
        ctx.strokeStyle = '#1877F2';
        ctx.lineWidth = 3;

        for (var w3 = 0; w3 < weeks; w3++) {
            var x3 = padding.left + (chartW / (weeks - 1)) * w3;
            var y3 = padding.top + chartH - (mrrData[w3] / maxMRR) * chartH;
            if (w3 === 0) ctx.moveTo(x3, y3);
            else ctx.lineTo(x3, y3);
        }
        ctx.stroke();

        // Area fill
        ctx.beginPath();
        for (var w4 = 0; w4 < weeks; w4++) {
            var x4 = padding.left + (chartW / (weeks - 1)) * w4;
            var y4 = padding.top + chartH - (mrrData[w4] / maxMRR) * chartH;
            if (w4 === 0) ctx.moveTo(x4, y4);
            else ctx.lineTo(x4, y4);
        }
        ctx.lineTo(padding.left + chartW, padding.top + chartH);
        ctx.lineTo(padding.left, padding.top + chartH);
        ctx.closePath();
        var gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, 'rgba(24, 119, 242, 0.15)');
        gradient.addColorStop(1, 'rgba(24, 119, 242, 0.01)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // $5K target line
        var targetY = padding.top + chartH - (5000 / maxMRR) * chartH;
        if (targetY >= padding.top && targetY <= padding.top + chartH) {
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, targetY);
            ctx.lineTo(width - padding.right, targetY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.font = '11px Inter Tight, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText('$5K MRR Target', width - padding.right, targetY - 4);
        }

        // Data points
        for (var w5 = 0; w5 < weeks; w5++) {
            var x5 = padding.left + (chartW / (weeks - 1)) * w5;
            var y5 = padding.top + chartH - (mrrData[w5] / maxMRR) * chartH;

            ctx.beginPath();
            ctx.arc(x5, y5, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#1877F2';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x5, y5, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
    }

    // ===================================
    // UI: Slider Binding
    // ===================================

    function formatSliderValue(metric, value) {
        switch (metric) {
            case 'weeklySpend': return '$' + parseInt(value).toLocaleString();
            case 'cpm': return '$' + parseFloat(value).toFixed(2);
            case 'ctr': return parseFloat(value).toFixed(1) + '%';
            case 'lpCvr': return parseFloat(value).toFixed(1) + '%';
            case 'trialCvr': return parseInt(value) + '%';
            case 'churn': return parseFloat(value).toFixed(1) + '%';
            case 'avgRevenue': return '$' + parseInt(value);
            default: return value;
        }
    }

    function initSliders() {
        // Channel sliders
        document.querySelectorAll('.channel-input').forEach(function (input) {
            var metric = input.dataset.metric;

            input.addEventListener('input', function () {
                var val = parseFloat(this.value);
                metaConfig[metric] = val;
                this.parentElement.querySelector('.slider-value').textContent = formatSliderValue(metric, val);

                // Remove active scenario
                document.querySelectorAll('.scenario-btn').forEach(function (b) { b.classList.remove('active'); });

                recalculate();
            });
        });

        // Global horizon
        var horizonSelect = document.getElementById('globalHorizon');
        if (horizonSelect) {
            horizonSelect.addEventListener('change', function () {
                globalHorizon = parseInt(this.value);
                recalculate();
            });
        }

        // Global growth
        var growthSlider = document.getElementById('globalGrowth');
        if (growthSlider) {
            growthSlider.addEventListener('input', function () {
                globalGrowth = parseFloat(this.value);
                document.getElementById('globalGrowthValue').textContent = globalGrowth.toFixed(1) + '%';
                recalculate();
            });
        }

        // Global spend cap
        var spendCapSlider = document.getElementById('globalSpendCap');
        if (spendCapSlider) {
            spendCapSlider.addEventListener('input', function () {
                globalSpendCap = parseInt(this.value);
                document.getElementById('globalSpendCapValue').textContent = '$' + globalSpendCap.toLocaleString();
                recalculate();
            });
        }
    }

    // ===================================
    // UI: Scenario Presets
    // ===================================

    function initScenarios() {
        document.querySelectorAll('.scenario-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var scenario = SCENARIOS[this.dataset.scenario];
                if (!scenario) return;

                document.querySelectorAll('.scenario-btn').forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                // Update global growth
                globalGrowth = scenario.globalGrowth;
                var growthSlider = document.getElementById('globalGrowth');
                if (growthSlider) {
                    growthSlider.value = globalGrowth;
                    document.getElementById('globalGrowthValue').textContent = globalGrowth.toFixed(1) + '%';
                }

                // Update meta config and sliders
                Object.entries(scenario.meta).forEach(function (entry) {
                    var metric = entry[0];
                    var value = entry[1];
                    metaConfig[metric] = value;

                    var input = document.querySelector('.channel-input[data-metric="' + metric + '"]');
                    if (input) {
                        input.value = value;
                        input.parentElement.querySelector('.slider-value').textContent = formatSliderValue(metric, value);
                    }
                });

                recalculate();
            });
        });
    }

    // ===================================
    // UI: Creative Tabs
    // ===================================

    function initCreativeTabs() {
        document.querySelectorAll('.creative-tab').forEach(function (tab) {
            tab.addEventListener('click', function () {
                var creative = this.dataset.creative;

                document.querySelectorAll('.creative-tab').forEach(function (t) { t.classList.remove('active'); });
                this.classList.add('active');

                document.querySelectorAll('.creative-panel').forEach(function (p) { p.classList.remove('active'); });
                document.getElementById('creative-' + creative).classList.add('active');
            });
        });
    }

    // ===================================
    // SCROLL REVEAL
    // ===================================

    function initScrollReveal() {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.section').forEach(function (el) {
            observer.observe(el);
        });

        // Path bar visibility
        var calcSection = document.getElementById('calculator');
        var pathBar = document.getElementById('pathBar');

        var pathObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    pathBar.classList.add('visible');
                } else {
                    pathBar.classList.remove('visible');
                }
            });
        }, { threshold: 0.05 });

        if (calcSection) {
            pathObserver.observe(calcSection);
        }
    }

    // ===================================
    // CAROUSEL
    // ===================================

    function initCarousel() {
        document.querySelectorAll('.creative-carousel').forEach(function (carousel) {
            var slides = carousel.querySelectorAll('.carousel-slide');
            var dots = carousel.querySelectorAll('.carousel-dot');
            var prevBtn = carousel.querySelector('.carousel-prev');
            var nextBtn = carousel.querySelector('.carousel-next');
            var current = 0;

            function goTo(index) {
                if (index < 0) index = slides.length - 1;
                if (index >= slides.length) index = 0;
                slides[current].classList.remove('active');
                dots[current].classList.remove('active');
                current = index;
                slides[current].classList.add('active');
                dots[current].classList.add('active');
            }

            if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
            if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });
            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    goTo(parseInt(this.getAttribute('data-slide'), 10));
                });
            });
        });
    }

    // ===================================
    // SMOOTH SCROLL
    // ===================================

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = this.getAttribute('href').substring(1);
            if (!targetId) return;
            var targetElement = document.getElementById(targetId);
            if (targetElement) {
                var offset = 60;
                var top = targetElement.offsetTop - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // ===================================
    // RESPONSIVE CHART REDRAW
    // ===================================

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(recalculate, 200);
    });

    // ===================================
    // INIT
    // ===================================

    initSliders();
    initScenarios();
    initCreativeTabs();
    initCarousel();
    initScrollReveal();
    recalculate();

});
