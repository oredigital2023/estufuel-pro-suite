import { salesService } from '../services/sales.service.js';
import { pricingService } from '../services/pricing.service.js';
import { settingsService } from '../services/settings.service.js';

export class CatalogModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('data:productsChanged', () => this.render());
        window.addEventListener('settings:changed', () => this.render());
    }

    render() {
        if (!this.container) return;

        const products = salesService.cache.products || [];
        const discountTier = settingsService.discountTier;
        const includeRE = settingsService.includeRE;
        
        let html = `
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.5rem; letter-spacing: -0.025em;">Catálogo de Productos</h1>
                    <p>Precios calculados al <strong>${(discountTier * 100).toFixed(0)}%</strong> ${includeRE ? 'con RE' : 'sin RE'}</p>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" id="btnUpdateCatalog"><i class="ph ph-upload-simple"></i> Actualizar Listado</button>
                    <button class="btn btn-primary" id="btnNewProduct"><i class="ph ph-plus"></i> Nuevo</button>
                </div>
            </header>
            
            <div class="bento-card" style="width: 100%;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead style="border-bottom: 1px solid var(--color-border);">
                            <tr>
                                <th style="padding: 1rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Producto</th>
                                <th style="padding: 1rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">VP</th>
                                <th style="padding: 1rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">PVP (Venta)</th>
                                <th style="padding: 1rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Costo (Tu Precio)</th>
                                <th style="padding: 1rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Margen Bruto</th>
                                <th style="padding: 1rem 0; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem; text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        if (products.length === 0) {
            html += `<tr><td colspan="6" style="padding: 3rem 0; text-align: center; color: var(--color-text-muted);">No hay productos en el catálogo. Usa el botón "Actualizar Listado" para cargar los precios de 2026.</td></tr>`;
        } else {
            products.forEach(p => {
                const retailPrice = parseFloat(p.price) || 0;
                const earnBase = parseFloat(p.basePrice) || 0;
                const category = p.taxType || 'internal'; // 'internal', 'external', 'literature'
                
                // NEW Logic 2026
                const baseImponible = pricingService.constructor.calculateBaseImponible(retailPrice, earnBase, discountTier);
                const costPrice = pricingService.constructor.calculateFinalPrice(baseImponible, category, includeRE);
                const margin = retailPrice - costPrice;
                
                html += `
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 1.25rem 0;">
                            <div style="font-weight: 600; font-size: 0.875rem;">${p.name}</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-muted);">Ref: ${p.sku || 'N/A'}</div>
                        </td>
                        <td style="padding: 1.25rem 0; font-size: 0.875rem;">${p.pv || 0}</td>
                        <td style="padding: 1.25rem 0; font-size: 0.875rem;">€${retailPrice.toFixed(2)}</td>
                        <td style="padding: 1.25rem 0; font-weight: 600; color: var(--color-primary-dark); font-size: 0.875rem;">€${costPrice.toFixed(2)}</td>
                        <td style="padding: 1.25rem 0; font-size: 0.875rem; color: var(--color-success);">€${margin.toFixed(2)}</td>
                        <td style="padding: 1.25rem 0; text-align: right;">
                            <button class="btn btn-secondary btn-edit-product" data-id="${p.id}" style="padding: 0.4rem;"><i class="ph ph-pencil-simple"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
    }

    setupListeners() {
        document.getElementById('btnUpdateCatalog')?.addEventListener('click', () => {
            alert('Función de carga masiva de PDF/CSV 2026 en desarrollo. Por ahora, los precios se calculan dinámicamente sobre la base de datos existente.');
        });

        document.querySelectorAll('.btn-edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                alert(`Editar producto ${id}`);
            });
        });
    }
}
