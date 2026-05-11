import { settingsService } from '../services/settings.service.js';

export class SettingsModule {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render() {
        if (!this.container) return;

        const current = settingsService.current;
        const tierLabels = {
            0.25: 'Consultor Mayor (25%)',
            0.35: 'Consultor del Éxito (35%)',
            0.42: 'Productor Calificado (42%)',
            0.50: 'Mayorista / Supervisor (50%)'
        };
        
        const html = `
            <div class="fade-in">
                <header style="margin-bottom: 1.5rem;">
                    <h1>Configuración</h1>
                    <p>Personaliza tus niveles de descuento, impuestos y preferencias.</p>
                </header>
                
                <div class="bento-grid">
                    <!-- Pricing Settings -->
                    <div class="bento-card bento-span-2">
                        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-tag" style="color: var(--color-primary);"></i>
                            Precios y Descuentos
                        </h3>
                        
                        <form id="settingsForm" style="display: flex; flex-direction: column; gap: 1.5rem;">
                            <div class="form-group">
                                <label class="form-label">Nivel de Descuento Actual</label>
                                <select id="s_discountTier" class="form-select">
                                    <option value="0.25" ${current.discountTier === 0.25 ? 'selected' : ''}>Consultor Mayor (25%)</option>
                                    <option value="0.35" ${current.discountTier === 0.35 ? 'selected' : ''}>Consultor del Éxito (35%)</option>
                                    <option value="0.42" ${current.discountTier === 0.42 ? 'selected' : ''}>Productor Calificado (42%)</option>
                                    <option value="0.50" ${current.discountTier === 0.50 ? 'selected' : ''}>Mayorista / Supervisor (50%)</option>
                                </select>
                                <p style="font-size: 0.75rem; color: var(--color-text-faint); margin-top: 0.25rem;">
                                    Tu nivel actual determina el descuento aplicado sobre la Base de Descuento (BD) de cada producto.
                                </p>
                            </div>
                            
                            <div class="form-checkbox-row">
                                <input type="checkbox" id="s_includeRE" ${current.includeRE ? 'checked' : ''}>
                                <label for="s_includeRE" class="form-label" style="cursor: pointer;">Aplicar Recargo de Equivalencia (RE)</label>
                            </div>
                            
                            <!-- Tax breakdown info -->
                            <div style="padding: 1rem; background: var(--color-bg-app); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
                                <p style="font-size: 0.75rem; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 0.75rem;">Tasas de impuestos aplicadas:</p>
                                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; font-size: 0.75rem;">
                                    <div>
                                        <span class="badge badge-primary" style="margin-bottom: 0.25rem; display: inline-block;">Nutrición</span>
                                        <div style="color: var(--color-text-muted);">IVA: 10%${current.includeRE ? ' + RE: 1,4%' : ''}</div>
                                        <div style="font-weight: 600; color: var(--color-text-main);">Total: ${current.includeRE ? '11,4%' : '10%'}</div>
                                    </div>
                                    <div>
                                        <span class="badge badge-info" style="margin-bottom: 0.25rem; display: inline-block;">Cosmética</span>
                                        <div style="color: var(--color-text-muted);">IVA: 21%${current.includeRE ? ' + RE: 5,2%' : ''}</div>
                                        <div style="font-weight: 600; color: var(--color-text-main);">Total: ${current.includeRE ? '26,2%' : '21%'}</div>
                                    </div>
                                    <div>
                                        <span class="badge badge-neutral" style="margin-bottom: 0.25rem; display: inline-block;">Literatura</span>
                                        <div style="color: var(--color-text-muted);">IVA: 4%${current.includeRE ? ' + RE: 0,5%' : ''}</div>
                                        <div style="font-weight: 600; color: var(--color-text-main);">Total: ${current.includeRE ? '4,5%' : '4%'}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Formula display -->
                            <div style="padding: 1rem; background: var(--color-primary-light); border-radius: var(--radius-lg); border: 1px solid rgba(101, 163, 13, 0.15);">
                                <p style="font-size: 0.75rem; color: var(--color-primary-dark); font-weight: 500; display: flex; align-items: center; gap: 0.5rem;">
                                    <i class="ph ph-math-operations"></i>
                                    Fórmula: <code class="font-mono" style="background: rgba(0,0,0,0.05); padding: 0.125rem 0.375rem; border-radius: var(--radius-xs);">Precio = (PL - BD × ${(current.discountTier * 100).toFixed(0)}%) × (1 + IVA${current.includeRE ? ' + RE' : ''})</code>
                                </p>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" style="justify-content: center; padding: 0.75rem;">
                                <i class="ph ph-check"></i> Guardar Preferencias
                            </button>
                        </form>
                    </div>
                    
                    <!-- Sync Status -->
                    <div class="bento-card">
                        <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="ph ph-cloud-check" style="color: var(--color-success);"></i>
                            Sincronización
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
                                <span style="color: var(--color-text-muted);">Estado</span>
                                <span style="display: flex; align-items: center; gap: 0.375rem; color: var(--color-success); font-weight: 550;">
                                    <span style="width: 7px; height: 7px; border-radius: 50%; background: var(--color-success); display: inline-block;" class="animate-pulse"></span>
                                    Conectado
                                </span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
                                <span style="color: var(--color-text-muted);">Backend</span>
                                <span style="font-weight: 500;">Supabase</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem;">
                                <span style="color: var(--color-text-muted);">Deploy</span>
                                <span style="font-weight: 500;">Netlify</span>
                            </div>
                            <hr style="border: none; border-top: 1px solid var(--color-border-subtle);">
                            <button class="btn btn-secondary" id="btnForceSync" style="justify-content: center;">
                                <i class="ph ph-arrows-clockwise"></i> Forzar Sincronización
                            </button>
                        </div>

                        <div style="margin-top: 1.5rem;">
                            <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="ph ph-info" style="color: var(--color-info);"></i>
                                Sobre la App
                            </h3>
                            <div style="font-size: 0.8125rem; color: var(--color-text-muted); display: flex; flex-direction: column; gap: 0.375rem;">
                                <div>Versión: <strong>2.0.0</strong></div>
                                <div>Motor de Precios: <strong>Abril 2026</strong></div>
                                <div>Arquitectura: <strong>Modular ES6</strong></div>
                            </div>
                        </div>
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
            window.toast?.success('Configuración guardada correctamente');
            
            // Re-render to update the tax breakdown display
            this.render();
        });

        document.getElementById('btnForceSync')?.addEventListener('click', async () => {
            const btn = document.getElementById('btnForceSync');
            btn.innerHTML = '<div class="loader"></div> Sincronizando...';
            btn.disabled = true;
            
            try {
                const { salesService } = await import('../services/sales.service.js');
                const { prospectService } = await import('../services/prospect.service.js');
                await Promise.all([salesService.fetchAll(), prospectService.fetchAll()]);
                window.toast?.success('Datos sincronizados con éxito');
            } catch(err) {
                window.toast?.error('Error de sincronización: ' + err.message);
            }
            
            btn.innerHTML = '<i class="ph ph-arrows-clockwise"></i> Forzar Sincronización';
            btn.disabled = false;
        });
    }
}
