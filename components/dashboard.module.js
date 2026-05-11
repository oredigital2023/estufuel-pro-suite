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
        const customers = salesService.cache.customers || [];
        
        // Calculate metrics
        const activeProspects = prospects.filter(p => p.estado !== 'Convertido' && p.estado !== 'Perdido').length;
        const convertedCount = prospects.filter(p => p.estado === 'Convertido').length;
        const salesTx = transactions.filter(t => t.type === 'sale');
        const totalSales = salesTx.reduce((acc, t) => acc + (Number(t.income) || 0), 0);
        const totalProfit = salesTx.reduce((acc, t) => acc + (Number(t.profit) || 0), 0);
        const conversionRate = this.calculateConversionRate(prospects);

        // Recent activity
        const recentProspects = [...prospects].slice(0, 4);
        
        const html = `
            <div class="fade-in">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div>
                        <h1>Visión General</h1>
                        <p>Resumen de tu actividad y métricas clave.</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn btn-secondary" id="btnRefreshDashboard"><i class="ph ph-arrows-clockwise"></i> Actualizar</button>
                        <button class="btn btn-primary" id="btnNewProspectDashboard"><i class="ph ph-plus"></i> Prospecto</button>
                    </div>
                </header>

                <div class="bento-grid">
                    <!-- KPI: Prospectos Activos -->
                    <div class="bento-card kpi-card">
                        <div class="kpi-label">
                            Prospectos Activos
                            <div class="kpi-icon blue"><i class="ph ph-users"></i></div>
                        </div>
                        <div class="kpi-value">${activeProspects}</div>
                        <div class="kpi-delta neutral">
                            <i class="ph ph-chart-bar"></i>
                            En pipeline actual
                        </div>
                    </div>

                    <!-- KPI: Ventas Totales -->
                    <div class="bento-card kpi-card">
                        <div class="kpi-label">
                            Volumen de Ventas
                            <div class="kpi-icon green"><i class="ph ph-currency-circle-dollar"></i></div>
                        </div>
                        <div class="kpi-value">€${totalSales.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                        <div class="kpi-delta ${totalProfit >= 0 ? 'positive' : 'negative'}">
                            <i class="ph ph-trend-up"></i>
                            €${totalProfit.toFixed(2)} beneficio neto
                        </div>
                    </div>

                    <!-- KPI: Tasa de Conversión -->
                    <div class="bento-card kpi-card">
                        <div class="kpi-label">
                            Conversión
                            <div class="kpi-icon amber"><i class="ph ph-target"></i></div>
                        </div>
                        <div class="kpi-value">${conversionRate}%</div>
                        <div class="kpi-delta neutral">
                            <i class="ph ph-arrow-right"></i>
                            ${convertedCount} de ${prospects.length} convertidos
                        </div>
                    </div>

                    <!-- Funnel Visual -->
                    <div class="bento-card bento-span-2">
                        <h3 style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-funnel" style="color: var(--color-primary);"></i>
                            Embudo de Conversión
                        </h3>
                        ${this.renderFunnel(prospects)}
                    </div>

                    <!-- Recent Prospects -->
                    <div class="bento-card">
                        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-clock" style="color: var(--color-info);"></i>
                            Últimos Prospectos
                        </h3>
                        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem;">
                            ${recentProspects.length === 0 ? `
                                <li style="text-align: center; padding: 1.5rem 0; color: var(--color-text-faint); font-size: 0.875rem;">
                                    Sin prospectos registrados
                                </li>
                            ` : recentProspects.map(p => `
                                <li style="display: flex; gap: 0.75rem; align-items: center;">
                                    <div class="avatar avatar-primary">${(p.nombre_completo || '?').charAt(0).toUpperCase()}</div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-weight: 500; font-size: 0.8125rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nombre_completo || 'Sin nombre'}</div>
                                        <div style="font-size: 0.6875rem; color: var(--color-text-faint);">${p.origen || 'Sin origen'}</div>
                                    </div>
                                    <span class="badge ${this.getBadgeClass(p.estado)}">${p.estado || 'Nuevo'}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
    }

    renderFunnel(prospects) {
        const stages = [
            { label: 'Total Prospectos', count: prospects.length, color: 'blue' },
            { label: 'Contactados', count: prospects.filter(p => !['Nuevo'].includes(p.estado)).length, color: 'primary' },
            { label: 'Interesados / Citas', count: prospects.filter(p => ['Interesado', 'Cita Agendada', 'Asistió'].includes(p.estado)).length, color: 'amber' },
            { label: 'Convertidos', count: prospects.filter(p => p.estado === 'Convertido').length, color: 'green' },
        ];

        const max = Math.max(stages[0].count, 1);

        return stages.map(s => `
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.375rem;">
                    <span style="color: var(--color-text-secondary);">${s.label}</span>
                    <strong>${s.count}</strong>
                </div>
                <div class="progress-track">
                    <div class="progress-fill ${s.color}" style="width: ${(s.count / max) * 100}%;"></div>
                </div>
            </div>
        `).join('');
    }

    getBadgeClass(estado) {
        const map = {
            'Nuevo': 'badge-info',
            'Contactado': 'badge-info',
            'Interesado': 'badge-warning',
            'Cita Agendada': 'badge-warning',
            'Asistió': 'badge-primary',
            'Convertido': 'badge-success',
            'Perdido': 'badge-danger'
        };
        return map[estado] || 'badge-neutral';
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
            btn.disabled = true;
            try {
                await Promise.all([prospectService.fetchAll(), salesService.fetchAll()]);
                window.toast?.success('Datos actualizados');
            } catch(err) {
                window.toast?.error('Error al actualizar');
            }
            btn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Actualizar';
            btn.disabled = false;
        });
    }
}
