
import { GoogleGenAI } from "@google/genai";
import { Question } from "../types";

export async function getQuestionExplanation(question: Question, userAnswer: any): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Context: A medical student is taking an exam. 
    Question: ${question.question}
    Type: ${question.type}
    Correct Answer/Key: ${JSON.stringify(question.correct_answer || question.mapping || question.groups)}
    User's Choice: ${JSON.stringify(userAnswer)}

    Task: Briefly and professionally explain the medical reasoning behind the correct answer. 
    If the user was wrong, explain why their choice might be incorrect. 
    Keep the explanation under 200 words. 
    Language: German (since the questions are in German).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Keine Erklärung verfügbar.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Fehler beim Abrufen der Erklärung. Bitte überprüfen Sie Ihre Internetverbindung oder den API-Key.";
  }
}
