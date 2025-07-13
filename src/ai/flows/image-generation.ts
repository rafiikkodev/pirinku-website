'use server';
/**
 * @fileOverview An AI flow for generating images for recipes.
 *
 * - generateRecipeImage - A function that handles the image generation process.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeImageInputSchema = z.object({
  title: z.string().describe('The title of the recipe to generate an image for.'),
});
export type GenerateRecipeImageInput = z.infer<
  typeof GenerateRecipeImageInputSchema
>;

const GenerateRecipeImageOutputSchema = z.object({
  imageUrl: z.string().describe('A data URI of the generated image for the recipe.'),
});
export type GenerateRecipeImageOutput = z.infer<
  typeof GenerateRecipeImageOutputSchema
>;

export async function generateRecipeImage(
  input: GenerateRecipeImageInput
): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async ({title}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A delicious-looking, realistic photo of "${title}", plated beautifully.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const imageUrl = media.url || 'https://placehold.co/600x400.png';
    return { imageUrl };
  }
);
