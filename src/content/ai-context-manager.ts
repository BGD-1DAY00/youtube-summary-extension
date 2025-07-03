interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  videoId?: string;
  videoTitle?: string;
  videoTranscript?: string;
}

interface ConversationContext {
  id: string;
  videoId: string;
  videoTitle?: string;
  videoTranscript?: string;
  messages: ConversationMessage[];
  createdAt: number;
  lastUpdated: number;
}

interface AIProviderConfig {
  provider: 'openai' | 'claude' | 'gemini';
  apiKey: string;
  model?: string;
}

class AIContextManager {
  private currentContext: ConversationContext | null = null;
  private readonly STORAGE_KEY = 'youtube-ai-conversations';
  private readonly MAX_CONTEXT_LENGTH = 10; // Maximum number of messages to keep in context
  
  async initializeConversation(videoId: string, videoTitle?: string, videoTranscript?: string): Promise<ConversationContext> {
    const contextId = `${videoId}_${Date.now()}`;
    
    this.currentContext = {
      id: contextId,
      videoId,
      videoTitle,
      videoTranscript,
      messages: [],
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };
    
    // Add system message with video context
    if (videoTitle || videoTranscript) {
      const systemContent = this.buildSystemMessage(videoTitle, videoTranscript);
      this.addMessage('system', systemContent);
    }
    
    await this.saveConversation();
    return this.currentContext;
  }
  
  private buildSystemMessage(videoTitle?: string, videoTranscript?: string): string {
    let content = 'You are an AI assistant helping users analyze YouTube videos. ';
    
    if (videoTitle) {
      content += `The current video is titled: "${videoTitle}". `;
    }
    
    if (videoTranscript) {
      content += `Here is the video transcript:\n\n${videoTranscript}\n\n`;
    }
    
    content += 'Please provide helpful analysis and answers based on the video content.';
    return content;
  }
  
  async loadConversation(videoId: string): Promise<ConversationContext | null> {
    const conversations = await this.getAllConversations();
    const conversation = conversations.find(c => c.videoId === videoId);
    
    if (conversation) {
      this.currentContext = conversation;
      return conversation;
    }
    
    return null;
  }
  
  addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
    if (!this.currentContext) {
      throw new Error('No active conversation context');
    }
    
    const message: ConversationMessage = {
      role,
      content,
      timestamp: Date.now(),
      videoId: this.currentContext.videoId,
      videoTitle: this.currentContext.videoTitle,
      videoTranscript: this.currentContext.videoTranscript
    };
    
    this.currentContext.messages.push(message);
    this.currentContext.lastUpdated = Date.now();
    
    // Trim context if too long, but keep system message
    if (this.currentContext.messages.length > this.MAX_CONTEXT_LENGTH) {
      const systemMessages = this.currentContext.messages.filter(m => m.role === 'system');
      const otherMessages = this.currentContext.messages.filter(m => m.role !== 'system');
      
      // Keep system messages + last MAX_CONTEXT_LENGTH-1 other messages
      const trimmedOtherMessages = otherMessages.slice(-(this.MAX_CONTEXT_LENGTH - systemMessages.length));
      this.currentContext.messages = [...systemMessages, ...trimmedOtherMessages];
    }
    
    this.saveConversation();
  }
  
  getContextMessages(): ConversationMessage[] {
    return this.currentContext?.messages || [];
  }
  
  getCurrentContext(): ConversationContext | null {
    return this.currentContext;
  }
  
  private async saveConversation(): Promise<void> {
    if (!this.currentContext) return;
    
    const conversations = await this.getAllConversations();
    const existingIndex = conversations.findIndex(c => c.id === this.currentContext!.id);
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = this.currentContext;
    } else {
      conversations.push(this.currentContext);
    }
    
    // Keep only last 50 conversations
    const trimmedConversations = conversations
      .sort((a, b) => b.lastUpdated - a.lastUpdated)
      .slice(0, 50);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: trimmedConversations }, () => {
        resolve();
      });
    });
  }
  
  private async getAllConversations(): Promise<ConversationContext[]> {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.STORAGE_KEY], (result) => {
        resolve(result[this.STORAGE_KEY] || []);
      });
    });
  }
  
  async makeAIRequest(userMessage: string, config: AIProviderConfig): Promise<string> {
    if (!this.currentContext) {
      throw new Error('No active conversation context');
    }
    
    // Add user message to context
    this.addMessage('user', userMessage);
    
    // Prepare messages for API request
    const messages = this.getContextMessages().map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    try {
      let response: string;
      
      switch (config.provider) {
        case 'openai':
          response = await this.makeOpenAIRequest(messages, config);
          break;
        case 'claude':
          response = await this.makeClaudeRequest(messages, config);
          break;
        case 'gemini':
          response = await this.makeGeminiRequest(messages, config);
          break;
        default:
          throw new Error(`Unsupported provider: ${config.provider}`);
      }
      
      // Add assistant response to context
      this.addMessage('assistant', response);
      
      return response;
    } catch (error) {
      console.error('AI request failed:', error);
      throw error;
    }
  }
  
  private async makeOpenAIRequest(messages: any[], config: AIProviderConfig): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }
  
  private async makeClaudeRequest(messages: any[], config: AIProviderConfig): Promise<string> {
    // Convert messages to Claude format
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        system: systemMessage?.content,
        messages: conversationMessages
      })
    });
    
    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.content[0]?.text || 'No response received';
  }
  
  private async makeGeminiRequest(messages: any[], config: AIProviderConfig): Promise<string> {
    // Convert messages to Gemini format
    const contents = messages.filter(m => m.role !== 'system').map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const systemInstruction = messages.find(m => m.role === 'system');
    
    const requestBody: any = {
      contents: contents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    };
    
    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction.content }]
      };
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-pro'}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || 'No response received';
  }
  
  clearCurrentContext(): void {
    this.currentContext = null;
  }
  
  async deleteConversation(conversationId: string): Promise<void> {
    const conversations = await this.getAllConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.STORAGE_KEY]: filtered }, () => {
        if (this.currentContext?.id === conversationId) {
          this.currentContext = null;
        }
        resolve();
      });
    });
  }
}

export { AIContextManager, ConversationContext, ConversationMessage, AIProviderConfig };