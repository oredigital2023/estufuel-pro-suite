import { prospectService } from '../services/prospect.service.js';
import { salesService } from '../services/sales.service.js';

export class DashboardModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
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
        
        // Calculate metrics
        const activeProspects = prospects.filter(p => p.estado !== 'Convertido' && p.estado !== 'Perdido').length;
        const totalSales = transactions.filter(t => t.type === 'Ingreso' || t.type === 'Venta').reduce((acc, t) => acc + (Number(t.income) || 0), 0);
        
        const html = `
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.5rem; letter-spacing: -0.025em;">Visión General</h1>
                    <p>Resumen de tu actividad reciente.</p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-primary" id="btnNewProspectDashboard"><i class="ph ph-plus"></i> Nuevo Prospecto</button>
                </div>
            </header>

            <div class="bento-grid">
                <!-- KPI Card 1 -->
                <div class="bento-card">
                    <div style="display: flex; justify-content: space-between; color: var(--color-text-muted); margin-bottom: 1rem;">
                        <span style="font-weight: 500; font-size: 0.875rem;">Prospectos Activos</span>
                        <i class="ph ph-users" style="color: var(--color-info); font-size: 1.25rem;"></i>
                    </div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--color-text-main);">${activeProspects}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem;">En pipeline actual</div>
                </div>

                <!-- KPI Card 2 -->
                <div class="bento-card">
                    <div style="display: flex; justify-content: space-between; color: var(--color-text-muted); margin-bottom: 1rem;">
                        <span style="font-weight: 500; font-size: 0.875rem;">Volumen de Ventas</span>
                        <i class="ph ph-currency-circle-dollar" style="color: var(--color-success); font-size: 1.25rem;"></i>
                    </div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--color-text-main);">€${totalSales.toFixed(2)}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem;">Total histórico</div>
                </div>

                <!-- KPI Card 3 -->
                <div class="bento-card">
                    <div style="display: flex; justify-content: space-between; color: var(--color-text-muted); margin-bottom: 1rem;">
                        <span style="font-weight: 500; font-size: 0.875rem;">Eficacia de Cierre</span>
                        <i class="ph ph-target" style="color: var(--color-warning); font-size: 1.25rem;"></i>
                    </div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--color-text-main);">${this.calculateConversionRate(prospects)}%</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.5rem;">Prospectos a Clientes</div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
    }

    calculateConversionRate(prospects) {
        if(prospects.length === 0) return 0;
        const converted = prospects.filter(p => p.estado === 'Convertido').length;
        return Math.round((converted / prospects.length) * 100);
    }

    setupListeners() {
        document.getElementById('btnNewProspectDashboard')?.addEventListener('click', () => {
            // Future: trigger slide over from prospect module
            const event = new CustomEvent('ui:openSlideOver', { detail: { type: 'newProspect' } });
            window.dispatchEvent(event);
        });
    }
}
