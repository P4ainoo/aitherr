
import { GoogleGenAI, Type } from "@google/genai";
import { Destination, DetailedPlan, SafetyAdvisory } from "../types";

const API_KEY = process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set VITE_GEMINI_API_KEY in your .env file.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(operation: () => Promise<T>, maxRetries = 5): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      // Check if it's a 429 error (Resource Exhausted)
      const isRateLimit = error?.status === 429 || 
                          error?.message?.includes('429') || 
                          error?.message?.includes('RESOURCE_EXHAUSTED') ||
                          error?.message?.includes('quota');
      
      if (isRateLimit && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 3000 + Math.random() * 2000; // Exponential backoff with jitter
        console.warn(`Rate limit hit. Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1} of ${maxRetries})`);
        await delay(waitTime);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const getDetailedPlanSchema = () => {
  const activitySchema = {
    type: Type.OBJECT,
    properties: {
      time: { type: Type.STRING },
      activity: { type: Type.STRING },
      description: { type: Type.STRING },
      location: { type: Type.STRING },
    },
    required: ["time", "activity", "description", "location"]
  };

  return {
    type: Type.OBJECT,
    properties: {
      country: { type: Type.STRING },
      hobbies: { type: Type.ARRAY, items: { type: Type.STRING } },
      summary: { type: Type.STRING },
      startDate: { type: Type.STRING },
      endDate: { type: Type.STRING },
      flightDetails: {
        type: Type.OBJECT,
        properties: {
          airline: { type: Type.STRING },
          route: { type: Type.STRING },
          estimatedPrice: { type: Type.STRING },
          bookingTip: { type: Type.STRING },
        },
        required: ["airline", "route", "estimatedPrice", "bookingTip"]
      },
      hotelDetails: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          estimatedPricePerNight: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "location", "estimatedPricePerNight", "description"]
      },
      itinerary: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            date: { type: Type.STRING },
            title: { type: Type.STRING },
            morning: activitySchema,
            afternoon: activitySchema,
            evening: activitySchema,
            dining: {
              type: Type.OBJECT,
              properties: { breakfast: { type: Type.STRING }, lunch: { type: Type.STRING }, dinner: { type: Type.STRING } },
              required: ["breakfast", "lunch", "dinner"]
            },
            transit: { type: Type.STRING },
            phraseOfTheDay: {
              type: Type.OBJECT,
              properties: { phrase: { type: Type.STRING }, meaning: { type: Type.STRING } },
              required: ["phrase", "meaning"]
            },
            sustainabilityTip: { type: Type.STRING },
          },
          required: ['day', 'date', 'title', 'morning', 'afternoon', 'evening', 'dining', 'transit', 'phraseOfTheDay', 'sustainabilityTip'],
        },
      },
      estimatedBudget: { type: Type.STRING },
      bestTimeToVisit: { type: Type.STRING },
    },
    required: ['country', 'hobbies', 'summary', 'startDate', 'endDate', 'flightDetails', 'hotelDetails', 'itinerary', 'estimatedBudget', 'bestTimeToVisit'],
  };
};

