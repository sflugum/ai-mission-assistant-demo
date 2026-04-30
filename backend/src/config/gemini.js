export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'

export function getGeminiEnv() {
  return {
    apiKey: process.env.GOOGLE_API_KEY,
    model: process.env.GOOGLE_MODEL || DEFAULT_GEMINI_MODEL
  }
}
