/**
 * Billing Components - AI Suggestions Module
 * 
 * This module provides AI-powered validation and suggestions for billing records.
 * It integrates with the RIPS Validator Lambda function (amplify/functions/rips-validator/).
 */

export { AISuggestionCard, AISuggestionList } from './AISuggestionCard';
export type { AISuggestion, SuggestionSeverity } from './AISuggestionCard';
export { useAISuggestions } from './useAISuggestions';
