#!/usr/bin/env node
// ===================================
// Calculator Verification Script
// Run: node verify-calculator.js
//
// Reproduces the exact same math from community-phone-assignment.js
// and prints week-by-week detail so every number can be hand-checked.
// ===================================

const SCENARIOS = {
    conservative: {
        label: 'Conservative',
        globalGrowth: 2,
        meta: { weeklySpend: 5600, cpm: 16, ctr: 0.7, lpCvr: 3.5, trialCvr: 8, churn: 6, avgRevenue: 55 }
    },
    base: {
        label: 'Base',
        globalGrowth: 5,
        meta: { weeklySpend: 5600, cpm: 14, ctr: 1.0, lpCvr: 5.0, trialCvr: 10, churn: 5, avgRevenue: 55 }
    },
    aggressive: {
        label: 'Aggressive',
        globalGrowth: 7,
        meta: { weeklySpend: 5600, cpm: 12, ctr: 1.2, lpCvr: 6.0, trialCvr: 13, churn: 4, avgRevenue: 55 }
    }
};

const HORIZON = 12;
const SPEND_CAP = 50000;

// Exact same function from community-phone-assignment.js
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
            weeklySpend,
            impressions,
            clicks,
            leads,
            newCustomers,
            activeCustomers,
            weeklyMRR,
            totalSpend,
            totalNewCustomers,
            monthlySpendEquiv: weeklySpend * 4.33,
            capped: spendCap && (config.weeklySpend * Math.pow(1 + growthRate / 100, w) * 4.33 > spendCap)
        });
    }

    return projections;
}

// Exact same function from community-phone-assignment.js
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
        ltvCacRatio,
        paybackMonths,
        totalActiveCustomers: Math.round(last.activeCustomers),
        totalSpend: last.totalSpend,
        totalNewCustomers: last.totalNewCustomers
    };
}

// ===================================
// Run verification for each scenario
// ===================================

function fmt(n) { return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtInt(n) { return Math.round(n).toLocaleString('en-US'); }

for (const [key, scenario] of Object.entries(SCENARIOS)) {
    const config = scenario.meta;
    const growth = scenario.globalGrowth;

    console.log('\n' + '='.repeat(100));
    console.log(`SCENARIO: ${scenario.label.toUpperCase()}`);
    console.log('='.repeat(100));
    console.log(`Inputs: Weekly Spend $${config.weeklySpend} | CPM $${config.cpm} | CTR ${config.ctr}% | LP CVR ${config.lpCvr}% | Trial ${config.trialCvr}% | Churn ${config.churn}%/mo | Revenue $${config.avgRevenue}/mo`);
    console.log(`Globals: Horizon ${HORIZON} weeks | WoW Growth ${growth}% | Spend Cap $${SPEND_CAP.toLocaleString()}/mo`);

    const weeklyChurn = 1 - Math.pow(1 - config.churn / 100, 1 / 4.33);
    console.log(`\nDerived: Weekly churn rate = ${(weeklyChurn * 100).toFixed(4)}% (from ${config.churn}% monthly, converted via 4.33 weeks/month)`);
    console.log(`         Formula: 1 - (1 - ${config.churn}/100)^(1/4.33) = 1 - ${(1 - config.churn / 100).toFixed(4)}^${(1/4.33).toFixed(6)}`);

    const projections = channelModel(config, HORIZON, growth, SPEND_CAP);

    console.log('\nWEEK-BY-WEEK DETAIL:');
    console.log('-'.repeat(100));
    console.log(
        'Wk'.padEnd(4) +
        'Spend'.padStart(10) +
        'Mo Equiv'.padStart(12) +
        'Cap?'.padStart(6) +
        'Impress'.padStart(12) +
        'Clicks'.padStart(10) +
        'Leads'.padStart(10) +
        'New Cust'.padStart(10) +
        'Active'.padStart(10) +
        'MRR'.padStart(12)
    );
    console.log('-'.repeat(100));

    for (const p of projections) {
        console.log(
            `W${p.week}`.padEnd(4) +
            `$${fmt(p.weeklySpend)}`.padStart(10) +
            `$${fmt(p.monthlySpendEquiv)}`.padStart(12) +
            (p.capped ? '  YES' : '   no').padStart(6) +
            fmtInt(p.impressions).padStart(12) +
            fmtInt(p.clicks).padStart(10) +
            fmt(p.leads).padStart(10) +
            fmt(p.newCustomers).padStart(10) +
            fmt(p.activeCustomers).padStart(10) +
            `$${fmt(p.weeklyMRR)}`.padStart(12)
        );
    }

    const metrics = calculateKeyMetrics(projections, config);
    const last = projections[projections.length - 1];

    console.log('-'.repeat(100));
    console.log('\nSUMMARY METRICS:');
    console.log(`  MRR at week ${HORIZON}:    $${fmt(metrics.totalMRR)}`);
    console.log(`  Total Spend:         $${fmt(metrics.totalSpend)}`);
    console.log(`  Total New Customers: ${fmt(metrics.totalNewCustomers)}`);
    console.log(`  Active Customers:    ${metrics.totalActiveCustomers}`);
    console.log(`  CAC:                 $${fmt(metrics.blendedCAC)}   (totalSpend / totalNewCustomers = ${fmt(metrics.totalSpend)} / ${fmt(metrics.totalNewCustomers)})`);
    console.log(`  LTV:                 $${fmt(metrics.blendedLTV)}   (avgRevenue / monthlyChurn = $${config.avgRevenue} / ${config.churn}% = $${config.avgRevenue} * ${(1/(config.churn/100)).toFixed(2)})`);
    console.log(`  LTV:CAC:             ${metrics.ltvCacRatio.toFixed(2)}x   ($${fmt(metrics.blendedLTV)} / $${fmt(metrics.blendedCAC)})`);
    console.log(`  Payback:             ${metrics.paybackMonths.toFixed(2)} months   ($${fmt(metrics.blendedCAC)} / $${config.avgRevenue})`);
    console.log(`  $5K MRR Target:      ${metrics.totalMRR >= 5000 ? 'HIT' : 'MISS'} (${((metrics.totalMRR / 5000) * 100).toFixed(1)}%)`);
}

console.log('\n' + '='.repeat(100));
console.log('FORMULA REFERENCE (for hand-checking any single week):');
console.log('='.repeat(100));
console.log('  weeklySpend     = baseWeeklySpend * (1 + growthRate/100)^weekIndex');
console.log('  monthlyEquiv    = weeklySpend * 4.33');
console.log('  if monthlyEquiv > spendCap → weeklySpend = spendCap / 4.33');
console.log('  impressions     = (weeklySpend / CPM) * 1000');
console.log('  clicks          = impressions * (CTR / 100)');
console.log('  leads           = clicks * (LP_CVR / 100)');
console.log('  newCustomers    = leads * (trialCvr / 100)');
console.log('  weeklyChurn     = 1 - (1 - monthlyChurn/100)^(1/4.33)');
console.log('  activeCustomers = prevActive * (1 - weeklyChurn) + newCustomers');
console.log('  MRR             = activeCustomers * avgRevenue');
console.log('  CAC             = totalSpend / totalNewCustomers');
console.log('  LTV             = avgRevenue / (monthlyChurn / 100)');
console.log('  LTV:CAC         = LTV / CAC');
console.log('  Payback         = CAC / avgRevenue');
console.log('');
