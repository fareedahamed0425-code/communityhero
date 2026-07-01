import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { createIssue } from './issueService';
import type { IssueData } from './issueService';

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
        const parsed = JSON.parse(cleanedText) as AISuggestion;
        
        // Ensure values match backend enums to prevent database errors
        const validIssueTypes = ['pothole', 'water_leakage', 'garbage', 'streetlight', 'other'];
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        
        if (!parsed.issue_type || !validIssueTypes.includes(parsed.issue_type.toLowerCase())) {
          parsed.issue_type = 'other';
        }
        if (!parsed.severity || !validSeverities.includes(parsed.severity.toLowerCase())) {
          parsed.severity = 'medium';
        }
        
        return parsed;
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
      systemInstruction: "You are the Community Hero AI Assistant. Your job is to help citizens report civic issues, answer questions about municipal services, and encourage community engagement. Be concise, polite, and helpful. Use markdown to format your responses beautifully. CRITICAL: If a user asks for emergency numbers, DO NOT provide generic numbers without specifying the country. If you do not know the user's location, ask them which country they are in first, or provide a well-labeled list of numbers. CRITICAL: You have the ability to automatically file complaints on behalf of the user using the `file_complaint` tool. If a user simply mentions or describes a civic issue (like a pothole, broken streetlight, or garbage dump), YOU MUST PROACTIVELY assume they want to report it. Do not wait for them to say 'file a complaint'. Instead, immediately acknowledge the issue and gently ask for any missing details (exact location, severity). Once you have enough information, automatically call the `file_complaint` tool.",
      tools: [
        {
          functionDeclarations: [
            {
              name: "file_complaint",
              description: "Automatically files a civic complaint on behalf of the user to the database.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  title: { type: SchemaType.STRING, description: "Short, precise title for the issue" },
                  description: { type: SchemaType.STRING, description: "Detailed description of the issue" },
                  issue_type: { type: SchemaType.STRING, description: "Must be exactly one of: pothole, water_leakage, garbage, streetlight, other" },
                  severity: { type: SchemaType.STRING, description: "Must be exactly one of: low, medium, high, critical" },
                },
                required: ["title", "description", "issue_type", "severity"]
              }
            }
          ]
        }
      ]
    });

    const chatSession = model.startChat({
      history: history,
    });

    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    
    // Check if the model decided to call our function
    const functionCall = response.functionCalls()?.[0];
    if (functionCall && functionCall.name === "file_complaint") {
      const args = functionCall.args as any;
      console.log("AI decided to file a complaint:", args);
      
      const issueData: IssueData = {
        title: args.title,
        description: args.description + " (Reported via AI Assistant)",
        issue_type: args.issue_type,
        severity: args.severity,
        latitude: null, // AI doesn't have exact coordinates
        longitude: null,
        image_url: "",
        status: "Reported"
      };
      
      try {
        const id = await createIssue(issueData);
        // Send the function response back to the model so it knows it succeeded
        const secondResult = await chatSession.sendMessage([{
          functionResponse: {
            name: "file_complaint",
            response: { success: true, issue_id: id }
          }
        }]);
        return secondResult.response.text();
      } catch (err) {
        console.error("Failed to create issue from AI:", err);
        const errorResult = await chatSession.sendMessage([{
          functionResponse: {
            name: "file_complaint",
            response: { success: false, error: "Database error occurred." }
          }
        }]);
        return errorResult.response.text();
      }
    }

    return response.text();
  } catch (error) {
    console.error("Error chatting with Gemini:", error);
    return "I encountered an error processing your request. Please try again later.";
  }
};
