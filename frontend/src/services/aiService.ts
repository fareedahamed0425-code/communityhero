import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client using the Vite environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let aiClient: GoogleGenerativeAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenerativeAI(apiKey);
} else {
  console.warn("Gemini API key is missing. Auto-categorization will not work.");
}

export interface AISuggestion {
  title: string;
  description: string;
  issue_type: string;
  severity: string;
}

export const analyzeIssueImage = async (base64DataUrl: string): Promise<AISuggestion | null> => {
  if (!aiClient) {
    console.warn("Cannot analyze image: AI Client not initialized.");
    return null;
  }

  try {
    // Extract base64 part from the data URL (e.g. "data:image/jpeg;base64,...")
    const base64Data = base64DataUrl.split(',')[1];
    const mimeType = base64DataUrl.split(';')[0].split(':')[1] || 'image/jpeg';

    const prompt = `
      You are an expert civic issue analyst for a municipal dashboard. 
      Look closely at this image and categorize the issue.
      
      Return ONLY a raw JSON object (without markdown code blocks) with the following structure:
      {
        "title": "A short, precise title (max 6 words)",
        "description": "A detailed but concise description of what you see and why it's a problem",
        "issue_type": "Must be exactly one of: pothole, water_leakage, garbage, streetlight, other",
        "severity": "Must be exactly one of: low, medium, high, critical"
      }
      
      Determine severity based on:
      - low: Cosmetic or minor annoyance.
      - medium: Bothersome but not immediately dangerous.
      - high: Risk to property or vehicle damage.
      - critical: Immediate safety hazard to life or limb.
    `;

    const model = aiClient.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      }
    ]);

    const response = await result.response;
    const text = response.text();

    if (text) {
      try {
        // In case the model returns markdown JSON blocks
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        return parsed as AISuggestion;
      } catch (parseError) {
        console.error("Failed to parse Gemini response as JSON:", text);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    return null;
  }
};

export const chatWithAI = async (message: string, history: { role: string, parts: { text: string }[] }[] = []): Promise<string | null> => {
  if (!aiClient) {
    console.warn("Cannot chat: AI Client not initialized.");
    return "I'm sorry, my AI connection is currently offline.";
  }

  try {
    const model = aiClient.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: "You are the Community Hero AI Assistant. Your job is to help citizens report civic issues, answer questions about municipal services, and encourage community engagement. Be concise, polite, and helpful. Use markdown to format your responses beautifully. CRITICAL: If a user asks for emergency numbers, helpline numbers, or municipal contact information, DO NOT provide generic numbers without specifying the country. Provide accurate numbers tailored to the user's country (e.g., USA: 911, India: 112, UK: 999). If you do not know the user's location, ask them which country they are in first, or provide a well-labeled list of numbers for common countries like India, USA, and UK."
    });

    const chatSession = model.startChat({
      history: history,
    });

    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
    return "I encountered an error processing your request. Please try again later.";
  }
};
