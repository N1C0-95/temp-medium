import { trpc } from "@/utils/trpcClient";

export function useGptGenerateSynonymsOfWord(inputText: string , word: string , position: number , count: number, options?: { enabled?: boolean }) {
    return trpc.gptRouter.getSynonyms.useQuery({ inputText, word, position, count }, options);
}
export function useGptRephrasings(inputText: string , count: number, options?: { enabled?: boolean }) {
    return trpc.gptRouter.getRephrasings.useQuery({ inputText, count }, options);
}
export function useGptRephrasingsFromSynonym(inputText: string , word: string , position: number , synonym: string, options?: { enabled?: boolean }) {
    return trpc.gptRouter.getRephrasingsFromSynonym.useQuery({ inputText, word, position, synonym }, options);
}