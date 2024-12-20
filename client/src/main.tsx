import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { BrewingProvider } from "@/context/BrewingContext";
import App from './App';
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrewingProvider>
        <App />
        <Toaster />
        <SonnerToaster position="bottom-right" theme="dark" />
      </BrewingProvider>
    </QueryClientProvider>
  </StrictMode>,
);
