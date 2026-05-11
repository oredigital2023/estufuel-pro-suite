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
        
        let html = `
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.5rem; letter-spacing: -0.025em;">Inteligencia de Negocio</h1>
                    <p>Análisis predictivo y retención.</p>
                </div>
                <button class="btn btn-secondary"><i class="ph ph-export"></i> Exportar Datos</button>
            </header>
            
            <div class="bento-grid">
                <!-- Retention Alert Card -->
                <div class="bento-card bento-span-2" style="background: linear-gradient(to right, var(--color-bg-panel), var(--color-primary-light)); border-left: 4px solid var(--color-primary);">
                    <h3 style="font-size: 1rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-bell-ringing" style="color: var(--color-primary);"></i> Oportunidades de Recompra
                    </h3>
                    <p style="font-size: 0.875rem; color: var(--color-text-muted); margin-bottom: 1rem;">Clientes que compraron hace más de 25 días y no han repuesto.</p>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;" id="retentionList">
                        <!-- Calculated dynamically -->
                    </ul>
                </div>

                <!-- Conversion Funnel -->
                <div class="bento-card">
                    <h3 style="font-size: 1rem; margin-bottom: 1rem;">Embudo de Conversión</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.25rem;">
                                <span>Total Prospectos</span>
                                <strong>${prospects.length}</strong>
                            </div>
                            <div style="height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: 100%; background: var(--color-info);"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.25rem;">
                                <span>Evaluación Nutricional</span>
                                <strong>${prospects.filter(p => p.estado !== 'Nuevo').length}</strong>
                            </div>
                            <div style="height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${prospects.length ? (prospects.filter(p => p.estado !== 'Nuevo').length / prospects.length) * 100 : 0}%; background: var(--color-warning);"></div>
                            </div>
                        </div>
                        <div>
                            <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 0.25rem;">
                                <span>Convertidos a Clientes</span>
                                <strong>${prospects.filter(p => p.estado === 'Convertido').length}</strong>
                            </div>
                            <div style="height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden;">
                                <div style="height: 100%; width: ${prospects.length ? (prospects.filter(p => p.estado === 'Convertido').length / prospects.length) * 100 : 0}%; background: var(--color-success);"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.calculateRetention(transactions);
    }

    calculateRetention(transactions) {
        const retentionList = document.getElementById('retentionList');
        if(!retentionList) return;

        // Simple mock algorithm for retention
        // In a real scenario, this would cross-reference customers with transactions
        const mockOpportunities = [
            { name: 'Ana García', lastPurchase: 'hace 28 días', product: 'Batido F1' },
            { name: 'Luis Pérez', lastPurchase: 'hace 31 días', product: 'Aloe + Té' }
        ];

        let html = '';
        mockOpportunities.forEach(opp => {
            html += `
                <li style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--color-bg-panel); border: 1px solid var(--color-border); border-radius: var(--radius-sm);">
                    <div>
                        <div style="font-weight: 500; font-size: 0.875rem;">${opp.name}</div>
                        <div style="font-size: 0.75rem; color: var(--color-text-muted);">${opp.product} - ${opp.lastPurchase}</div>
                    </div>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;"><i class="ph ph-whatsapp-logo"></i> Contactar</button>
                </li>
            `;
        });
        
        if(mockOpportunities.length === 0) {
             html = `<li style="font-size: 0.875rem; color: var(--color-text-muted);">Todo al día. No hay seguimientos pendientes.</li>`;
        }

        retentionList.innerHTML = html;
    }
}
