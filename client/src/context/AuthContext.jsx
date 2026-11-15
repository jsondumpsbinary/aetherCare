import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("aethercare_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("aethercare_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
          localStorage.setItem("aethercare_user", JSON.stringify(response.data));
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, [token]);

  async function login(email, password) {
    const res = await api.login({ email, password });
    if (res.success && res.data) {
      const { token: newToken, user: newUser } = res.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("aethercare_token", newToken);
      localStorage.setItem("aethercare_user", JSON.stringify(newUser));
      return { success: true };
    }
    return { success: false, message: res.message || "Login failed" };
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("aethercare_token");
    localStorage.removeItem("aethercare_user");
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
