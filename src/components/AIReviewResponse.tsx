import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIReviewResponseProps {
  reviewText: string;
  rating: number;
  authorName: string;
  businessName: string;
  onUseResponse: (response: string) => void;
  isPro?: boolean;
}

export function AIReviewResponse({
  reviewText,
  rating,
  authorName,
  businessName,
  onUseResponse,
  isPro = false,
}: AIReviewResponseProps) {
  const [tone, setTone] = useState('professional');
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateResponse = async () => {
    if (!isPro) {
      toast.error('AI Review Response is a Pro feature. Please upgrade to access.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-review-response', {
        body: {
          reviewText,
          rating,
          authorName,
          businessName,
          tone,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedResponse(data.response);
      toast.success('Response generated!');
    } catch (error) {
      console.error('AI Response error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate response');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  if (!isPro) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm">AI Response Helper is a Pro feature</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <Label className="font-medium">AI Response Helper</Label>
        </div>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="friendly">Friendly</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={generateResponse}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Response
          </>
        )}
      </Button>

      {generatedResponse && (
        <div className="space-y-2">
          <Textarea
            value={generatedResponse}
            onChange={(e) => setGeneratedResponse(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex-1"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              size="sm"
              onClick={() => onUseResponse(generatedResponse)}
              className="flex-1"
            >
              Use This Response
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
