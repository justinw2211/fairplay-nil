// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    try {
      console.log("[AuthContext] User signing out");
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
      navigate('/login');
    } catch (err) {
      console.error("[AuthContext] Sign out error:", err);
      setError(err.message);
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[AuthContext] Session error:", error);
          throw error;
        }

        if (!mounted) return;

        if (session?.user) {
          console.log("[AuthContext] Valid session found for:", session.user.email);
          setUser(session.user);
        } else {
          console.log("[AuthContext] No valid session found");
          setUser(null);
        }
      } catch (err) {
        console.error("[AuthContext] Session retrieval error:", err);
        if (mounted) {
          setError(err.message);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[AuthContext] Auth event: ${event}`, session?.user?.email);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN') {
        setUser(session.user);
        setError(null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
      } else if (event === 'USER_UPDATED') {
        setUser(session?.user ?? null);
        setError(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (data) => {
    try {
      setLoading(true);
      setError(null);
      console.log("[AuthContext] Attempting to sign in user:", data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword(data);
      
      if (error) throw error;
      
      console.log("[AuthContext] Sign-in successful for:", authData.user.email);
      return { data: authData, error: null };
    } catch (err) {
      console.error("[AuthContext] Sign-in error:", err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, metadata) => {
    try {
      setLoading(true);
      setError(null);
      console.log("[AuthContext] Attempting to sign up new user:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      console.log("[AuthContext] Sign-up successful for:", data.user.email);
      return { data, error: null };
    } catch (err) {
      console.error("[AuthContext] Sign-up error:", err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};