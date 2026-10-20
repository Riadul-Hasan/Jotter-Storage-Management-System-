import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

/**
 * AuthContext — the single source of truth for the signed-in user.
 *
 * Previously every component fetched `/auth/me` on its own and kept a private
 * copy of the user, so a profile update (e.g. a new avatar) was visible on the
 * Profile page but never reached the header or any other page. This context
 * holds one user object and exposes a `setUser`/`patchUser` so any successful
 * mutation can be merged into it immediately.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const next = res.data?.user || null;
      setUserState(next);
      return next;
    } catch {
      setUserState(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Merge a partial update (e.g. `{ avatar: '/uploads/x.png' }`) into the
  // global user so every consumer re-renders with the new value.
  const patchUser = useCallback((patch) => {
    if (!patch) return;
    setUserState((prev) => (prev ? { ...prev, ...patch } : { ...patch }));
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore — the session may already be gone */
    }
    setUserState(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser: setUserState, patchUser, refreshUser, logout, loading }),
    [user, patchUser, refreshUser, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside an <AuthProvider>');
  return ctx;
};

export default AuthContext;
