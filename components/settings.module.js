import { settingsService } from '../services/settings.service.js';

export class SettingsModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render() {
        if (!this.container) return;

        const current = settingsService.current;
        
        let html = `
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h1 style="font-size: 1.5rem; letter-spacing: -0.025em;">Configuración del Perfil</h1>
                    <p>Personaliza tus niveles de descuento e impuestos.</p>
                </div>
            </header>
            
            <div class="bento-grid">
                <div class="bento-card">
                    <h3 style="font-size: 1rem; margin-bottom: 1.5rem;">Precios y Descuentos</h3>
                    
                    <form id="settingsForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; font-size: 0.875rem;">Nivel de Descuento Actual</label>
                            <select id="s_discountTier" style="padding: 0.75rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-bg-app); color: var(--color-text-main);">
                                <option value="0.25" ${current.discountTier === 0.25 ? 'selected' : ''}>Consultor Mayor (25%)</option>
                                <option value="0.35" ${current.discountTier === 0.35 ? 'selected' : ''}>Consultor del Éxito (35%)</option>
                                <option value="0.42" ${current.discountTier === 0.42 ? 'selected' : ''}>Productor Calificado (42%)</option>
                                <option value="0.50" ${current.discountTier === 0.50 ? 'selected' : ''}>Mayorista / Supervisor (50%)</option>
                            </select>
                        </div>
                        
                        <div class="form-group" style="display: flex; align-items: center; gap: 0.75rem; cursor: pointer;">
                            <input type="checkbox" id="s_includeRE" ${current.includeRE ? 'checked' : ''} style="width: 1.25rem; height: 1.25rem; accent-color: var(--color-primary);">
                            <label for="s_includeRE" style="font-weight: 500; font-size: 0.875rem;">Aplicar Recargo de Equivalencia (RE)</label>
                        </div>
                        
                        <div style="padding: 1rem; background: var(--color-primary-light); border-radius: var(--radius-md); border: 1px solid var(--color-primary);">
                            <p style="font-size: 0.75rem; color: var(--color-primary-dark); font-weight: 500;">
                                <i class="ph ph-info"></i> Esta configuración afectará a todos los cálculos del catálogo y nuevas ventas.
                            </p>
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="justify-content: center;">
                            Guardar Preferencias
                        </button>
                    </form>
                </div>
                
                <div class="bento-card">
                    <h3 style="font-size: 1rem; margin-bottom: 1.5rem;">Sincronización Cloud</h3>
                    <p style="font-size: 0.875rem; margin-bottom: 1rem;">Tus datos se sincronizan automáticamente con Supabase.</p>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.875rem;">
                            <span color="var(--color-text-muted)">Estado:</span>
                            <span style="color: var(--color-success); font-weight: 600;">Conectado</span>
                        </div>
                        <button class="btn btn-secondary" style="justify-content: center;"><i class="ph ph-arrow-counter-clockwise"></i> Forzar Sincronización</button>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        this.setupListeners();
    }

    setupListeners() {
        document.getElementById('settingsForm')?.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const updates = {
                discountTier: parseFloat(document.getElementById('s_discountTier').value),
                includeRE: document.getElementById('s_includeRE').checked
            };
            
            settingsService.save(updates);
            alert('Configuración guardada correctamente.');
        });
    }
}
