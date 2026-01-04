
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface GenerateImageDialogProps {
    onImageGenerated: (url: string) => void;
    categoryName: string;
}

export function GenerateImageDialog({ onImageGenerated, categoryName }: GenerateImageDialogProps) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState(`A high-quality, realistic, cinematic photo of ${categoryName || 'a rental item'}, professional photography.`);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);

        // Simulate API call time
        setTimeout(() => {
            setIsGenerating(false);
            setOpen(false);

            // For now, since we don't have a live backend connected to OpenAI/Gemini for the user,
            // we show a toast explaining the setup. In a real app, this would call an Edge Function.
            toast.info("AI Generation Feature: This would connect to the Gemini/OpenAI API. For this demo, please upload an image manually or ask the AI assistant to generate it!");

            // Optional: We could return a placeholder or a 'mock' generated image if we had one.
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Generate with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Generate Category Image</DialogTitle>
                    <DialogDescription>
                        Use AI to create a unique image for this category.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="prompt">Image Prompt</Label>
                        <Textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="h-24"
                            placeholder="Describe the image you want..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
