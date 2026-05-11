import { authService } from './services/auth.service.js';
import { prospectService } from './services/prospect.service.js';
import { salesService } from './services/sales.service.js';
import { DashboardModule } from './components/dashboard.module.js';
import { ProspectsModule } from './components/prospects.module.js';
import { settingsService } from './services/settings.service.js';
import { pricingService } from './services/pricing.service.js';

/**
 * Toast Notification System
 * Global utility for displaying non-blocking notifications
 */
class ToastSystem {
    constructor() {
        this.container = document.getElementById('toastContainer');
    }

    show(message, type = 'info', duration = 3500) {
        if (!this.container) return;

        const icons = {
            success: 'ph-check-circle',
            error: 'ph-warning-circle',
            warning: 'ph-warning',
            info: 'ph-info'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="ph ${icons[type] || icons.info} toast-icon"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(toast);

        // Auto-remove
        setTimeout(() => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, duration);

        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.classList.add('toast-out');
            toast.addEventListener('animationend', () => toast.remove());
        });
    }

    success(msg) { this.show(msg, 'success'); }
    error(msg) { this.show(msg, 'error', 5000); }
    warning(msg) { this.show(msg, 'warning', 4000); }
    info(msg) { this.show(msg, 'info'); }
}

/**
 * Main Application Controller
 * Handles routing, navigation, slide-over modals, and auth state
 */
class App {
    constructor() {
        console.log('🚀 EstuFuel Pro Suite v2.0 Inicializada');
        this.modules = {};
        this.toast = new ToastSystem();
        this.currentModule = null;
        
        // Expose toast globally
        window.toast = this.toast;

        this.init();
    }

    async init() {
        this.setupNavigation();
        this.listenForAuthChanges();
        this.listenForErrors();
        this.setupSlideOver();
        
        const session = await authService.getSession();
        if (session) {
            this.loadInitialData();
        } else {
            console.log('Usuario no autenticado.');
            this.showLoginPlaceholder();
        }
    }

