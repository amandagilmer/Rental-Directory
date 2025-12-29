import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  Send, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Ticket,
  User,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'admin' | 'system';
  message: string;
  created_at: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export default function MyTickets() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);

      // Subscribe to new messages for this ticket
      const channel = supabase
        .channel(`user-ticket-${selectedTicket.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `ticket_id=eq.${selectedTicket.id}`,
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as ChatMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        sender_type: 'user',
        message: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: typeof Clock; className: string; label: string }> = {
      open: { 
        icon: AlertCircle, 
        className: 'bg-red-500/10 text-red-500 border-red-500/20',
        label: 'Open - Awaiting Response'
      },
      'in-progress': { 
        icon: Clock, 
        className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        label: 'In Progress'
      },
      resolved: { 
        icon: CheckCircle, 
        className: 'bg-green-500/10 text-green-500 border-green-500/20',
        label: 'Resolved'
      },
      closed: { 
        icon: MessageCircle, 
        className: 'bg-muted text-muted-foreground border-muted',
        label: 'Closed'
      },
    };

    const { icon: Icon, className, label } = config[status] || config.open;

    return (
      <Badge className={className} variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      urgent: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
      <Badge className={colors[priority] || ''} variant="outline">
        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
      </Badge>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">My Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Track the status of your support requests
          </p>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any support tickets. Use the chat widget to get help.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
            {/* Ticket List */}
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader className="py-3 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Your Tickets ({tickets.length})
                </CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-muted/50 hover:bg-muted border border-transparent'
                      }`}
                    >
                      <p className="font-medium text-sm truncate">{ticket.subject}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Ticket Detail & Chat */}
            <Card className="lg:col-span-2 flex flex-col">
              {selectedTicket ? (
                <>
                  <CardHeader className="py-4 border-b">
                    <div className="space-y-3">
                      <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                      <div className="flex flex-wrap gap-2">
                        {getStatusBadge(selectedTicket.status)}
                        {getPriorityBadge(selectedTicket.priority)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Created: {new Date(selectedTicket.created_at).toLocaleString()}</p>
                        <p>Last updated: {new Date(selectedTicket.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {/* Original ticket message */}
                      <div className="flex justify-end">
                        <div className="max-w-[80%] bg-primary text-primary-foreground rounded-lg px-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs font-medium">You</span>
                          </div>
                          <p className="text-sm">{selectedTicket.description}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(selectedTicket.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.sender_type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <User className="h-3 w-3" />
                              <span className="text-xs font-medium">
                                {msg.sender_type === 'user' ? 'You' : 'Support Team'}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? (
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              sendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={sendingMessage || !newMessage.trim()}
                        >
                          {sendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border-t bg-muted/50 text-center text-sm text-muted-foreground">
                      This ticket has been {selectedTicket.status}. Need more help? Submit a new ticket.
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p>Select a ticket to view details</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
