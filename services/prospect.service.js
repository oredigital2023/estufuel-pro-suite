import { supabase, handleSupabaseError } from './supabase.config.js';
import { authService } from './auth.service.js';

class ProspectService {
    constructor() {
        this.tableName = 'suite_prospects';
        this.prospectsCache = [];
    }

    async fetchAll() {
        if (!authService.user) throw new Error('Usuario no autenticado');
        
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .order('fecha_registro', { ascending: false });

        if (error) {
            handleSupabaseError(error, 'ProspectService.fetchAll');
            return [];
        }
        
        this.prospectsCache = data;
        return data;
    }

    async create(prospectData) {
        if (!authService.user) throw new Error('Usuario no autenticado');

        const payload = { ...prospectData };
        const { data, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select()
            .single();

        if (error) {
            handleSupabaseError(error, 'ProspectService.create');
            throw error;
        }

        this.prospectsCache.unshift(data); // Add to local cache
        this._emitChange();
        return data;
    }

    async update(id, updates) {
        const { data, error } = await supabase
            .from(this.tableName)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            handleSupabaseError(error, 'ProspectService.update');
            throw error;
        }

        // Update local cache
        const index = this.prospectsCache.findIndex(p => p.id === id);
        if (index !== -1) this.prospectsCache[index] = data;
        
        this._emitChange();
        return data;
    }

    async delete(id) {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) {
            handleSupabaseError(error, 'ProspectService.delete');
            throw error;
        }

        this.prospectsCache = this.prospectsCache.filter(p => p.id !== id);
        this._emitChange();
    }

    // Event driven architecture
    _emitChange() {
        const event = new CustomEvent('data:prospectsChanged', { detail: this.prospectsCache });
        window.dispatchEvent(event);
    }
}

export const prospectService = new ProspectService();
