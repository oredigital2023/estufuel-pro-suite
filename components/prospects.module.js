import { prospectService } from '../services/prospect.service.js';

export class ProspectsModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.searchTerm = '';
        this.filterState = 'all';
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('data:prospectsChanged', () => this.render());
    }

    render() {
        if (!this.container) return;

        const allProspects = prospectService.prospectsCache || [];
        
        // Apply filters
        let prospects = allProspects;
        if (this.filterState !== 'all') {
            prospects = prospects.filter(p => p.estado === this.filterState);
        }
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            prospects = prospects.filter(p => 
                (p.nombre_completo || '').toLowerCase().includes(term) ||
                (p.whatsapp || '').includes(term)
            );
        }

        // State counts for filter pills
        const stateCounts = {};
        allProspects.forEach(p => {
            stateCounts[p.estado] = (stateCounts[p.estado] || 0) + 1;
        });

        const states = ['all', 'Nuevo', 'Contactado', 'Interesado', 'Cita Agendada', 'Asistió', 'Convertido', 'Perdido'];
        const stateLabels = { all: 'Todos', Nuevo: 'Nuevos', Contactado: 'Contactados', Interesado: 'Interesados', 'Cita Agendada': 'Citas', 'Asistió': 'Asistieron', Convertido: 'Convertidos', Perdido: 'Perdidos' };

        const html = `
            <div class="fade-in">
                <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h1>Gestión de Prospectos</h1>
                        <p>${allProspects.length} registros totales · ${prospects.length} mostrados</p>
                    </div>
                    <button class="btn btn-primary" id="btnNewProspectMain"><i class="ph ph-plus"></i> Añadir Prospecto</button>
                </header>

                <!-- Search & Filters -->
                <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; align-items: center;">
                    <div style="flex: 1; min-width: 200px; position: relative;">
                        <i class="ph ph-magnifying-glass" style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--color-text-faint);"></i>
                        <input type="text" id="prospectSearch" class="form-input" placeholder="Buscar por nombre o teléfono..." 
                            style="padding-left: 2.25rem; width: 100%;" value="${this.searchTerm}">
                    </div>
                </div>

                <!-- State filter pills -->
                <div style="display: flex; gap: 0.375rem; margin-bottom: 1.25rem; overflow-x: auto; padding-bottom: 0.25rem;" id="filterPills">
                    ${states.map(s => `
                        <button class="btn ${this.filterState === s ? 'btn-primary' : 'btn-secondary'} filter-pill" 
                            data-state="${s}" style="padding: 0.375rem 0.75rem; font-size: 0.75rem; white-space: nowrap;">
                            ${stateLabels[s] || s}
                            ${s === 'all' ? `(${allProspects.length})` : (stateCounts[s] ? `(${stateCounts[s]})` : '')}
                        </button>
                    `).join('')}
                </div>
                
                <!-- Table -->
                <div class="bento-card" style="padding: 0; overflow: hidden;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Estado</th>
                                <th>Origen</th>
                                <th style="text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${prospects.length === 0 ? `
                                <tr><td colspan="5">
                                    <div class="empty-state">
                                        <i class="ph ph-users-three"></i>
                                        <h4>Sin resultados</h4>
                                        <p>${this.searchTerm || this.filterState !== 'all' ? 'Intenta ajustar los filtros' : 'Añade tu primer prospecto para comenzar'}</p>
                                    </div>
                                </td></tr>
                            ` : prospects.map(p => `
                                <tr>
                                    <td>
                                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                                            <div class="avatar avatar-primary">${(p.nombre_completo || '?').charAt(0).toUpperCase()}</div>
                                            <span style="font-weight: 500;">${p.nombre_completo || 'Sin nombre'}</span>
                                        </div>
                                    </td>
                                    <td style="color: var(--color-text-muted);">${p.whatsapp || '—'}</td>
                                    <td><span class="badge ${this.getBadgeClass(p.estado)}">${p.estado || 'Nuevo'}</span></td>
                                    <td style="color: var(--color-text-muted); font-size: 0.8125rem;">${p.origen || '—'}</td>
                                    <td style="text-align: right;">
                                        <div style="display: flex; gap: 0.375rem; justify-content: flex-end;">
                                            ${p.whatsapp ? `<a href="https://wa.me/${(p.whatsapp || '').replace(/\D/g, '')}" target="_blank" class="btn btn-ghost" style="padding: 0.375rem; color: var(--color-success);"><i class="ph ph-whatsapp-logo"></i></a>` : ''}
                                            <button class="btn btn-ghost btn-edit-prospect" data-id="${p.id}" style="padding: 0.375rem;"><i class="ph ph-pencil-simple"></i></button>
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

    getBadgeClass(estado) {
        const map = {
            'Nuevo': 'badge-info', 'Contactado': 'badge-info',
            'Interesado': 'badge-warning', 'Cita Agendada': 'badge-warning',
            'Asistió': 'badge-primary', 'Convertido': 'badge-success', 'Perdido': 'badge-danger'
        };
        return map[estado] || 'badge-neutral';
    }

    setupListeners() {
        document.getElementById('btnNewProspectMain')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('ui:openSlideOver', { detail: { type: 'newProspect' } }));
        });

        // Search
        document.getElementById('prospectSearch')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.render();
        });

        // Filter pills
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                this.filterState = pill.getAttribute('data-state');
                this.render();
            });
        });

        // Edit buttons
        document.querySelectorAll('.btn-edit-prospect').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const prospect = prospectService.prospectsCache.find(p => p.id === id);
                if (prospect) {
                    window.dispatchEvent(new CustomEvent('ui:openSlideOver', { detail: { type: 'editProspect', data: prospect } }));
                }
            });
        });
    }
}
