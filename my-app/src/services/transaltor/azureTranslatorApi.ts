import { AzureTranslatorResult } from "@/models/response/azuretranslator-response";
import { LanguageResponse } from "@/models/response/language-response";

interface TranslateTextParams {
  text: string;
  to: string;
  from?: string;
}

// Function to translate text using Azure Translator API
// This function takes the text to be translated, the target language, and an optional source language
export async function postTranslateText(params:TranslateTextParams): Promise<AzureTranslatorResult[]> {
  const { text, to, from } = params;

  const url = `${process.env.AZURE_TRANSLATOR_ENDPOINT!}/translate?api-version=3.0&to=${to}${
    from ? `&from=${from}` : ""
  }`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATOR_KEY!,
      "Ocp-Apim-Subscription-Region": process.env.AZURE_TRANSLATOR_REGION!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ Text: text }]),
  });

  if (!response.ok) {
    throw new Error("Errore nella chiamata a Azure Translator");
  }

  return response.json();
}

// Function to get the list of languages supported by Azure Translator API
// This function fetches the list of languages and their names from the Azure Translator service
export async function getLanguageList(acceptedLanguage: string): Promise<LanguageResponse> {
  try {
    const response = await fetch(
      `${process.env.AZURE_TRANSLATOR_ENDPOINT!}/languages?api-version=3.0`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATOR_KEY!,
          "Ocp-Apim-Subscription-Region": process.env.AZURE_TRANSLATOR_REGION!,
          "Accept-Language": acceptedLanguage || "en",
        },
        next:{revalidate:60}
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch language list");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching language list:", error);
    throw error;
  }
}

// Function to detect the language of a given text
// This function can be used to identify the language of the input text
export async function getDetectLanguage(text: string): Promise<string> {
  const url = `${process.env.AZURE_TRANSLATOR_ENDPOINT!}/detect?api-version=3.0`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.AZURE_TRANSLATOR_KEY!,
      "Ocp-Apim-Subscription-Region": process.env.AZURE_TRANSLATOR_REGION!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ Text: text }]),
  });

  if (!response.ok) {
    throw new Error("Errore nella chiamata a Azure Translator");
  }

  const result = await response.json();
  return result[0].language;
}
