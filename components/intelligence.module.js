import { prospectService } from '../services/prospect.service.js';
import { salesService } from '../services/sales.service.js';

export class IntelligenceModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
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
        
        // Calculate real retention data
        const retentionOpps = this.calculateRetentionOpportunities(transactions, customers);
        
        // Pipeline by origin
        const originCounts = {};
        prospects.forEach(p => {
            const origin = p.origen || 'Sin origen';
            originCounts[origin] = (originCounts[origin] || 0) + 1;
        });
        const originEntries = Object.entries(originCounts).sort((a, b) => b[1] - a[1]);

        // Lost analysis
        const lostProspects = prospects.filter(p => p.estado === 'Perdido');
        const activeProspects = prospects.filter(p => !['Convertido', 'Perdido'].includes(p.estado));
        
        // Sales velocity
        const salesTx = transactions.filter(t => t.type === 'sale');
        const avgTicket = salesTx.length > 0 
            ? salesTx.reduce((a, t) => a + (Number(t.income) || 0), 0) / salesTx.length 
            : 0;

        const html = `
            <div class="fade-in">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1>Inteligencia de Negocio</h1>
                        <p>Análisis predictivo, retención y rendimiento del pipeline.</p>
                    </div>
                    <button class="btn btn-secondary" id="btnExportData"><i class="ph ph-export"></i> Exportar</button>
                </header>
                
                <div class="bento-grid">
                    <!-- Retention Alert Card -->
                    <div class="bento-card bento-span-2" style="border-left: 3px solid var(--color-warning);">
                        <h3 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-bell-ringing" style="color: var(--color-warning);"></i>
                            Oportunidades de Recompra
                        </h3>
                        <p style="margin-bottom: 1rem;">Clientes sin actividad reciente que pueden necesitar seguimiento.</p>
                        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;" id="retentionList">
                            ${retentionOpps.length === 0 ? `
                                <li style="font-size: 0.875rem; color: var(--color-success); display: flex; align-items: center; gap: 0.5rem; padding: 1rem 0;">
                                    <i class="ph ph-check-circle"></i>
                                    Todo al día. No hay seguimientos pendientes.
                                </li>
                            ` : retentionOpps.map(opp => `
                                <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--color-bg-app); border: 1px solid var(--color-border); border-radius: var(--radius-lg);">
                                    <div style="display: flex; gap: 0.75rem; align-items: center;">
                                        <div class="avatar avatar-neutral">${opp.name.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div style="font-weight: 500; font-size: 0.8125rem;">${opp.name}</div>
                                            <div style="font-size: 0.6875rem; color: var(--color-text-faint);">${opp.detail}</div>
                                        </div>
                                    </div>
                                    ${opp.phone ? `
                                        <a href="https://wa.me/${opp.phone.replace(/\D/g, '')}" target="_blank" class="btn btn-ghost" style="padding: 0.375rem; color: var(--color-success);">
                                            <i class="ph ph-whatsapp-logo"></i>
                                        </a>
                                    ` : ''}
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <!-- Quick Stats -->
                    <div class="bento-card">
                        <h3 style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-chart-pie" style="color: var(--color-info);"></i>
                            Métricas Rápidas
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.8125rem; color: var(--color-text-muted);">Ticket Medio</span>
                                <strong style="font-size: 1.125rem;">€${avgTicket.toFixed(2)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.8125rem; color: var(--color-text-muted);">En seguimiento</span>
                                <strong>${activeProspects.length}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.8125rem; color: var(--color-text-muted);">Perdidos</span>
                                <strong style="color: var(--color-danger);">${lostProspects.length}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 0.8125rem; color: var(--color-text-muted);">Total clientes</span>
                                <strong>${customers.length}</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Conversion Funnel -->
                    <div class="bento-card bento-span-2">
                        <h3 style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-funnel" style="color: var(--color-primary);"></i>
                            Embudo Detallado
                        </h3>
                        ${this.renderDetailedFunnel(prospects)}
                    </div>

                    <!-- Origin Analysis -->
                    <div class="bento-card">
                        <h3 style="margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-map-pin" style="color: var(--color-warning);"></i>
                            Origen de Prospectos
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${originEntries.length === 0 ? `
                                <p style="font-size: 0.875rem; color: var(--color-text-faint); text-align: center; padding: 1rem 0;">Sin datos de origen</p>
                            ` : originEntries.map(([origin, count]) => {
                                const pct = prospects.length > 0 ? ((count / prospects.length) * 100).toFixed(0) : 0;
                                return `
                                <div>
                                    <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.25rem;">
                                        <span style="color: var(--color-text-secondary);">${origin}</span>
                                        <span style="font-weight: 600;">${count} <span style="color: var(--color-text-faint); font-weight: 400;">(${pct}%)</span></span>
                                    </div>
                                    <div class="progress-track">
                                        <div class="progress-fill primary" style="width: ${pct}%;"></div>
                                    </div>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
    }

    renderDetailedFunnel(prospects) {
        const stages = [
            { label: 'Nuevos', estado: 'Nuevo', color: 'blue', icon: 'ph-user-plus' },
            { label: 'Contactados', estado: 'Contactado', color: 'blue', icon: 'ph-chat-circle' },
            { label: 'Interesados', estado: 'Interesado', color: 'amber', icon: 'ph-star' },
            { label: 'Cita Agendada', estado: 'Cita Agendada', color: 'amber', icon: 'ph-calendar' },
            { label: 'Asistió', estado: 'Asistió', color: 'primary', icon: 'ph-check' },
            { label: 'Convertidos', estado: 'Convertido', color: 'green', icon: 'ph-crown' },
        ];

        const max = Math.max(prospects.length, 1);

        return `<div style="display: flex; flex-direction: column; gap: 0.875rem;">
            ${stages.map(s => {
                const count = prospects.filter(p => p.estado === s.estado).length;
                return `
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8125rem; margin-bottom: 0.25rem;">
                        <span style="display: flex; align-items: center; gap: 0.375rem; color: var(--color-text-secondary);">
                            <i class="ph ${s.icon}" style="font-size: 0.875rem;"></i>
                            ${s.label}
                        </span>
                        <strong>${count}</strong>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill ${s.color}" style="width: ${(count / max) * 100}%;"></div>
                    </div>
                </div>
            `}).join('')}
        </div>`;
    }

    calculateRetentionOpportunities(transactions, customers) {
        if (customers.length === 0) return [];
        
        const now = new Date();
        const opportunities = [];

        customers.forEach(customer => {
            // Find last transaction for this customer
            const customerTx = transactions
                .filter(t => t.customerId === customer.id && t.type === 'sale')
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            if (customerTx.length > 0) {
                const lastDate = new Date(customerTx[0].date);
                const daysSince = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
                
                if (daysSince >= 25) {
                    opportunities.push({
                        name: customer.name,
                        phone: customer.phone || '',
                        detail: `Última compra hace ${daysSince} días`,
                        daysSince
                    });
                }
            } else {
                // Customer with no sales - might need first contact
                opportunities.push({
                    name: customer.name,
                    phone: customer.phone || '',
                    detail: 'Sin compras registradas',
                    daysSince: 999
                });
            }
        });

        return opportunities.sort((a, b) => b.daysSince - a.daysSince).slice(0, 8);
    }

    setupListeners() {
        document.getElementById('btnExportData')?.addEventListener('click', () => {
            window.toast?.info('Exportación de datos próximamente.');
        });
    }
}
