import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Loader2, Headphones, FileText, ChevronLeft, Ticket, GripHorizontal } from 'lucide-react';
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
import { useDraggable } from '@/hooks/useDraggable';

interface Message {
  id: string;
  role: 'user' | 'assistant';
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
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<WidgetView>('menu');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { position, handleMouseDown, isDragging } = useDraggable({ x: 0, y: 0 });

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
      role: 'assistant',
      content: "Hi there! 👋 I'm here to help. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Visibility Check - Only show on Dashboard/Admin/Tickets pages
  const isDashboard = location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/my-tickets');


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
      role: 'user',
      content: chatInput,
      isUser: true,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const messageContent = chatInput;
    setChatInput('');
    setIsSubmitting(true);

    try {
      // Create a temporary placeholder for the AI response
      const aiPlaceholderId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, {
        id: aiPlaceholderId,
        role: 'assistant',
        content: '',
        isUser: false,
        timestamp: new Date()
      }]);

      const response = await supabase.functions.invoke('ai-support-chat', {
        body: {
          message: messageContent,
          history: newMessages.map(m => ({
            isUser: m.isUser,
            content: m.content
          }))
        }
      });

      if (response.error) throw response.error;

      // Handle streaming response manually if needed, or if invoked returns JSON
      // For simplicity with supabase-js invoke, let's assume valid JSON or text stream handling
      // Note: invoke returns a JSON object by default unless we handle the response body stream manually.
      // To get streaming text, we need to access the underlying response body or handle the stream locally.
      // However, supabase-js `invoke` simplifies this. If we return a stream from the server, 
      // we might need to use basic fetch instead of supabase.functions.invoke to handle the readable stream easily 
      // OR handle the blob.

      // Let's use direct fetch for simpler streaming support if invoke doesn't auto-handle it well in this context
      // Actually, let's use the standard fetch pattern we used in TrailerChatbot for reliable streaming.

      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const streamResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            message: messageContent,
            history: newMessages.map(m => ({
              isUser: m.isUser,
              content: m.content
            }))
          })
        }
      );

      if (!streamResponse.body) throw new Error('No response body');

      const reader = streamResponse.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        aiContent += text;

        // Update the placeholder message with new content
        setMessages(prev => prev.map(msg =>
          msg.id === aiPlaceholderId
            ? { ...msg, content: aiContent }
            : msg
        ));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      // Remove the user message on error? Or just leave it.
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleViewTickets = () => {
    setIsOpen(false);
    navigate('/my-tickets');
  };

  // Visibility Check - Only show on Dashboard/Admin/Tickets pages
  // Moved here to prevent "Rendered fewer hooks" error
  if (!isDashboard) return null;

  const style = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isDragging ? 'none' : 'transform 0.1s',
  };

  if (!isOpen) {
    return (
      <div style={style} className="fixed bottom-6 right-6 z-50 flex items-end gap-2 flex-row-reverse">
        <div
          className="bg-primary/80 hover:bg-primary text-white p-1 rounded-md cursor-move transition-opacity"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <GripHorizontal className="h-4 w-4" />
        </div>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Headphones className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <Card
      style={style}
      className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col"
    >
      <CardHeader
        className="flex flex-row items-center justify-between py-3 px-4 border-b bg-primary text-primary-foreground rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="h-4 w-4 opacity-50 mr-1" />
          {view !== 'menu' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
              onClick={(e) => {
                e.stopPropagation();
                setView('menu');
              }}
              onMouseDown={(e) => e.stopPropagation()} // Prevent drag on button click
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
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
            setView('menu');
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden bg-background">
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
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${message.isUser
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
