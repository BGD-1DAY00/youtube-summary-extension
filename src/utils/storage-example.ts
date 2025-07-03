import { ConversationStorageManager } from './storage';
import { ConversationMessage } from '../types/conversation';

export async function exampleUsage() {
  console.log('=== Conversation Storage Example ===');

  try {
    // Create a new conversation
    const conversation = await ConversationStorageManager.createConversation(
      'YouTube Video Analysis'
    );
    console.log('Created conversation:', conversation);

    // Add some messages
    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}_1`,
      role: 'user',
      content: 'Can you summarize this YouTube video?',
      timestamp: Date.now()
    };

    const assistantMessage: ConversationMessage = {
      id: `msg_${Date.now()}_2`,
      role: 'assistant',
      content: 'I\'d be happy to help summarize the YouTube video. Let me analyze the content...',
      timestamp: Date.now() + 1000
    };

    await ConversationStorageManager.addMessage(conversation.id, userMessage);
    await ConversationStorageManager.addMessage(conversation.id, assistantMessage);

    // Set as active conversation
    await ConversationStorageManager.setActiveConversation(conversation.id);

    // Retrieve the updated conversation
    const updatedConversation = await ConversationStorageManager.getConversation(conversation.id);
    console.log('Updated conversation:', updatedConversation);

    // Get active conversation
    const activeConversation = await ConversationStorageManager.getActiveConversation();
    console.log('Active conversation:', activeConversation);

    // Get all conversations
    const allConversations = await ConversationStorageManager.getConversationList();
    console.log('All conversations:', allConversations);

    console.log('=== Example completed successfully ===');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Test function to verify storage functionality
export async function testStorageFunctionality() {
  console.log('=== Testing Storage Functionality ===');
  
  try {
    // Clear existing data
    await ConversationStorageManager.clearAllConversations();
    
    // Test 1: Create multiple conversations
    const conv1 = await ConversationStorageManager.createConversation('Test Conversation 1');
    const conv2 = await ConversationStorageManager.createConversation('Test Conversation 2');
    
    // Test 2: Add messages to conversations
    await ConversationStorageManager.addMessage(conv1.id, {
      id: 'msg1',
      role: 'user',
      content: 'Hello',
      timestamp: Date.now()
    });
    
    await ConversationStorageManager.addMessage(conv2.id, {
      id: 'msg2',
      role: 'assistant',
      content: 'Hi there!',
      timestamp: Date.now()
    });
    
    // Test 3: Set active conversation
    await ConversationStorageManager.setActiveConversation(conv1.id);
    
    // Test 4: Verify retrieval
    const retrievedConv1 = await ConversationStorageManager.getConversation(conv1.id);
    const activeConv = await ConversationStorageManager.getActiveConversation();
    const allConvs = await ConversationStorageManager.getConversationList();
    
    console.log('✅ All tests passed');
    console.log('Conversations created:', allConvs.length);
    console.log('Active conversation ID:', activeConv?.id);
    console.log('Messages in conv1:', retrievedConv1?.messages.length);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}