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

        // Metrics
        const salesTx = transactions.filter(t => t.type === 'sale');
        const totalIncome = salesTx.reduce((a, t) => a + (Number(t.income) || 0), 0);
        const totalProfit = salesTx.reduce((a, t) => a + (Number(t.profit) || 0), 0);
        const expenseTx = transactions.filter(t => t.type === 'other_expense' || t.type === 'stock_purchase');
        const totalExpenses = expenseTx.reduce((a, t) => a + (Number(t.income) || Number(t.expense) || 0), 0);

        const typeLabels = { sale: 'Venta', personal: 'Consumo', sample: 'Muestra', stock_purchase: 'Compra Stock', other_expense: 'Gasto' };
        const typeBadge = { sale: 'badge-success', personal: 'badge-info', sample: 'badge-warning', stock_purchase: 'badge-primary', other_expense: 'badge-danger' };
        
        const recentTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
        const recentCustomers = [...customers].slice(0, 6);

        const html = `
            <div class="fade-in">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1>Ventas y Clientes</h1>
                        <p>${customers.length} clientes · ${transactions.length} operaciones</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn btn-secondary" id="btnNewCustomer"><i class="ph ph-user-plus"></i> Cliente</button>
                        <button class="btn btn-primary" id="btnNewTransaction"><i class="ph ph-plus"></i> Operación</button>
                    </div>
                </header>

                <!-- KPI Row -->
                <div class="bento-grid" style="margin-bottom: 1.25rem;">
                    <div class="bento-card kpi-card">
                        <div class="kpi-label">
                            Ingresos
                            <div class="kpi-icon green"><i class="ph ph-arrow-up-right"></i></div>
                        </div>
                        <div class="kpi-value">€${totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 0 })}</div>
                        <div class="kpi-delta positive"><i class="ph ph-chart-line-up"></i> ${salesTx.length} ventas</div>
                    </div>
                    <div class="bento-card kpi-card">
                        <div class="kpi-label">
                            Beneficio Neto
                            <div class="kpi-icon ${totalProfit >= 0 ? 'green' : 'red'}"><i class="ph ph-coins"></i></div>
                        </div>
                        <div class="kpi-value" style="color: ${totalProfit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'};">€${totalProfit.toFixed(2)}</div>
                        <div class="kpi-delta neutral"><i class="ph ph-percent"></i> Margen sobre ventas</div>
                    </div>
                    <div class="bento-card kpi-card">
                        <div class="kpi-label">
                            Gastos / Stock
                            <div class="kpi-icon red"><i class="ph ph-arrow-down-right"></i></div>
                        </div>
                        <div class="kpi-value">€${totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 0 })}</div>
                        <div class="kpi-delta neutral"><i class="ph ph-receipt"></i> ${expenseTx.length} operaciones</div>
                    </div>
                </div>

                <div class="bento-grid">
                    <!-- Transactions List -->
                    <div class="bento-card bento-span-2" style="padding: 0; overflow: hidden;">
                        <div style="padding: 1.25rem 1.25rem 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-list-checks" style="color: var(--color-primary);"></i>
                            <h3>Últimas Operaciones</h3>
                        </div>
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Tipo</th>
                                    <th>Ingreso</th>
                                    <th>Ganancia</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${recentTx.length === 0 ? `
                                    <tr><td colspan="4">
                                        <div class="empty-state" style="padding: 2rem;">
                                            <i class="ph ph-receipt"></i>
                                            <p>No hay transacciones registradas</p>
                                        </div>
                                    </td></tr>
                                ` : recentTx.map(t => {
                                    const profitColor = (t.profit || 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
                                    const displayIncome = t.type === 'other_expense' ? -(Number(t.expense) || Number(t.income) || 0) : (Number(t.income) || 0);
                                    return `
                                    <tr>
                                        <td>${new Date(t.date || Date.now()).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</td>
                                        <td><span class="badge ${typeBadge[t.type] || 'badge-neutral'}">${typeLabels[t.type] || t.type}</span></td>
                                        <td style="font-weight: 500;">€${Number(displayIncome).toFixed(2)}</td>
                                        <td style="color: ${profitColor}; font-weight: 500;">€${Number(t.profit || 0).toFixed(2)}</td>
                                    </tr>
                                `}).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Customers Card -->
                    <div class="bento-card">
                        <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-address-book" style="color: var(--color-info);"></i>
                            Clientes
                        </h3>
                        <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.625rem;">
                            ${recentCustomers.length === 0 ? `
                                <li class="empty-state" style="padding: 1.5rem 0;">
                                    <i class="ph ph-user-circle" style="font-size: 2rem;"></i>
                                    <p>Sin clientes registrados</p>
                                </li>
                            ` : recentCustomers.map(c => `
                                <li style="display: flex; gap: 0.75rem; align-items: center; padding-bottom: 0.5rem; border-bottom: 1px solid var(--color-border-subtle);">
                                    <div class="avatar avatar-neutral">${c.name ? c.name.charAt(0).toUpperCase() : '?'}</div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-weight: 500; font-size: 0.8125rem;">${c.name}</div>
                                        <div style="font-size: 0.6875rem; color: var(--color-text-faint);">${c.phone || 'Sin teléfono'}</div>
                                    </div>
                                    <button class="btn btn-ghost btn-edit-customer" data-id="${c.id}" style="padding: 0.25rem;"><i class="ph ph-pencil-simple"></i></button>
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

    setupListeners() {
        document.getElementById('btnNewTransaction')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('ui:openSlideOver', { detail: { type: 'newTransaction' } }));
        });

        document.getElementById('btnNewCustomer')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('ui:openSlideOver', { detail: { type: 'newCustomer' } }));
        });

        document.querySelectorAll('.btn-edit-customer').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const customer = salesService.cache.customers.find(c => c.id === id);
                if (customer) {
                    window.dispatchEvent(new CustomEvent('ui:openSlideOver', { detail: { type: 'editCustomer', data: customer } }));
                }
            });
        });
    }
}
