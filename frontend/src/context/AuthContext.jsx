import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("velamar_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem("velamar_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    localStorage.setItem("velamar_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await api.signup(payload);
    localStorage.setItem("velamar_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("velamar_token");
    setUser(null);
  };

  const refreshUser = async () => {
    const data = await api.getMe();
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
