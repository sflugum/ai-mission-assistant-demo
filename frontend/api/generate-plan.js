import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Edge runtime keeps this fast and cheap to run, and it's a requirement for
// streaming responses to work properly with the ai SDK on Vercel.
export const config = {
  runtime: 'edge',
};

/**
 * Handles POST requests to generate a mission plan from a text prompt.
 * Streams back a JSON object (action plan, risks, tools) instead of waiting
 * for the full response, so the frontend can start rendering before the
 * model is done generating.
 */
export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { prompt } = await req.json(); 

    const result = await streamObject({
      model: google('gemini-2.5-flash'), 
      // Explicitly telling the model not to add markdown or explanations. 
      // Without this it can wrap the JSON in a code block unintentionally, which 
      // would break the schema validation in streamObject.
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
    // Logging as structured JSON so it's easier to filter in Vercel's
    // log viewer if something goes wrong in production.
    console.error(JSON.stringify({
      level: 'error',
      event: 'gemini_stream_failed',
      message: error.message,
      stack: error.stack
    }));

    // Note: this only catches errors that happen before streaming starts
    // (e.g. bad request, auth failure). If the model fails partway through
    // streaming, the client may just get a partial response instead of this
    // error. Haven't built handling for that case yet.
    return new Response(
      JSON.stringify({ error: "Failed to generate plan." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}