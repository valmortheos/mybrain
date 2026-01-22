import { GoogleGenAI, Type } from "@google/genai";
import { CognitiveAnalysisResult, UserProfile } from "../types";
import { SYSTEM_PROMPT_V2, DISCOVERY_MODE_INSTRUCTION } from "./ai/prompts";
import { userProfileSchema, PROFILE_EXTRACTION_PROMPT } from "./analysis/profileEngine";

// Helper untuk mendapatkan API Key yang valid
export const getApiKey = (): string | undefined => {
  // 1. Cek Environment Variable (Dev Mode / Google AI Studio)
  if (process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // 2. Cek Local Storage (Hosted Mode / User Input)
  const storedKey = localStorage.getItem('mybrain_api_key');
  if (storedKey) {
    return storedKey;
  }
  return undefined;
};

// Gabungkan Schema Utama dengan Schema Profiling
const cognitiveSchema = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: "Respon verbal yang cerdas, reflektif, dan memancing pemikiran lebih dalam.",
    },
    graphUpdates: {
      type: Type.OBJECT,
      description: "Perubahan topografi jaringan saraf.",
      properties: {
        newNodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "ID Unik (UPPERCASE_SNAKE_CASE). Contoh: FEAR_OF_FAILURE" },
              label: { type: Type.STRING, description: "Label pendek untuk visualisasi. Max 2 kata." },
              group: { type: Type.STRING, enum: ["memory", "logic", "emotion", "visual", "core"] },
              val: { type: Type.NUMBER, description: "Pentingnya node ini (5-30). 30=Core Belief, 5=Passing thought." },
              description: { type: Type.STRING, description: "Analisis singkat kenapa node ini terbentuk." },
            },
            required: ["id", "label", "group", "val"],
          },
        },
        newLinks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING },
              target: { type: Type.STRING },
              value: { type: Type.NUMBER, description: "Kekuatan hubungan (1-10)." },
            },
            required: ["source", "target", "value"],
          },
        },
      },
      nullable: true,
    },
    metrics: {
      type: Type.OBJECT,
      description: "Evaluasi kuantitatif dari pola pikir saat ini.",
      properties: {
        analytical: { type: Type.NUMBER },
        creative: { type: Type.NUMBER },
        emotional: { type: Type.NUMBER },
        memory: { type: Type.NUMBER },
      },
      nullable: true,
    },
    // Integrasi Schema Profil dari folder analysis
    profileUpdate: userProfileSchema
  },
  required: ["reply"],
};

export const sendMessageToGemini = async (
  history: string[], 
  userInput: string,
  currentProfile: UserProfile,
  mode: 'chat' | 'discovery' = 'chat'
): Promise<CognitiveAnalysisResult> => {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
        throw new Error("MISSING_API_KEY");
    }

    // Initialize Client per request to ensure latest key is used
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const model = "gemini-2.0-flash"; // Updated to stable flash model if available, or fallback
    
    // Construct sophisticated context
    const context = history.join("\n");
    const profileContext = `[CURRENT USER DATA]: ${JSON.stringify(currentProfile)}`;

    let fullPrompt = `${SYSTEM_PROMPT_V2}\n\n${profileContext}\n\n${PROFILE_EXTRACTION_PROMPT}\n\n--- RIWAYAT CHAT ---\n${context}\n\n`;

    if (mode === 'discovery') {
      fullPrompt += `${DISCOVERY_MODE_INSTRUCTION}\n\n`;
      if (!userInput) {
        fullPrompt += `[SYSTEM TRIGGER]: Mulai sesi interogasi. Gunakan data profil yang ada untuk membuat pertanyaan tajam.`;
      } else {
        fullPrompt += `[USER ANSWER]: "${userInput}"\n\nAnalisis jawaban ini, update profil dan grafik, lalu ajukan pertanyaan probing berikutnya.`;
      }
    } else {
      fullPrompt += `[ANALYSIS TRIGGERED]\nUser Input: "${userInput}"\n\nLakukan analisis mendalam, perbarui grafik, dan perbarui profil user jika ada info baru:`;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cognitiveSchema,
        temperature: mode === 'discovery' ? 0.7 : 0.65,
        topK: 40,
        topP: 0.95,
      },
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("Sirkuit AI tidak merespons (Empty Output).");
    }

    try {
      const parsed = JSON.parse(responseText) as CognitiveAnalysisResult;
      return parsed;
    } catch (e) {
      console.error("Neural Parsing Error:", e);
      return {
        reply: "Sistem mengalami rekalibrasi internal. Mohon ulangi input Anda.",
        graphUpdates: { newNodes: [], newLinks: [] }
      };
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message === "MISSING_API_KEY") {
        return {
            reply: "⚠️ API Key Belum Terpasang. Silakan refresh halaman untuk masuk ke menu Onboarding dan masukkan API Key Gemini Anda.",
            graphUpdates: { newNodes: [], newLinks: [] }
        };
    }

    return {
      reply: "Maaf, ada gangguan sinyal kognitif pada server AI. Coba lagi nanti.",
      graphUpdates: { newNodes: [], newLinks: [] }
    };
  }
};