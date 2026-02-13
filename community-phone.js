// ===================================
// Community Phone Growth Calculator
// ===================================

document.addEventListener('DOMContentLoaded', function () {

    // ===================================
    // DATA: Channel defaults & ICE items
    // ===================================

    const CHANNEL_DEFAULTS = {
        meta: {
            name: 'Meta Ads',
            color: '#1877F2',
            weeklySpend: 12000,
            cpm: 14,
            ctr: 0.9,
            lpCvr: 5,
            trialCvr: 12,
            churn: 7,
            avgRevenue: 70
        },
        tiktok: {
            name: 'TikTok Ads',
            color: '#fe2c55',
            weeklySpend: 20000,
            cpm: 10,
            ctr: 0.5,
            lpCvr: 3,
            trialCvr: 8,
            churn: 7,
            avgRevenue: 70
        },
        influencer: {
            name: 'Influencer / Affiliate',
            color: '#E1306C',
            weeklySpend: 10000,
            cpm: 18,
            ctr: 1.8,
            lpCvr: 9,
            trialCvr: 16,
            churn: 5,
            avgRevenue: 70
        },
        youtube: {
            name: 'YouTube Ads',
            color: '#FF0000',
            weeklySpend: 8000,
            cpm: 6,
            ctr: 0.5,
            lpCvr: 4,
            trialCvr: 9,
            churn: 6,
            avgRevenue: 70
        },
        ctv: {
            name: 'CTV / OTT',
            color: '#9333EA',
            weeklySpend: 15000,
            cpm: 40,
            ctr: 0.05,
            lpCvr: 3,
            trialCvr: 8,
            churn: 6,
            avgRevenue: 70
        }
    };

    const SCENARIOS = {
        conservative: {
            globalGrowth: 2,
            channels: {
                meta:       { weeklySpend: 8000,  cpm: 16,  ctr: 0.7,  lpCvr: 3.5, trialCvr: 10, churn: 8,  avgRevenue: 70 },
                tiktok:     { weeklySpend: 5000,  cpm: 12,  ctr: 0.4,  lpCvr: 2.5, trialCvr: 6,  churn: 9,  avgRevenue: 70 },
                influencer: { weeklySpend: 3000,  cpm: 20,  ctr: 1.5,  lpCvr: 7,   trialCvr: 12, churn: 6,  avgRevenue: 70 },
                youtube:    { weeklySpend: 5000,  cpm: 7,   ctr: 0.45, lpCvr: 3,   trialCvr: 7,  churn: 7,  avgRevenue: 70 },
                ctv:        { weeklySpend: 10000, cpm: 50,  ctr: 0.03, lpCvr: 2.5, trialCvr: 6,  churn: 7,  avgRevenue: 70 }
            }
        },
        base: {
            globalGrowth: 3,
            channels: {
                meta:       { weeklySpend: 12000, cpm: 14, ctr: 0.9,  lpCvr: 5,  trialCvr: 12, churn: 7, avgRevenue: 70 },
                tiktok:     { weeklySpend: 8000,  cpm: 10, ctr: 0.5,  lpCvr: 3,  trialCvr: 8,  churn: 7, avgRevenue: 70 },
                influencer: { weeklySpend: 5000,  cpm: 18, ctr: 1.8,  lpCvr: 9,  trialCvr: 16, churn: 5, avgRevenue: 70 },
                youtube:    { weeklySpend: 8000,  cpm: 6,  ctr: 0.5,  lpCvr: 4,  trialCvr: 9,  churn: 6, avgRevenue: 70 },
                ctv:        { weeklySpend: 15000, cpm: 40, ctr: 0.05, lpCvr: 3,  trialCvr: 8,  churn: 6, avgRevenue: 70 }
            }
        },
        aggressive: {
            globalGrowth: 7,
            channels: {
                meta:       { weeklySpend: 18000, cpm: 12, ctr: 1.2,  lpCvr: 8,   trialCvr: 15, churn: 5, avgRevenue: 70 },
                tiktok:     { weeklySpend: 12000, cpm: 8,  ctr: 0.8,  lpCvr: 5,   trialCvr: 10, churn: 6, avgRevenue: 70 },
                influencer: { weeklySpend: 8000,  cpm: 15, ctr: 2.5,  lpCvr: 12,  trialCvr: 20, churn: 4, avgRevenue: 70 },
                youtube:    { weeklySpend: 12000, cpm: 4,  ctr: 0.65, lpCvr: 6,   trialCvr: 12, churn: 5, avgRevenue: 70 },
                ctv:        { weeklySpend: 20000, cpm: 30, ctr: 0.08, lpCvr: 4.5, trialCvr: 10, churn: 5, avgRevenue: 70 }
            }
        }
    };

    const ICE_ITEMS = [
        {
            initiative: 'Launch Meta Ads for Family/Senior Targeting',
            desc: 'Carousel + video creative on Facebook & Instagram targeting key demos',
            rationale: 'Impact 10: Meta has the largest addressable audience in CP\'s core demo (families, 35-65), and could realistically deliver 100% of the $100K goal if executed well. This is the primary bet. Confidence 7: proven platform with deep targeting options, but uncertain how well CP\'s specific offer will convert without testing. Ease 8: fast to launch, mature ad tools, can be live with initial tests in days.',
            impact: 10, confidence: 7, ease: 8
        },
        {
            initiative: 'YouTube Ads (Performance)',
            desc: 'Pre-roll and in-stream video ads on YouTube targeting high-intent keywords and audiences',
            rationale: 'Impact 7: YouTube has strong audience reach in CP\'s demo with lower CPMs than Meta. Good for mid-funnel testing. Confidence 6: proven performance channel with clear attribution, though conversion depends heavily on creative quality - moderate confidence. Ease 8: fast to launch via Google Ads, can leverage existing search keyword data and creative from other channels.',
            impact: 7, confidence: 6, ease: 8
        },
        {
            initiative: 'Connected TV / OTT (Awareness)',
            desc: 'Premium CTV inventory on streaming platforms for reach and brand awareness',
            rationale: 'Impact 5: CTV is an awareness channel, not a direct response driver. Weak standalone unit economics, but valuable as the top of a multi-channel funnel that feeds retargeting and direct mail later. Confidence 4: attribution is murky for awareness plays - difficult to measure true incremental lift, below 50% certainty this drives measurable impact in first 6 months. Ease 7: programmatic buying makes launch straightforward, but requires creative production and measurement infrastructure.',
            impact: 5, confidence: 4, ease: 7
        },
        {
            initiative: 'Creative Testing System',
            desc: 'Structured hypothesis, produce, test, iterate framework across all channels',
            rationale: 'Impact 7: creative is a primary lever when building a new channel, and a systematic testing framework compounds the impact of every channel initiative. Can improve performance across all channels by 50-70%, which gets us meaningfully closer to the goal but doesn\'t deliver it alone. Confidence 8: this is a process that improves odds significantly, though not a guarantee of hitting $100K ARR target. Ease 7: requires setup (naming conventions, thresholds, kill criteria) but no media spend.',
            impact: 7, confidence: 8, ease: 7
        },
        {
            initiative: 'Landing Page Optimization for Non-Google Traffic',
            desc: 'Dedicated LPs per channel with tailored messaging and social proof',
            rationale: 'Impact 6: sending paid traffic to a generic page kills conversion, and channel-specific LPs can 2-3x CVR. This is a force multiplier on other channels rather than a standalone driver - gets us 50-60% of the way there by improving conversion across all paid efforts. Confidence 7: LP optimization is well-proven, though exact lift varies by offer and creative quality. Ease 8: fast to spin up with a page builder, low resource cost.',
            impact: 6, confidence: 7, ease: 8
        },
        {
            initiative: 'Direct Mail Retargeting',
            desc: 'Physical mailers to high-intent website visitors and abandoned signups',
            rationale: 'Impact 4: narrow audience (retargeting only) caps the volume ceiling. High intent means strong per-piece conversion, but at best this delivers 30-40% of the goal due to audience size constraints. Confidence 5: less common channel with fewer benchmarks - about 50% certain this delivers meaningful impact given untested audience. Ease 7: vendors handle fulfillment, mainly requires pixel integration and creative.',
            impact: 4, confidence: 5, ease: 7
        },
        {
            initiative: 'Affiliate / Referral Channel Buildout',
            desc: 'Commission-based program for existing customers and partners',
            rationale: 'Impact 5: scalable long-term but slow to build initial volume, unlikely to move the needle meaningfully in the first 6 months. At best delivers 40-50% of goal given ramp time. Confidence 6: performance-based model means low risk, and existing customers are a warm starting point, but execution complexity creates uncertainty. Ease 5: requires building program infrastructure, tracking, commission structure, and ongoing partner recruitment.',
            impact: 5, confidence: 6, ease: 5
        },
        {
            initiative: 'Influencer Partnerships',
            desc: 'Family and tech YouTube/Instagram reviewers with trackable promo codes',
            rationale: 'Impact 7: authentic endorsements convert well for trust-dependent products like home phone service. Confidence 6: trackable via promo codes and measurable quickly, but influencer performance varies widely - moderate confidence in consistent impact. Ease 6: requires outreach and content coordination, but platforms like Creator Marketplace streamline the process.',
            impact: 7, confidence: 6, ease: 6
        },
        {
            initiative: 'TikTok Creative Testing Program',
            desc: 'UGC-style and product demo ads on TikTok',
            rationale: 'Impact 5: TikTok\'s core demo skews younger than CP\'s target audience (families, seniors). Potential upside if creative resonates, but not the primary channel. Confidence 4: limited data on TikTok performance for this product category and age group - below 50% certainty. Ease 7: low CPMs and easy to launch, good for low-cost experimentation.',
            impact: 5, confidence: 4, ease: 7
        }
    ];

    // ===================================
    // STATE
    // ===================================

    let channelConfigs = {};
    Object.keys(CHANNEL_DEFAULTS).forEach(key => {
        channelConfigs[key] = { ...CHANNEL_DEFAULTS[key] };
    });

    let channelEnabled = { meta: true, tiktok: false, influencer: false, youtube: true, ctv: false };
    let globalBudget = 75000;
    let globalHorizon = 26;
    let globalGrowth = 3;

    // ===================================
    // CALCULATOR ENGINE
    // ===================================

    function channelModel(config, weeks, growthRate) {
        const projections = [];
        let activeCustomers = 0;
        let cumulativeMRR = 0;
        let totalSpend = 0;
        let totalNewCustomers = 0;
        const weeklyChurn = 1 - Math.pow(1 - config.churn / 100, 1 / 4.33);

        for (let w = 0; w < weeks; w++) {
            const weeklySpend = config.weeklySpend * Math.pow(1 + growthRate / 100, w);
            const impressions = (weeklySpend / config.cpm) * 1000;
            const clicks = impressions * (config.ctr / 100);
            const leads = clicks * (config.lpCvr / 100);
            const newCustomers = leads * (config.trialCvr / 100);

            activeCustomers = activeCustomers * (1 - weeklyChurn) + newCustomers;
            const weeklyMRR = activeCustomers * config.avgRevenue;
            totalSpend += weeklySpend;
            totalNewCustomers += newCustomers;

            projections.push({
                week: w + 1,
                weeklySpend,
                impressions,
                clicks,
                leads,
                newCustomers,
                activeCustomers,
                weeklyMRR,
                totalSpend,
                totalNewCustomers
            });
        }

        return projections;
    }

    function aggregateChannels(allProjections, weeks) {
        const combined = [];
        for (let w = 0; w < weeks; w++) {
            let totalMRR = 0;
            let totalSpend = 0;
            let totalActive = 0;
            Object.values(allProjections).forEach(proj => {
                if (proj[w]) {
                    totalMRR += proj[w].weeklyMRR;
                    totalSpend += proj[w].totalSpend;
                    totalActive += proj[w].activeCustomers;
                }
            });
            combined.push({ week: w + 1, totalMRR, totalSpend, totalActive });
        }
        return combined;
    }

    function calculateKeyMetrics(allProjections, weeks) {
        let totalSpend = 0;
        let totalNewCustomers = 0;
        let totalMRR = 0;
        let totalActiveCustomers = 0;
        let weightedChurn = 0;
        let weightedRevenue = 0;

        const channelMetrics = {};

        Object.entries(allProjections).forEach(([key, proj]) => {
            const last = proj[weeks - 1];
            if (!last) return;
            const config = channelConfigs[key];
            const cac = last.totalNewCustomers > 0 ? last.totalSpend / last.totalNewCustomers : 0;
            const ltv = config.churn > 0 ? config.avgRevenue * (1 / (config.churn / 100)) : 0;
            const roas = last.totalSpend > 0 ? (last.weeklyMRR * 4.33) / (last.totalSpend / weeks * 4.33) : 0;

            channelMetrics[key] = {
                name: config.name,
                color: config.color,
                cac,
                ltv,
                roas,
                newCustomers: Math.round(last.activeCustomers),
                mrr: last.weeklyMRR,
                totalSpend: last.totalSpend,
                weeklySpend: config.weeklySpend
            };

            totalSpend += last.totalSpend;
            totalNewCustomers += last.totalNewCustomers;
            totalMRR += last.weeklyMRR;
            totalActiveCustomers += last.activeCustomers;
            weightedChurn += (config.churn / 100) * last.activeCustomers;
            weightedRevenue += config.avgRevenue * last.activeCustomers;
        });

        const blendedCAC = totalNewCustomers > 0 ? totalSpend / totalNewCustomers : 0;
        const avgChurn = totalActiveCustomers > 0 ? weightedChurn / totalActiveCustomers : 0;
        const avgRevenue = totalActiveCustomers > 0 ? weightedRevenue / totalActiveCustomers : 0;
        const blendedLTV = avgChurn > 0 ? avgRevenue / avgChurn : 0;
        const ltvCacRatio = blendedCAC > 0 ? blendedLTV / blendedCAC : 0;
        const paybackMonths = avgRevenue > 0 ? blendedCAC / avgRevenue : 0;

        return {
            totalMRR,
            blendedCAC,
            blendedLTV,
            ltvCacRatio,
            paybackMonths,
            totalActiveCustomers: Math.round(totalActiveCustomers),
            channelMetrics
        };
    }

    // ===================================
    // MAIN RECALCULATE
    // ===================================

    function recalculate() {
        const allProjections = {};
        Object.keys(channelConfigs).forEach(key => {
            if (!channelEnabled[key]) return;
            allProjections[key] = channelModel(channelConfigs[key], globalHorizon, globalGrowth);
        });

        const combined = aggregateChannels(allProjections, globalHorizon);
        const metrics = calculateKeyMetrics(allProjections, globalHorizon);

        renderMetricCards(metrics);
        renderTargetIndicator(metrics.totalMRR);
        renderFunnelTable(allProjections);
        renderChart(allProjections, globalHorizon);
        renderDonut(metrics.channelMetrics);
        renderComparisonTable(metrics.channelMetrics);
        updatePathBar(metrics.totalMRR);
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
        animateValue('metricMRR', metrics.totalMRR, v => formatCurrency(v));
        animateValue('metricCAC', metrics.blendedCAC, v => formatCurrency(v));
        animateValue('metricLTV', metrics.blendedLTV, v => formatCurrency(v));
        animateValue('metricRatio', metrics.ltvCacRatio, v => v.toFixed(1) + 'x');
        animateValue('metricPayback', metrics.paybackMonths, v => v.toFixed(1) + ' mo');
        animateValue('metricCustomers', metrics.totalActiveCustomers, v => Math.round(v).toLocaleString());
    }

    const animationFrames = {};

    function animateValue(elementId, targetVal, formatter) {
        const el = document.getElementById(elementId);
        if (!el) return;

        if (animationFrames[elementId]) {
            cancelAnimationFrame(animationFrames[elementId]);
        }

        const currentText = el.textContent;
        const currentNum = parseFloat(currentText.replace(/[^0-9.\-]/g, '')) || 0;
        const startTime = performance.now();
        const duration = 400;

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = currentNum + (targetVal - currentNum) * eased;
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
        const target = 100000;
        const indicator = document.getElementById('targetIndicator');
        const icon = document.getElementById('targetIcon');
        const headline = document.getElementById('targetHeadline');
        const detail = document.getElementById('targetDetail');

        const annualizedMRR = totalMRR;
        const pct = (annualizedMRR / target) * 100;

        indicator.className = 'target-indicator';

        if (pct >= 100) {
            indicator.classList.add('hit');
            icon.textContent = '\u2713';
            headline.textContent = 'Target Hit: $100K MRR achieved';
            detail.textContent = 'Projected MRR of ' + formatCurrency(annualizedMRR) + ' exceeds the $100K target by ' + formatCurrency(annualizedMRR - target);
        } else if (pct >= 70) {
            indicator.classList.add('close');
            icon.textContent = '\u2192';
            headline.textContent = 'Close: ' + Math.round(pct) + '% of $100K MRR target';
            detail.textContent = 'Projected MRR of ' + formatCurrency(annualizedMRR) + ' — ' + formatCurrency(target - annualizedMRR) + ' short. Adjust inputs to close the gap.';
        } else {
            indicator.classList.add('miss');
            icon.textContent = '\u2022';
            headline.textContent = Math.round(pct) + '% of $100K MRR target';
            detail.textContent = 'Projected MRR of ' + formatCurrency(annualizedMRR) + '. Consider increasing spend, improving conversion rates, or extending the planning horizon.';
        }
    }

    // ===================================
    // RENDERING: Path Bar
    // ===================================

    function updatePathBar(totalMRR) {
        const target = 100000;
        const pct = Math.min((totalMRR / target) * 100, 100);
        const fill = document.getElementById('pathBarFill');
        const value = document.getElementById('pathBarValue');

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

    function renderFunnelTable(allProjections) {
        var tbody = document.getElementById('funnelBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        var totals = { impressions: 0, clicks: 0, leads: 0, customers: 0 };

        Object.entries(allProjections).forEach(function (entry) {
            var key = entry[0];
            var proj = entry[1];
            var config = channelConfigs[key];

            var impressions = 0, clicks = 0, leads = 0, customers = 0;
            proj.forEach(function (week) {
                impressions += week.impressions;
                clicks += week.clicks;
                leads += week.leads;
                customers += week.newCustomers;
            });

            totals.impressions += impressions;
            totals.clicks += clicks;
            totals.leads += leads;
            totals.customers += customers;

            var ctr = impressions > 0 ? (clicks / impressions * 100).toFixed(1) + '%' : '0%';
            var lpCvr = clicks > 0 ? (leads / clicks * 100).toFixed(1) + '%' : '0%';
            var trialCvr = leads > 0 ? (customers / leads * 100).toFixed(1) + '%' : '0%';

            var tr = document.createElement('tr');
            tr.innerHTML =
                '<td><span class="channel-name"><span class="channel-dot" style="background:' + config.color + '"></span>' + config.name + '</span></td>' +
                '<td>' + formatNumber(impressions) + '</td>' +
                '<td class="funnel-arrow"><span class="funnel-rate">' + ctr + '</span></td>' +
                '<td>' + formatNumber(clicks) + '</td>' +
                '<td class="funnel-arrow"><span class="funnel-rate">' + lpCvr + '</span></td>' +
                '<td>' + formatNumber(leads) + '</td>' +
                '<td class="funnel-arrow"><span class="funnel-rate">' + trialCvr + '</span></td>' +
                '<td>' + formatNumber(customers) + '</td>';
            tbody.appendChild(tr);
        });

        // Total row
        var totalCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions * 100).toFixed(1) + '%' : '0%';
        var totalLpCvr = totals.clicks > 0 ? (totals.leads / totals.clicks * 100).toFixed(1) + '%' : '0%';
        var totalTrialCvr = totals.leads > 0 ? (totals.customers / totals.leads * 100).toFixed(1) + '%' : '0%';

        var totalTr = document.createElement('tr');
        totalTr.className = 'funnel-total-row';
        totalTr.innerHTML =
            '<td><span class="channel-name"><span class="channel-dot" style="background:var(--green-primary)"></span>Total</span></td>' +
            '<td>' + formatNumber(totals.impressions) + '</td>' +
            '<td class="funnel-arrow"><span class="funnel-rate">' + totalCtr + '</span></td>' +
            '<td>' + formatNumber(totals.clicks) + '</td>' +
            '<td class="funnel-arrow"><span class="funnel-rate">' + totalLpCvr + '</span></td>' +
            '<td>' + formatNumber(totals.leads) + '</td>' +
            '<td class="funnel-arrow"><span class="funnel-rate">' + totalTrialCvr + '</span></td>' +
            '<td>' + formatNumber(totals.customers) + '</td>';
        tbody.appendChild(totalTr);
    }

    // ===================================
    // RENDERING: Revenue Chart (Canvas)
    // ===================================

    function renderChart(allProjections, weeks) {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.parentElement.getBoundingClientRect();
        const width = rect.width;
        const height = 400;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, width, height);

        const padding = { top: 20, right: 30, bottom: 50, left: 70 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        // Calculate max MRR for y-axis
        let maxMRR = 0;
        const totalLine = [];
        for (let w = 0; w < weeks; w++) {
            let sum = 0;
            Object.values(allProjections).forEach(proj => {
                if (proj[w]) sum += proj[w].weeklyMRR;
            });
            totalLine.push(sum);
            if (sum > maxMRR) maxMRR = sum;
        }

        // Add buffer and round up
        maxMRR = Math.ceil(maxMRR / 10000) * 10000;
        if (maxMRR === 0) maxMRR = 10000;

        // Gridlines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartH / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Y-axis labels
            const val = maxMRR - (maxMRR / gridLines) * i;
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
        const labelInterval = weeks <= 12 ? 1 : weeks <= 20 ? 2 : 4;
        for (let w = 0; w < weeks; w += labelInterval) {
            const x = padding.left + (chartW / (weeks - 1)) * w;
            ctx.fillText('W' + (w + 1), x, height - padding.bottom + 10);
        }

        // Axis labels
        ctx.save();
        ctx.fillStyle = '#6b6b6b';
        ctx.font = '12px Inter Tight, sans-serif';
        ctx.textAlign = 'center';
        ctx.translate(15, padding.top + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Monthly Recurring Revenue', 0, 0);
        ctx.restore();

        // Draw channel lines
        const channelKeys = Object.keys(allProjections);

        channelKeys.forEach(key => {
            const proj = allProjections[key];
            const color = channelConfigs[key].color;

            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7;

            for (let w = 0; w < weeks; w++) {
                const x = padding.left + (chartW / (weeks - 1)) * w;
                const y = padding.top + chartH - (proj[w].weeklyMRR / maxMRR) * chartH;
                if (w === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        // Draw total line
        ctx.beginPath();
        ctx.strokeStyle = '#22aa6e';
        ctx.lineWidth = 3;

        for (let w = 0; w < weeks; w++) {
            const x = padding.left + (chartW / (weeks - 1)) * w;
            const y = padding.top + chartH - (totalLine[w] / maxMRR) * chartH;
            if (w === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Area fill under total
        ctx.beginPath();
        for (let w = 0; w < weeks; w++) {
            const x = padding.left + (chartW / (weeks - 1)) * w;
            const y = padding.top + chartH - (totalLine[w] / maxMRR) * chartH;
            if (w === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.lineTo(padding.left + chartW, padding.top + chartH);
        ctx.lineTo(padding.left, padding.top + chartH);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, 'rgba(34, 170, 110, 0.15)');
        gradient.addColorStop(1, 'rgba(34, 170, 110, 0.01)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // $100K target line
        const targetY = padding.top + chartH - (100000 / maxMRR) * chartH;
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
            ctx.fillText('$100K Target', width - padding.right, targetY - 4);
        }

        // Build legend
        const legendEl = document.getElementById('chartLegend');
        legendEl.innerHTML = '';
        channelKeys.forEach(key => {
            const item = document.createElement('div');
            item.className = 'chart-legend-item';
            item.innerHTML = '<span class="chart-legend-dot" style="background:' + channelConfigs[key].color + '"></span>' + channelConfigs[key].name;
            legendEl.appendChild(item);
        });
        const totalItem = document.createElement('div');
        totalItem.className = 'chart-legend-item';
        totalItem.innerHTML = '<span class="chart-legend-dot" style="background:#22aa6e"></span>Total MRR';
        legendEl.appendChild(totalItem);
    }

    // ===================================
    // RENDERING: Donut Chart (Canvas)
    // ===================================

    function renderDonut(channelMetrics) {
        const canvas = document.getElementById('donutChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 280;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, size, size);

        const cx = size / 2;
        const cy = size / 2;
        const outerR = 120;
        const innerR = 80;

        let totalSpend = 0;
        Object.values(channelMetrics).forEach(m => {
            totalSpend += m.weeklySpend;
        });

        if (totalSpend === 0) totalSpend = 1;

        let startAngle = -Math.PI / 2;

        const slices = [];
        Object.entries(channelMetrics).forEach(([key, m]) => {
            const pct = m.weeklySpend / totalSpend;
            const sweep = pct * Math.PI * 2;
            slices.push({ key, color: m.color, name: m.name, pct, startAngle, sweep, weeklySpend: m.weeklySpend });
            startAngle += sweep;
        });

        slices.forEach(s => {
            ctx.beginPath();
            ctx.arc(cx, cy, outerR, s.startAngle, s.startAngle + s.sweep);
            ctx.arc(cx, cy, innerR, s.startAngle + s.sweep, s.startAngle, true);
            ctx.closePath();
            ctx.fillStyle = s.color;
            ctx.fill();
        });

        // Update center
        const centerVal = document.querySelector('.donut-center-value');
        if (centerVal) {
            centerVal.textContent = formatCurrency(totalSpend * 4.33);
        }

        // Update legend
        const legendEl = document.getElementById('donutLegend');
        legendEl.innerHTML = '';
        slices.forEach(s => {
            const item = document.createElement('div');
            item.className = 'donut-legend-item';
            item.innerHTML =
                '<span class="donut-legend-left"><span class="donut-legend-dot" style="background:' + s.color + '"></span>' + s.name + '</span>' +
                '<span class="donut-legend-pct">' + Math.round(s.pct * 100) + '%</span>';
            legendEl.appendChild(item);
        });
    }

    // ===================================
    // RENDERING: Comparison Table
    // ===================================

    function renderComparisonTable(channelMetrics) {
        const tbody = document.getElementById('comparisonBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        Object.entries(channelMetrics).forEach(([key, m]) => {
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td><span class="channel-name"><span class="channel-dot" style="background:' + m.color + '"></span>' + m.name + '</span></td>' +
                '<td>' + formatCurrency(m.cac) + '</td>' +
                '<td>' + formatCurrency(m.ltv) + '</td>' +
                '<td>' + m.roas.toFixed(1) + 'x</td>' +
                '<td>' + m.newCustomers.toLocaleString() + '</td>' +
                '<td>' + formatCurrency(m.mrr) + '</td>';
            tbody.appendChild(tr);
        });
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
        document.querySelectorAll('.channel-input').forEach(input => {
            const channel = input.dataset.channel;
            const metric = input.dataset.metric;

            input.addEventListener('input', function () {
                const val = parseFloat(this.value);
                channelConfigs[channel][metric] = val;
                this.parentElement.querySelector('.slider-value').textContent = formatSliderValue(metric, val);

                // Remove active scenario
                document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));

                recalculate();
            });
        });

        // Global budget — scales all channel weekly spends proportionally
        const budgetSlider = document.getElementById('globalBudget');
        if (budgetSlider) {
            budgetSlider.addEventListener('input', function () {
                var newBudget = parseInt(this.value);
                var currentTotal = 0;
                Object.keys(channelConfigs).forEach(function (key) {
                    if (channelEnabled[key]) currentTotal += channelConfigs[key].weeklySpend * 4.33;
                });
                if (currentTotal === 0) currentTotal = 1;
                var ratio = newBudget / currentTotal;

                Object.keys(channelConfigs).forEach(function (key) {
                    if (!channelEnabled[key]) return;
                    var newSpend = Math.round(channelConfigs[key].weeklySpend * ratio / 1000) * 1000;
                    if (newSpend < 1000) newSpend = 1000;
                    channelConfigs[key].weeklySpend = newSpend;

                    var slider = document.querySelector('.channel-input[data-channel="' + key + '"][data-metric="weeklySpend"]');
                    if (slider) {
                        slider.value = newSpend;
                        slider.parentElement.querySelector('.slider-value').textContent = '$' + newSpend.toLocaleString();
                    }
                });

                globalBudget = newBudget;
                document.getElementById('globalBudgetValue').textContent = '$' + globalBudget.toLocaleString();
                recalculate();
            });
        }

        // Global horizon
        const horizonSelect = document.getElementById('globalHorizon');
        if (horizonSelect) {
            horizonSelect.addEventListener('change', function () {
                globalHorizon = parseInt(this.value);
                recalculate();
            });
        }

        // Global growth
        const growthSlider = document.getElementById('globalGrowth');
        if (growthSlider) {
            growthSlider.addEventListener('input', function () {
                globalGrowth = parseFloat(this.value);
                document.getElementById('globalGrowthValue').textContent = globalGrowth.toFixed(1) + '%';
                recalculate();
            });
        }
    }

    // ===================================
    // UI: Channel Tabs
    // ===================================

    function initTabs() {
        // Tab click — switch panel (ignore clicks on the toggle itself)
        document.querySelectorAll('.channel-tab').forEach(tab => {
            tab.addEventListener('click', function (e) {
                if (e.target.closest('.channel-toggle')) return;
                const channel = this.dataset.channel;

                document.querySelectorAll('.channel-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                document.querySelectorAll('.channel-panel').forEach(p => p.classList.remove('active'));
                document.getElementById('panel-' + channel).classList.add('active');
            });
        });

        // Toggle switches — enable/disable channels
        document.querySelectorAll('.channel-enabled').forEach(function (toggle) {
            toggle.addEventListener('change', function () {
                var channel = this.dataset.channel;
                channelEnabled[channel] = this.checked;
                var tab = this.closest('.channel-tab');
                if (this.checked) {
                    tab.classList.remove('disabled');
                } else {
                    tab.classList.add('disabled');
                }
                recalculate();
            });
        });
    }

    // ===================================
    // UI: Scenario Presets
    // ===================================

    function initScenarios() {
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const scenario = SCENARIOS[this.dataset.scenario];
                if (!scenario) return;

                document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Update global growth
                globalGrowth = scenario.globalGrowth;
                const growthSlider = document.getElementById('globalGrowth');
                if (growthSlider) {
                    growthSlider.value = globalGrowth;
                    document.getElementById('globalGrowthValue').textContent = globalGrowth.toFixed(1) + '%';
                }

                // Update channel configs and sliders
                Object.entries(scenario.channels).forEach(([channelKey, values]) => {
                    Object.entries(values).forEach(([metric, value]) => {
                        channelConfigs[channelKey][metric] = value;

                        const input = document.querySelector('.channel-input[data-channel="' + channelKey + '"][data-metric="' + metric + '"]');
                        if (input) {
                            input.value = value;
                            input.parentElement.querySelector('.slider-value').textContent = formatSliderValue(metric, value);
                        }
                    });
                });

                recalculate();
            });
        });
    }

    // ===================================
    // ICE FRAMEWORK
    // ===================================

    function initICE() {
        renderICETable();
    }

    function renderICETable() {
        const tbody = document.getElementById('iceBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        // Sort by total descending
        const sorted = [...ICE_ITEMS].sort((a, b) => (b.impact + b.confidence + b.ease) - (a.impact + a.confidence + a.ease));

        sorted.forEach((item, idx) => {
            const total = item.impact + item.confidence + item.ease;
            let tierClass = 'low';
            if (total >= 24) tierClass = 'high';
            else if (total >= 18) tierClass = 'medium';

            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td><div class="ice-initiative">' + item.initiative + '</div><div class="ice-initiative-desc">' + item.desc + '</div><div class="ice-rationale">' + item.rationale + '</div></td>' +
                '<td class="ice-score-cell"><input type="number" class="ice-score-input" min="1" max="10" value="' + item.impact + '" data-idx="' + ICE_ITEMS.indexOf(item) + '" data-field="impact"></td>' +
                '<td class="ice-score-cell"><input type="number" class="ice-score-input" min="1" max="10" value="' + item.confidence + '" data-idx="' + ICE_ITEMS.indexOf(item) + '" data-field="confidence"></td>' +
                '<td class="ice-score-cell"><input type="number" class="ice-score-input" min="1" max="10" value="' + item.ease + '" data-idx="' + ICE_ITEMS.indexOf(item) + '" data-field="ease"></td>' +
                '<td class="ice-total-cell ' + tierClass + '">' + total + '</td>';

            tbody.appendChild(tr);
        });

        // Bind ICE inputs
        tbody.querySelectorAll('.ice-score-input').forEach(input => {
            input.addEventListener('change', function () {
                let val = parseInt(this.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 10) val = 10;
                this.value = val;

                const idx = parseInt(this.dataset.idx);
                const field = this.dataset.field;
                ICE_ITEMS[idx][field] = val;

                renderICETable();
            });
        });
    }

    // ===================================
    // SCROLL REVEAL
    // ===================================

    function initScrollReveal() {
        const observer = new IntersectionObserver(function (entries) {
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
        const calcSection = document.getElementById('calculator');
        const pathBar = document.getElementById('pathBar');

        const pathObserver = new IntersectionObserver(function (entries) {
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

    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(recalculate, 200);
    });

    // ===================================
    // INIT
    // ===================================

    initSliders();
    initTabs();
    initScenarios();
    initICE();
    initScrollReveal();
    recalculate();

});
