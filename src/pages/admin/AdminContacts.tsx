import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Eye, Trash2, Search, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminContacts() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setSubmissions(data);
    }
    setLoading(false);
  };

  const viewSubmission = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);

    if (!submission.is_read) {
      await supabase
        .from('contact_submissions')
        .update({ is_read: true })
        .eq('id', submission.id);
      
      fetchSubmissions();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete submission");
    } else {
      toast.success("Submission deleted");
      fetchSubmissions();
      if (selectedSubmission?.id === id) {
        setIsDialogOpen(false);
      }
    }
  };

  const markAllRead = async () => {
    const { error } = await supabase
      .from('contact_submissions')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) {
      toast.error("Failed to mark as read");
    } else {
      toast.success("All marked as read");
      fetchSubmissions();
    }
  };

  const filteredSubmissions = submissions.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = submissions.filter(s => !s.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contact Submissions</h1>
          <p className="text-muted-foreground mt-1">
            View messages from the contact form
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              All Messages ({submissions.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="w-40">Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow 
                  key={submission.id} 
                  className={!submission.is_read ? "bg-primary/5" : ""}
                >
                  <TableCell>
                    {!submission.is_read && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className={`${!submission.is_read ? 'font-semibold' : 'font-medium'} text-foreground`}>
                        {submission.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{submission.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className={`${!submission.is_read ? 'font-medium' : ''} text-foreground`}>
                      {submission.subject}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {submission.message}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewSubmission(submission)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(submission.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubmissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? "No matching submissions found." : "No contact submissions yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Submission Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Submission</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a 
                    href={`mailto:${selectedSubmission.email}`} 
                    className="font-medium text-primary hover:underline"
                  >
                    {selectedSubmission.email}
                  </a>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subject</p>
                <p className="font-medium">{selectedSubmission.subject}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(new Date(selectedSubmission.created_at), 'MMMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(selectedSubmission.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button asChild>
                  <a href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
