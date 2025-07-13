
"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { recipeSuggestion, type RecipeSuggestionOutput } from "@/ai/flows/recipe-suggestion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, AlertCircle, Plus, X, Mic, MicOff } from "lucide-react";
import { RecipeCard } from "./recipe-card";
import { RecipeSkeletons } from "./recipe-skeletons";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  ingredients: z.string().min(3, { message: "Sebutkan setidaknya satu bahan, misal: telur, nasi." }),
});

type Recipe = RecipeSuggestionOutput["suggestions"][0];

// Define the SpeechRecognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}


export function RecipeFinder() {
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cookingTools, setCookingTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [voiceTarget, setVoiceTarget] = useState<'ingredients' | 'tools' | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'id-ID';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        
        if (voiceTarget === 'ingredients') {
          const currentIngredients = form.getValues("ingredients");
          form.setValue("ingredients", currentIngredients ? `${currentIngredients}, ${transcript}` : transcript);
        } else if (voiceTarget === 'tools') {
          const tools = transcript.split(',').map(tool => tool.trim().toLowerCase()).filter(Boolean);
          const updatedTools = [...cookingTools];
          tools.forEach(tool => {
            if (!updatedTools.includes(tool)) {
              updatedTools.push(tool);
            }
          });
          setCookingTools(updatedTools);
        }
      };

      recognition.onerror = (event) => {
          let errorMessage = "Terjadi kesalahan pada pengenalan suara.";
          if (event.error === 'no-speech') {
              errorMessage = "Tidak ada suara yang terdeteksi. Coba lagi.";
          } else if (event.error === 'not-allowed') {
              errorMessage = "Izin menggunakan mikrofon ditolak. Aktifkan di pengaturan browser.";
          }
          toast({
              variant: "destructive",
              title: "Voice Command Gagal",
              description: errorMessage,
          });
          setIsListening(false);
          setVoiceTarget(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setVoiceTarget(null);
      };

      recognitionRef.current = recognition;
    }
  }, [form, toast, voiceTarget, cookingTools]);


  const handleToggleListening = (target: 'ingredients' | 'tools') => {
    const recognition = recognitionRef.current;
    if (!recognition) {
        toast({
            variant: "destructive",
            title: "Fitur Tidak Didukung",
            description: "Browser Anda tidak mendukung fitur voice command.",
        });
        return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      setVoiceTarget(null);
    } else {
      try {
        setVoiceTarget(target);
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        toast({
            variant: "destructive",
            title: "Voice Command Gagal",
            description: "Tidak dapat memulai fitur rekam suara.",
        });
        setIsListening(false);
        setVoiceTarget(null);
      }
    }
  };

  const handleAddTool = () => {
    const toolToAdd = newTool.trim().toLowerCase();
    if (toolToAdd && !cookingTools.includes(toolToAdd)) {
      setCookingTools([...cookingTools, toolToAdd]);
      setNewTool("");
    }
  };

  const handleRemoveTool = (toolToRemove: string) => {
    setCookingTools(cookingTools.filter(tool => tool !== toolToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTool();
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (cookingTools.length === 0) {
        form.setError("root", { type: "manual", message: "Sebutkan setidaknya satu alat masak." });
        return;
    }
    
    setIsLoading(true);
    setSuggestions([]);
    setError(null);
    form.clearErrors("root");

    const submissionData = {
        ...values,
        cookingTools: cookingTools.join(', '),
    };

    try {
      const result = await recipeSuggestion(submissionData);
      if (result && result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      } else {
        setError("Tidak ada resep yang ditemukan. Coba ganti bahan atau alatmu.");
      }
    } catch (e) {
      console.error(e);
      setError("Maaf, terjadi kesalahan saat mencari resep. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full shadow-lg border-2 border-green-200/50 dark:border-green-800/50">
      <CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          placeholder="Contoh: mie instan, telur, bawang putih... atau gunakan ikon mikrofon"
                          className="resize-none pr-12"
                          {...field}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant={isListening && voiceTarget === 'ingredients' ? "destructive" : "outline"}
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => handleToggleListening('ingredients')}
                        >
                          {isListening && voiceTarget === 'ingredients' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          <span className="sr-only">{isListening && voiceTarget === 'ingredients' ? "Berhenti Merekam" : "Mulai Merekam Bahan"}</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel className="font-bold text-lg text-foreground/90">Alat masak yang tersedia?</FormLabel>
                 <div className="flex gap-2">
                    <Input 
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Contoh: teflon, panci..."
                    />
                     <Button
                        type="button"
                        size="icon"
                        variant={isListening && voiceTarget === 'tools' ? "destructive" : "outline"}
                        className="h-10 w-10 flex-shrink-0"
                        onClick={() => handleToggleListening('tools')}
                        >
                        {isListening && voiceTarget === 'tools' ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        <span className="sr-only">{isListening && voiceTarget === 'tools' ? "Berhenti Merekam" : "Mulai Merekam Alat"}</span>
                    </Button>
                    <Button type="button" onClick={handleAddTool} className="flex-shrink-0"><Plus className="mr-2"/> Tambah</Button>
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
                 {form.formState.errors.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>}
              </div>
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
      </CardHeader>
      
      {(isLoading || error || suggestions.length > 0) && (
        <CardContent>
          <Separator className="my-4" />
          <div className="space-y-4">
            {isLoading && <RecipeSkeletons />}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Oops, ada masalah!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {suggestions.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold font-headline text-center text-primary">Ini dia idenya!</h2>
                    {suggestions.map((recipe, index) => (
                        <RecipeCard key={index} recipe={recipe} />
                    ))}
                </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
