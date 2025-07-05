// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { authLogger } from '../utils/logger';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    try {
      authLogger.info("User signing out");
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
      navigate('/login');
    } catch (err) {
      authLogger.error("Sign out error", { error: err.message });
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
          authLogger.error("Session error", { error: error.message });
          throw error;
        }

        if (!mounted) return;

        if (session?.user) {
          authLogger.info("Valid session found");
          setUser(session.user);
        } else {
          authLogger.info("No valid session found");
          setUser(null);
        }
      } catch (err) {
        authLogger.error("Session retrieval error", { error: err.message });
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
      authLogger.info(`Auth event: ${event}`);
      
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
      authLogger.info("Attempting to sign in user");
      
      const { data: authData, error } = await supabase.auth.signInWithPassword(data);
      
      if (error) throw error;
      
      authLogger.info("Sign-in successful");
      return { data: authData, error: null };
    } catch (err) {
      authLogger.error("Sign-in error", { error: err.message });
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
      authLogger.info("Attempting to sign up new user");
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      authLogger.info("Sign-up successful");
      return { data, error: null };
    } catch (err) {
      authLogger.error("Sign-up error", { error: err.message });
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