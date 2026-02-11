/**
 * JCSM Internal Portal - Dashboard Module
 * Gère l'affichage des graphiques (Chart.js) et le calcul des KPIs.
 */

let charts = {};

// ==========================================
// DASHBOARD LOGIC
// ==========================================

function updateDashboard() {
    // Vérification accès Admin (technicien est global pour l'instant)
    if (!technicien || !technicien.isAdmin) {
        const btn = document.getElementById('dashboard-tab-button');
        if (btn) btn.style.display = 'none';
        return;
    }

    const btn = document.getElementById('dashboard-tab-button');
    if (btn) btn.style.display = 'flex';

    // KPIs
    // ALL_INTERVENTIONS est global (defini dans interne.html)
    if (typeof ALL_INTERVENTIONS === 'undefined' || !ALL_INTERVENTIONS) return;
    const total = ALL_INTERVENTIONS.length;
    const done = ALL_INTERVENTIONS.filter(i => i.rapportFait).length;
    const todo = total - done;
    const success = ALL_INTERVENTIONS.filter(i => i.reussi).length;
    const successRate = done > 0 ? Math.round((success / done) * 100) : 0;

    const elTotal = document.getElementById('kpi-total');
    if (elTotal) elTotal.textContent = total;

    const elDone = document.getElementById('kpi-done');
    if (elDone) elDone.textContent = done;

    const elTodo = document.getElementById('kpi-todo');
    if (elTodo) elTodo.textContent = todo;

    const elSuccess = document.getElementById('kpi-success-rate');
    if (elSuccess) elSuccess.textContent = successRate + '%';

    // Data Prep
    const regions = {};
    const months = {};
    const delays = { 'J+1': 0, 'Standard': 0, 'Urgent': 0 };

    ALL_INTERVENTIONS.forEach(i => {
        // Regions
        if (i.region && typeof i.region === 'string') regions[i.region] = (regions[i.region] || 0) + 1;

        // Delays - Normalisation sommaire
        const del = String(i.delais || '').toLowerCase();
        if (del.includes('urgent') || del === '1') delays['Urgent']++;
        else if (del.includes('standard') || del === '5') delays['Standard']++;
        else if (del.includes('1')) delays['J+1']++;
        else delays['Standard']++; // Fallback

        // History (Date demande) — clé ISO pour tri chronologique
        if (i.dateDemande) {
            const date = new Date(i.dateDemande);
            if (!isNaN(date.getTime())) {
                const isoKey = date.toISOString().slice(0, 7); // "2024-01"
                months[isoKey] = (months[isoKey] || 0) + 1;
            }
        }
    });

    // 1. Chart Progress (Doughnut)
    renderChart('chart-progress', 'doughnut', {
        labels: ['Réalisé', 'À faire'],
        datasets: [{
            data: [done, todo],
            backgroundColor: ['#10B981', '#E5E7EB'],
            borderWidth: 0
        }]
    });

    // 2. Chart Regions (Bar)
    renderChart('chart-regions', 'bar', {
        labels: Object.keys(regions),
        datasets: [{
            label: 'Interventions',
            data: Object.values(regions),
            backgroundColor: '#3B82F6',
            borderRadius: 4
        }]
    });

    // 3. Chart History (Line) — tri chronologique par clé ISO
    const sortedMonthKeys = Object.keys(months).sort();
    const monthLabels = sortedMonthKeys.map(k => {
        const [y, m] = k.split('-');
        const d = new Date(parseInt(y), parseInt(m) - 1);
        return d.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
    });
    renderChart('chart-history', 'line', {
        labels: monthLabels,
        datasets: [{
            label: 'Nouvelles Demandes',
            data: sortedMonthKeys.map(k => months[k]),
            borderColor: '#8B5CF6',
            tension: 0.4,
            fill: true,
            backgroundColor: 'rgba(139, 92, 246, 0.1)'
        }]
    });

    // 4. Chart Delays (Pie)
    renderChart('chart-delays', 'pie', {
        labels: Object.keys(delays),
        datasets: [{
            data: Object.values(delays),
            backgroundColor: ['#F59E0B', '#3B82F6', '#EF4444'],
            borderWidth: 0
        }]
    });
}

function renderChart(id, type, data) {
    const ctx = document.getElementById(id);
    if (!ctx) return;

    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }

    // Chart global object from Chart.js CDN
    if (typeof Chart === 'undefined') {
        // Chart.js not loaded
        return;
    }

    charts[id] = new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                } // Added missing closing brace for legend object
            },
            scales: type === 'bar' || type === 'line' ? {
                y: {
                    beginAtZero: true,
                    grid: {
                        borderDash: [2, 4]
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            } : {} // No scales for pie/doughnut
        }
    });
}

// Expose global
window.updateDashboard = updateDashboard;
