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

  const handleSignOut = useCallback(async () => {
    // *** NEW: Add logging for sign-out ***
    console.log("User signing out.");
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || (session && !session.user)) {
        console.error("AuthContext: Invalid session found on initial load, signing out.", error);
        await handleSignOut();
      } else {
        setUser(session?.user ?? null);
      }
      setLoading(false);
    };
    
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // *** NEW: Add detailed logging for auth state changes ***
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
      // *** NEW: Add logging for sign-in attempts ***
      console.log("Attempting to sign in user:", data.email);
      const response = await supabase.auth.signInWithPassword(data);
      if (response.error) {
        console.error("Sign-in error:", response.error.message);
      } else {
        console.log("Sign-in successful for:", response.data.user.email);
      }
      return response;
    },
    signUp: async (email, password, metadata) => {
      // *** NEW: Add logging for sign-up attempts ***
      console.log("Attempting to sign up new user:", email);
      const response = await supabase.auth.signUp({ email, password, options: { data: metadata } });
      if (response.error) {
        console.error("Sign-up error:", response.error.message);
      } else {
        console.log("Sign-up successful for:", response.data.user.email);
      }
      return response;
    },
    signOut: handleSignOut, 
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};