import { prospectService } from '../services/prospect.service.js';
import { salesService } from '../services/sales.service.js';

export class DashboardModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.charts = {};
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('data:prospectsChanged', () => this.render());
        window.addEventListener('data:transactionsChanged', () => this.render());
        window.addEventListener('data:customersChanged', () => this.render());
    }

    render() {
        if (!this.container) return;

        const prospects = prospectService.prospectsCache || [];
        const transactions = salesService.cache.transactions || [];
        
        const activeProspects = prospects.filter(p => p.estado !== 'Convertido' && p.estado !== 'Perdido').length;
        const salesTx = transactions.filter(t => t.type === 'sale');
        const totalSales = salesTx.reduce((acc, t) => acc + (Number(t.income) || 0), 0);
        const conversionRate = this.calculateConversionRate(prospects);

        const html = `
            <div class="fade-in">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div>
                        <h1>Visión General</h1>
                        <p>Métricas de rendimiento en tiempo real.</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn btn-secondary" id="btnRefreshDashboard"><i class="ph ph-arrows-clockwise"></i></button>
                        <button class="btn btn-primary" id="btnNewProspectDashboard"><i class="ph ph-plus"></i> Nuevo</button>
                    </div>
                </header>

                <div class="bento-grid">
                    <!-- KPI Cards -->
                    <div class="bento-card kpi-card">
                        <div class="kpi-label">Prospectos Activos <div class="kpi-icon blue"><i class="ph ph-users"></i></div></div>
                        <div class="kpi-value">${activeProspects}</div>
                        <div class="kpi-delta neutral"><i class="ph ph-trend-up"></i> Pipeline actual</div>
                    </div>

                    <div class="bento-card kpi-card">
                        <div class="kpi-label">Ventas Totales <div class="kpi-icon green"><i class="ph ph-currency-circle-dollar"></i></div></div>
                        <div class="kpi-value">€${totalSales.toLocaleString('es-ES', { minimumFractionDigits: 0 })}</div>
                        <div class="kpi-delta positive"><i class="ph ph-check"></i> ${salesTx.length} ventas</div>
                    </div>

                    <div class="bento-card kpi-card">
                        <div class="kpi-label">Conversión <div class="kpi-icon amber"><i class="ph ph-target"></i></div></div>
                        <div class="kpi-value">${conversionRate}%</div>
                        <div class="kpi-delta neutral"><i class="ph ph-users-three"></i> Prospectos a Clientes</div>
                    </div>

                    <!-- Chart: Sales Trend -->
                    <div class="bento-card bento-span-2">
                        <h3 style="margin-bottom: 1.25rem;">Tendencia de Ventas (6 meses)</h3>
                        <div style="height: 240px; width: 100%;">
                            <canvas id="salesTrendChart"></canvas>
                        </div>
                    </div>

                    <!-- Chart: Prospect States -->
                    <div class="bento-card">
                        <h3 style="margin-bottom: 1.25rem;">Distribución de Pipeline</h3>
                        <div style="height: 240px; width: 100%;">
                            <canvas id="prospectDistributionChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
        
        // Render charts after HTML is in DOM
        setTimeout(() => {
            this.renderSalesChart(transactions);
            this.renderProspectChart(prospects);
        }, 50);
    }

    renderSalesChart(transactions) {
        const ctx = document.getElementById('salesTrendChart');
        if (!ctx) return;

        // Group sales by month
        const monthlyData = {};
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
            months.push(key);
            monthlyData[key] = 0;
        }

        transactions.filter(t => t.type === 'sale').forEach(t => {
            const key = new Date(t.date).toLocaleString('es-ES', { month: 'short', year: '2-digit' });
            if (monthlyData[key] !== undefined) monthlyData[key] += Number(t.income) || 0;
        });

        if (this.charts.sales) this.charts.sales.destroy();

        this.charts.sales = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Ingresos (€)',
                    data: months.map(m => monthlyData[m]),
                    backgroundColor: 'rgba(101, 163, 13, 0.8)',
                    borderRadius: 6,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }

    renderProspectChart(prospects) {
        const ctx = document.getElementById('prospectDistributionChart');
        if (!ctx) return;

        const counts = {
            'Nuevos': prospects.filter(p => p.estado === 'Nuevo').length,
            'Seguimiento': prospects.filter(p => !['Nuevo', 'Convertido', 'Perdido'].includes(p.estado)).length,
            'Convertidos': prospects.filter(p => p.estado === 'Convertido').length,
            'Perdidos': prospects.filter(p => p.estado === 'Perdido').length
        };

        if (this.charts.prospects) this.charts.prospects.destroy();

        this.charts.prospects = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(counts),
                datasets: [{
                    data: Object.values(counts),
                    backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444'],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, padding: 15, font: { size: 11 } } }
                }
            }
        });
    }

    calculateConversionRate(prospects) {
        if (prospects.length === 0) return 0;
        const converted = prospects.filter(p => p.estado === 'Convertido').length;
        return Math.round((converted / prospects.length) * 100);
    }

    setupListeners() {
        document.getElementById('btnNewProspectDashboard')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('ui:openSlideOver', { detail: { type: 'newProspect' } }));
        });

        document.getElementById('btnRefreshDashboard')?.addEventListener('click', async () => {
            const btn = document.getElementById('btnRefreshDashboard');
            btn.innerHTML = '<div class="loader"></div>';
            await Promise.all([prospectService.fetchAll(), salesService.fetchAll()]);
            btn.innerHTML = '<i class="ph ph-arrows-clockwise"></i>';
        });
    }
}
