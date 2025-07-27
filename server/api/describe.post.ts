import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';
import config from '../config';

export default defineEventHandler(async (event) => {
  const { image } = await readBody(event);
  const geminiApiKey = config.gemini.apiKey;

  if (!image) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image data is required',
    });
  }

  if (!geminiApiKey) {
    console.error('Gemini API key is not configured. Please check your .env file');
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini API key is not configured. Please check your server configuration.',
    });
  }

  const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
  });

  const model = 'gemini-2.5-flash-lite';

  const contents = [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: image,
          },
        },
        {
          text: 'You are a navigation assistant for blind and visually impaired users. Describe the surroundings naturally as if you are their eyes, focusing on:\n\n1. IMMEDIATE SAFETY: Any obstacles, hazards, or things to be cautious about in the path ahead\n2. DISTANCE ESTIMATION: Approximate distances to key objects (e.g., "about 3 feet ahead", "roughly 10 steps to your right")\n3. SPATIAL LAYOUT: General layout of the space and navigation guidance\n4. IMPORTANT DETAILS: Signs, text, people, or significant objects\n\nIMPORTANT GUIDELINES:\n- Never mention "image", "photo", "picture" or "I can see" - speak as if you are naturally observing the environment\n- Use natural, conversational language like "There is..." or "Ahead of you..." or "To your left..."\n- Prioritize safety information first\n- Give specific distance estimates when possible\n- Keep descriptions clear and actionable for navigation',
        },
      ],
    },
  ];

  try {
    console.log('Sending request to Gemini API with model:', model);
    
    // First, let's log the environment variables to ensure the API key is set
    console.log('Environment variables:', {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? '***' : 'Not set',
      NODE_ENV: process.env.NODE_ENV
    });

    // Use the Gemini API directly with fetch for better control
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            {
              text: 'You are a navigation assistant for blind and visually impaired users. Describe the surroundings naturally as if you are their eyes, focusing on:\n\n1. IMMEDIATE SAFETY: Any obstacles, hazards, or things to be cautious about in the path ahead\n2. DISTANCE ESTIMATION: Approximate distances to key objects (e.g., "about 3 feet ahead", "roughly 10 steps to your right")\n3. SPATIAL LAYOUT: General layout of the space and navigation guidance\n4. IMPORTANT DETAILS: Signs, text, people, or significant objects\n\nIMPORTANT GUIDELINES:\n- Never mention "image", "photo", "picture" or "I can see" - speak as if you are naturally observing the environment\n- Use natural, conversational language like "There is..." or "Ahead of you..." or "To your left..."\n- Prioritize safety information first\n- Give specific distance estimates when possible\n- Keep descriptions clear and actionable for navigation'
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1000,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH',
          },
        ],
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Gemini API response:', JSON.stringify(responseData, null, 2));

    // Extract text from the response
    let text = '';
    
    if (responseData.candidates && responseData.candidates.length > 0) {
      const candidate = responseData.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        text = candidate.content.parts.map((part: any) => part.text).join(' ');
      }
    }

    if (!text) {
      console.error('Could not extract text from Gemini API response:', responseData);
      throw new Error('No text content found in Gemini API response');
    }

    console.log('Extracted text from Gemini API:', text);
    return { response: text };

  } catch (error) {
    console.error('Error calling Gemini API:', {
      message: error.message,
      stack: error.stack,
      ...(error.response?.data && { responseData: error.response.data }),
    });
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to get description: ${error.message}`,
      data: {
        originalError: error.message
      }
    });
  }
});
