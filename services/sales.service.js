import { supabase, handleSupabaseError } from './supabase.config.js';
import { authService } from './auth.service.js';

class SalesService {
    constructor() {
        this.cache = {
            transactions: [],
            customers: [],
            products: []
        };
        this.tables = {
            transactions: 'suite_transactions',
            customers: 'suite_customers',
            products: 'suite_products'
        };
    }

    async fetchAll() {
        if (!authService.user) throw new Error('Usuario no autenticado');
        
        try {
            const [transactionsRes, customersRes, productsRes] = await Promise.all([
                supabase.from(this.tables.transactions).select('*'),
                supabase.from(this.tables.customers).select('*'),
                supabase.from(this.tables.products).select('*')
            ]);

            if (transactionsRes.error) throw transactionsRes.error;
            if (customersRes.error) throw customersRes.error;
            if (productsRes.error) throw productsRes.error;

            this.cache.transactions = transactionsRes.data;
            this.cache.customers = customersRes.data;
            this.cache.products = productsRes.data;
            
            return this.cache;
        } catch (error) {
            handleSupabaseError(error, 'SalesService.fetchAll');
            return null;
        }
    }

    // Generic insert for any sales-related table
    async create(tableKey, dataPayload) {
        if (!authService.user) throw new Error('Usuario no autenticado');
        const tableName = this.tables[tableKey];
        if (!tableName) throw new Error(`Tabla ${tableKey} no soportada`);

        const payload = { ...dataPayload };
        const { data, error } = await supabase
            .from(tableName)
            .insert(payload)
            .select()
            .single();

        if (error) {
            handleSupabaseError(error, `SalesService.create[${tableName}]`);
            throw error;
        }

        this.cache[tableKey].push(data);
        this._emitChange(tableKey);
        return data;
    }

    // Generic update
    async update(tableKey, id, updates) {
        const tableName = this.tables[tableKey];
        const { data, error } = await supabase
            .from(tableName)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            handleSupabaseError(error, `SalesService.update[${tableName}]`);
            throw error;
        }

        const index = this.cache[tableKey].findIndex(item => item.id === id);
        if (index !== -1) this.cache[tableKey][index] = data;
        
        this._emitChange(tableKey);
        return data;
    }

    // Generic delete
    async delete(tableKey, id) {
        const tableName = this.tables[tableKey];
        if (!tableName) throw new Error(`Tabla ${tableKey} no soportada`);

        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) {
            handleSupabaseError(error, `SalesService.delete[${tableName}]`);
            throw error;
        }

        this.cache[tableKey] = this.cache[tableKey].filter(item => item.id !== id);
        this._emitChange(tableKey);
    }

    _emitChange(tableKey) {
        const event = new CustomEvent(`data:${tableKey}Changed`, { detail: this.cache[tableKey] });
        window.dispatchEvent(event);
    }
}

export const salesService = new SalesService();
