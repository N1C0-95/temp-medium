import { generateObject } from "ai";
import z from "zod";
import { azureGptModel } from "../../utils/azureGptModelClient";
import { GPT_PROMPTS } from "@/config/gptPrompts.config";

export function useGptModelService() {
  async function generateSynonymsOfWord(
    inputText: string,
    word: string,
    position: number,
    count: number
  )  {
    const systemPrompt = GPT_PROMPTS.synonymsSystemPrompt.replace(
      "{count}",
      count.toString()
    );

    const userPrompt = `
Sentence: "${inputText}"
Target word: "${word}" (position ${position} in the sentence)
Provide up to '${count}' suggestions that can replace the target word without changing the sentence's meaning.
`;

    // Define the schema for the expected output
    const { object: result } = await generateObject({
      model: azureGptModel,
      schema: z.object({
        suggestions: z
          .array(z.string())
          .describe("Array of suggestions for the target word."),
      }),
      temperature: 0.6,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return result;
  }
  async function generateRephrasings(inputText: string, count: number) {
    const systemPrompt = GPT_PROMPTS.rephrasingsSystemPrompt.replace(
      "{count}",
      count.toString()
    );

    const userPrompt = `
Sentence: 
===
${inputText}
===
Provide up to '${count}' rephrasings that can replace the target sentence without changing the sentence's meaning.
`;

    const { object: result } = await generateObject({
      model: azureGptModel,
      schema: z.object({
        rephrasings: z
          .array(z.string())
          .describe("Array of rephrasings for the target sentence."),
      }),
      temperature: 0.6,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return result;
  }
  async function generateRephrasingsFromSynonim(
    inputText: string,
    word: string,
    position: number,
    synonym: string
  ) {
    const systemPrompt = GPT_PROMPTS.rephrasingsFromSynonymSystemPrompt

    const userPrompt = `
 Sentence: 
 ===
 ${inputText}
 ===
 Word to replace: "${word}"
 Position: '${position}'
 Synonym to use: "${synonym}"
 `;

    const { object: result } = await generateObject({
      model: azureGptModel,
      schema: z.object({
        rephrasings: z
          .array(z.string())
          .describe(
            "Array of rephrasings from synonym for the target sentence."
          ),
      }),
      temperature: 0.6,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return result;
  }

  return {
    actions: {
      generateSynonymsOfWord,
      generateRephrasings,
      generateRephrasingsFromSynonim,
    },
  };
}
