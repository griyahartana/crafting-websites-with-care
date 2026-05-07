import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminGate } from "@/components/AdminGate";
import { InstallPrompt } from "@/components/InstallPrompt";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminGate><Index /></AdminGate>} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/app/*" element={<AdminGate><Index /></AdminGate>} />
          <Route path="/dashboard/*" element={<AdminGate><Index /></AdminGate>} />
          <Route path="/onboarding" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallPrompt />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
