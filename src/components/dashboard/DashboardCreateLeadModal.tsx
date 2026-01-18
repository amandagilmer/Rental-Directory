import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";

interface DashboardCreateLeadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface BusinessListing {
    id: string;
    business_name: string;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    businessId: string;
    status: string;
    estimatedValue: string;
    message: string;
}

export const DashboardCreateLeadModal = ({ open, onOpenChange, onSuccess }: DashboardCreateLeadModalProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [listings, setListings] = useState<BusinessListing[]>([]);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: "",
        businessId: "",
        status: "new_inquiry",
        estimatedValue: "",
        message: "",
    });

    useEffect(() => {
        if (open && user) {
            fetchListings();
        }
    }, [open, user]);

    const fetchListings = async () => {
        try {
            const { data, error } = await supabase
                .from('business_listings')
                .select('id, business_name')
                .eq('user_id', user?.id);

            if (error) throw error;
            setListings(data || []);

            // Auto-select if only one listing
            if (data && data.length === 1) {
                setFormData(prev => ({ ...prev, businessId: data[0].id }));
            }
        } catch (error) {
            console.error("Error fetching listings:", error);
            toast({
                title: "Error",
                description: "Failed to load your listings",
                variant: "destructive",
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.businessId) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields (Name, Email, Listing)",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.from('leads').insert({
                business_id: formData.businessId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                status: formData.status,
                estimated_value: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
                message: formData.message || null,
                source: 'Manual Entry'
            });

            if (error) throw error;

            toast({
                title: "Success",
                description: "Lead created successfully",
            });

            if (onSuccess) onSuccess();
            handleClose();

        } catch (error) {
            console.error("Error creating lead:", error);
            toast({
                title: "Error",
                description: "Failed to create lead",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        // Reset form
        setFormData({
            name: "",
            email: "",
            phone: "",
            businessId: listings.length === 1 ? listings[0].id : "",
            status: "new_inquiry",
            estimatedValue: "",
            message: "",
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="business">Assign to Listing *</Label>
                        <Select
                            value={formData.businessId}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, businessId: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a listing" />
                            </SelectTrigger>
                            <SelectContent>
                                {listings.map((listing) => (
                                    <SelectItem key={listing.id} value={listing.id}>
                                        {listing.business_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new_inquiry">New Inquiry</SelectItem>
                                    <SelectItem value="response_sent">Response Sent</SelectItem>
                                    <SelectItem value="verified">Verified (Application)</SelectItem>
                                    <SelectItem value="booked">Booked</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="did_not_book">Did Not Book</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(555) 123-4567"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="value">Estimated Value ($)</Label>
                        <Input
                            id="value"
                            type="number"
                            value={formData.estimatedValue}
                            onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                            placeholder="0.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Notes / Initial Message</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Enter any notes about this lead..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={handleClose} className="text-muted-foreground hover:text-foreground hover:bg-accent/50">Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Lead"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
