import { AzureTranslatorResult,  } from "@/models/response/azuretranslator-response";
import { LanguageResponse } from "@/models/response/language-response";
import { trpc } from "@/utils/trpcClient";
import { UseTRPCQueryOptions } from "@trpc/react-query/shared";


export function useAzureTranslateText(text: string, to: string, from: string, options?: UseTRPCQueryOptions<AzureTranslatorResult[], AzureTranslatorResult[], any, any>) {
    return trpc.translatorRouter.translateText.useQuery({text, to,from},options);
}
export function useAzureLanguageAvailable(acceptedLanguage: string, options?: UseTRPCQueryOptions<LanguageResponse, LanguageResponse, any, any>) {
    return trpc.translatorRouter.getLanguageList.useQuery({acceptedLanguage}, options);
}
export function useAzureDetectLanguage(text: string, options?: UseTRPCQueryOptions<string, string, any, any>) {
    return trpc.translatorRouter.detectLanguage.useQuery({ text }, options);
}
