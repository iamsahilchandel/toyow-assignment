import { createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
} from "@/store/slices/auth-slice";
import { authApi } from "@/lib/api/auth";
import type { LoginCredentials } from "@/lib/types/auth";

interface AuthContextType {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const login = async (credentials: LoginCredentials) => {
    dispatch(setLoading(true));
    try {
      const response = await authApi.login(credentials);
      dispatch(setCredentials(response));
      navigate("/");
    } catch (error) {
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
