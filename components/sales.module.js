import { salesService } from '../services/sales.service.js';

export class SalesModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('data:transactionsChanged', () => this.render());
        window.addEventListener('data:customersChanged', () => this.render());
    }

    render() {
        if (!this.container) return;

        const transactions = salesService.cache.transactions || [];
        const customers = salesService.cache.customers || [];
        
        let html = `
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.5rem; letter-spacing: -0.025em;">Ventas y Clientes</h1>
                    <p>Total: ${customers.length} clientes, ${transactions.length} operaciones</p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" id="btnNewCustomer"><i class="ph ph-user-plus"></i> Cliente</button>
                    <button class="btn btn-primary" id="btnNewTransaction"><i class="ph ph-plus"></i> Transacción</button>
                </div>
            </header>
            
            <div class="bento-grid">
                <!-- Transactions List (Span 2) -->
                <div class="bento-card bento-span-2">
                    <h3 style="font-size: 1rem; margin-bottom: 1rem;">Últimas Operaciones</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead style="border-bottom: 1px solid var(--color-border);">
                                <tr>
                                    <th style="padding: 0.75rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Fecha</th>
                                    <th style="padding: 0.75rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Tipo</th>
                                    <th style="padding: 0.75rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Ingreso</th>
                                    <th style="padding: 0.75rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Ganancia</th>
                                </tr>
                            </thead>
                            <tbody>
        `;

        const recentTransactions = [...transactions].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        if (recentTransactions.length === 0) {
            html += `<tr><td colspan="4" style="padding: 2rem 0; text-align: center; color: var(--color-text-muted);">No hay transacciones.</td></tr>`;
        } else {
            recentTransactions.forEach(t => {
                const isIncome = t.type === 'Ingreso' || t.type === 'Venta';
                const typeColor = isIncome ? 'var(--color-success)' : 'var(--color-danger)';
                const profitColor = t.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
                
                html += `
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 1rem 0;">${new Date(t.date || Date.now()).toLocaleDateString()}</td>
                        <td style="padding: 1rem 0;">
                            <span style="background: ${typeColor}20; color: ${typeColor}; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); font-size: 0.75rem; font-weight: 500;">
                                ${t.type}
                            </span>
                        </td>
                        <td style="padding: 1rem 0; font-weight: 500;">€${Number(t.income || 0).toFixed(2)}</td>
                        <td style="padding: 1rem 0; color: ${profitColor}; font-weight: 500;">€${Number(t.profit || 0).toFixed(2)}</td>
                    </tr>
                `;
            });
        }

        html += `
                            </tbody>
                        </table>
                    </div>
                    <button class="btn btn-secondary" style="width: 100%; margin-top: 1rem;">Ver todas</button>
                </div>

                <!-- Follow-ups Card -->
                <div class="bento-card">
                    <h3 style="font-size: 1rem; margin-bottom: 1rem;">Clientes (Recientes)</h3>
                    <ul style="list-style: none; display: flex; flex-direction: column; gap: 1rem;">
        `;

        const recentCustomers = [...customers].slice(0, 5); // Just taking first 5 for now
        
        if (recentCustomers.length === 0) {
            html += `<li style="text-align: center; color: var(--color-text-muted); padding: 1rem 0;">No hay clientes.</li>`;
        } else {
            recentCustomers.forEach(c => {
                html += `
                    <li style="display: flex; gap: 1rem; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border);">
                        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-bg-app); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600;">
                            ${c.name ? c.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 500; font-size: 0.875rem;">${c.name}</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-muted);">${c.phone || 'Sin teléfono'}</div>
                        </div>
                        <button class="btn btn-secondary btn-edit-customer" data-id="${c.id}" style="padding: 0.25rem;"><i class="ph ph-pencil-simple"></i></button>
                    </li>
                `;
            });
        }

        html += `
                    </ul>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
    }

    setupListeners() {
        document.getElementById('btnNewTransaction')?.addEventListener('click', () => {
            const event = new CustomEvent('ui:openSlideOver', { detail: { type: 'newTransaction' } });
            window.dispatchEvent(event);
        });

        document.getElementById('btnNewCustomer')?.addEventListener('click', () => {
            const event = new CustomEvent('ui:openSlideOver', { detail: { type: 'newCustomer' } });
            window.dispatchEvent(event);
        });
    }
}
