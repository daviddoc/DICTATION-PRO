import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from "../types";
import { playPcmAudio } from "./audioUtils";

const apiKey = process.env.API_KEY;

// Helper to get voice name based on language
const getVoiceForLanguage = (lang: Language): string => {
  switch (lang) {
    case Language.EN: return 'Puck'; 
    case Language.FR: return 'Fenrir'; 
    case Language.ES: return 'Kore'; 
    default: return 'Kore';
  }
};

export const speakText = async (
  text: string, 
  language: Language,
  onProgress?: (percentage: number) => void,
  onEnded?: () => void
): Promise<(() => void) | undefined> => {
  if (!text.trim()) {
    if(onEnded) onEnded();
    return;
  }
  if (!apiKey) {
    alert("API Key not found in environment");
    if(onEnded) onEnded();
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // We revert to the specialized TTS model for reliability.
    // This model does not support 'systemInstruction', so we cannot enforce 
    // the accent via config, but it guarantees audio generation works.
    const modelName = "gemini-2.5-flash-preview-tts";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { 
              voiceName: getVoiceForLanguage(language) 
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // This returns the stop function from audioUtils
      return await playPcmAudio(base64Audio, onProgress, onEnded);
    } else {
      console.error("No audio data received from Gemini");
      if(onEnded) onEnded();
    }
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    alert("Error generating speech. Please try again.");
    if(onEnded) onEnded();
  }
  return undefined;
};