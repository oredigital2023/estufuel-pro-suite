import { authService } from './services/auth.service.js';
import { prospectService } from './services/prospect.service.js';
import { salesService } from './services/sales.service.js';
import { DashboardModule } from './components/dashboard.module.js';
import { ProspectsModule } from './components/prospects.module.js';
import { settingsService } from './services/settings.service.js';
import { pricingService } from './services/pricing.service.js';

class App {
    constructor() {
        console.log('EstuFuel Pro Suite Inicializada');
        this.modules = {};
        this.init();
    }

    async init() {
        this.setupNavigation();
        this.listenForAuthChanges();
        this.setupSlideOver();
        
        const session = await authService.getSession();
        if (session) {
            this.loadInitialData();
        } else {
            console.log('Usuario no autenticado.');
            this.showLoginPlaceholder();
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item, index) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(n => {
                    n.classList.remove('active');
                    n.style.background = 'transparent';
                    n.style.color = 'var(--color-text-muted)';
                    n.style.fontWeight = '400';
                });
                
                item.classList.add('active');
                item.style.background = 'var(--color-bg-app)';
                item.style.color = 'var(--color-text-main)';
                item.style.fontWeight = '500';
                
                // Simple router
                if(index === 0) {
                    if(!this.modules.dashboard) this.modules.dashboard = new DashboardModule('appContent');
                    this.modules.dashboard.render();
                } else if(index === 1) {
                    if(!this.modules.prospects) this.modules.prospects = new ProspectsModule('appContent');
                    this.modules.prospects.render();
                } else if(index === 2) {
                    import('./components/sales.module.js').then(({ SalesModule }) => {
                        if(!this.modules.sales) this.modules.sales = new SalesModule('appContent');
                        this.modules.sales.render();
                    });
                } else if(index === 3) {
                    import('./components/catalog.module.js').then(({ CatalogModule }) => {
                        if(!this.modules.catalog) this.modules.catalog = new CatalogModule('appContent');
                        this.modules.catalog.render();
                    });
                } else if(index === 4) {
                    import('./components/intelligence.module.js').then(({ IntelligenceModule }) => {
                        if(!this.modules.intelligence) this.modules.intelligence = new IntelligenceModule('appContent');
                        this.modules.intelligence.render();
                    });
                } else if(index === 5) {
                    import('./components/settings.module.js').then(({ SettingsModule }) => {
                        if(!this.modules.settings) this.modules.settings = new SettingsModule('appContent');
                        this.modules.settings.render();
                    });
                }


            });
        });
    }

    setupSlideOver() {
        const overlay = document.getElementById('globalSlideOver');
        const btnClose = document.getElementById('btnCloseSlideOver');
        
        window.addEventListener('ui:openSlideOver', (e) => {
            const { type, data } = e.detail;
            const titleEl = document.getElementById('slideOverTitle');
            const contentEl = document.getElementById('slideOverContent');
            
            if(type === 'newProspect' || type === 'editProspect') {
                const isEdit = type === 'editProspect';
                titleEl.textContent = isEdit ? `Editar: ${data.nombre_completo}` : 'Nuevo Prospecto';
                
                contentEl.innerHTML = `
                    <form id="prospectForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <input type="hidden" id="p_id" value="${isEdit ? data.id : ''}">
                        
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Nombre Completo</label>
                            <input type="text" id="p_nombre" value="${isEdit ? data.nombre_completo : ''}" required style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                        </div>
                        
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">WhatsApp</label>
                            <input type="tel" id="p_whatsapp" value="${isEdit ? (data.whatsapp || '') : ''}" style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                        </div>

                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Estado</label>
                            <select id="p_estado" style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                                <option value="Nuevo" ${isEdit && data.estado === 'Nuevo' ? 'selected' : ''}>Nuevo</option>
                                <option value="Contactado" ${isEdit && data.estado === 'Contactado' ? 'selected' : ''}>Contactado</option>
                                <option value="Interesado" ${isEdit && data.estado === 'Interesado' ? 'selected' : ''}>Interesado</option>
                                <option value="Cita Agendada" ${isEdit && data.estado === 'Cita Agendada' ? 'selected' : ''}>Cita Agendada</option>
                                <option value="Asistió" ${isEdit && data.estado === 'Asistió' ? 'selected' : ''}>Asistió</option>
                                <option value="Convertido" ${isEdit && data.estado === 'Convertido' ? 'selected' : ''}>Convertido (Cliente)</option>
                                <option value="Perdido" ${isEdit && data.estado === 'Perdido' ? 'selected' : ''}>Perdido</option>
                            </select>
                        </div>
                        
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Origen</label>
                            <select id="p_origen" style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                                <option value="Redes Sociales" ${isEdit && data.origen === 'Redes Sociales' ? 'selected' : ''}>Redes Sociales</option>
                                <option value="Acción de calle" ${isEdit && data.origen === 'Acción de calle' ? 'selected' : ''}>Acción de calle</option>
                                <option value="Referido" ${isEdit && data.origen === 'Referido' ? 'selected' : ''}>Referido</option>
                                <option value="Evento" ${isEdit && data.origen === 'Evento' ? 'selected' : ''}>Evento</option>
                                <option value="Otro" ${isEdit && data.origen === 'Otro' ? 'selected' : ''}>Otro</option>
                            </select>
                        </div>

                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <button type="submit" class="btn btn-primary" style="flex: 1; justify-content: center;">
                                ${isEdit ? 'Guardar Cambios' : 'Crear Prospecto'}
                            </button>
                            ${isEdit ? `<button type="button" id="btnDeleteProspect" class="btn btn-secondary" style="color: var(--color-danger); border-color: var(--color-danger);"><i class="ph ph-trash"></i></button>` : ''}
                        </div>
                    </form>
                `;

                if (isEdit) {
                    document.getElementById('btnDeleteProspect')?.addEventListener('click', async () => {
                        if(confirm('¿Estás seguro de que deseas eliminar este prospecto? Esta acción no se puede deshacer.')) {
                            const btn = document.getElementById('btnDeleteProspect');
                            btn.innerHTML = '<div class="loader" style="width:16px;height:16px;"></div>';
                            try {
                                await prospectService.delete(data.id);
                                overlay.classList.remove('active');
                            } catch(err) {
                                alert('Error al eliminar: ' + err.message);
                                btn.innerHTML = '<i class="ph ph-trash"></i>';
                            }
                        }
                    });
                }

                document.getElementById('prospectForm').addEventListener('submit', async (ev) => {
                    ev.preventDefault();
                    const submitBtn = ev.target.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<div class="loader" style="width:16px;height:16px;"></div> Guardando...';
                    submitBtn.disabled = true;

                    const payload = {
                        nombre_completo: document.getElementById('p_nombre').value,
                        whatsapp: document.getElementById('p_whatsapp').value,
                        estado: document.getElementById('p_estado').value,
                        origen: document.getElementById('p_origen').value
                    };

                    try {
                        if(isEdit) {
                            await prospectService.update(data.id, payload);
                        } else {
                            await prospectService.create(payload);
                        }
                        overlay.classList.remove('active');
                    } catch(err) {
                        alert('Error al guardar: ' + err.message);
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                });
            } else if (type === 'newCustomer' || type === 'editCustomer') {
                const isEdit = type === 'editCustomer';
                titleEl.textContent = isEdit ? `Editar Cliente: ${data.name}` : 'Nuevo Cliente';
                
                contentEl.innerHTML = `
                    <form id="customerForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Nombre</label>
                            <input type="text" id="c_name" value="${isEdit ? data.name : ''}" required style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                        </div>
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Teléfono</label>
                            <input type="tel" id="c_phone" value="${isEdit ? (data.phone || '') : ''}" style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                        </div>
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Email (Opcional)</label>
                            <input type="email" id="c_email" value="${isEdit ? (data.email || '') : ''}" style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                        </div>
                        <button type="submit" class="btn btn-primary" style="margin-top: 1rem; justify-content: center;">
                            ${isEdit ? 'Guardar Cambios' : 'Crear Cliente'}
                        </button>
                    </form>
                `;

                document.getElementById('customerForm').addEventListener('submit', async (ev) => {
                    ev.preventDefault();
                    const submitBtn = ev.target.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<div class="loader" style="width:16px;height:16px;"></div> Guardando...';
                    submitBtn.disabled = true;

                    const payload = {
                        name: document.getElementById('c_name').value,
                        phone: document.getElementById('c_phone').value,
                        email: document.getElementById('c_email').value
                    };

                    try {
                        if(isEdit) {
                            await salesService.update('customers', data.id, payload);
                        } else {
                            await salesService.create('customers', payload);
                        }
                        overlay.classList.remove('active');
                    } catch(err) {
                        alert('Error al guardar cliente: ' + err.message);
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                });
            } else if (type === 'newTransaction') {
                titleEl.textContent = 'Nueva Operación Manual';
                
                // Construct customers options
                const customers = salesService.cache.customers || [];
                let custOptions = '<option value="">-- Seleccionar (Opcional) --</option>';
                customers.forEach(c => custOptions += `<option value="${c.id}">${c.name}</option>`);

                contentEl.innerHTML = `
                    <form id="transactionForm" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Tipo de Operación</label>
                            <select id="t_type" required style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                                <option value="sale">Venta</option>
                                <option value="personal">Consumo Personal</option>
                                <option value="sample">Muestra</option>
                                <option value="stock_purchase">Compra de Stock</option>
                                <option value="other_expense">Gasto General</option>
                            </select>
                        </div>
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Cliente (Si aplica)</label>
                            <select id="t_customer" style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                                ${custOptions}
                            </select>
                        </div>
                        <div style="display: flex; gap: 1rem;">
                            <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem; flex: 1;">
                                <label style="font-weight: 500; font-size: 0.875rem;">Ingreso (€)</label>
                                <input type="number" step="0.01" id="t_income" value="0" required style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                            </div>
                            <div class="form-group" style="display: flex; flex-direction: column; gap: 0.25rem; flex: 1;">
                                <label style="font-weight: 500; font-size: 0.875rem;">Utilidad (€)</label>
                                <input type="number" step="0.01" id="t_profit" value="0" style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                            </div>
                        </div>
                        <p style="font-size: 0.75rem; color: var(--color-text-muted);">*Nota: El cálculo avanzado de productos se añadirá en la interfaz completa. Este panel es para registros manuales rápidos.</p>
                        
                        <button type="submit" class="btn btn-primary" style="margin-top: 1rem; justify-content: center;">
                            Guardar Operación
                        </button>
                    </form>
                `;

                document.getElementById('transactionForm').addEventListener('submit', async (ev) => {
                    ev.preventDefault();
                    const submitBtn = ev.target.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<div class="loader" style="width:16px;height:16px;"></div> Guardando...';
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
                    } catch(err) {
                        alert('Error al guardar transacción: ' + err.message);
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }
                });
            }
            
            overlay.classList.add('active');
        });

        btnClose?.addEventListener('click', () => overlay.classList.remove('active'));
        overlay?.addEventListener('click', (e) => {
            if(e.target === overlay) overlay.classList.remove('active');
        });
    }

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
        console.log('Cargando datos de módulos...');
        try {
            await Promise.all([
                prospectService.fetchAll(),
                salesService.fetchAll()
            ]);
            console.log('Datos cargados exitosamente');
            
            // Render default view (Dashboard)
            if(!this.modules.dashboard) this.modules.dashboard = new DashboardModule('appContent');
            this.modules.dashboard.render();
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }


    showLoginPlaceholder() {
        const appContent = document.getElementById('appContent');
        appContent.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
                <i class="ph ph-lock-key" style="font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem;"></i>
                <h2>Autenticación Requerida</h2>
                <p style="margin-bottom: 1rem;">Debes iniciar sesión para acceder a EstuFuel Pro Suite.</p>
                <button class="btn btn-primary" id="tempLoginBtn">Iniciar Sesión (Demo)</button>
            </div>
        `;
        
        // Temp login for development (requires actual user credentials to work)
        document.getElementById('tempLoginBtn')?.addEventListener('click', () => {
            const email = prompt('Email:');
            const password = prompt('Password:');
            if(email && password) {
                authService.signIn(email, password).catch(err => alert(err.message));
            }
        });
    }
}

// Boot up
document.addEventListener('DOMContentLoaded', () => {
    window.estufuelApp = new App();
});
