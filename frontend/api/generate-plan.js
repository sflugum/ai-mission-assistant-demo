import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { prompt } = await req.json(); 

    const result = await streamObject({
      model: google('gemini-2.5-flash'), 
      system: 'You are a senior analyst mapping out a mission. Return ONLY valid JSON matching the requested schema. No markdown, no explanations.',
      prompt: prompt,
      schema: z.object({
        actionPlan: z.array(z.string()).describe("A list of clear, actionable steps."),
        risks: z.array(z.string()).describe("Potential failure points or operational risks."),
        tools: z.array(z.string()).describe("Required equipment, software, or resources."),
      }),
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      event: 'gemini_stream_failed',
      message: error.message,
      stack: error.stack
    }));
    return new Response(
      JSON.stringify({ error: "Failed to generate plan." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}