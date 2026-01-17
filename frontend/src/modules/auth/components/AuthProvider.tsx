import { createContext, useContext, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
} from "../auth.slice";
import { useLoginMutation } from "../auth.api";
import type { LoginCredentials } from "../../../shared/types/auth";

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
  const [loginMutation] = useLoginMutation();

  const login = async (credentials: LoginCredentials) => {
    dispatch(setLoading(true));
    try {
      const response = await loginMutation(credentials).unwrap();

      if (!response.data.tokens.accessToken) {
        throw new Error("No access token received from server");
      }

      dispatch(setCredentials(response.data));
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
