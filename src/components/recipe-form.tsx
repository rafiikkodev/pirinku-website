
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Plus, X, Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RecipeSuggestionInput } from "@/ai/flows/recipe-suggestion";

const formSchema = z.object({
  ingredients: z.string().min(3, { message: "Sebutkan setidaknya satu bahan, misal: telur, nasi." }),
  cookingTools: z.string().min(3, { message: "Sebutkan setidaknya satu alat masak, misal: teflon." }),
});

interface RecipeFormProps {
  onSubmit: (values: RecipeSuggestionInput) => void;
  isLoading: boolean;
}

export function RecipeForm({ onSubmit, isLoading }: RecipeFormProps) {
  const [cookingTools, setCookingTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      cookingTools: "",
    },
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSpeechRecognitionSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        form.setValue('ingredients', transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            toast({
                variant: 'destructive',
                title: 'Akses Mikrofon Ditolak',
                description: 'Mohon izinkan akses mikrofon di pengaturan browser Anda.',
            });
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, [form, toast]);

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Could not start recognition:", e)
      }
    }
    setIsListening(prev => !prev);
  };
  
  const handleAddTool = () => {
    const toolToAdd = newTool.trim().toLowerCase();
    if (toolToAdd && !cookingTools.includes(toolToAdd)) {
      const newTools = [...cookingTools, toolToAdd];
      setCookingTools(newTools);
      form.setValue('cookingTools', newTools.join(', '));
      form.clearErrors('cookingTools');
      setNewTool("");
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    const newTools = cookingTools.filter(tool => tool !== toolToRemove);
    setCookingTools(newTools);
    form.setValue('cookingTools', newTools.join(', '));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTool();
    }
  };
  
  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="ingredients"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-lg text-foreground/90">Bahan yang kamu punya?</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Contoh: mie instan, telur, bawang putih..."
                      className="resize-none pr-12"
                      {...field}
                    />
                    {isSpeechRecognitionSupported && (
                       <Button
                        type="button"
                        size="icon"
                        variant={isListening ? "destructive" : "outline"}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={handleToggleListening}
                       >
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        <span className="sr-only">{isListening ? 'Stop recording' : 'Start recording'}</span>
                       </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel className="font-bold text-lg text-foreground/90">Alat masak yang tersedia?</FormLabel>
             <div className="flex gap-2">
                <Input 
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Contoh: teflon, lalu tekan 'Tambah'"
                />
                <Button type="button" onClick={handleAddTool} className="flex-shrink-0"><Plus className="mr-2 h-4 w-4"/> Tambah</Button>
             </div>
             <div className="flex flex-wrap gap-2 pt-2 min-h-[2.5rem]">
                {cookingTools.map(tool => (
                    <Badge key={tool} variant="secondary" className="text-base py-1 pl-3 pr-1 capitalize">
                        {tool}
                        <button type="button" onClick={() => handleRemoveTool(tool)} className="ml-2 rounded-full p-0.5 hover:bg-destructive/20 text-destructive">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
             </div>
             <FormMessage>{form.formState.errors.cookingTools?.message}</FormMessage>
          </FormItem>
        </div>

        <Button type="submit" className="w-full font-bold text-base" size="lg" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          {isLoading ? "Mencari ide..." : "Kasih Tau Resepnya Dong!"}
        </Button>
      </form>
    </Form>
  );
}
