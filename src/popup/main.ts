import './style.css'

class ExtensionHomePage {
  private apiStatusIndicator!: HTMLElement;
  private apiStatusText!: HTMLElement;
  private apiForm!: HTMLElement;
  private apiSuccess!: HTMLElement;
  private providerSelect!: HTMLSelectElement;
  private apiKeyInput!: HTMLInputElement;
  private saveButton!: HTMLElement;
  private changeButton!: HTMLElement;

  constructor() {
    this.initializeElements();
    this.setupEventListeners();
    this.checkAPIStatus();
  }

  private initializeElements() {
    this.apiStatusIndicator = document.getElementById('status-indicator')!;
    this.apiStatusText = document.getElementById('status-text')!;
    this.apiForm = document.getElementById('api-form')!;
    this.apiSuccess = document.getElementById('api-success')!;
    this.providerSelect = document.getElementById('provider-select') as HTMLSelectElement;
    this.apiKeyInput = document.getElementById('api-key-input') as HTMLInputElement;
    this.saveButton = document.getElementById('save-api-key')!;
    this.changeButton = document.getElementById('change-api-key')!;
  }

  private setupEventListeners() {
    this.saveButton.addEventListener('click', () => this.saveAPIKey());
    this.changeButton.addEventListener('click', () => this.showAPIForm());
    
    // Footer links
    document.getElementById('help-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showHelp();
    });
    
    document.getElementById('privacy-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showPrivacy();
    });
    
    document.getElementById('about-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.showAbout();
    });
  }

  private async checkAPIStatus() {
    try {
      const result = await chrome.storage.local.get(['youtube-ai-api-key', 'youtube-ai-provider']);
      
      if (result['youtube-ai-api-key'] && result['youtube-ai-provider']) {
        this.showAPISuccess(result['youtube-ai-provider']);
      } else {
        this.showAPIForm();
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      this.showError('Failed to check API status');
    }
  }

  private async saveAPIKey() {
    const provider = this.providerSelect.value;
    const apiKey = this.apiKeyInput.value.trim();

    if (!provider) {
      this.showError('Please select an AI provider');
      return;
    }

    if (!apiKey) {
      this.showError('Please enter your API key');
      return;
    }

    try {
      await chrome.storage.local.set({
        'youtube-ai-api-key': apiKey,
        'youtube-ai-provider': provider
      });

      this.showAPISuccess(provider);
      
      // Clear the form
      this.apiKeyInput.value = '';
      this.providerSelect.value = '';
      
    } catch (error) {
      console.error('Error saving API key:', error);
      this.showError('Failed to save API key');
    }
  }

  private showAPIForm() {
    this.apiForm.style.display = 'flex';
    this.apiSuccess.style.display = 'none';
    this.updateStatus('warning', 'API key not configured');
  }

  private showAPISuccess(provider: string) {
    this.apiForm.style.display = 'none';
    this.apiSuccess.style.display = 'block';
    
    const providerNames: Record<string, string> = {
      'openai': '🧠 OpenAI',
      'claude': '⚡ Claude',
      'gemini': '🤖 Gemini'
    };
    
    this.updateStatus('success', `Connected to ${providerNames[provider] || provider}`);
  }

  private showError(message: string) {
    this.updateStatus('error', message);
    
    // Clear error after 3 seconds
    setTimeout(() => {
      this.checkAPIStatus();
    }, 3000);
  }

  private updateStatus(type: 'success' | 'warning' | 'error', message: string) {
    this.apiStatusIndicator.className = `status-indicator ${type === 'success' ? 'connected' : type === 'error' ? 'error' : ''}`;
    this.apiStatusText.textContent = message;
  }

  private showHelp() {
    alert(`YouTube AI Summarizer Help

How to use:
1. Configure your API key in this popup
2. Visit any YouTube video page
3. Look for the blue "Sum" button on video thumbnails
4. Click the button to get an AI summary

Supported providers:
• OpenAI (GPT models)
• Claude (Anthropic)
• Gemini (Google)

For issues, check the console logs or reinstall the extension.`);
  }

  private showPrivacy() {
    alert(`Privacy Policy

• Your API keys are stored locally on your device
• No data is sent to our servers
• Video analysis is done directly with your chosen AI provider
• We don't collect or store your usage data
• All communication is between you and the AI provider

Your privacy is important to us.`);
  }

  private showAbout() {
    alert(`YouTube AI Summarizer v1.0.0

A Chrome extension that provides AI-powered summaries of YouTube videos.

Features:
• Quick video summaries
• Multiple AI provider support
• Clean, modern interface
• Privacy-focused design

Built with ❤️ for YouTube users who want to save time.`);
  }
}

// Initialize the extension home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ExtensionHomePage();
});

// Also initialize immediately in case DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ExtensionHomePage();
  });
} else {
  new ExtensionHomePage();
}