    // ========================================
    // NAVIGATION (data-module based routing)
    // ========================================
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-module]');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const moduleName = item.getAttribute('data-module');
                this.navigateTo(moduleName, item);
            });
        });
    }

    navigateTo(moduleName, navElement) {
        // Update active state
        const navItems = document.querySelectorAll('.nav-item[data-module]');
        navItems.forEach(n => {
            n.classList.remove('active');
        });
        
        if (navElement) {
            navElement.classList.add('active');
        } else {
            // Find the nav element by data-module
            const target = document.querySelector(`.nav-item[data-module="${moduleName}"]`);
            if (target) target.classList.add('active');
        }

        this.currentModule = moduleName;

        // Module routing
        const moduleLoaders = {
            dashboard: () => {
                if (!this.modules.dashboard) {
                    this.modules.dashboard = new DashboardModule('appContent');
                }
                this.modules.dashboard.render();
            },
            prospects: () => {
                if (!this.modules.prospects) {
                    this.modules.prospects = new ProspectsModule('appContent');
                }
                this.modules.prospects.render();
            },
            sales: () => {
                import('./components/sales.module.js').then(({ SalesModule }) => {
                    if (!this.modules.sales) this.modules.sales = new SalesModule('appContent');
                    this.modules.sales.render();
                });
            },
            catalog: () => {
                import('./components/catalog.module.js').then(({ CatalogModule }) => {
                    if (!this.modules.catalog) this.modules.catalog = new CatalogModule('appContent');
                    this.modules.catalog.render();
                });
            },
            intelligence: () => {
                import('./components/intelligence.module.js').then(({ IntelligenceModule }) => {
                    if (!this.modules.intelligence) this.modules.intelligence = new IntelligenceModule('appContent');
                    this.modules.intelligence.render();
                });
            },
            settings: () => {
                import('./components/settings.module.js').then(({ SettingsModule }) => {
                    if (!this.modules.settings) this.modules.settings = new SettingsModule('appContent');
                    this.modules.settings.render();
                });
            }
        };

        const loader = moduleLoaders[moduleName];
        if (loader) {
            loader();
        } else {
            console.warn(`Módulo desconocido: ${moduleName}`);
        }
    }

    // ========================================
    // GLOBAL ERROR LISTENER
    // ========================================
    listenForErrors() {
        window.addEventListener('app:error', (e) => {
            const { message, context } = e.detail;
            this.toast.error(`${context ? context + ': ' : ''}${message}`);
        });
    }

    // ========================================
    // SLIDE-OVER MODAL SYSTEM
    // ========================================
    setupSlideOver() {
        const overlay = document.getElementById('globalSlideOver');
        const btnClose = document.getElementById('btnCloseSlideOver');
        
        window.addEventListener('ui:openSlideOver', (e) => {
            const { type, data } = e.detail;
            const titleEl = document.getElementById('slideOverTitle');
            const contentEl = document.getElementById('slideOverContent');
            
            if (type === 'newProspect' || type === 'editProspect') {
                this.renderProspectForm(titleEl, contentEl, overlay, type, data);
            } else if (type === 'newCustomer' || type === 'editCustomer') {
                this.renderCustomerForm(titleEl, contentEl, overlay, type, data);
            } else if (type === 'newTransaction') {
                this.renderTransactionForm(titleEl, contentEl, overlay);
            } else if (type === 'newProduct' || type === 'editProduct') {
                this.renderProductForm(titleEl, contentEl, overlay, type, data);
            }
            
            overlay.classList.add('active');
        });

        btnClose?.addEventListener('click', () => overlay.classList.remove('active'));
        overlay?.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay?.classList.contains('active')) {
                overlay.classList.remove('active');
            }
        });
    }

    renderProspectForm(titleEl, contentEl, overlay, type, data) {
        const isEdit = type === 'editProspect';
        titleEl.textContent = isEdit ? `Editar: ${data.nombre_completo}` : 'Nuevo Prospecto';
        
        contentEl.innerHTML = `
            <form id="prospectForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <input type="hidden" id="p_id" value="${isEdit ? data.id : ''}">
                
                <div class="form-group">
                    <label class="form-label">Nombre Completo</label>
                    <input type="text" id="p_nombre" value="${isEdit ? data.nombre_completo : ''}" required class="form-input" placeholder="Ej: María García López">
                </div>
                
                <div class="form-group">
                    <label class="form-label">WhatsApp</label>
                    <input type="tel" id="p_whatsapp" value="${isEdit ? (data.whatsapp || '') : ''}" class="form-input" placeholder="+34 600 000 000">
                </div>

                <div class="form-group">
                    <label class="form-label">Estado</label>
                    <select id="p_estado" class="form-select">
                        <option value="Nuevo" ${isEdit && data.estado === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
                        <option value="Contactado" ${isEdit && data.estado === 'Contactado' ? 'selected' : ''}>Contactado</option>
                        <option value="Interesado" ${isEdit && data.estado === 'Interesado' ? 'selected' : ''}>Interesado</option>
                        <option value="Cita Agendada" ${isEdit && data.estado === 'Cita Agendada' ? 'selected' : ''}>Cita Agendada</option>
                        <option value="Asistió" ${isEdit && data.estado === 'Asistió' ? 'selected' : ''}>Asistió</option>
                        <option value="Convertido" ${isEdit && data.estado === 'Convertido' ? 'selected' : ''}>Convertido (Cliente)</option>
                        <option value="Perdido" ${isEdit && data.estado === 'Perdido' ? 'selected' : ''}>Perdido</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Origen</label>
                    <select id="p_origen" class="form-select">
                        <option value="Redes Sociales" ${isEdit && data.origen === 'Redes Sociales' ? 'selected' : ''}>Redes Sociales</option>
                        <option value="Acción de calle" ${isEdit && data.origen === 'Acción de calle' ? 'selected' : ''}>Acción de calle</option>
                        <option value="Referido" ${isEdit && data.origen === 'Referido' ? 'selected' : ''}>Referido</option>
                        <option value="Evento" ${isEdit && data.origen === 'Evento' ? 'selected' : ''}>Evento</option>
                        <option value="Otro" ${isEdit && data.origen === 'Otro' ? 'selected' : ''}>Otro</option>
                    </select>
                </div>

                <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">
                        ${isEdit ? 'Guardar Cambios' : 'Crear Prospecto'}
                    </button>
                    ${isEdit ? `<button type="button" id="btnDeleteProspect" class="btn btn-danger" style="padding: 0.5rem 0.75rem;"><i class="ph ph-trash"></i></button>` : ''}
                </div>
            </form>
        `;

        if (isEdit) {
            document.getElementById('btnDeleteProspect')?.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de que deseas eliminar este prospecto?')) {
                    const btn = document.getElementById('btnDeleteProspect');
                    btn.innerHTML = '<div class="loader"></div>';
                    try {
                        await prospectService.delete(data.id);
                        overlay.classList.remove('active');
                        this.toast.success('Prospecto eliminado');
                    } catch(err) {
                        this.toast.error('Error al eliminar: ' + err.message);
                        btn.innerHTML = '<i class="ph ph-trash"></i>';
                    }
                }
            });
        }

        document.getElementById('prospectForm').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const submitBtn = ev.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loader"></div> Guardando...';
            submitBtn.disabled = true;

            const payload = {
                nombre_completo: document.getElementById('p_nombre').value,
                whatsapp: document.getElementById('p_whatsapp').value,
                estado: document.getElementById('p_estado').value,
                origen: document.getElementById('p_origen').value
            };

            try {
                if (isEdit) {
                    await prospectService.update(data.id, payload);
                    this.toast.success('Prospecto actualizado');
                } else {
                    await prospectService.create(payload);
                    this.toast.success('Prospecto creado con éxito');
                }
                overlay.classList.remove('active');
            } catch(err) {
                this.toast.error('Error al guardar: ' + err.message);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    renderCustomerForm(titleEl, contentEl, overlay, type, data) {
        const isEdit = type === 'editCustomer';
        titleEl.textContent = isEdit ? `Editar: ${data.name}` : 'Nuevo Cliente';
        
        contentEl.innerHTML = `
            <form id="customerForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div class="form-group">
                    <label class="form-label">Nombre</label>
                    <input type="text" id="c_name" value="${isEdit ? data.name : ''}" required class="form-input" placeholder="Nombre completo">
                </div>
                <div class="form-group">
                    <label class="form-label">Teléfono</label>
                    <input type="tel" id="c_phone" value="${isEdit ? (data.phone || '') : ''}" class="form-input" placeholder="+34 600 000 000">
                </div>
                <div class="form-group">
                    <label class="form-label">Email (Opcional)</label>
                    <input type="email" id="c_email" value="${isEdit ? (data.email || '') : ''}" class="form-input" placeholder="correo@ejemplo.com">
                </div>
                <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem; justify-content: center;">
                    ${isEdit ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
            </form>
        `;

        document.getElementById('customerForm').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const submitBtn = ev.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loader"></div> Guardando...';
            submitBtn.disabled = true;

            const payload = {
                name: document.getElementById('c_name').value,
                phone: document.getElementById('c_phone').value,
                email: document.getElementById('c_email').value
            };

            try {
                if (isEdit) {
                    await salesService.update('customers', data.id, payload);
                    this.toast.success('Cliente actualizado');
                } else {
                    await salesService.create('customers', payload);
                    this.toast.success('Cliente creado con éxito');
                }
                overlay.classList.remove('active');
            } catch(err) {
                this.toast.error('Error al guardar cliente: ' + err.message);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    renderTransactionForm(titleEl, contentEl, overlay) {
        titleEl.textContent = 'Nueva Operación';
        
        const customers = salesService.cache.customers || [];
        let custOptions = '<option value="">-- Sin cliente --</option>';
        customers.forEach(c => custOptions += `<option value="${c.id}">${c.name}</option>`);

        contentEl.innerHTML = `
            <form id="transactionForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div class="form-group">
                    <label class="form-label">Tipo de Operación</label>
                    <select id="t_type" required class="form-select">
                        <option value="sale">Venta</option>
                        <option value="personal">Consumo Personal</option>
                        <option value="sample">Muestra</option>
                        <option value="stock_purchase">Compra de Stock</option>
                        <option value="other_expense">Gasto General</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Cliente (Si aplica)</label>
                    <select id="t_customer" class="form-select">
                        ${custOptions}
                    </select>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Ingreso (€)</label>
                        <input type="number" step="0.01" id="t_income" value="0" required class="form-input">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Utilidad (€)</label>
                        <input type="number" step="0.01" id="t_profit" value="0" class="form-input">
                    </div>
                </div>
                <div style="padding: 0.875rem; background: var(--color-info-light); border-radius: var(--radius-lg); border: 1px solid rgba(59, 130, 246, 0.15);">
                    <p style="font-size: 0.75rem; color: var(--color-info); font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="ph ph-info"></i>
                        El cálculo avanzado con catálogo se añadirá próximamente. Este panel es para registros rápidos.
                    </p>
                </div>
                
                <button type="submit" class="btn btn-primary" style="justify-content: center;">
                    Guardar Operación
                </button>
            </form>
        `;

        document.getElementById('transactionForm').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const submitBtn = ev.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loader"></div> Guardando...';
            submitBtn.disabled = true;

            const payload = {
                type: document.getElementById('t_type').value,
                customerId: document.getElementById('t_customer').value || null,
                income: parseFloat(document.getElementById('t_income').value) || 0,
                profit: parseFloat(document.getElementById('t_profit').value) || 0,
                date: new Date().toISOString()
            };

            try {
                await salesService.create('transactions', payload);
                overlay.classList.remove('active');
                this.toast.success('Operación registrada');
            } catch(err) {
                this.toast.error('Error al guardar: ' + err.message);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ========================================
    // PRODUCT FORM
    // ========================================
    renderProductForm(titleEl, contentEl, overlay, type, data) {
        const isEdit = type === 'editProduct';
        titleEl.textContent = isEdit ? `Editar: ${data.name}` : 'Nuevo Producto';
        
        contentEl.innerHTML = `
            <form id="productForm" style="display: flex; flex-direction: column; gap: 1.25rem;">
                <div class="form-group">
                    <label class="form-label">Nombre del Producto</label>
                    <input type="text" id="pr_name" value="${isEdit ? (data.name || '') : ''}" required class="form-input" placeholder="Ej: Batido Fórmula 1 - Vainilla">
                </div>
                
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Referencia (SKU)</label>
                        <input type="text" id="pr_sku" value="${isEdit ? (data.sku || '') : ''}" class="form-input" placeholder="Ej: 0141">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Puntos Volumen (PV)</label>
                        <input type="number" step="0.01" id="pr_pv" value="${isEdit ? (data.pv || 0) : ''}" class="form-input" placeholder="25.75">
                    </div>
                </div>

                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Precio en Lista (PL) €</label>
                        <input type="number" step="0.01" id="pr_price" value="${isEdit ? (data.price || '') : ''}" required class="form-input" placeholder="45.51">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Base Descuento (BD) €</label>
                        <input type="number" step="0.01" id="pr_basePrice" value="${isEdit ? (data.basePrice || '') : ''}" required class="form-input" placeholder="41.70">
                    </div>
                </div>

                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Categoría Fiscal</label>
                        <select id="pr_taxType" class="form-select">
                            <option value="internal" ${isEdit && data.taxType === 'internal' ? 'selected' : ''}>Nutrición (IVA 10%)</option>
                            <option value="external" ${isEdit && data.taxType === 'external' ? 'selected' : ''}>Cosmética (IVA 21%)</option>
                            <option value="literature" ${isEdit && data.taxType === 'literature' ? 'selected' : ''}>Literatura (IVA 4%)</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Línea de Producto</label>
                        <input type="text" id="pr_category" value="${isEdit ? (data.category || '') : ''}" class="form-input" placeholder="Ej: Nutrición Básica">
                    </div>
                </div>

                <!-- Price Preview -->
                <div id="pricePreview" style="padding: 1rem; background: var(--color-bg-app); border-radius: var(--radius-lg); border: 1px solid var(--color-border); font-size: 0.8125rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: var(--color-text-muted);">Vista previa del precio:</span>
                    </div>
                    <div id="pricePreviewContent" style="color: var(--color-text-faint);">Rellena PL y BD para ver la vista previa</div>
                </div>

                <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                    <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">
                        ${isEdit ? 'Guardar Cambios' : 'Añadir Producto'}
                    </button>
                    ${isEdit ? `<button type="button" id="btnDeleteProduct" class="btn btn-danger" style="padding: 0.5rem 0.75rem;"><i class="ph ph-trash"></i></button>` : ''}
                </div>
            </form>
        `;

        // Live price preview
        const updatePreview = () => {
            const pl = parseFloat(document.getElementById('pr_price')?.value) || 0;
            const bd = parseFloat(document.getElementById('pr_basePrice')?.value) || 0;
            const taxType = document.getElementById('pr_taxType')?.value || 'internal';
            const previewEl = document.getElementById('pricePreviewContent');
            if (!previewEl || pl === 0) return;

            // Import dynamically to avoid circular deps
            import('./services/pricing.service.js').then(({ PricingService }) => {
                import('./services/settings.service.js').then(({ settingsService }) => {
                    const tier = settingsService.discountTier;
                    const re = settingsService.includeRE;
                    const bi = PricingService.calculateBaseImponible(pl, bd, tier);
                    const final = PricingService.calculateFinalPrice(bi, taxType, re);
                    const margin = pl - final;
                    const pct = pl > 0 ? ((margin / pl) * 100).toFixed(1) : 0;

                    previewEl.innerHTML = `
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; text-align: center;">
                            <div>
                                <div style="font-size: 0.6875rem; color: var(--color-text-faint);">Base Imponible</div>
                                <div style="font-weight: 600;">€${bi.toFixed(2)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.6875rem; color: var(--color-text-faint);">Tu precio (${(tier*100).toFixed(0)}%)</div>
                                <div style="font-weight: 600; color: var(--color-primary-dark);">€${final.toFixed(2)}</div>
                            </div>
                            <div>
                                <div style="font-size: 0.6875rem; color: var(--color-text-faint);">Margen</div>
                                <div style="font-weight: 600; color: var(--color-success);">€${margin.toFixed(2)} (${pct}%)</div>
                            </div>
                        </div>
                    `;
                });
            });
        };

        ['pr_price', 'pr_basePrice', 'pr_taxType'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', updatePreview);
            document.getElementById(id)?.addEventListener('change', updatePreview);
        });

        // Trigger initial preview for edit mode
        if (isEdit) setTimeout(updatePreview, 100);

        // Delete handler
        if (isEdit) {
            document.getElementById('btnDeleteProduct')?.addEventListener('click', async () => {
                if (confirm(`¿Eliminar "${data.name}"?`)) {
                    try {
                        await salesService.delete('products', data.id);
                        overlay.classList.remove('active');
                        this.toast.success(`"${data.name}" eliminado`);
                    } catch(err) {
                        this.toast.error('Error: ' + err.message);
                    }
                }
            });
        }

        // Submit handler
        document.getElementById('productForm').addEventListener('submit', async (ev) => {
            ev.preventDefault();
            const submitBtn = ev.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loader"></div> Guardando...';
            submitBtn.disabled = true;

            const payload = {
                name: document.getElementById('pr_name').value,
                sku: document.getElementById('pr_sku').value,
                price: parseFloat(document.getElementById('pr_price').value) || 0,
                basePrice: parseFloat(document.getElementById('pr_basePrice').value) || 0,
                pv: parseFloat(document.getElementById('pr_pv').value) || 0,
                taxType: document.getElementById('pr_taxType').value,
                category: document.getElementById('pr_category').value
            };

            try {
                if (isEdit) {
                    await salesService.update('products', data.id, payload);
                    this.toast.success('Producto actualizado');
                } else {
                    await salesService.create('products', payload);
                    this.toast.success(`"${payload.name}" añadido al catálogo`);
                }
                overlay.classList.remove('active');
            } catch(err) {
                this.toast.error('Error: ' + err.message);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ========================================
    // AUTH
    // ========================================
    listenForAuthChanges() {
        window.addEventListener('auth:stateChange', (e) => {
            const { user } = e.detail;
            if (user) {
                this.loadInitialData();
            } else {
                this.showLoginPlaceholder();
            }
        });
    }

    async loadInitialData() {
        const appContent = document.getElementById('appContent');
        
        // Show loading state
        appContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 1rem;">
                <div class="loader loader-lg"></div>
                <p style="color: var(--color-text-faint);">Cargando datos...</p>
            </div>
        `;

        try {
            await Promise.all([
                prospectService.fetchAll(),
                salesService.fetchAll()
            ]);
            console.log('✅ Datos cargados exitosamente');
            
            // Render default view (Dashboard)
            this.navigateTo('dashboard');
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.toast.error('Error al conectar con la base de datos');
            
            // Still render dashboard even if data fails
            this.navigateTo('dashboard');
        }
    }

    showLoginPlaceholder() {
        const appContent = document.getElementById('appContent');
        appContent.innerHTML = `
            <div class="empty-state" style="height: 100%;">
                <div style="width: 80px; height: 80px; border-radius: var(--radius-2xl); background: var(--color-primary-light); display: flex; align-items: center; justify-content: center; margin-bottom: 1.5rem;">
                    <i class="ph ph-lock-key" style="font-size: 2rem; color: var(--color-primary);"></i>
                </div>
                <h2 style="margin-bottom: 0.5rem;">Autenticación Requerida</h2>
                <p style="margin-bottom: 1.5rem; max-width: 320px;">Inicia sesión para acceder a tu panel de gestión de EstuFuel Pro Suite.</p>
                <button class="btn btn-primary" id="tempLoginBtn" style="padding: 0.75rem 2rem;">
                    <i class="ph ph-sign-in"></i>
                    Iniciar Sesión
                </button>
            </div>
        `;
        
        document.getElementById('tempLoginBtn')?.addEventListener('click', () => {
            const email = prompt('Email:');
            const password = prompt('Password:');
            if (email && password) {
                authService.signIn(email, password)
                    .then(() => this.toast.success('Sesión iniciada'))
                    .catch(err => this.toast.error(err.message));
            }
        });
    }
}

// Boot up
document.addEventListener('DOMContentLoaded', () => {
    window.estufuelApp = new App();
});
