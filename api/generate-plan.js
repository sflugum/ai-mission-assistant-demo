import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import * as Sentry from '@sentry/vercel-edge';


Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN, 
  tracesSampleRate: 1.0,
});

export const runtime = 'edge'; 

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { prompt } = await req.json(); 

    const result = streamText({
      model: google('gemini-1.5-flash'), 
      prompt: prompt,
    });

    return result.toDataStreamResponse();

  } catch (error) {
   
    Sentry.captureException(error);

    await Sentry.flush(2000);

    return new Response(
      JSON.stringify({ error: "Failed to generate plan." }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}