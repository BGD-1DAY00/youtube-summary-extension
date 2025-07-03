import { Conversation, ConversationMessage, ConversationStorage } from '../types/conversation';

const STORAGE_KEYS = {
  CONVERSATIONS: 'youtube-ai-conversations',
  ACTIVE_CONVERSATION: 'youtube-ai-active-conversation-id'
} as const;

export class ConversationStorageManager {
  static async getAll(): Promise<ConversationStorage> {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEYS.CONVERSATIONS, STORAGE_KEYS.ACTIVE_CONVERSATION], (result) => {
        const conversations = result[STORAGE_KEYS.CONVERSATIONS] || {};
        const activeConversationId = result[STORAGE_KEYS.ACTIVE_CONVERSATION];
        
        resolve({
          conversations,
          activeConversationId
        });
      });
    });
  }

  static async saveConversation(conversation: Conversation): Promise<void> {
    const storage = await this.getAll();
    storage.conversations[conversation.id] = conversation;
    
    return new Promise((resolve) => {
      chrome.storage.local.set({
        [STORAGE_KEYS.CONVERSATIONS]: storage.conversations
      }, () => {
        resolve();
      });
    });
  }

  static async getConversation(id: string): Promise<Conversation | null> {
    const storage = await this.getAll();
    return storage.conversations[id] || null;
  }

  static async deleteConversation(id: string): Promise<void> {
    const storage = await this.getAll();
    delete storage.conversations[id];
    
    const updates: Record<string, any> = {
      [STORAGE_KEYS.CONVERSATIONS]: storage.conversations
    };

    if (storage.activeConversationId === id) {
      updates[STORAGE_KEYS.ACTIVE_CONVERSATION] = null;
    }

    return new Promise((resolve) => {
      chrome.storage.local.set(updates, () => {
        resolve();
      });
    });
  }

  static async setActiveConversation(id: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({
        [STORAGE_KEYS.ACTIVE_CONVERSATION]: id
      }, () => {
        resolve();
      });
    });
  }

  static async getActiveConversation(): Promise<Conversation | null> {
    const storage = await this.getAll();
    if (!storage.activeConversationId) return null;
    return storage.conversations[storage.activeConversationId] || null;
  }

  static async addMessage(conversationId: string, message: ConversationMessage): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation with id ${conversationId} not found`);
    }

    conversation.messages.push(message);
    conversation.updatedAt = Date.now();
    
    await this.saveConversation(conversation);
  }

  static async createConversation(title: string, initialMessage?: ConversationMessage): Promise<Conversation> {
    const now = Date.now();
    const conversation: Conversation = {
      id: `conv_${now}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      messages: initialMessage ? [initialMessage] : [],
      createdAt: now,
      updatedAt: now
    };

    await this.saveConversation(conversation);
    return conversation;
  }

  static async updateConversationTitle(id: string, title: string): Promise<void> {
    const conversation = await this.getConversation(id);
    if (!conversation) {
      throw new Error(`Conversation with id ${id} not found`);
    }

    conversation.title = title;
    conversation.updatedAt = Date.now();
    
    await this.saveConversation(conversation);
  }

  static async clearAllConversations(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove([STORAGE_KEYS.CONVERSATIONS, STORAGE_KEYS.ACTIVE_CONVERSATION], () => {
        resolve();
      });
    });
  }

  static async getConversationList(): Promise<Conversation[]> {
    const storage = await this.getAll();
    return Object.values(storage.conversations).sort((a, b) => b.updatedAt - a.updatedAt);
  }
}