//export type AzureTranslatorResponse = AzureTranslatorResult[];


export interface AzureTranslatorResult {    
    translations: AzureTranslation[];
    detectedLanguage?: DetectedLanguage
}
export interface DetectedLanguage{
    language: string;
    score: number;
}
export interface AzureTranslation{
    text: string;
    to: string;
    from?: string;
}