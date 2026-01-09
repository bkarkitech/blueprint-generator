/**
 * Shared TypeScript types for the Blueprint Generator
 */

export interface RequestBody {
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  repos?: string[];
}
