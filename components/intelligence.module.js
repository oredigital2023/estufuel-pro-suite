import { prospectService } from '../services/prospect.service.js';
import { salesService } from '../services/sales.service.js';

export class IntelligenceModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.charts = {};
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('data:prospectsChanged', () => this.render());
        window.addEventListener('data:transactionsChanged', () => this.render());
    }

    render() {
        if (!this.container) return;

        const prospects = prospectService.prospectsCache || [];
        const transactions = salesService.cache.transactions || [];
        const customers = salesService.cache.customers || [];
        
        const retentionOpps = this.calculateRetentionOpportunities(transactions, customers);
        
        const html = `
            <div class="fade-in">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div>
                        <h1>Inteligencia de Negocio</h1>
                        <p>Análisis avanzado y herramientas de exportación.</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn btn-secondary" id="btnExportProspects"><i class="ph ph-users"></i> Exportar Prospectos</button>
                        <button class="btn btn-secondary" id="btnExportSales"><i class="ph ph-receipt"></i> Exportar Ventas</button>
                    </div>
                </header>
                
                <div class="bento-grid">
                    <!-- Retention Alerts -->
                    <div class="bento-card bento-span-2">
                        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-bell-ringing" style="color: var(--color-warning);"></i>
                            Alertas de Seguimiento
                        </h3>
                        <div id="retentionList" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${retentionOpps.length === 0 ? '<p style="color: var(--color-text-faint);">No hay alertas pendientes.</p>' : 
                                retentionOpps.map(opp => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--color-bg-app); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
                                    <div>
                                        <div style="font-weight: 500; font-size: 0.875rem;">${opp.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--color-text-faint);">${opp.detail}</div>
                                    </div>
                                    <a href="https://wa.me/${opp.phone.replace(/\D/g, '')}" target="_blank" class="btn btn-ghost" style="color: var(--color-success);"><i class="ph ph-whatsapp-logo"></i></a>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Origin Distribution Chart -->
                    <div class="bento-card">
                        <h3 style="margin-bottom: 1.25rem;">Eficacia por Origen</h3>
                        <div style="height: 250px;">
                            <canvas id="originChart"></canvas>
                        </div>
                    </div>

                    <!-- Projections Card -->
                    <div class="bento-card bento-span-3">
                        <h3 style="margin-bottom: 1rem;">Calculadora de Calificación (Proyección PV)</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div style="padding: 1rem; background: var(--color-primary-light); border-radius: var(--radius-lg);">
                                <div style="font-size: 0.75rem; color: var(--color-primary-dark); font-weight: 600;">Objetivo Supervisor (4000 PV)</div>
                                <div style="font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0;">${this.calculatePVProgress(transactions, 4000)}%</div>
                                <div class="progress-track"><div class="progress-fill primary" style="width: ${this.calculatePVProgress(transactions, 4000)}%"></div></div>
                            </div>
                            <div style="padding: 1rem; background: var(--color-info-light); border-radius: var(--radius-lg);">
                                <div style="font-size: 0.75rem; color: var(--color-info); font-weight: 600;">Objetivo P. Calificado (1000 PV/Mes)</div>
                                <div style="font-size: 1.5rem; font-weight: 700; margin: 0.5rem 0;">${this.calculatePVProgress(transactions, 1000, true)}%</div>
                                <div class="progress-track"><div class="progress-fill blue" style="width: ${this.calculatePVProgress(transactions, 1000, true)}%"></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
        
        setTimeout(() => this.renderOriginChart(prospects), 50);
    }

    renderOriginChart(prospects) {
        const ctx = document.getElementById('originChart');
        if (!ctx) return;

        const origins = {};
        prospects.forEach(p => {
            const o = p.origen || 'Otros';
            origins[o] = (origins[o] || 0) + 1;
        });

        if (this.charts.origin) this.charts.origin.destroy();

        this.charts.origin = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: Object.keys(origins),
                datasets: [{
                    data: Object.values(origins),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(101, 163, 13, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(139, 92, 246, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } } },
                scales: { r: { ticks: { display: false } } }
            }
        });
    }

    calculatePVProgress(transactions, target, currentMonthOnly = false) {
        let totalPV = 0;
        const now = new Date();
        
        transactions.forEach(t => {
            if (t.type === 'stock_purchase' || t.type === 'sale') {
                const tDate = new Date(t.date);
                if (currentMonthOnly && (tDate.getMonth() !== now.getMonth() || tDate.getFullYear() !== now.getFullYear())) {
                    return;
                }
                totalPV += Number(t.pv || 0);
            }
        });

        const progress = (totalPV / target) * 100;
        return Math.min(100, Math.round(progress));
    }

    calculateRetentionOpportunities(transactions, customers) {
        const now = new Date();
        return customers.map(c => {
            const lastTx = transactions
                .filter(t => t.customerId === c.id && t.type === 'sale')
                .sort((a,b) => new Date(b.date) - new Date(a.date))[0];
            
            if (!lastTx) return { name: c.name, phone: c.phone || '', detail: 'Sin compras aún', days: 999 };
            
            const days = Math.floor((now - new Date(lastTx.date)) / (1000 * 60 * 60 * 24));
            if (days >= 25) return { name: c.name, phone: c.phone || '', detail: `Última compra hace ${days} días`, days };
            return null;
        }).filter(Boolean).sort((a,b) => b.days - a.days).slice(0, 5);
    }

    setupListeners() {
        document.getElementById('btnExportProspects')?.addEventListener('click', () => {
            this.exportToCSV(prospectService.prospectsCache, 'prospectos_estufuel.csv');
        });

        document.getElementById('btnExportSales')?.addEventListener('click', () => {
            this.exportToCSV(salesService.cache.transactions, 'ventas_estufuel.csv');
        });
    }

    exportToCSV(data, filename) {
        if (!data || !data.length) {
            window.toast?.warning('No hay datos para exportar');
            return;
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => 
            Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
        );
        
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.toast?.success('Archivo exportado correctamente');
    }
}
