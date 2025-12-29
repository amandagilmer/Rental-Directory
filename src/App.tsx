import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SupportChatWidget } from "@/components/SupportChatWidget";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BusinessDetail from "./pages/BusinessDetail";
import UnitDetail from "./pages/UnitDetail";
import BadgeExplainer from "./pages/BadgeExplainer";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/dashboard/Overview";
import MyListing from "./pages/dashboard/MyListing";
import BusinessInfo from "./pages/dashboard/BusinessInfo";
import Analytics from "./pages/dashboard/Analytics";
import GmbSettings from "./pages/dashboard/GmbSettings";
import Settings from "./pages/dashboard/Settings";
import LeadInbox from "./pages/dashboard/LeadInbox";
import Reviews from "./pages/dashboard/Reviews";
import TriggerLinks from "./pages/dashboard/TriggerLinks";
import Auth from "./pages/Auth";
import SubmitReview from "./pages/SubmitReview";
import ReviewWidget from "./pages/ReviewWidget";
import ReviewLanding from "./pages/ReviewLanding";
import TriggerRedirect from "./pages/TriggerRedirect";
import ClaimBusiness from "./pages/ClaimBusiness";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminBulkImport from "./pages/admin/AdminBulkImport";
import AdminPages from "./pages/admin/AdminPages";
import AdminFaqs from "./pages/admin/AdminFaqs";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminBadges from "./pages/admin/AdminBadges";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminLiveChat from "./pages/admin/AdminLiveChat";
import AdminCategories from "./pages/admin/AdminCategories";
import MyTickets from "./pages/MyTickets";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <SupportChatWidget />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/business/:slug" element={<BusinessDetail />} />
          <Route path="/business/:slug/unit/:unitId" element={<UnitDetail />} />
          <Route path="/badges" element={<BadgeExplainer />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/review/:token" element={<SubmitReview />} />
          <Route path="/widget/reviews/:businessId" element={<ReviewWidget />} />
          <Route path="/review-landing/:businessId" element={<ReviewLanding />} />
          <Route path="/go/:code" element={<TriggerRedirect />} />
          <Route path="/claim/:token" element={<ClaimBusiness />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="business-info" element={<BusinessInfo />} />
            <Route path="listing" element={<MyListing />} />
            <Route path="trigger-links" element={<TriggerLinks />} />
            <Route path="leads" element={<LeadInbox />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="gmb" element={<GmbSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="import" element={<AdminBulkImport />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="marketing" element={<AdminMarketing />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="live-chat" element={<AdminLiveChat />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="faqs" element={<AdminFaqs />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="badges" element={<AdminBadges />} />
          </Route>
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
