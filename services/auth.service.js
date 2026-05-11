import { supabase, handleSupabaseError } from './supabase.config.js';

class AuthService {
    constructor() {
        this.user = null;
        this.session = null;
        this.initAuthListener();
    }

    async getSession() {
        // Mock session for backward compatibility with existing data
        const mockSession = { user: { id: 'demo-user', email: 'demo@estufuel.com' } };
        this.session = mockSession;
        this.user = mockSession.user;
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return mockSession;
    }

    initAuthListener() {
        /*
        supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[Auth Event] ${event}`);
            this.session = session;
            this.user = session?.user || null;
            
            // Dispatch event for UI updates
            const authEvent = new CustomEvent('auth:stateChange', { 
                detail: { event, user: this.user } 
            });
            window.dispatchEvent(authEvent);
        });
        */
    }

    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            handleSupabaseError(error, 'signIn');
            throw error;
        }
        return data;
    }

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) handleSupabaseError(error, 'signOut');
    }
}

export const authService = new AuthService();
