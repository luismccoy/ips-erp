import { type Schema } from '../../data/resource';
import { AIClient } from './ai-client';

// Initialize AI Client (supports LIVE and RECORDED modes)
const aiClient = new AIClient();

export const handler: Schema["generateRoster"]["functionHandler"] = async (event) => {
    const { nurses, unassignedShifts } = event.arguments;

    // 1. Construct the Prompt
    const prompt = `
    You are an expert Home Care Roster Coordinator for a Colombian IPS.
    Your goal is to assign SHIFTS to NURSES to minimize travel time and match skills.

    DATA:
    - NURSES: ${JSON.stringify(nurses)}
    - SHIFTS: ${JSON.stringify(unassignedShifts)}

    RULES:
    1. A nurse cannot be assigned if they don't have the required skills (if specified).
    2. Try to minimize distance between nurse location and shift location.
    3. Output JSON ONLY. Format: { "assignments": [ { "shiftId": "...", "nurseId": "..." } ] }
  `;

    // 2. Call AI Client (supports LIVE and RECORDED modes)
    try {
        // Validate required environment variables
        if (!process.env.MODEL_ID) {
            throw new Error("MODEL_ID environment variable is required");
        }
        if (!process.env.AI_RECORDINGS_S3_BUCKET) {
            throw new Error("AI_RECORDINGS_S3_BUCKET environment variable is required");
        }

        const responseBody = await aiClient.invokeModel({
            modelId: process.env.MODEL_ID,
            prompt: prompt,
            maxTokens: 1000,
            temperature: 0.7
        });

        // Extract the text content
        const textOutput = responseBody.content[0].text;

        // Attempt to parse JSON from the output (simple extraction)
        // In production we might use a more robust parser or tool use
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in AI response");
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;

    } catch (error) {
        console.error("AI Roster generation failed:", error);
        // Fallback: Return empty assignments
        return { assignments: [] };
    }
};
