import { DefaultAzureCredential } from '@azure/identity';

// Token cache
const tokenCache = {
    openai: null,
    storage: null
};

// Get credential (uses managed identity in Azure, Azure CLI locally)
const credential = new DefaultAzureCredential();

// Get token for Azure OpenAI
export async function getOpenAIToken() {
    if (tokenCache.openai && tokenCache.openai.expiresOnTimestamp > Date.now() + 300000) {
        return tokenCache.openai.token;
    }
    console.log('🔑 Getting Azure OpenAI token with Entra ID...');
    const tokenResponse = await credential.getToken('https://cognitiveservices.azure.com/.default');
    tokenCache.openai = tokenResponse;
    return tokenResponse.token;
}

// Get token for Azure Storage
export async function getStorageToken() {
    if (tokenCache.storage && tokenCache.storage.expiresOnTimestamp > Date.now() + 300000) {
        return tokenCache.storage.token;
    }
    console.log('🔑 Getting Azure Storage token with Entra ID...');
    const tokenResponse = await credential.getToken('https://storage.azure.com/.default');
    tokenCache.storage = tokenResponse;
    return tokenResponse.token;
}
