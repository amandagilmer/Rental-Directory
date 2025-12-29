import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, Headphones, FileText, ChevronLeft, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'admin' | 'system';
  message: string;
  created_at: string;
}

type WidgetView = 'menu' | 'ticket' | 'chat';

export function SupportChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<WidgetView>('menu');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Ticket form state
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'medium',
  });

  // Chat state
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! 👋 I'm here to help. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to admin responses when we have an active ticket
  useEffect(() => {
    if (!activeTicketId) return;

    const channel = supabase
      .channel(`widget-ticket-${activeTicketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `ticket_id=eq.${activeTicketId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Only add admin messages (user messages are added locally)
          if (newMsg.sender_type === 'admin') {
            setMessages((prev) => [
              ...prev,
              {
                id: newMsg.id,
                content: newMsg.message,
                isUser: false,
                timestamp: new Date(newMsg.created_at),
              },
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTicketId]);

  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: user?.id || null,
        subject: ticketForm.subject,
        description: ticketForm.description,
        priority: ticketForm.priority,
        status: 'open',
      });

      if (error) throw error;

      toast({
        title: 'Ticket Submitted',
        description: 'We\'ll get back to you as soon as possible.',
      });

      setTicketForm({ subject: '', description: '', priority: 'medium' });
      setView('menu');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit ticket. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: chatInput,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = chatInput;
    setChatInput('');
    setIsSubmitting(true);

    try {
      // If we don't have an active ticket, create one
      if (!activeTicketId) {
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .insert({
            user_id: user?.id || null,
            subject: `Live Chat: ${messageContent.substring(0, 50)}${messageContent.length > 50 ? '...' : ''}`,
            description: messageContent,
            priority: 'medium',
            status: 'open',
          })
          .select()
          .single();

        if (ticketError) throw ticketError;

        setActiveTicketId(ticketData.id);

        // Add the first message to chat_messages
        await supabase.from('chat_messages').insert({
          ticket_id: ticketData.id,
          sender_id: user?.id || null,
          sender_type: 'user',
          message: messageContent,
        });

        // Add a system message
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "Thanks for your message! A support team member will respond shortly. You'll see their replies here in real-time.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      } else {
        // Add message to existing ticket
        const { error: msgError } = await supabase.from('chat_messages').insert({
          ticket_id: activeTicketId,
          sender_id: user?.id || null,
          sender_type: 'user',
          message: messageContent,
        });

        if (msgError) throw msgError;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTickets = () => {
    setIsOpen(false);
    navigate('/my-tickets');
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
        size="icon"
      >
        <Headphones className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 left-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          {view !== 'menu' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => setView('menu')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <CardTitle className="text-lg flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            {view === 'menu' && 'Support'}
            {view === 'ticket' && 'Submit Ticket'}
            {view === 'chat' && 'Live Chat'}
          </CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => {
            setIsOpen(false);
            setView('menu');
          }}
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {view === 'menu' && (
          <div className="p-4 space-y-4">
            <p className="text-muted-foreground text-sm">
              How can we help you today? Choose an option below.
            </p>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => setView('ticket')}
            >
              <FileText className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Submit a Ticket</p>
                <p className="text-xs text-muted-foreground">
                  Describe your issue and we'll respond via email
                </p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4"
              onClick={() => setView('chat')}
            >
              <MessageCircle className="h-5 w-5 text-primary" />
              <div className="text-left">
                <p className="font-medium">Live Chat</p>
                <p className="text-xs text-muted-foreground">
                  Chat with us in real-time
                </p>
              </div>
            </Button>
            {user && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-4"
                onClick={handleViewTickets}
              >
                <Ticket className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">My Tickets</p>
                  <p className="text-xs text-muted-foreground">
                    View and track your support tickets
                  </p>
                </div>
              </Button>
            )}
          </div>
        )}

        {view === 'ticket' && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief summary of your issue"
                value={ticketForm.subject}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, subject: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={ticketForm.priority}
                onValueChange={(value) =>
                  setTicketForm({ ...ticketForm, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe your issue in detail..."
                className="min-h-[120px] resize-none"
                value={ticketForm.description}
                onChange={(e) =>
                  setTicketForm({ ...ticketForm, description: e.target.value })
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmitTicket}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Ticket'
              )}
            </Button>
          </div>
        )}

        {view === 'chat' && (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isSubmitting && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={isSubmitting || !chatInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
