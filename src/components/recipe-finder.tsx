
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { recipeSuggestion, type RecipeSuggestionOutput } from "@/ai/flows/recipe-suggestion";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { RecipeCard } from "./recipe-card";
import { RecipeSkeletons } from "./recipe-skeletons";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  ingredients: z.string().min(3, { message: "Sebutkan setidaknya satu bahan, misal: telur, nasi." }),
  cookingTools: z.string().min(3, { message: "Sebutkan setidaknya satu alat, misal: panci, kompor." }),
});

type Recipe = RecipeSuggestionOutput["suggestions"][0];

export function RecipeFinder() {
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredients: "",
      cookingTools: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions([]);
    setError(null);
    try {
      const result = await recipeSuggestion(values);
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
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-lg text-foreground/90">Bahan yang kamu punya?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: mie instan, telur, bawang putih, sosis..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cookingTools"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-lg text-foreground/90">Alat masak yang tersedia?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Contoh: rice cooker, teflon, panci..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
