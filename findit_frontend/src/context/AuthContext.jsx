import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore, setUnauthorizedHandler } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logoutLocal = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logoutLocal);
  }, [logoutLocal]);

  useEffect(() => {
    let alive = true;
    async function init() {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.get("/auth/me/");
        if (alive) setUser(me);
      } catch {
        tokenStore.clear();
      } finally {
        if (alive) setLoading(false);
      }
    }
    init();
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (loginValue, password) => {
    // Eski token 401 qaytarmasligi uchun auth:false
    const data = await api.post("/auth/login/", { username: loginValue, password }, { auth: false });
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
   const data = await api.post("/auth/login/", { username: loginValue, password }, { auth: false });
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post("/auth/logout/"); } catch { /* ignore */ }
    logoutLocal();
  }, [logoutLocal]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAuth: !!user,
    isModerator: !!user && (user.role === "moderator" || user.role === "admin"),
    isAdmin: !!user && user.role === "admin",
  }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth AuthProvider ichida ishlatilishi kerak");
  return ctx;
}