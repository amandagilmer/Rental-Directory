import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageSquare, Shield, Truck, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Contact() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Pre-fill form data if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || prev.name
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setIsSubmitting(true);

      const tryInsert = async (data: any) => {
        console.log('Attempting ticket submission with payload:', data);
        const result = await supabase.from('support_tickets').insert([data]);
        return result;
      };

      // Level 1: Full tactical insert
      let ticketData: any = {
        subject: formData.subject,
        description: formData.message,
        status: 'open',
        priority: 'medium',
        category: 'other',
        user_id: user?.id
      };

      if (!user) {
        ticketData.guest_name = formData.name;
        ticketData.guest_email = formData.email;
      }

      let { error } = await tryInsert(ticketData);

      // Level 2: Handle guest column cache delay (PGRST204 for guest_name/email)
      if (error && error.code === 'PGRST204' && !user) {
        console.warn('Guest columns not found in cache, trying Level 2 fallback (description-based guest info).');
        const level2Data = {
          subject: formData.subject,
          description: `[GUEST SUBMISSION]\nName: ${formData.name}\nEmail: ${formData.email}\n---\n${formData.message}`,
          status: 'open',
          priority: 'medium',
          category: 'other',
          user_id: null
        };
        const level2Result = await tryInsert(level2Data);
        error = level2Result.error;
      }

      // Level 3: Handle category column cache delay (PGRST204 for category)
      if (error && error.code === 'PGRST204') {
        console.warn('Category column not found in cache, trying Level 3 fallback (minimal insert).');
        const level3Data: any = {
          subject: formData.subject,
          description: user
            ? formData.message
            : `[GUEST SUBMISSION]\nName: ${formData.name}\nEmail: ${formData.email}\n---\n${formData.message}`,
          status: 'open',
          priority: 'medium',
          user_id: user?.id || null
        };
        // Remove category if it caused the failure
        const level3Result = await tryInsert(level3Data);
        error = level3Result.error;
      }

      if (error) throw error;

      toast.success("Message sent. Our team will review the intel and get back to you.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting ticket:", error);
      toast.error("Comms failed. Please try again or use the direct email link.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden border-b border-white/5 text-center">
          <div className="absolute inset-0 bg-blue-900/5" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl md:text-7xl font-black font-display italic uppercase tracking-tighter text-white mb-6">
              Get <span className="text-red-600">In Touch</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              Real people. Real responses. No runaround.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Direct Intel & Help Section */}
              <div className="space-y-12">
                <div className="space-y-8">
                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tight font-display mb-8">
                    Need Help? <span className="text-red-600">Start Here.</span>
                  </h2>

                  <div className="space-y-8">
                    {/* Renter Guidance */}
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-red-600/20 flex items-center justify-center text-red-500">
                        <Truck className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight italic font-display">🚛 Renting a trailer?</h3>
                        <p className="text-gray-400 leading-relaxed">
                          Contact the operator directly from their listing. They're the ones with the trailers — they can answer your questions about availability, pricing, and equipment faster than anyone.
                        </p>
                        <a href="/" className="inline-block text-red-500 font-bold hover:underline uppercase text-sm tracking-widest mt-2">Find a Rig →</a>
                      </div>
                    </div>

                    {/* Operator Guidance */}
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight italic font-display">📋 Want to join as an operator?</h3>
                        <p className="text-gray-400 leading-relaxed">
                          Head to our Join the Brotherhood page to apply. Questions about the process? Hit us at <a href="mailto:operators@patriothauls.com" className="text-white hover:underline">operators@patriothauls.com</a>
                        </p>
                        <a href="/join" className="inline-block text-blue-500 font-bold hover:underline uppercase text-sm tracking-widest mt-2">Apply Now →</a>
                      </div>
                    </div>

                    {/* Issue Guidance */}
                    <div className="flex gap-6">
                      <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight italic font-display">⚠️ Having an issue with a rental?</h3>
                        <div className="space-y-3 text-gray-400 leading-relaxed">
                          <p><span className="text-white font-bold">Step 1:</span> Contact the operator directly. They want to make it right.</p>
                          <p><span className="text-white font-bold">Step 2:</span> If that doesn't work, email <a href="mailto:support@patriothauls.com" className="text-white hover:underline">support@patriothauls.com</a> with details and we'll help sort it out.</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Comms */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Dispatch</span>
                        <span className="text-white font-bold">support@patriothauls.com</span>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone Ops</span>
                        <span className="text-white font-bold">877-618-3959</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form & Report Section */}
              <div className="space-y-8">
                <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Shield className="h-32 w-32 text-red-600" />
                  </div>

                  <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter font-display mb-6">
                    Initiate <span className="text-red-600">Secure Comms</span>
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-xs uppercase tracking-widest text-gray-400 font-bold">Your Name</Label>
                        <Input
                          id="name"
                          required
                          className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-red-600 focus:ring-red-600/20"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs uppercase tracking-widest text-gray-400 font-bold">Secure Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 focus:border-red-600 focus:ring-red-600/20"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-xs uppercase tracking-widest text-gray-400 font-bold">Briefing Subject</Label>
                      <Input
                        id="subject"
                        required
                        className="bg-black/40 border-white/10 text-white placeholder:text-gray-600"
                        placeholder="Operator Complaint / General Inquiry"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-xs uppercase tracking-widest text-gray-400 font-bold">Full Intel</Label>
                      <Textarea
                        id="message"
                        required
                        className="bg-black/40 border-white/10 text-white placeholder:text-gray-600 min-h-[150px] resize-none"
                        placeholder="Provide all relevant mission details..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg font-bold uppercase tracking-widest shadow-xl shadow-red-600/20 group"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                          Transmitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {/* Report a Problem Sidebar */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-red-500 font-bold uppercase text-sm tracking-widest">
                    <AlertCircle className="h-5 w-5" />
                    Report a Problem
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Had a bad experience with an operator? Use the form above or email <a href="mailto:support@patriothauls.com" className="text-white hover:underline">support@patriothauls.com</a> directly. We investigate every complaint.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const AlertCircle = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);
