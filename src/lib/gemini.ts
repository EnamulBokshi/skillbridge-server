import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY. Please configure it in your environment.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SKILLBRIDGE_SYSTEM_INSTRUCTION = `
You are SkillBridge AI, an assistant for the SkillBridge tutoring platform.

PRIMARY GOAL:
- Help students, tutors, and admins with SkillBridge-related tasks only.

ALLOWED TOPICS:
- Tutors, subjects, categories, slots, bookings, reviews, and platform usage.
- Practical guidance like choosing tutors, planning sessions, writing short profile descriptions, and understanding booking flows.

RESPONSE RULES:
- Keep responses clear, concise, and actionable.
- If information is missing, ask a short clarifying question.
- Do not invent platform data, policies, prices, or availability.
- If asked about unrelated domains, politely redirect to SkillBridge topics.
- Never expose secrets, API keys, internal credentials, or private user data.
`;

export interface SkillBridgeAiRequest {
  prompt: string;
  context?: string;
  history?: { role: "user" | "model"; content: string }[];
  maxOutputTokens?: number;
}

class SkillBridgeChatbot {
  private model: GenerativeModel;
  private chat: ChatSession;

  constructor(
    history: SkillBridgeAiRequest["history"] = [],
    maxOutputTokens: number = 500,
  ) {
    this.model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
      systemInstruction: SKILLBRIDGE_SYSTEM_INSTRUCTION,
    });

    this.chat = this.model.startChat({
      history: history.map((item) => ({
        role: item.role,
        parts: [{ text: item.content }],
      })),
      generationConfig: {
        maxOutputTokens,
      },
    });
  }

 
  async sendMessage(userMessage: string): Promise<string> {
    try {
      const result = await this.chat.sendMessage(userMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("SkillBridge AI Error:", error);
      return "I am having trouble connecting to SkillBridge AI right now. Please try again.";
    }
  }
}

const buildPrompt = (payload: SkillBridgeAiRequest) => {
  const contextBlock = payload.context
    ? `\n\nSkillBridge Context:\n${payload.context}`
    : "";

  return `${payload.prompt}${contextBlock}`;
};

export const generateSkillBridgeResponse = async (
  payload: SkillBridgeAiRequest,
): Promise<string> => {
  const bot = new SkillBridgeChatbot(
    payload.history || [],
    payload.maxOutputTokens || 500,
  );
  return await bot.sendMessage(buildPrompt(payload));
};

export const listModels = async () => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
    );
    const data = await response.json();

    if (!data?.models || !Array.isArray(data.models)) {
      return [];
    }

    return data.models.map((model: { name: string }) => model.name);
  } catch (error) {
    console.error("Error listing Gemini models:", error);
    return [];
  }
};

async function ChatBot(message: string): Promise<string> {
  return await generateSkillBridgeResponse({ prompt: message });
}

export default ChatBot;