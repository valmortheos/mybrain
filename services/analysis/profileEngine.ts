// services/analysis/profileEngine.ts
import { Type } from "@google/genai";

/**
 * FILE INI BERISI LOGIKA ANALISIS PROFIL PENGGUNA (PROFILING ENGINE).
 * Tujuannya adalah memisahkan logika ekstraksi data diri dari logika percakapan biasa.
 */

// Schema definisi untuk output profil dari AI
export const userProfileSchema = {
  type: Type.OBJECT,
  description: "CRITICAL: Ekstrak data diri user. JANGAN PERNAH LEWATKAN NAMA, UMUR, ATAU GENDER JIKA DISEBUTKAN.",
  properties: {
    name: { type: Type.STRING, description: "Nama panggilan user. Title Case." },
    age: { type: Type.NUMBER, description: "Angka umur. Cth: '20 tahun' -> 20." },
    gender: { type: Type.STRING, description: "Pria/Wanita. Normalisasi dari: cowo, laki, pria -> 'Pria'; cewe, wanita, gadis -> 'Wanita'." },
    mbti: { type: Type.STRING, description: "Prediksi MBTI 4 huruf (INTJ, ENFP, dll)." },
    careerAmbitions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Cita-cita atau karir."
    },
    hobbies: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Hobi."
    },
    interests: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Minat intelektual."
    },
    likes: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Hal yang disukai."
    },
    dislikes: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Hal yang tidak disukai."
    },
    personalityTraits: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Sifat dominan."
    }
  },
  nullable: true
};

// Prompt tambahan khusus untuk profiling dengan FEW-SHOT LEARNING
export const PROFILE_EXTRACTION_PROMPT = `
[SYSTEM: PROFILING DATA EXTRACTOR V5.0]
Tugasmu adalah menjadi "Data Miner" di latar belakang. Kamu HARUS mengupdate JSON \`profileUpdate\` setiap kali user memberikan fakta baru tentang dirinya.

ATURAN WAJIB (STRICT RULES):
1. **JANGAN MALAS**. Jika user bilang "umurku 20", JSON \`age\` HARUS diisi 20. Jangan biarkan null.
2. **PRIORITAS TERTINGGI**: Nama, Umur, Gender. Ini adalah "Identity Core".
3. **NORMALISASI GENDER**:
   - Input: "aku cowok", "gw laki", "saya pria", "jaka" (nama cowok) -> gender: "Pria"
   - Input: "aku cewek", "gw wanita", "saya gadis", "stella" (nama cewek) -> gender: "Wanita"

CONTOH KASUS (FEW-SHOT LEARNING):
Input User: "Namaku Jake Daniels, aku laki laki umur 20 tahun."
Output JSON Benar:
{
  "profileUpdate": {
    "name": "Jake Daniels",
    "age": 20,
    "gender": "Pria"
  }
}

Input User: "Aku suka berenang tapi benci lari. Cita citaku pilot."
Output JSON Benar:
{
  "profileUpdate": {
    "likes": ["Berenang"],
    "dislikes": ["Lari"],
    "careerAmbitions": ["Pilot"]
  }
}

Input User: "Saya stella, perempuan 23 tahun."
Output JSON Benar:
{
  "profileUpdate": {
    "name": "Stella",
    "age": 23,
    "gender": "Wanita"
  }
}

JIKA KAMU GAGAL MENGEKSTRAK DATA YANG JELAS TERTULIS, SISTEM AKAN DIANGGAP BUG.
`;