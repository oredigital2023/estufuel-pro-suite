import { supabase, handleSupabaseError } from './supabase.config.js';

/**
 * AuthService
 * Handles real user authentication via Supabase Auth.
 */
class AuthService {
    constructor() {
        this.user = null;
        this.session = null;
        this._initAuthListener();
    }

    /**
     * Initializes the Supabase auth listener to handle session changes globally.
     */
    _initAuthListener() {
        supabase.auth.onAuthStateChange((event, session) => {
            console.log(`[Auth Event] ${event}`);
            this.session = session;
            this.user = session?.user || null;
            
            // Notify the application
            const authEvent = new CustomEvent('auth:stateChange', { 
                detail: { event, user: this.user, session: this.session } 
            });
            window.dispatchEvent(authEvent);
        });
    }

    /**
     * Returns the current session, or null if not logged in.
     */
    async getSession() {
        try {
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;
            
            this.session = data.session;
            this.user = data.session?.user || null;
            return data.session;
        } catch (error) {
            console.error('[AuthService.getSession] Error:', error);
            return null;
        }
    }

    /**
     * Sign in with Email and Password
     */
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            handleSupabaseError(error, 'AuthService.signIn');
            throw error;
        }
        return data;
    }

    /**
     * Sign up a new user
     */
    async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            handleSupabaseError(error, 'AuthService.signUp');
            throw error;
        }
        return data;
    }

    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            handleSupabaseError(error, 'AuthService.signOut');
        }
    }

    /**
     * Password reset request
     */
    async resetPassword(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            handleSupabaseError(error, 'AuthService.resetPassword');
            throw error;
        }
    }
}

export const authService = new AuthService();
