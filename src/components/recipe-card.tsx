import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils } from "lucide-react";

interface RecipeCardProps {
  title: string;
  content: string;
}

export function RecipeCard({ title, content }: RecipeCardProps) {
  return (
    <Card className="bg-background/80 dark:bg-card/60 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-start gap-3 text-lg font-headline text-primary">
            <Utensils className="h-6 w-6 mt-1 shrink-0" />
            <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-foreground/80 pl-[36px]">
          {content}
        </div>
      </CardContent>
    </Card>
  );
}
