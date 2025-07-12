
'use client';

import { RecipeFinder } from '@/components/recipe-finder';
import { ChefHat } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen p-4 antialiased">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#d2d2d2_1px,transparent_1px)] dark:bg-[radial-gradient(#404040_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <header className="w-full max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center gap-3 text-center">
          <ChefHat className="w-10 h-10 md:w-12 md:h-12 text-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline text-primary">
              Pirinku
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Resep masakan andalan anak kos
            </p>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto flex-grow">
        {isClient ? <RecipeFinder /> : null}
      </main>

      <footer className="w-full max-w-4xl mx-auto py-6 text-center text-muted-foreground text-xs md:text-sm">
        <p>Powered by AI ✨ Dibuat untuk para pejuang kos.</p>
      </footer>
    </div>
  );
}
