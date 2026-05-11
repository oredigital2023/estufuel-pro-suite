import { salesService } from '../services/sales.service.js';
import { PricingService } from '../services/pricing.service.js';
import { settingsService } from '../services/settings.service.js';
import { HERBALIFE_CATALOG_2026 } from '../data/herbalife-catalog-2026.js';

export class CatalogModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.searchTerm = '';
        this.filterCategory = 'all';
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

        // Extract unique categories
        const categories = [...new Set(allProducts.map(p => p.category || 'Sin categoría'))].sort();

        // Apply filters
        let products = allProducts;
        if (this.filterCategory !== 'all') {
            products = products.filter(p => (p.category || 'Sin categoría') === this.filterCategory);
        }
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            products = products.filter(p => 
                (p.name || '').toLowerCase().includes(term) ||
                (p.sku || '').toLowerCase().includes(term)
            );
        }

        // Calculate product rows
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

            return { ...p, retailPrice, costPrice, margin, marginPct, taxCategory: category };
        });

        const html = `
            <div class="fade-in">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1>Catálogo de Productos</h1>
                        <p>Precios al <strong style="color: var(--color-primary-dark);">${tierLabel}</strong> ${includeRE ? 'con RE' : 'sin RE'} · ${allProducts.length} productos</p>
                    </div>
                    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <button class="btn btn-secondary" id="btnSeedCatalog"><i class="ph ph-database"></i> Cargar Catálogo 2026</button>
                        <button class="btn btn-secondary" id="btnImportJSON"><i class="ph ph-upload-simple"></i> Importar JSON</button>
                        <button class="btn btn-primary" id="btnNewProduct"><i class="ph ph-plus"></i> Producto</button>
                    </div>
                </header>

                <!-- Search + Category Filter -->
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; align-items: center;">
                    <div style="flex: 1; min-width: 220px; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-faint);"></i>
                        <input type="text" id="catalogSearch" class="form-input" placeholder="Buscar por nombre o referencia..." 
                            style="padding-left: 2.25rem; width: 100%;" value="${this.searchTerm}">
                    </div>
                    <select id="catalogCategoryFilter" class="form-select" style="min-width: 160px;">
                        <option value="all" ${this.filterCategory === 'all' ? 'selected' : ''}>Todas las categorías</option>
                        ${categories.map(c => `<option value="${c}" ${this.filterCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>

                <!-- Summary Row -->
                ${allProducts.length > 0 ? `
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
                    <div style="padding: 0.625rem 1rem; background: var(--color-primary-light); border-radius: var(--radius-lg); border: 1px solid rgba(101, 163, 13, 0.15); font-size: 0.8125rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-package" style="color: var(--color-primary);"></i>
                        <span style="color: var(--color-primary-dark);">${products.length} productos mostrados</span>
                    </div>
                    <div style="padding: 0.625rem 1rem; background: var(--color-success-light); border-radius: var(--radius-lg); border: 1px solid rgba(34, 197, 94, 0.15); font-size: 0.8125rem; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-chart-line-up" style="color: var(--color-success);"></i>
                        <span style="color: var(--color-success);">Margen total: €${totalMargin.toFixed(2)}</span>
                    </div>
                </div>
                ` : ''}
                
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
                                        <h4>${this.searchTerm || this.filterCategory !== 'all' ? 'Sin resultados' : 'Catálogo vacío'}</h4>
                                        <p>${this.searchTerm || this.filterCategory !== 'all' 
                                            ? 'Intenta ajustar los filtros de búsqueda' 
                                            : 'Pulsa "Cargar Catálogo 2026" para importar los productos de Herbalife automáticamente.'}</p>
                                    </div>
                                </td></tr>
                            ` : productRows.map(p => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 550; font-size: 0.8125rem;">${p.name}</div>
                                        <div style="font-size: 0.6875rem; color: var(--color-text-faint); display: flex; gap: 0.5rem; align-items: center; margin-top: 0.125rem;">
                                            <span>Ref: ${p.sku || 'N/A'}</span>
                                            <span class="badge ${p.taxCategory === 'external' ? 'badge-info' : (p.taxCategory === 'literature' ? 'badge-neutral' : 'badge-primary')}" style="font-size: 0.5625rem;">
                                                ${p.taxCategory === 'external' ? 'SKIN' : (p.taxCategory === 'literature' ? 'LIT' : 'NUT')}
                                            </span>
                                            ${p.category ? `<span style="color: var(--color-text-faint);">· ${p.category}</span>` : ''}
                                        </div>
                                    </td>
                                    <td style="font-family: 'SF Mono', monospace; font-size: 0.8125rem;">${p.pv || 0}</td>
                                    <td style="font-size: 0.8125rem;">€${p.retailPrice.toFixed(2)}</td>
                                    <td style="font-weight: 600; color: var(--color-primary-dark); font-size: 0.8125rem;">€${p.costPrice.toFixed(2)}</td>
                                    <td>
                                        <span style="color: ${p.margin >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 550; font-size: 0.8125rem;">
                                            €${p.margin.toFixed(2)}
                                        </span>
                                        <span style="font-size: 0.625rem; color: var(--color-text-faint); margin-left: 0.25rem;">${p.marginPct}%</span>
                                    </td>
                                    <td style="text-align: right;">
                                        <div style="display: flex; gap: 0.25rem; justify-content: flex-end;">
                                            <button class="btn btn-ghost btn-edit-product" data-id="${p.id}" style="padding: 0.375rem;" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                                            <button class="btn btn-ghost btn-delete-product" data-id="${p.id}" style="padding: 0.375rem; color: var(--color-danger);" title="Eliminar"><i class="ph ph-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
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

        // Category filter
        document.getElementById('catalogCategoryFilter')?.addEventListener('change', (e) => {
            this.filterCategory = e.target.value;
            this.render();
        });

        // Seed Catalog button
        document.getElementById('btnSeedCatalog')?.addEventListener('click', () => this.seedCatalog());

        // Import JSON button
        document.getElementById('btnImportJSON')?.addEventListener('click', () => this.importJSON());

        // New product
        document.getElementById('btnNewProduct')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('ui:openSlideOver', { 
                detail: { type: 'newProduct' } 
            }));
        });

        // Edit buttons
        document.querySelectorAll('.btn-edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const product = salesService.cache.products.find(p => p.id === id);
                if (product) {
                    window.dispatchEvent(new CustomEvent('ui:openSlideOver', { 
                        detail: { type: 'editProduct', data: product } 
                    }));
                }
            });
        });

        // Delete buttons
        document.querySelectorAll('.btn-delete-product').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const product = salesService.cache.products.find(p => p.id === id);
                if (product && confirm(`¿Eliminar "${product.name}"?`)) {
                    try {
                        await salesService.delete('products', id);
                        window.toast?.success(`"${product.name}" eliminado`);
                    } catch(err) {
                        window.toast?.error('Error al eliminar: ' + err.message);
                    }
                }
            });
        });
    }

    /**
     * Seeds the catalog with Herbalife 2026 products
     */
    async seedCatalog() {
        const existing = salesService.cache.products || [];
        
        if (existing.length > 0) {
            if (!confirm(`Ya tienes ${existing.length} productos. ¿Deseas añadir los ${HERBALIFE_CATALOG_2026.length} productos del catálogo 2026? (No se duplicarán los que ya existen por SKU)`)) {
                return;
            }
        }

        const btn = document.getElementById('btnSeedCatalog');
        btn.innerHTML = '<div class="loader"></div> Cargando...';
        btn.disabled = true;

        let added = 0;
        let skipped = 0;
        const existingSKUs = new Set(existing.map(p => p.sku));

        for (const product of HERBALIFE_CATALOG_2026) {
            if (existingSKUs.has(product.sku)) {
                skipped++;
                continue;
            }

            try {
                await salesService.create('products', {
                    name: product.name,
                    sku: product.sku,
                    price: product.price,
                    basePrice: product.basePrice,
                    pv: product.pv,
                    taxType: product.taxType,
                    category: product.category
                });
                added++;
            } catch(err) {
                console.error(`Error adding ${product.name}:`, err);
            }
        }

        window.toast?.success(`Catálogo cargado: ${added} productos añadidos${skipped > 0 ? `, ${skipped} omitidos (duplicados)` : ''}`);
        
        btn.innerHTML = '<i class="ph ph-database"></i> Cargar Catálogo 2026';
        btn.disabled = false;
    }

    /**
     * Import products from a JSON file
     */
    importJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        document.body.appendChild(input);

        input.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const products = JSON.parse(text);
                
                if (!Array.isArray(products)) {
                    window.toast?.error('El archivo debe contener un array de productos JSON');
                    return;
                }

                // Validate structure
                const requiredFields = ['name', 'price'];
                const firstInvalid = products.find(p => !requiredFields.every(f => p[f]));
                if (firstInvalid) {
                    window.toast?.error('Cada producto necesita al menos: name, price');
                    return;
                }

                if (!confirm(`Se importarán ${products.length} productos desde "${file.name}". ¿Continuar?`)) {
                    return;
                }

                let added = 0;
                for (const product of products) {
                    try {
                        await salesService.create('products', {
                            name: product.name,
                            sku: product.sku || '',
                            price: parseFloat(product.price) || 0,
                            basePrice: parseFloat(product.basePrice || product.earnBase) || 0,
                            pv: parseFloat(product.pv || product.volumePoints) || 0,
                            taxType: product.taxType || 'internal',
                            category: product.category || 'Importado'
                        });
                        added++;
                    } catch(err) {
                        console.error(`Error importing ${product.name}:`, err);
                    }
                }

                window.toast?.success(`Importación completada: ${added} de ${products.length} productos`);
            } catch(err) {
                window.toast?.error('Error al leer el archivo: ' + err.message);
            }

            input.remove();
        });

        input.click();
    }
}