export const getDetailedPlan = async (country: string, hobbies: string[], budget: number, startDate: string, endDate: string, departurePlace: string): Promise<DetailedPlan> => {
  const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
  
  const prompt = `
    You are a world-class travel planner. 
    Create a highly detailed, time-blocked ${days}-day travel itinerary for a user visiting "${country}" from "${departurePlace}".
    The user is interested in these hobbies: ${hobbies.join(", ")}.
    The user's total budget is: $${budget}.
    The travel dates are from ${startDate} to ${endDate}.
    
    The plan should be sustainable, culturally respectful, and highly personalized to their hobbies and budget.
    Include:
    - A summary of the trip.
    - Flight details: Suggest the cheapest/best airline route from ${departurePlace} to ${country}, estimated price, and a booking tip.
    - Hotel details: Suggest a specific hotel that fits the $${budget} budget, its location, estimated price per night, and a description.
    - A day-by-day itinerary with specific time-blocked activities for morning, afternoon, and evening.
    - For EVERY activity (morning, afternoon, evening), provide a detailed 'description' (what it is about, why it's interesting) and the specific 'location' (where it is).
    - Specific sustainable dining recommendations for breakfast, lunch, and dinner each day that fit the budget.
    - Transit and logistics advice for each day (e.g., "Take the Metro Line 4").
    - A local "Phrase of the Day" with its meaning.
    - A sustainability tip for each day.
    - Estimated budget (range in USD or local currency).
    - Best time to visit.
    
    Return the response in the specified JSON format. Ensure exactly ${days} days are included in the itinerary array.
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getDetailedPlanSchema(),
        temperature: 0.7,
      },
    }));

    const jsonString = response.text;
    if (!jsonString) throw new Error("Empty response from AI");
    return JSON.parse(jsonString);
  } catch (error: any) {
    console.error("Error generating detailed plan:", error);
    if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('quota')) {
      throw new Error("The AI service is currently busy (rate limit exceeded). Please wait a moment and try again.");
    }
    throw new Error("Failed to generate detailed plan.");
  }
};

const getResponseSchema = (skill: string) => ({
  type: Type.OBJECT,
  properties: {
    destinations: {
      type: Type.ARRAY,
      description: "A list of 3 to 5 recommended travel destinations.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "Name of the destination, including city and country. E.g., 'Tuscany, Italy'",
          },
          description: {
            type: Type.STRING,
            description: "A compelling paragraph about why this is a great destination for learning the specified skill, emphasizing sustainable and responsible tourism aspects.",
          },
          sustainabilityScore: {
            type: Type.INTEGER,
            description: "A score from 1 to 100 representing the destination's commitment to eco-friendly practices, cultural preservation, and supporting local communities.",
          },
          learningOpportunities: {
            type: Type.ARRAY,
            description: "A short list of 2-3 specific learning activities or workshops available.",
            items: {
              type: Type.STRING,
            },
          },
          latitude: {
            type: Type.NUMBER,
            description: "The geographical latitude of the destination.",
          },
          longitude: {
            type: Type.NUMBER,
            description: "The geographical longitude of the destination.",
          },
          skill: {
            type: Type.STRING,
            description: "The skill this destination is recommended for.",
            enum: [skill]
          }
        },
        required: ['name', 'description', 'sustainabilityScore', 'learningOpportunities', 'latitude', 'longitude', 'skill']
      },
    },
  },
  required: ['destinations'],
});


export const getTravelRecommendations = async (skill: string): Promise<{ destinations: Destination[] }> => {
  const prompt = `
    You are an expert travel agent specializing in educational and sustainable tourism.
    A user wants to learn a new skill: "${skill}".
    
    Please recommend 3-5 ideal destinations around the world for learning this skill.
    
    For each destination, focus on places known for their commitment to responsible tourism, cultural respect, and local economic benefits.
    Provide the information in the structured JSON format as defined by the schema, including accurate geographical coordinates (latitude and longitude) for each destination.
    Ensure the descriptions are engaging and highlight both the learning and sustainability aspects. The 'skill' field for each destination must be exactly "${skill}".
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(skill),
        temperature: 0.7,
      },
    }));

    const jsonString = response.text;
    if (!jsonString) {
      throw new Error("Received an empty response from the AI.");
    }

    const parsedResponse = JSON.parse(jsonString);

    if (!parsedResponse.destinations || !Array.isArray(parsedResponse.destinations)) {
        throw new Error("Invalid data structure received from AI.");
    }
    
    return parsedResponse;

  } catch (error: any) {
    console.error("Error fetching travel recommendations:", error);
    if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('quota')) {
      throw new Error("The AI service is currently busy (rate limit exceeded). Please wait a moment and try again.");
    }
    throw new Error("Failed to get recommendations from Gemini API.");
  }
};

