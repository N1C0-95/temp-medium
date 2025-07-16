export interface LanguageResponse {
    translation : Record<string, LanguageItem>
}

export interface LanguageItem{
    name: string;
    nativeName: string;
    dir: "ltr" | "rtl";
}