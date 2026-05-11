import { salesService } from '../services/sales.service.js';
import { PricingService } from '../services/pricing.service.js';
import { settingsService } from '../services/settings.service.js';

export class CatalogModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.searchTerm = '';
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('data:productsChanged', () => this.render());
        window.addEventListener('settings:changed', () => this.render());
    }

    render() {
        if (!this.container) return;

        const allProducts = salesService.cache.products || [];
        const discountTier = settingsService.discountTier;
        const includeRE = settingsService.includeRE;
        const tierLabel = `${(discountTier * 100).toFixed(0)}%`;

        // Filter
        let products = allProducts;
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            products = products.filter(p => 
                (p.name || '').toLowerCase().includes(term) ||
                (p.sku || '').toLowerCase().includes(term)
            );
        }

        // Calculate totals
        let totalMargin = 0;
        const productRows = products.map(p => {
            const retailPrice = parseFloat(p.price) || 0;
            const earnBase = parseFloat(p.basePrice) || 0;
            const category = p.taxType || 'internal';
            
            const baseImponible = PricingService.calculateBaseImponible(retailPrice, earnBase, discountTier);
            const costPrice = PricingService.calculateFinalPrice(baseImponible, category, includeRE);
            const margin = retailPrice - costPrice;
            totalMargin += margin;

            const marginPct = retailPrice > 0 ? ((margin / retailPrice) * 100).toFixed(0) : 0;

            return { ...p, retailPrice, costPrice, margin, marginPct, category };
        });

        const html = `
            <div class="fade-in">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1>Catálogo de Productos</h1>
                        <p>Precios al <strong style="color: var(--color-primary-dark);">${tierLabel}</strong> ${includeRE ? 'con RE' : 'sin RE'} · ${products.length} productos</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem;">
                        <button class="btn btn-secondary" id="btnUpdateCatalog"><i class="ph ph-upload-simple"></i> Importar</button>
                        <button class="btn btn-primary" id="btnNewProduct"><i class="ph ph-plus"></i> Producto</button>
                    </div>
                </header>

                <!-- Search -->
                <div style="margin-bottom: 1.25rem; position: relative; max-width: 400px;">
                    <i class="ph ph-magnifying-glass" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-faint);"></i>
                    <input type="text" id="catalogSearch" class="form-input" placeholder="Buscar por nombre o referencia..." 
                        style="padding-left: 2.25rem; width: 100%;" value="${this.searchTerm}">
                </div>
                
                <!-- Products Table -->
                <div class="bento-card" style="padding: 0; overflow: hidden;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>VP</th>
                                <th>PVP</th>
                                <th>Tu Precio</th>
                                <th>Margen</th>
                                <th style="text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productRows.length === 0 ? `
                                <tr><td colspan="6">
                                    <div class="empty-state">
                                        <i class="ph ph-package"></i>
                                        <h4>Catálogo vacío</h4>
                                        <p>${this.searchTerm ? 'Sin resultados para tu búsqueda' : 'Usa "Importar" para cargar los precios de Abril 2026 o añade productos manualmente.'}</p>
                                    </div>
                                </td></tr>
                            ` : productRows.map(p => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 550; font-size: 0.8125rem;">${p.name}</div>
                                        <div style="font-size: 0.6875rem; color: var(--color-text-faint); display: flex; gap: 0.5rem; align-items: center;">
                                            <span>Ref: ${p.sku || 'N/A'}</span>
                                            <span class="badge ${p.category === 'external' ? 'badge-info' : (p.category === 'literature' ? 'badge-neutral' : 'badge-primary')}" style="font-size: 0.5625rem;">
                                                ${p.category === 'external' ? 'SKIN' : (p.category === 'literature' ? 'LIT' : 'NUT')}
                                            </span>
                                        </div>
                                    </td>
                                    <td>${p.pv || 0}</td>
                                    <td>€${p.retailPrice.toFixed(2)}</td>
                                    <td style="font-weight: 600; color: var(--color-primary-dark);">€${p.costPrice.toFixed(2)}</td>
                                    <td>
                                        <span style="color: ${p.margin >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 500;">
                                            €${p.margin.toFixed(2)}
                                        </span>
                                        <span style="font-size: 0.6875rem; color: var(--color-text-faint); margin-left: 0.25rem;">(${p.marginPct}%)</span>
                                    </td>
                                    <td style="text-align: right;">
                                        <button class="btn btn-ghost btn-edit-product" data-id="${p.id}" style="padding: 0.375rem;"><i class="ph ph-pencil-simple"></i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                ${productRows.length > 0 ? `
                    <div style="margin-top: 1rem; padding: 1rem 1.25rem; background: var(--color-primary-light); border-radius: var(--radius-xl); border: 1px solid rgba(101, 163, 13, 0.15); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.8125rem; color: var(--color-primary-dark); font-weight: 500;">
                            <i class="ph ph-info"></i> Margen total del catálogo: <strong>€${totalMargin.toFixed(2)}</strong> (si vendieras 1 ud. de cada producto)
                        </span>
                    </div>
                ` : ''}
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
    }

    setupListeners() {
        // Search
        document.getElementById('catalogSearch')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.render();
        });

        // Import button
        document.getElementById('btnUpdateCatalog')?.addEventListener('click', () => {
            window.toast?.info('Importador de catálogo CSV/JSON próximamente. Los precios se calculan dinámicamente.');
        });

        // New product
        document.getElementById('btnNewProduct')?.addEventListener('click', () => {
            window.toast?.info('Formulario de nuevo producto próximamente.');
        });

        // Edit buttons
        document.querySelectorAll('.btn-edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                window.toast?.info(`Editor de producto (${id}) próximamente.`);
            });
        });
    }
}
