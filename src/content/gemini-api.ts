interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface VideoAnalysisResult {
  summary: string;
  keyPoints: string[];
  error?: string;
}

export class GeminiAPIService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyzeVideoTranscript(transcript: string, videoTitle: string): Promise<VideoAnalysisResult> {
    try {
      const prompt = `
        Please analyze the following YouTube video transcript and provide:
        1. A concise summary (2-3 sentences)
        2. Key points or takeaways (3-5 bullet points)
        
        Video Title: ${videoTitle}
        
        Transcript: ${transcript}
        
        Please format your response as JSON with the following structure:
        {
          "summary": "Your summary here",
          "keyPoints": ["Point 1", "Point 2", "Point 3"]
        }
      `;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response from Gemini API');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      
      // Try to parse JSON response
      try {
        const parsedResponse = JSON.parse(responseText);
        return {
          summary: parsedResponse.summary || 'Summary not available',
          keyPoints: parsedResponse.keyPoints || []
        };
      } catch (parseError) {
        // If JSON parsing fails, return the raw response
        return {
          summary: responseText,
          keyPoints: [],
          error: 'Could not parse structured response'
        };
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return {
        summary: 'Error analyzing video',
        keyPoints: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getVideoTranscript(videoId: string): Promise<string> {
    // Note: This is a simplified approach. In a real implementation,
    // you might want to use YouTube's API or a transcript extraction service
    try {
      // For now, we'll return a placeholder since transcript extraction
      // requires additional setup with YouTube API or third-party services
      return `Transcript for video ${videoId} would be extracted here. This requires YouTube API access or a transcript extraction service.`;
    } catch (error) {
      console.error('Error getting video transcript:', error);
      throw new Error('Could not extract video transcript');
    }
  }
}