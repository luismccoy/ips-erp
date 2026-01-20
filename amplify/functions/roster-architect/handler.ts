import { type Schema } from '../../data/resource';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Initialize Bedrock Client
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });

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

    // 2. Call Bedrock (Claude 3.5 Sonnet)
    try {
        const command = new InvokeModelCommand({
            modelId: process.env.MODEL_ID,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt }
                        ]
                    }
                ]
            }),
        });

        const response = await bedrock.send(command);
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

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
