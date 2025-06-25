// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // This is the function that will clear an invalid session.
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login'); // Redirect to login after sign out
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    // Check for a user session when the app first loads.
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // *** BUG FIX: If Supabase returns an error trying to get the session, sign out. ***
      // This handles the "Session from session_id claim in JWT does not exist" error.
      if (error || (session && !session.user)) {
        console.error("Invalid session found, signing out.", error);
        await handleSignOut();
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };
    
    getSession();

    // Listen for future authentication state changes.
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Supabase auth event: ${event}`, session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [handleSignOut]);

  const value = {
    user,
    loading,
    signIn: async (data) => {
      return await supabase.auth.signInWithPassword(data);
    },
    signUp: async (email, password, metadata) => {
      return await supabase.auth.signUp({ email, password, options: { data: metadata } });
    },
    // Expose the handleSignOut function so it can be used in the UI.
    signOut: handleSignOut, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};