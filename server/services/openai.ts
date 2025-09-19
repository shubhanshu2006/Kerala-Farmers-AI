import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface CropRecommendation {
  crop: string;
  recommendations: string[];
  tasks: Array<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    dueDate: string;
  }>;
  warnings: string[];
}

export interface DiseaseAnalysis {
  disease: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  treatment: string[];
  prevention: string[];
}

export interface ChatResponse {
  response: string;
  actionItems?: string[];
}

export async function generateCropRecommendations(
  crop: string,
  location: string,
  weather: any,
  soilData?: any,
  language: string = "en"
): Promise<CropRecommendation> {
  const prompt = `You are an expert agricultural advisor for Kerala, India. Provide specific farming recommendations for ${crop} in ${location}.

Current conditions:
- Weather: ${JSON.stringify(weather)}
- Soil data: ${soilData ? JSON.stringify(soilData) : "Not available"}
- Language: ${language}

Provide recommendations in JSON format with:
- crop: crop name
- recommendations: array of specific actionable advice
- tasks: array of tasks with title, description, priority (low/medium/high), and dueDate (YYYY-MM-DD)
- warnings: array of potential issues to watch for

Focus on Kerala-specific farming practices and current conditions.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert agricultural advisor specializing in Kerala farming practices. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to generate crop recommendations: " + (error as Error).message);
  }
}

export async function analyzePlantDisease(base64Image: string): Promise<DiseaseAnalysis> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert plant pathologist. Analyze the plant image for diseases and provide detailed diagnosis and treatment recommendations in JSON format."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this plant image for diseases. Provide response in JSON format with:
              - disease: disease name or "healthy" if no disease detected
              - confidence: confidence score (0-100)
              - severity: "low", "medium", or "high"
              - treatment: array of treatment steps
              - prevention: array of prevention measures
              
              Focus on diseases common in Kerala's tropical climate.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048
    });

    return JSON.parse(visionResponse.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to analyze plant disease: " + (error as Error).message);
  }
}

export async function generateChatResponse(
  message: string,
  context: any,
  language: string = "en"
): Promise<ChatResponse> {
  const systemPrompt = `You are കൃഷി സഹായി (Krishi Sahayi), an AI farming assistant specifically designed for Kerala farmers. You have expertise in:
- Kerala's tropical agriculture and monsoon patterns
- Local crops: rice, coconut, pepper, banana, rubber, spices
- Traditional and modern farming practices
- Pest and disease management
- Market trends and pricing
- Government schemes and subsidies

Context: ${JSON.stringify(context)}
Language: ${language}

Provide helpful, practical advice in a friendly manner. If speaking in Malayalam or Tamil, use the script appropriately.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{"response": "I apologize, but I could not process your request at the moment."}');
  } catch (error) {
    throw new Error("Failed to generate chat response: " + (error as Error).message);
  }
}

export async function generateSoilRecommendations(soilTest: any, crop?: string): Promise<any> {
  const prompt = `Analyze this soil test data and provide recommendations for ${crop || "general farming"} in Kerala:

Soil Data: ${JSON.stringify(soilTest)}

Provide response in JSON format with:
- overallHealth: "poor", "fair", "good", "excellent"
- criticalIssues: array of urgent problems
- recommendations: array of specific actions
- fertilizers: array of recommended fertilizers with quantities
- timeline: when to implement recommendations`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a soil scientist and agricultural expert. Provide detailed soil analysis and recommendations in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    throw new Error("Failed to generate soil recommendations: " + (error as Error).message);
  }
}
