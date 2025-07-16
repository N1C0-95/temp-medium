import z from "zod";
import { publicProcedure, router } from "../trpc";
import { useTranslatorService } from "@/services/transaltor";


export const translatorRouter = router({
  translateText: publicProcedure
    .input(z.object({ text: z.string(), to: z.string(), from: z.string()}))
    .query(async ({ input }) => useTranslatorService().actions.translateText(input.text, input.to, input.from)),
    getLanguageList: publicProcedure.input(z.object({ acceptedLanguage: z.string() })).query(async ({ input }) => useTranslatorService().actions.languageAvailable(input.acceptedLanguage)),
  detectLanguage: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => useTranslatorService().actions.detectLanguage(input.text)),
});