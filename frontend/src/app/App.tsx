import { useEffect } from "react";
import { useAppDispatch } from "./hooks";
import { initializeAuth } from "../modules/auth/auth.slice";
import { AppRouter } from "./router";
import { Toaster } from "sonner";
import { AppProviders } from "./providers";

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth from localStorage on app load
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
