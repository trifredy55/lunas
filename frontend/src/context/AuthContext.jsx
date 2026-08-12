import { createContext, useContext, useEffect, useState } from 'react';

import api from '../api/api';

const AuthContext = createContext(null);
const TOKEN_KEY = 'lunas_token';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setToken('');
      setUser(null);
      setLoading(false);
      return;
    }

    setToken(storedToken);

    api
      .get('/api/auth/me')
      .then((response) => {
        setUser(response.data.data);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const nextToken = response.data.token;

    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(response.data.data);

    return response.data;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/api/auth/register', { name, email, password });

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        setUser,
        setToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  }

  return context;
}

export { AuthProvider, useAuth };
