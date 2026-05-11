/**
 * Settings Service
 * Manages user preferences like discount tier and tax regimen.
 */

class SettingsService {
    constructor() {
        this.defaults = {
            discountTier: 0.25, // 25% by default
            includeRE: true,    // Recargo de Equivalencia enabled by default
            taxRegimen: 'peninsula'
        };
        
        this.current = this.load();
    }

    load() {
        const saved = localStorage.getItem('estufuel_settings');
        return saved ? { ...this.defaults, ...JSON.parse(saved) } : { ...this.defaults };
    }

    save(updates) {
        this.current = { ...this.current, ...updates };
        localStorage.setItem('estufuel_settings', JSON.stringify(this.current));
        
        // Notify app of settings change
        window.dispatchEvent(new CustomEvent('settings:changed', { detail: this.current }));
    }

    get discountTier() { return this.current.discountTier; }
    get includeRE() { return this.current.includeRE; }
}

export const settingsService = new SettingsService();
