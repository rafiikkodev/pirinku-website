
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles, Mic, MicOff, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RecipeSuggestionInput } from "@/ai/flows/recipe-suggestion";

const formSchema = z.object({
  ingredients: z.string().min(3, { message: "Sebutkan setidaknya satu bahan, misal: telur, nasi." }),
  cookingTools: z.string().min(3, { message: "Pilih setidaknya satu alat masak." }),
});

interface RecipeFormProps {
  onSubmit: (values: RecipeSuggestionInput) => void;
  isLoading: boolean;
}

const PREDEFINED_TOOLS = [
  "Teflon", "Panci", "Kompor", "Rice Cooker", "Microwave",
  "Pisau", "Talenan", "Spatula", "Mangkuk", "Piring", "Sendok", "Garpu"
];
const TOOL_FREQUENCY_KEY = 'pirinku-tool-frequency';

export function RecipeForm({ onSubmit, isLoading }: RecipeFormProps) {
  const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
  const [sortedTools, setSortedTools] = useState(PREDEFINED_TOOLS);
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

    // Load frequencies and sort tools
    try {
        const storedFrequencies = localStorage.getItem(TOOL_FREQUENCY_KEY);
        const frequencies: Record<string, number> = storedFrequencies ? JSON.parse(storedFrequencies) : {};
        
        const toolsToSort = [...PREDEFINED_TOOLS];
        toolsToSort.sort((a, b) => (frequencies[b] || 0) - (frequencies[a] || 0));
        setSortedTools(toolsToSort);
    } catch (error) {
        console.error("Failed to access localStorage for tool frequencies:", error);
        setSortedTools(PREDEFINED_TOOLS);
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

  const handleToolToggle = (tool: string) => {
    const newSelectedTools = new Set(selectedTools);
    if (newSelectedTools.has(tool)) {
      newSelectedTools.delete(tool);
    } else {
      newSelectedTools.add(tool);
    }
    setSelectedTools(newSelectedTools);
    
    const toolsString = Array.from(newSelectedTools).join(', ');
    form.setValue('cookingTools', toolsString, { shouldValidate: true });
  };
  
  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    // Update tool frequencies in localStorage
    try {
      const storedFrequencies = localStorage.getItem(TOOL_FREQUENCY_KEY);
      const frequencies: Record<string, number> = storedFrequencies ? JSON.parse(storedFrequencies) : {};

      selectedTools.forEach(tool => {
        frequencies[tool] = (frequencies[tool] || 0) + 1;
      });

      localStorage.setItem(TOOL_FREQUENCY_KEY, JSON.stringify(frequencies));
    } catch (error) {
      console.error("Failed to update tool frequencies in localStorage:", error);
    }
    
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
            <FormControl>
                <div className="flex flex-wrap gap-2 pt-2">
                    {sortedTools.map(tool => {
                        const isSelected = selectedTools.has(tool);
                        return (
                            <Button
                                type="button"
                                key={tool}
                                variant={isSelected ? "default" : "outline"}
                                onClick={() => handleToolToggle(tool)}
                                className={cn("rounded-full", isSelected && "border-primary-foreground/50")}
                            >
                                {isSelected && <Check className="mr-2 h-4 w-4" />}
                                {tool}
                            </Button>
                        )
                    })}
                </div>
            </FormControl>
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
