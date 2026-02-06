// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.


document.addEventListener("DOMContentLoaded", () => {
    let hoursEl = document.getElementById("hours");
    let costEl = document.getElementById("cost");
    let calculate = document.getElementById("calculate");

    calculate.addEventListener("click", () => {
        const hoursNum = Number(hoursEl.value); // <-- read from input

        if (!Number.isFinite(hoursNum) || hoursNum < 0) {
            costEl.textContent = "Enter a valid number of hours.";
            return;
        }

        const rate = rateApproachMax(hoursNum, 20, 30, 12, 0.999); // <-- 0..1
        const cost = hoursNum * rate;

        costEl.textContent = `$${cost.toFixed(2)} (rate: $${rate.toFixed(2)}/hr)`;
    });
});

/**
 * Rate increases quickly early, then flattens and approaches maxRate.
 * By default, it's ~99% of the way to maxRate at 12 hours.
 */
function rateApproachMax(hours, baseRate, maxRate, plateauHours = 12, pctAtPlateau = 0.99) {
    const h = Math.max(0, hours);

    // Ensure pct is in a safe range (can't be 1 exactly)
    const pct = Math.min(0.999999, Math.max(0.000001, pctAtPlateau));

    // k chosen so that rate(plateauHours) ~= base + (max-base)*pct
    const k = -Math.log(1 - pct) / plateauHours;

    return baseRate + (maxRate - baseRate) * (1 - Math.exp(-k * h));
}
