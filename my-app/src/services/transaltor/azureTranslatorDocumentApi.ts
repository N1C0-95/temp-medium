

export async function postTranslateDocument(data:FormData, targetLanguage: string, sourceLanguage?: string): Promise<Blob> {
  const apiVersion = "2024-05-01"; // update if necessary
  const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT_DOCUMENT;
  const apiKey = process.env.AZURE_TRANSLATOR_KEY;
  const region = process.env.AZURE_TRANSLATOR_REGION;

  if (!endpoint || !apiKey) {
    throw new Error("Endpoint or API key is not defined");
  }

  const url = `${endpoint}/translator/document:translate?targetLanguage=${targetLanguage}&api-version=${apiVersion}${sourceLanguage ? `&sourceLanguage=${sourceLanguage}` : ""}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Ocp-Apim-Subscription-Region": region || "",
    },
    body: data,
  });

  if (!response.ok) {
    throw new Error("Errore upload");
  }

  return response.blob();

}