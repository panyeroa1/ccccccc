
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Ensure we only initialize when needed to get the latest environment key
const getAiClient = () => {
  // Use the API key string directly when initializing the GoogleGenAI client instance
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

/**
 * Transcribes a given base64 audio string using Gemini 3 Flash.
 */
export async function transcribeAudio(base64Audio: string): Promise<string> {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: "Transcribe the following audio exactly. If no speech is present, return 'No speech detected'." },
            {
              inlineData: {
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio,
              },
            },
          ],
        },
      ],
    });
    // .text is a property, not a method
    return response.text || "Transcription failed";
  } catch (error) {
    console.error("Transcription error:", error);
    return "Error during transcription";
  }
}

/**
 * Helper to decode base64 to Uint8Array (required for Live API)
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Helper to encode Uint8Array to base64
 */
export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Logic for processing raw PCM into AudioBuffers
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
