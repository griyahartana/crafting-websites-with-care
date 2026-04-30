import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { InstallPrompt } from "@/components/InstallPrompt";
import { AppLayout } from "@/components/app/AppLayout";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Onboarding from "./pages/app/Onboarding";
import Home from "./pages/app/Home";
import CariBidan from "./pages/app/CariBidan";
import Chat from "./pages/app/Chat";
import Tracking from "./pages/app/Tracking";
import Kunjungan from "./pages/app/Kunjungan";
import Profil from "./pages/app/Profil";
import CatatanKehamilan from "./pages/app/CatatanKehamilan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<AppLayout />}>
            <Route index element={<Onboarding />} />
          </Route>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="cari-bidan" element={<CariBidan />} />
            <Route path="chat" element={<CariBidan />} />
            <Route path="chat/:id" element={<Chat />} />
            <Route path="kunjungan" element={<Kunjungan />} />
            <Route path="tracking" element={<Tracking />} />
            <Route path="catatan" element={<CatatanKehamilan />} />
            <Route path="profil" element={<Profil />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <InstallPrompt />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
