import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const summarizeArticle = async (content: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Resumen no disponible (Clave API no configurada).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Resume la siguiente noticia corporativa para un operario de fábrica ocupado. Usa un tono motivador y breve (máximo 2 frases). Contenido: ${content}`,
    });
    return response.text || "No se pudo generar el resumen.";
  } catch (error) {
    console.error("Error summarizing:", error);
    return "Error al conectar con el asistente inteligente.";
  }
};