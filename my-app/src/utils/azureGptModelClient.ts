import { createAzure } from "@ai-sdk/azure";

const azure = createAzure({
    resourceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION,
});
export const azureGptModel = azure(process.env.AZURE_OPENAI_MODEL_NAME || "");