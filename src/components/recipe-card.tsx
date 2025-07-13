
import { useState, useEffect } from "react";
import type { RecipeSuggestionOutput } from "@/ai/flows/recipe-suggestion";
import { generateRecipeImage } from "@/ai/flows/image-generation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Utensils, Clock, Users, Salad, ListOrdered, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";

type Recipe = RecipeSuggestionOutput["suggestions"][0];

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [imageUrl, setImageUrl] = useState(recipe.imageUrl);
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchImage() {
      try {
        const result = await generateRecipeImage({ title: recipe.title });
        if (isMounted && result.imageUrl) {
          setImageUrl(result.imageUrl);
        }
      } catch (error) {
        console.error("Failed to generate recipe image:", error);
        // Keep the placeholder if image generation fails
      } finally {
        if (isMounted) {
          setIsImageLoading(false);
        }
      }
    }

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [recipe.title]);
  
  return (
    <Card className="bg-background/80 dark:bg-card/60 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/40 overflow-hidden">
      <div className="relative w-full h-48 bg-muted">
        {isImageLoading ? (
            <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8 animate-pulse" />
                    <p className="text-sm">Membuat gambar...</p>
                </div>
            </div>
        ) : (
          imageUrl && (
            <Image
              src={imageUrl}
              alt={`Gambar ${recipe.title}`}
              layout="fill"
              objectFit="cover"
              data-ai-hint="recipe food"
            />
          )
        )}
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="flex items-start gap-4 text-xl font-headline text-primary">
            <Utensils className="h-7 w-7 mt-1 shrink-0" />
            <span>{recipe.title}</span>
        </CardTitle>
        <CardDescription className="pt-1 !ml-[44px] text-foreground/80">{recipe.description}</CardDescription>
        <div className="flex flex-wrap gap-2 pt-2 !ml-[44px]">
          {recipe.servings && <Badge variant="outline"><Users className="mr-1.5" /> {recipe.servings}</Badge>}
          {recipe.prepTime && <Badge variant="outline"><Clock className="mr-1.5" /> {recipe.prepTime}</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="ingredients" className="w-full">
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-3">
                    <Salad className="h-5 w-5 text-primary"/>Bahan-bahan
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc space-y-1 pl-8 text-foreground/80">
                {recipe.ingredients.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="steps">
            <AccordionTrigger className="text-base font-semibold">
                <div className="flex items-center gap-3">
                    <ListOrdered className="h-5 w-5 text-primary"/>Cara Memasak
                </div>
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal space-y-2 pl-8 text-foreground/80">
                {recipe.steps.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
