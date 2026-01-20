import React, { useState } from 'react';
import { client, MOCK_USER } from '../amplify-utils';

export const AdminRoster: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [assignments, setAssignments] = useState<any[]>([]);

    const handleAutoAssign = async () => {
        setLoading(true);
        try {
            // 1. Fetch current unassigned shifts and available nurses
            // In a real app we would query the DB first. Here we mock input data for the AI.
            const mockNurses = [{ id: 'nurse-1', name: 'Maria', skills: ['Wound Care'] }];
            const mockShifts = [{ id: 'shift-A', locationLat: 4.60, locationLng: -74.08, requiredSkill: 'Wound Care' }];

            // 2. Call the AI Cloud Function
            const { data, errors } = await client.queries.generateRoster({
                nurses: JSON.stringify(mockNurses),
                unassignedShifts: JSON.stringify(mockShifts)
            });

            if (errors) throw new Error(errors[0].message);

            // 3. Parse and display results
            if (data) {
                const result = JSON.parse(data as string);
                setAssignments(result.assignments || []);
            }
        } catch (err) {
            console.error('AI Roster failed:', err);
            alert('AI Roster generation failed. Check console.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', marginTop: '20px', border: '1px solid #cce5ff', borderRadius: '8px', background: '#f8f9fa' }}>
            <h2>🤖 AI Roster Architect</h2>
            <p>Use Bedrock (Claude 3.5 Sonnet) to optimize schedule.</p>

            <button
                onClick={handleAutoAssign}
                disabled={loading}
                style={{ background: '#6610f2', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                {loading ? 'Thinking...' : '⚡ Auto-Assign Shifts'}
            </button>

            {assignments.length > 0 && (
                <div style={{ marginTop: '15px' }}>
                    <h3>Suggested Assignments:</h3>
                    <ul>
                        {assignments.map((a, idx) => (
                            <li key={idx}>Shift <strong>{a.shiftId}</strong> ➡️ Nurse <strong>{a.nurseId}</strong></li>
                        ))}
                    </ul>
                    <button onClick={() => alert("Assignments Confirmed (Stub)")}>Confirm & Save</button>
                </div>
            )}
        </div>
    );
};
