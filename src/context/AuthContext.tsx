"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);

            // Upsert user profile on login
            if (session?.user) {
                const { user } = session;
                // We can upsert basic info. 
                // Note: Supabase RLS policies must allow this.
                const updates = {
                    id: user.id,
                    full_name: user.user_metadata.full_name,
                    avatar_url: user.user_metadata.avatar_url,
                    updated_at: new Date(),
                };

                // Fire and forget upsert to ensure profile exists
                supabase.from('profiles').upsert(updates).then(({ error }) => {
                    if (error) console.error("Error upserting profile:", error);
                });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Error signing out:", error);
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
