import { createContext, useContext, useEffect, type ReactNode } from "react";
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

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        dispatch(setLoading(true));
        try {
          const user = await authApi.getCurrentUser();
          const refreshToken = localStorage.getItem("refreshToken");
          dispatch(
            setCredentials({
              user,
              tokens: { accessToken, refreshToken: refreshToken || "" },
            })
          );
        } catch (error) {
          // Token invalid, remove it
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch(logoutAction());
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  const login = async (credentials: LoginCredentials) => {
    dispatch(setLoading(true));
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem("accessToken", response.tokens.accessToken);
      localStorage.setItem("refreshToken", response.tokens.refreshToken);
      dispatch(setCredentials(response));
      navigate("/");
    } catch (error) {
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
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
