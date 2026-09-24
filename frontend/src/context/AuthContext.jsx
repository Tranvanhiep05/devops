import { createContext, useContext, useState } from "react";
import { api, clearSession, getRole, getToken, getUsername, setSession } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [role, setRoleState] = useState(() => getRole());
  const [username, setUsernameState] = useState(() => getUsername());

  const applySession = (session) => {
    setSession(session);
    setTokenState(session.token);
    setRoleState(session.role);
    setUsernameState(session.username);
    return session;
  };

  const login = async (username, password) => {
    const session = await api.login(username, password);
    return applySession(session);
  };

  const register = async (username, password) => {
    const session = await api.register(username, password);
    return applySession(session);
  };

  const logout = () => {
    clearSession();
    setTokenState(null);
    setRoleState(null);
    setUsernameState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        role,
        username,
        isAdmin: role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
