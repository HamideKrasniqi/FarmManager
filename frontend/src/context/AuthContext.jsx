/**
 * Auth context — single source of truth for session + role helpers.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persist = useCallback((nextUser, tokens) => {
    if (tokens?.access) localStorage.setItem('access_token', tokens.access);
    if (tokens?.refresh) localStorage.setItem('refresh_token', tokens.refresh);
    if (nextUser) {
      localStorage.setItem('user', JSON.stringify(nextUser));
      setUser(nextUser);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const login = useCallback(
    async (username, password) => {
      const { data } = await authApi.login(username, password);
      persist(data.user, { access: data.access, refresh: data.refresh });
      return data.user;
    },
    [persist]
  );

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    return data;
  }, []);

  // Re-validate token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(({ data }) => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      register,
      isAuthenticated: Boolean(user),
      isSuperAdmin: user?.role === 'SUPERADMIN',
      isOwner: user?.role === 'OWNER',
      isManager: user?.role === 'MANAGER',
      isWorker: user?.role === 'WORKER',
      isFarmStaff: user?.role === 'OWNER' || user?.role === 'MANAGER',
    }),
    [user, loading, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