export const getSafetyAdvisories = async (location: string): Promise<SafetyAdvisory[]> => {
  const prompt = `
    You are a travel safety expert.
    Identify 3-5 specific areas or neighborhoods in or near "${location}" that travelers should avoid or be cautious about due to safety concerns (e.g., high crime, scams, political instability, natural hazards).
    
    For each area, provide:
    - The name of the area/neighborhood.
    - The specific reason why it should be avoided.
    - The severity of the risk (high, medium, or low).
    - The approximate latitude and longitude of the center of that area.
    
    Return the response in the following JSON format:
    {
      "advisories": [
        {
          "locationName": "Name of the area",
          "reason": "Detailed reason for the advisory",
          "severity": "high", // or "medium", "low"
          "latitude": 12.3456,
          "longitude": -78.9012
        }
      ]
    }
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advisories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  locationName: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
                  latitude: { type: Type.NUMBER },
                  longitude: { type: Type.NUMBER },
                },
                required: ["locationName", "reason", "severity", "latitude", "longitude"]
              }
            }
          },
          required: ["advisories"]
        },
        temperature: 0.5,
      },
    }));

    const jsonString = response.text;
    if (!jsonString) throw new Error("Empty response from AI");
    const parsed = JSON.parse(jsonString);
    return parsed.advisories;
  } catch (error: any) {
    console.error("Error fetching safety advisories:", error);
    if (error?.message?.includes('RESOURCE_EXHAUSTED') || error?.message?.includes('quota')) {
      throw new Error("The AI service is currently busy (rate limit exceeded). Please wait a moment and try again.");
    }
    throw new Error("Failed to get safety advisories.");
  }
};

export const analyzeAndReconstruct = async (imageBase64: string): Promise<{ placeName: string; description: string; historicalEra: string; imagePrompt: string; videoPrompt: string }> => {
  const prompt = `
    Analyze this image and identify the specific landmark or place shown.
    
    Then, describe what this place looked like in its prime historical era (e.g., Ancient Rome for the Colosseum, Edo period for a Japanese castle).
    Describe how people lived, dressed, and interacted there during that time.
    
    Finally, create two prompts:
    1. A highly detailed image generation prompt to recreate a photorealistic view of this place in that historical era.
    2. A dynamic video generation prompt to create a cinematic video of the location in that era, capturing the atmosphere, people in motion (e.g., fighting, trading, celebrating), and the general "vibe".
    
    Return the response in this JSON format (do not include markdown code blocks):
    {
      "placeName": "Name of the place",
      "historicalEra": "The historical era (e.g., 1st Century AD)",
      "description": "A brief paragraph (approx 100 words) describing the place and life during that era.",
      "imagePrompt": "A detailed prompt for an image generator...",
      "videoPrompt": "A detailed prompt for a video generator..."
    }
  `;

  try {
    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: imageBase64
          }
        },
        { text: prompt }
      ],
      config: {
        temperature: 0.4,
      },
    }));

    let jsonString = response.text;
    if (!jsonString) throw new Error("Empty response from AI");
    
    // Clean up markdown code blocks if present
    jsonString = jsonString.replace(/```json\n?|\n?```/g, '').trim();
    
    return JSON.parse(jsonString);
  } catch (error: any) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze the image.");
  }
};

export const generateHistoricalImage = async (prompt: string): Promise<string> => {
  try {
    // Using gemini-3.1-flash-image-preview for high quality generation as requested
    const response = await withRetry(() => ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      },
    }));

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error: any) {
    console.error("Error generating historical image:", error);
    throw new Error("Failed to generate historical image.");
  }
};

export const generateHistoricalVideo = async (prompt: string): Promise<string> => {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video URI in response");

    // Fetch the video content with the API key
    const response = await fetch(videoUri, {
      method: 'GET',
      headers: {
        'x-goog-api-key': API_KEY,
      },
    });

    if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.error("Error generating historical video:", error);
    throw new Error("Failed to generate historical video.");
  }
};

export const createTravelChatSession = (currentPlan: DetailedPlan | null) => {
  const systemInstruction = `You are Aither, a helpful AI travel assistant. 
  ${currentPlan ? `The user is currently viewing this travel plan: ${JSON.stringify(currentPlan)}.` : `The user has not generated a plan yet.`}
  Answer their questions about travel, destinations, and sustainability.
  If they want to modify their current plan (e.g., "change the morning activity on Day 2 to a museum"), you MUST do two things:
  1. Explain the new activity in your chat response in detail (e.g., tell them what the museum is about, where it is located, why it's a good fit).
  2. Use the 'updatePlan' tool to generate the new modified plan. Keep the rest of the plan intact, only change what they asked for. Make sure the new activity has a detailed 'description' and 'location' in the JSON.`;

  const updatePlanTool = {
    name: "updatePlan",
    description: "Update the user's travel plan/itinerary. Use this when the user asks to change activities, dining, or any part of their current plan.",
    parameters: getDetailedPlanSchema()
  };

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [updatePlanTool] }],
      temperature: 0.7,
    }
  });
};