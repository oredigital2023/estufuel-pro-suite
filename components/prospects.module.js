import { prospectService } from '../services/prospect.service.js';

export class ProspectsModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.bindEvents();
    }

    bindEvents() {
        window.addEventListener('data:prospectsChanged', () => this.render());
    }

    render() {
        if (!this.container) return;

        const prospects = prospectService.prospectsCache || [];
        
        let html = `
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.5rem; letter-spacing: -0.025em;">Gestión de Prospectos</h1>
                    <p>Total: ${prospects.length} registros</p>
                </div>
                <button class="btn btn-primary" id="btnNewProspectMain"><i class="ph ph-plus"></i> Añadir Prospecto</button>
            </header>
            
            <div style="background: var(--color-bg-panel); border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: var(--color-bg-app); border-bottom: 1px solid var(--color-border);">
                        <tr>
                            <th style="padding: 1rem; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Nombre</th>
                            <th style="padding: 1rem; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Teléfono</th>
                            <th style="padding: 1rem; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Estado</th>
                            <th style="padding: 1rem; font-weight: 500; color: var(--color-text-muted); font-size: 0.875rem;">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (prospects.length === 0) {
            html += `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--color-text-muted);">No hay prospectos registrados.</td></tr>`;
        } else {
            prospects.forEach(p => {
                const badgeColor = p.estado === 'Convertido' ? 'var(--color-success)' : 
                                   (p.estado === 'Perdido' ? 'var(--color-danger)' : 'var(--color-info)');
                
                html += `
                    <tr style="border-bottom: 1px solid var(--color-border);">
                        <td style="padding: 1rem; font-weight: 500;">${p.nombre}</td>
                        <td style="padding: 1rem; color: var(--color-text-muted);">${p.telefono || '-'}</td>
                        <td style="padding: 1rem;">
                            <span style="background: ${badgeColor}20; color: ${badgeColor}; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 500;">
                                ${p.estado || 'Nuevo'}
                            </span>
                        </td>
                        <td style="padding: 1rem;">
                            <button class="btn btn-secondary btn-edit-prospect" data-id="${p.id}" style="padding: 0.25rem 0.5rem;"><i class="ph ph-pencil-simple"></i></button>
                        </td>
                    </tr>
                `;
            });
        }

        html += `</tbody></table></div>`;
        this.container.innerHTML = html;
        this.setupListeners();
    }

    setupListeners() {
        document.getElementById('btnNewProspectMain')?.addEventListener('click', () => {
            const event = new CustomEvent('ui:openSlideOver', { detail: { type: 'newProspect' } });
            window.dispatchEvent(event);
        });

        document.querySelectorAll('.btn-edit-prospect').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const prospect = prospectService.prospectsCache.find(p => p.id === id);
                if (prospect) {
                    const event = new CustomEvent('ui:openSlideOver', { detail: { type: 'editProspect', data: prospect } });
                    window.dispatchEvent(event);
                }
            });
        });
    }
}
