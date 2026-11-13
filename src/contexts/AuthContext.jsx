import { createContext, useContext, useState, useEffect } from 'react';
import { isSheetsConfigured, sheetsClient } from '../services/googleSheets.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sheetsClient.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      setLoading(false);
    });

    const { data } = sheetsClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await sheetsClient.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message || 'Login gagal');
    return data.user;
  };

  const register = async (userData) => {
    const { data, error } = await sheetsClient.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: { data: userData },
    });
    if (error) throw new Error(error.message || 'Registrasi gagal');
    return data.user;
  };

  const logout = async () => {
    await sheetsClient.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSheetsConfigured,
        isSupabaseConfigured: isSheetsConfigured,
        login,
        register,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);