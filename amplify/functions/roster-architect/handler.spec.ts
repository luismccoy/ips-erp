import { handler } from './handler';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { mockClient } from "aws-sdk-client-mock";
import { describe, it, expect, beforeEach } from 'vitest';

const bedrockMock = mockClient(BedrockRuntimeClient);

describe('Roster Architect AI', () => {
    beforeEach(() => {
        bedrockMock.reset();
    });

    it('should generate assignments for unassigned shifts', async () => {
        // 1. Mock Request Data
        const event = {
            arguments: {
                nurses: [{ id: 'nurse-1', name: 'Maria', skills: ['Wound Care'] }],
                unassignedShifts: [{ id: 'shift-A', requiredSkill: 'Wound Care' }]
            }
        };

        // 2. Mock Bedrock Response (Claude 3.5 Sonnet format)
        const mockAIResponse = {
            assignments: [
                { shiftId: 'shift-A', nurseId: 'nurse-1' }
            ]
        };

        bedrockMock.on(InvokeModelCommand).resolves({
            body: new TextEncoder().encode(JSON.stringify({
                content: [
                    { text: JSON.stringify(mockAIResponse) }
                ]
            }))
        });

        // 3. Invoke Handler
        // @ts-expect-error - Partial mock of the event
        const result = await handler(event);

        // 4. Assertions
        expect(result).toEqual(mockAIResponse);
        expect(bedrockMock.calls()).toHaveLength(1);

        // Check if prompt contains critical info
        const callArgs = bedrockMock.call(0).args[0].input;
        const requestBody = JSON.parse(callArgs.body as string);
        const promptText = requestBody.messages[0].content[0].text;

        expect(promptText).toContain('Maria'); // Nurse data present
        expect(promptText).toContain('shift-A'); // Shift data present
    });

    it('should handle AI failure gracefully', async () => {
        bedrockMock.on(InvokeModelCommand).rejects(new Error('Bedrock Throttling'));

        // @ts-expect-error - Testing valid failure case
        const result = await handler({ arguments: { nurses: [], unassignedShifts: [] } });

        expect(result).toEqual({ assignments: [] });
    });
});
