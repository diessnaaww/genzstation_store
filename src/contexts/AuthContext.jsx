import { createContext, useContext, useState, useEffect } from 'react';
import { isSheetsConfigured, sheetsClient } from '../services/googleSheets.js';

const defaultAuthContext = {
  user: null,
  session: null,
  loading: false,
  isSheetsConfigured,
  isSupabaseConfigured: isSheetsConfigured,
  login: async () => {
    throw new Error('AuthProvider belum terpasang');
  },
  register: async () => {
    throw new Error('AuthProvider belum terpasang');
  },
  logout: async () => {},
  signOut: async () => {},
};

const AuthContext = createContext(defaultAuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sheetsClient.auth.getSession().then(({ data }) => {
      const currentSession = data?.session || null;
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setLoading(false);
    });

    const { data } = sheetsClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
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
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isSheetsConfigured,
        isSupabaseConfigured: isSheetsConfigured,
        login,
        register,
        logout,
        signOut: logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext) ?? defaultAuthContext;