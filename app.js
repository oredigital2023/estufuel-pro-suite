import { authService } from './services/auth.service.js';
import { prospectService } from './services/prospect.service.js';
import { salesService } from './services/sales.service.js';
import { DashboardModule } from './components/dashboard.module.js';
import { ProspectsModule } from './components/prospects.module.js';

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
                } else {
                    document.getElementById('appContent').innerHTML = `<div style="padding: 2rem;">Módulo Inteligencia en construcción...</div>`;
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
            
            if(type === 'newProspect') {
                titleEl.textContent = 'Nuevo Prospecto';
                contentEl.innerHTML = `<p>Formulario de creación aquí...</p>`;
            } else if(type === 'editProspect') {
                titleEl.textContent = `Editar: ${data.nombre}`;
                contentEl.innerHTML = `<p>Formulario de edición para ${data.nombre} aquí...</p>`;
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
