import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { CONFIG } from '../utils/config.js';

// Initialize the Supabase client using the configuration
export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// Generic error handler for Supabase requests
export const handleSupabaseError = (error, context = '') => {
    console.error(`[Supabase Error] ${context}:`, error);
    // Future: dispatch custom event for global error UI (toast)
    const event = new CustomEvent('app:error', { detail: { message: error.message || 'Error de conexión', context } });
    window.dispatchEvent(event);
};
