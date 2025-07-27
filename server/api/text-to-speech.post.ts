import axios from 'axios';
import config from '../config';

export default defineEventHandler(async (event) => {
  const { text } = await readBody(event);
  const murfApiKey = config.murf.apiKey;

  if (!text) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Text is required for text-to-speech conversion',
    });
  }
  if (!murfApiKey) {
    console.error('Murf API key is not configured. Please check your .env file');
    throw createError({
      statusCode: 500,
      statusMessage: 'Murf API key is not configured. Please check your server configuration.',
    });
  }

  try {
    console.log('Sending text to Murf API for TTS conversion');
    
    // First, check if the API key is valid
    if (!murfApiKey) {
      throw new Error('Murf API key is not properly configured. Please set the MURF_API_KEY environment variable.');
    }

    // Call the Murf API to generate speech using the correct format
    console.log('Calling Murf API with correct format...');
    const murfResponse = await axios.post(
      'https://api.murf.ai/v1/speech/generate',
      {
        text: text,
        voiceId: 'en-US-natalie', // Correct format: voiceId (not voice_id)
        format: 'mp3',
        sampleRate: 24000 // Correct format: sampleRate (not sample_rate)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'api-key': murfApiKey, // Correct header: api-key (not Authorization or X-API-KEY)
        },
        timeout: 30000,
      }
    );

    console.log('Received response from Murf API:', {
      status: murfResponse.status,
      headers: murfResponse.headers,
      dataKeys: Object.keys(murfResponse.data || {})
    });

    // Check if we got a valid response
    if (!murfResponse.data) {
      throw new Error('Empty response from Murf API');
    }

    // Log the full response for debugging
    console.log('Full Murf API response:', JSON.stringify(murfResponse.data, null, 2));
    
    // Extract the audio URL from the Murf API response
    // Based on the test, Murf returns the URL in the 'audioFile' field
    let audioUrl = null;
    
    if (murfResponse.data.audioFile) {
      audioUrl = murfResponse.data.audioFile;
    }
    // Fallback checks for other possible formats
    else if (murfResponse.data.url) {
      audioUrl = murfResponse.data.url;
    }
    else if (murfResponse.data.audioUrl) {
      audioUrl = murfResponse.data.audioUrl;
    }
    else if (murfResponse.data.audio_url) {
      audioUrl = murfResponse.data.audio_url;
    }

    if (!audioUrl) {
      console.error('Murf API response did not contain an audio URL. Available keys:', 
        Object.keys(murfResponse.data).join(', '));
      console.error('Full response structure:', JSON.stringify(murfResponse.data, null, 2));
      throw new Error('Audio URL not found in Murf API response. Please check the API documentation for the correct response format.');
    }

    console.log('Successfully generated audio URL:', audioUrl);
    
    // Return the response with additional metadata from Murf
    return { 
      audioUrl,
      audioLengthInSeconds: murfResponse.data.audioLengthInSeconds,
      consumedCharacterCount: murfResponse.data.consumedCharacterCount,
      remainingCharacterCount: murfResponse.data.remainingCharacterCount,
      warning: murfResponse.data.warning
    };

  } catch (err) {
    const error = err as Error & { response?: any };
    const errorInfo: Record<string, any> = {
      message: error.message,
      stack: error.stack
    };

    if (error.response) {
      errorInfo.status = error.response.status;
      errorInfo.statusText = error.response.statusText;
      errorInfo.data = error.response.data;
      errorInfo.headers = error.response.headers;
      
      // Log specific error details for debugging
      console.error('Murf API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.config?.url,
        method: error.response.config?.method,
        headers: error.response.config?.headers
      });
    }

    console.error('Error in text-to-speech conversion:', errorInfo);

    // Check if it's an authentication error
    if (error.response?.status === 401 || error.response?.status === 403) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid Murf API key. Please check your API key configuration.',
      });
    }

    // Check if it's a rate limit error
    if (error.response?.status === 429) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Murf API rate limit exceeded. Please try again later.',
      });
    }

    // For development/testing, return a fallback but also throw the error details
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: providing fallback audio and error details');
      return {
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
        _error: error.message,
        _debug: errorInfo,
        _warning: 'Using fallback audio due to Murf API error in development mode'
      };
    }

    // In production, throw the actual error
    throw createError({
      statusCode: 500,
      statusMessage: `Text-to-speech conversion failed: ${error.message}`,
    });
  }
});
