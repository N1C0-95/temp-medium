
import { getDetectLanguage, getLanguageList, postTranslateText } from "@/services/transaltor/azureTranslatorApi";
import { postTranslateDocument } from "./azureTranslatorDocumentApi";

export function useTranslatorService() {
  // Function to translate text using Azure Translator API
  // This function takes the text to be translated, the target language, and an optional source
  async function translateText(text: string, to: string, from: string) {
    try {
      const response = await postTranslateText({
        text,
        to,
        from,
      });

      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }
  // Function to get the list of languages
  // This function fetches the list of languages supported by Azure Translator API
  async function languageAvailable(acceptedLanguage: string) {
    try {
      //add more logic here if needed
      const response = await getLanguageList(acceptedLanguage);
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  // Function to detect the language of a given text
  // This function can be used to identify the language of the input text
  async function detectLanguage(text: string) {
    try {
      //add more logic here if needed
      const response = await getDetectLanguage(text);
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  async function translateDocument(
    data: FormData,
    targetLanguage: string,
    sourceLanguage?: string
  ) {
    try {
      //add more logic here if needed
      const response = await postTranslateDocument(
        data,
        targetLanguage,
        sourceLanguage
      );
      return response;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }

  // Return the actions that can be used in the components
  // This allows the components to call these functions to perform translations and fetch language lists
  return {
    actions: {
      translateText,
      languageAvailable,
      detectLanguage,
      translateDocument,
    },
  };
}


   

