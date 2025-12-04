import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/dashboard/Overview";
import MyListing from "./pages/dashboard/MyListing";
import Analytics from "./pages/dashboard/Analytics";
import GmbSettings from "./pages/dashboard/GmbSettings";
import BulkImport from "./pages/dashboard/BulkImport";
import Settings from "./pages/dashboard/Settings";
import LeadInbox from "./pages/dashboard/LeadInbox";
import BusinessDetail from "./pages/BusinessDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/business/:slug" element={<BusinessDetail />} />
            <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="listing" element={<MyListing />} />
            <Route path="leads" element={<LeadInbox />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="gmb" element={<GmbSettings />} />
            <Route path="bulk-import" element={<BulkImport />} />
            <Route path="settings" element={<Settings />} />
          </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
