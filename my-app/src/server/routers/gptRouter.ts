import z from "zod";
import { publicProcedure, router } from "../trpc";
import { useGptModelService } from "@/services/gpt";

export const gptRouter = router({
 getSynonyms: publicProcedure.input(z.object({ inputText: z.string(), word: z.string(), position: z.number(), count: z.number() })).query(async ({ input }) => useGptModelService().actions.generateSynonymsOfWord(input.inputText, input.word, input.position, input.count)),
 getRephrasings: publicProcedure.input(z.object({ inputText: z.string(), count: z.number() })).query(async ({ input }) => useGptModelService().actions.generateRephrasings(input.inputText, input.count)),
 getRephrasingsFromSynonym: publicProcedure.input(z.object({ inputText: z.string(), word: z.string(), position: z.number(), synonym: z.string() })).query(async ({ input }) => useGptModelService().actions.generateRephrasingsFromSynonim(input.inputText, input.word, input.position, input.synonym)),
});