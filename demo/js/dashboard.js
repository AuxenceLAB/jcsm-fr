let charts = {};

// Clean up charts on page unload to prevent memory leaks
window.addEventListener("beforeunload", function() {
    Object.keys(charts).forEach(function(t) {
        if (charts[t]) {
            charts[t].destroy();
            delete charts[t];
        }
    });
});

function updateDashboard() {
    try {
        // Check admin access - hide dashboard tab for non-admins
        if (typeof technicien === 'undefined' || !technicien || !technicien.isAdmin) {
            var tabBtn = document.getElementById("dashboard-tab-button");
            if (tabBtn) tabBtn.style.display = "none";
            return;
        }

        var tabBtn2 = document.getElementById("dashboard-tab-button");
        if (tabBtn2) tabBtn2.style.display = "flex";

        // Validate data source exists
        if ("undefined" == typeof ALL_INTERVENTIONS || !ALL_INTERVENTIONS) return;

        var total = ALL_INTERVENTIONS.length;
        var done = ALL_INTERVENTIONS.filter(function(t) { return t.rapportFait; }).length;
        var todo = total - done;
        var success = ALL_INTERVENTIONS.filter(function(t) { return t.reussi; }).length;
        var successRate = done > 0 ? Math.round(success / done * 100) : 0;

        // Update KPI elements with null checks
        var kpiTotal = document.getElementById("kpi-total");
        if (kpiTotal) kpiTotal.textContent = total;

        var kpiDone = document.getElementById("kpi-done");
        if (kpiDone) kpiDone.textContent = done;

        var kpiTodo = document.getElementById("kpi-todo");
        if (kpiTodo) kpiTodo.textContent = todo;

        var kpiSuccess = document.getElementById("kpi-success-rate");
        if (kpiSuccess) kpiSuccess.textContent = successRate + "%";

        // Aggregate data by region
        var regions = {};
        var monthly = {};
        var delays = { "J+1": 0, Standard: 0, Urgent: 0 };

        ALL_INTERVENTIONS.forEach(function(t) {
            // Region aggregation
            if (t.region && "string" == typeof t.region) {
                regions[t.region] = (regions[t.region] || 0) + 1;
            }

            // Delay classification
            var sla = String(t.delais || "").toLowerCase();
            if (sla.includes("urgent") || "1" === sla) {
                delays.Urgent++;
            } else if (sla.includes("standard") || "5" === sla) {
                delays.Standard++;
            } else if (sla.includes("j+1") || "1" === sla) {
                delays["J+1"]++;
            } else {
                delays.Standard++;
            }

            // Monthly history
            if (t.dateDemande) {
                var d = new Date(t.dateDemande);
                if (!isNaN(d.getTime())) {
                    var key = d.toISOString().slice(0, 7);
                    monthly[key] = (monthly[key] || 0) + 1;
                }
            }
        });

        // Render charts
        renderChart("chart-progress", "doughnut", {
            labels: ["Realise", "A faire"],
            datasets: [{
                data: [done, todo],
                backgroundColor: ["#10B981", "#E5E7EB"],
                borderWidth: 0
            }]
        });

        var regionLabels = Object.keys(regions);
        if (regionLabels.length > 0) {
            renderChart("chart-regions", "bar", {
                labels: regionLabels,
                datasets: [{
                    label: "Interventions",
                    data: Object.values(regions),
                    backgroundColor: "#3B82F6",
                    borderRadius: 4
                }]
            });
        }

        var sortedMonths = Object.keys(monthly).sort();
        if (sortedMonths.length > 0) {
            renderChart("chart-history", "line", {
                labels: sortedMonths.map(function(t) {
                    var parts = t.split("-");
                    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1).toLocaleString("fr-FR", { month: "short", year: "2-digit" });
                }),
                datasets: [{
                    label: "Nouvelles Demandes",
                    data: sortedMonths.map(function(t) { return monthly[t]; }),
                    borderColor: "#8B5CF6",
                    tension: 0.4,
                    fill: true,
                    backgroundColor: "rgba(139, 92, 246, 0.1)"
                }]
            });
        }

        var delayLabels = Object.keys(delays);
        var delayData = Object.values(delays);
        var hasDelayData = delayData.some(function(v) { return v > 0; });
        if (hasDelayData) {
            renderChart("chart-delays", "pie", {
                labels: delayLabels,
                datasets: [{
                    data: delayData,
                    backgroundColor: ["#F59E0B", "#3B82F6", "#EF4444"],
                    borderWidth: 0
                }]
            });
        }
    } catch (t) {
        /* silent fail : dashboard update non-critical */
    }
}

function renderChart(id, type, data) {
    var canvas = document.getElementById(id);
    if (!canvas) return;

    // Destroy existing chart instance
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }

    // Only render if Chart.js is loaded
    if ("undefined" == typeof Chart) return;

    // Validate data has content
    if (!data || !data.datasets || !data.datasets.length) return;
    var hasData = data.datasets.some(function(ds) {
        return ds.data && ds.data.length > 0 && ds.data.some(function(v) { return v > 0; });
    });
    if (!hasData && (type === "doughnut" || type === "pie")) return;

    var options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: "rgba(0,0,0,.8)",
                titleFont: { size: 13, weight: "bold" },
                bodyFont: { size: 12 },
                padding: 10,
                cornerRadius: 8
            }
        }
    };

    // Add scales only for chart types that use them
    if (type === "bar" || type === "line") {
        options.scales = {
            y: {
                beginAtZero: true,
                grid: { borderDash: [2, 4], color: "rgba(0,0,0,.06)" },
                ticks: { font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 11 }, maxRotation: 45 }
            }
        };
    }

    try {
        charts[id] = new Chart(canvas, {
            type: type,
            data: data,
            options: options
        });
    } catch (e) {
        /* silent fail : chart render non-critical */
    }
}

window.updateDashboard = updateDashboard;
