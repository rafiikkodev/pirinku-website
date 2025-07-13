
"use client";

import { useState } from "react";
import type { RecipeSuggestionOutput, RecipeSuggestionInput } from "@/ai/flows/recipe-suggestion";
import { recipeSuggestion } from "@/ai/flows/recipe-suggestion";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Separator } from "./ui/separator";

import { RecipeCard } from "./recipe-card";
import { RecipeSkeletons } from "./recipe-skeletons";
import { RecipeForm } from "./recipe-form";

type Recipe = RecipeSuggestionOutput["suggestions"][0];

export function RecipeFinder() {
  const [suggestions, setSuggestions] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (values: RecipeSuggestionInput) => {
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
  };

  return (
    <Card className="w-full shadow-lg border-2 border-green-200/50 dark:border-green-800/50">
      <CardHeader>
        <RecipeForm onSubmit={handleFormSubmit} isLoading={isLoading} />
      </CardHeader>
      
      {(isLoading || error || suggestions.length > 0) && (
        <CardContent>
          <Separator className="my-4" />
          <div className="mt-6">
            {isLoading && <RecipeSkeletons />}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Oops, ada masalah!</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {suggestions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-headline text-center text-primary mb-6">Ini dia idenya!</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {suggestions.map((recipe, index) => (
                    <RecipeCard key={`${recipe.title}-${index}`} recipe={recipe} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
