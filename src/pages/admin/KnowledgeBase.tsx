import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, BookOpen, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import OpenAI from 'openai';

const getOpenAI = () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }
    return new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
    });
};

interface SupportDoc {
    id: number;
    content: string;
    created_at: string;
}

export default function KnowledgeBase() {
    const [docs, setDocs] = useState<SupportDoc[]>([]);
    const [newContent, setNewContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        try {
            const { data, error } = await supabase
                .from('support_documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocs(data || []);
        } catch (error) {
            console.error('Error fetching docs:', error);
            toast({
                title: 'Error',
                description: 'Failed to load knowledge base.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddDoc = async () => {
        if (!newContent.trim()) return;

        setAdding(true);
        try {
            const openai = getOpenAI();
            // Generate embedding client-side
            const embeddingResponse = await openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: newContent,
            });
            const embedding = embeddingResponse.data[0].embedding;

            const { error } = await supabase
                .from('support_documents')
                .insert({
                    content: newContent,
                    embedding: embedding
                });

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Knowledge base updated with AI brain power.',
            });
            setNewContent('');
            fetchDocs();
        } catch (error) {
            console.error('Error adding doc:', error);
            toast({
                title: 'Error',
                description: 'Failed to save document or generate embedding. Check API key.',
                variant: 'destructive',
            });
        } finally {
            setAdding(false);
        }
    };


    const handleDelete = async (id: number) => {
        try {
            const { error } = await supabase
                .from('support_documents')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setDocs(docs.filter(d => d.id !== id));
            toast({
                title: 'Deleted',
                description: 'Document removed from knowledge base.',
            });
        } catch (error) {
            console.error('Error deleting doc:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete document.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 container py-8">
                <div className="mb-6">
                    <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <BookOpen className="h-8 w-8" />
                                Bot Knowledge Base
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Teach the AI bot by adding relevant information, FAQs, and policies.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Add New Section */}
                    <Card className="md:col-span-1 h-fit">
                        <CardHeader>
                            <CardTitle className="text-lg">Add New Knowledge</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Enter text, FAQ answer, or policy details..."
                                className="min-h-[200px]"
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                            />
                            <Button
                                onClick={handleAddDoc}
                                className="w-full"
                                disabled={adding || !newContent.trim()}
                            >
                                {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save to Brain
                            </Button>
                        </CardContent>
                    </Card>

                    {/* List Section */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg">Existing Knowledge ({docs.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : docs.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>No knowledge added yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {docs.map((doc) => (
                                        <div key={doc.id} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
                                            <div className="flex justify-between gap-4">
                                                <p className="text-sm whitespace-pre-wrap">{doc.content}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Added: {new Date(doc.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
