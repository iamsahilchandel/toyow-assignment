import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { AppRoutes } from "@/routes";
import { AuthProvider } from "@/features/auth/auth-provider";
import { Toaster } from "sonner";
import { BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch } from "@/hooks/use-redux";
import { initializeAuth } from "@/store/slices/auth-slice";
import { ThemeProvider } from "@/hooks/use-theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth from localStorage on app load
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
