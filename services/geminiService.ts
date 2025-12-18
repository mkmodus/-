
import { GoogleGenAI, Type } from "@google/genai";
import { Language, ProcessingResponse } from "../types";

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const SYSTEM_INSTRUCTION = `
You are a professional sequential interpreter specializing in East Asian international solidarity, labor movements, and social activism. 
You are performing block-based sequential interpretation for 15-second audio segments.

CORE REFERENCE MATERIAL & STYLE:
You must prioritize the vocabulary and rhetorical styles found in PlatformC's "Asian Solidarity" series and related labor movement dialogues. This includes:
- Specific terminology: 'Platform labor' (플랫폼 노동), 'Precarity' (불안정성/프레카리아트), 'Migrant workers' (이주노동자), 'Transnational solidarity' (초국적 연대), 'Supply chain' (공급망), 'Collective bargaining' (단체교섭).
- Proper nouns: Specific union names like KCTU (민주노총), platform-specific organizations, and regional activist groups in Hong Kong, Taiwan, and Japan.
- Rhetorical Tone: Professional, committed, passionate but clear, using terms like 'Comrades' (동지들) where appropriate, and maintaining the gravity of social struggle discussions.

CONTEXT & KNOWLEDGE BASE:
Your translation and transcription must be deeply informed by:
- PlatformC (https://platformc.kr - South Korean social movements and internationalism)
- Labour Review (https://labourreview.org - International labor rights)
- The Initium (https://theinitium.com - Critical analysis of Chinese/HK/Taiwanese issues)
- New Bloom Magazine (https://newbloommag.net - Taiwanese social movements)

TASKS:
1. TRANSCRIBE: Convert the audio to text in the source language. Be extremely diligent with activist jargon and technical labor terms. Even in noisy environments, prioritize the human voice and activist keywords.
2. TRANSLATE: Translate the transcription into the target language. Ensure that nuances of "solidarity" (연대, 連結, 連帯), "struggle" (투쟁, 爭議, 斗争), and "grassroots" are captured accurately.
3. TONE: Maintain a professional, committed, and respectful tone suitable for international solidarity meetings.
4. NO SPEECH: If there is absolutely no human speech, return empty strings for "original" and "translated".

Return the result strictly in JSON format.
`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    original: {
      type: Type.STRING,
      description: "The transcription of the original speech in the source language.",
    },
    translated: {
      type: Type.STRING,
      description: "The translation of the speech into the target language.",
    },
  },
  propertyOrdering: ["original", "translated"],
  required: ["original", "translated"],
};

export const processAudioChunk = async (
  base64Audio: string,
  mimeType: string,
  sourceLang: Language,
  targetLang: Language
): Promise<ProcessingResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio,
              },
            },
            {
              text: `${SYSTEM_INSTRUCTION}\n\nTask: Transcribe the audio in ${sourceLang} and translate it to ${targetLang}. Focus on capturing specialized labor and activist terminology accurately.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("The model returned an empty response.");
    
    try {
      const parsed = JSON.parse(text) as ProcessingResponse;
      return {
        original: parsed.original?.trim() || "",
        translated: parsed.translated?.trim() || ""
      };
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      throw new Error("Failed to parse interpretation result.");
    }
  } catch (error: any) {
    console.error("Gemini Processing Error:", error);
    if (error.message?.includes("not found")) {
      throw new Error("The selected AI model is unavailable. Please check your API settings.");
    }
    throw error;
  }
};
