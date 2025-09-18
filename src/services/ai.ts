/* eslint-disable @typescript-eslint/no-unused-vars */
import type { AIResponse } from '../types';
import { SYSTEM_PROMPTS } from '../constants';
import { determineIntent, loadContext } from '../utils';

export class AIService {

  private apiKey: string;
  constructor(apiKey:string) {
    this.apiKey = apiKey;
  }

  async processQuery(searchValue: string, selectedModel: string): Promise<string> {
    const context = loadContext();
    const intent = determineIntent(searchValue.toLowerCase());
    const systemPrompt = SYSTEM_PROMPTS[intent as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.general;

    const contextInfo = context
      ? `\n\nCurrent context: You are working with repository "${context.repo_name}" (${context.repo_url}). Owner: ${context.owner}. Created: ${context.created_at}.`
      : "";

    const modelToUse = "meta-llama/llama-3.1-405b-instruct:free";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `${searchValue}${contextInfo}`,
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Failed to get AI response");
    }
  }

  parseResponse(aiResponse: string): AIResponse | string {
    try {
      let cleanedResponse = aiResponse.trim();
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      const parsedResponse: AIResponse = JSON.parse(cleanedResponse);
      
      const validActions = ['create_repo', 'edit_readme', 'create_issue', 'view_issues', 'view_prs', 'view_repo', 'general_help'];
      if (parsedResponse.action && validActions.includes(parsedResponse.action)) {
        return parsedResponse;
      } else {
        return aiResponse;
      }
    } catch (parseError) {
        console.log('Error parsing AI response:', parseError);
      return aiResponse;
    }
  }
}