import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageCircle, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
  user_id: string | null;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function AdminLiveChat() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      
      // Subscribe to new messages for this ticket
      const channel = supabase
        .channel(`ticket-${selectedTicket.id}`)
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
              // Avoid duplicates
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
        .in('status', ['open', 'in-progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
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
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase.from('chat_messages').insert({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        sender_type: 'admin',
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');

      // Update ticket status to in-progress if it was open
      if (selectedTicket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in-progress' })
          .eq('id', selectedTicket.id);
        
        setSelectedTicket({ ...selectedTicket, status: 'in-progress' });
        fetchTickets();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const updateTicketStatus = async (status: string) => {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast.success(`Ticket marked as ${status}`);
      setSelectedTicket({ ...selectedTicket, status });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: typeof Clock; className: string }> = {
      open: { icon: AlertCircle, className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      'in-progress': { icon: Clock, className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
      resolved: { icon: CheckCircle, className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    };

    const { icon: Icon, className } = config[status] || config.open;

    return (
      <Badge className={className} variant="outline">
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'border-l-blue-500',
      medium: 'border-l-yellow-500',
      high: 'border-l-orange-500',
      urgent: 'border-l-red-500',
    };
    return colors[priority] || '';
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-[600px] bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Live Chat</h1>
        <p className="text-muted-foreground mt-1">Respond to customer chats in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)] min-h-[500px]">
        {/* Ticket List */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader className="py-3 border-b">
            <CardTitle className="text-lg">Active Chats</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
              {tickets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active chats</p>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3 rounded-lg cursor-pointer border-l-4 transition-colors ${getPriorityColor(ticket.priority)} ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-muted/50 hover:bg-muted border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ticket.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedTicket ? (
            <>
              <CardHeader className="py-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTicket.description.substring(0, 100)}
                      {selectedTicket.description.length > 100 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedTicket.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketStatus('resolved')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {/* Initial ticket message */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-muted rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">Customer</span>
                      </div>
                      <p className="text-sm">{selectedTicket.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
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
                      className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.sender_type === 'admin'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">
                            {msg.sender_type === 'admin' ? 'Support Team' : 'Customer'}
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

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={selectedTicket.status === 'resolved'}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sendingMessage || !newMessage.trim() || selectedTicket.status === 'resolved'}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {selectedTicket.status === 'resolved' && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    This ticket has been resolved
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Select a chat to start responding</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
