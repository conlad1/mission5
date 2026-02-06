// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.


$(function () {
    $("#calculate").on("click", function () {
        const raw = $("#hours").val();
        const hoursNum = Number(raw);

        if (raw.trim() === "" || !Number.isFinite(hoursNum) || hoursNum < 0) {
            alert("Enter a valid number of hours.");
            $("#hours").val("").focus();
            return;
        }

        const { cost, rate } = costRampToCapRepeating(hoursNum, 20, 300, 12);
        $("#cost").text(`$${cost.toFixed(2)} (rate: $${rate.toFixed(2)}/hr)`);
    });
});

// Find growth so that the starting marginal rate equals baseRate
function solveGrowthForBaseRate(baseRate, blockMaxCost, blockHours) {
    // At growth -> 0, start rate -> blockMaxCost/blockHours
    const maxPossibleBase = blockMaxCost / blockHours;
    if (baseRate >= maxPossibleBase) return 0; // can't be higher than 300/12 = 25 with this shape

    // Bisection on growth. As growth increases, start rate decreases.
    let lo = 0;
    let hi = 50; // plenty big
    for (let i = 0; i < 80; i++) {
        const mid = (lo + hi) / 2;
        const denom = Math.exp(mid) - 1;
        const startRate = (blockMaxCost * (mid / blockHours)) / denom;

        if (startRate > baseRate) lo = mid; // need bigger growth to lower the start rate
        else hi = mid;
    }
    return (lo + hi) / 2;
}

/**
 * Each 12-hour block starts at baseRate ($/hr) and ramps up (bigger jumps near the end),
 * reaching blockMaxCost exactly at blockHours. Repeats every block.
 *
 * Returns:
 *  - cost: total accumulated cost up to `hours`
 *  - rate: marginal $/hr at that moment (within the current block)
 */
function costRampToCapRepeating(hours, baseRate = 20, blockMaxCost = 300, blockHours = 12) {
    const h = Math.max(0, Number(hours) || 0);

    const fullBlocks = Math.floor(h / blockHours);
    const t = h - fullBlocks * blockHours; // hours into current block [0, blockHours)

    const completedCost = fullBlocks * blockMaxCost;

    // Solve growth so rate at the start of each block equals baseRate
    const growth = solveGrowthForBaseRate(baseRate, blockMaxCost, blockHours);

    // Normalized exponential (convex): costWithin(0)=0, costWithin(blockHours)=blockMaxCost
    if (growth === 0) {
        // linear fallback when baseRate hits the maximum possible (25/hr for 300/12)
        const costWithin = (blockMaxCost / blockHours) * t;
        const rate = blockMaxCost / blockHours;
        return { cost: completedCost + costWithin, rate };
    }

    const denom = Math.exp(growth) - 1;
    const x = (t / blockHours) * growth;

    const costWithin = blockMaxCost * (Math.exp(x) - 1) / denom;

    // Marginal rate ($/hr) at time t in the block
    const rate = (completedCost + costWithin) / hours;

    return { cost: completedCost + costWithin, rate };
}



