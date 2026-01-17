import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter } from "react-router-dom";
import { type ReactNode } from "react";
import { ThemeProvider } from "../hooks/use-theme";
import { AuthProvider } from "../modules/auth/components/AuthProvider";


export function AppProviders({ children }: { children?: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}
