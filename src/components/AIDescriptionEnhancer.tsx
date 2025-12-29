import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AIDescriptionEnhancerProps {
  currentDescription: string;
  itemName: string;
  itemType?: string;
  features?: string[];
  specs?: Record<string, string>;
  onUseDescription: (description: string) => void;
}

export function AIDescriptionEnhancer({
  currentDescription,
  itemName,
  itemType,
  features,
  specs,
  onUseDescription,
}: AIDescriptionEnhancerProps) {
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateDescription = async () => {
    if (!itemName.trim()) {
      toast.error('Please enter a name first');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-description-enhancer', {
        body: {
          currentDescription,
          itemName,
          itemType,
          features,
          specs,
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedDescription(data.description);
      toast.success('Description generated!');
    } catch (error) {
      console.error('AI Description error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate description');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUse = () => {
    onUseDescription(generatedDescription);
    setGeneratedDescription('');
    toast.success('Description applied!');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={generateDescription}
          disabled={isLoading}
          className="flex-shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-1" />
              AI Enhance
            </>
          )}
        </Button>
      </div>

      {generatedDescription && (
        <div className="p-3 rounded-lg border bg-muted/50 space-y-3">
          <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            AI Suggestion:
          </p>
          <p className="text-sm whitespace-pre-wrap">{generatedDescription}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleUse}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Use This
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateDescription}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
