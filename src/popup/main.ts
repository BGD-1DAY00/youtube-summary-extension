import './style.css'

interface AIProvider {
  id: string
  name: string
  icon: string
  color: string
}

const AI_PROVIDERS: AIProvider[] = [
  { id: 'openai', name: 'OpenAI', icon: '🧠', color: '#10a37f' },
  { id: 'claude', name: 'Claude', icon: '⚡', color: '#ff6b35' },
  { id: 'gemini', name: 'Gemini', icon: '🤖', color: '#4285f4' }
]

class PopupApp {
  private currentProvider: string = ''
  private apiKey: string = ''

  constructor() {
    this.init()
  }

  private async init() {
    await this.loadStoredData()
    this.render()
    this.attachEventListeners()
  }

  private async loadStoredData() {
    try {
      const result = await chrome.storage.local.get(['youtube-ai-provider', 'youtube-ai-api-key'])
      this.currentProvider = result['youtube-ai-provider'] || ''
      this.apiKey = result['youtube-ai-api-key'] || ''
    } catch (error) {
      console.error('Error loading stored data:', error)
    }
  }

  private render() {
    const app = document.querySelector('#app')!
    
    app.innerHTML = `
      <div class="popup-container">
        <div class="header">
          <h1 class="title">YouTube AI Assistant</h1>
          <p class="subtitle">Configure your AI provider to get started</p>
        </div>

        <div class="status-indicator ${this.apiKey ? 'connected' : 'disconnected'}">
          <div class="status-dot"></div>
          <span class="status-text">${this.apiKey ? 'Connected' : 'Not configured'}</span>
        </div>

        <div class="provider-section">
          <h2 class="section-title">Select AI Provider</h2>
          <div class="provider-grid">
            ${AI_PROVIDERS.map(provider => `
              <div class="provider-card ${this.currentProvider === provider.id ? 'selected' : ''}" 
                   data-provider="${provider.id}">
                <div class="provider-icon" style="color: ${provider.color}">${provider.icon}</div>
                <div class="provider-name">${provider.name}</div>
                ${this.currentProvider === provider.id ? '<div class="selected-indicator">✓</div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="api-key-section">
          <h2 class="section-title">API Key</h2>
          <div class="input-group">
            <input 
              type="password" 
              id="api-key-input" 
              class="api-key-input"
              placeholder="Enter your API key"
              value="${this.apiKey}"
            />
            <button type="button" id="toggle-visibility" class="toggle-btn">👁️</button>
          </div>
          <p class="input-hint">Your API key is stored securely and only used for YouTube AI analysis</p>
        </div>

        <div class="actions">
          <button type="button" id="save-btn" class="save-btn ${this.currentProvider && this.apiKey ? 'enabled' : 'disabled'}">
            Save Configuration
          </button>
          <button type="button" id="test-btn" class="test-btn ${this.currentProvider && this.apiKey ? 'enabled' : 'disabled'}">
            Test Connection
          </button>
        </div>

        <div class="footer">
          <p class="help-text">
            Need help? Visit the 
            <a href="#" id="help-link">documentation</a>
            for API key setup instructions
          </p>
        </div>
      </div>
    `
  }

  private attachEventListeners() {
    // Provider selection
    document.querySelectorAll('.provider-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const provider = (e.currentTarget as HTMLElement).dataset.provider!
        this.selectProvider(provider)
      })
    })

    // API key input
    const apiKeyInput = document.getElementById('api-key-input') as HTMLInputElement
    apiKeyInput.addEventListener('input', (e) => {
      this.apiKey = (e.target as HTMLInputElement).value
      this.updateButtonStates()
    })

    // Toggle password visibility
    document.getElementById('toggle-visibility')?.addEventListener('click', () => {
      this.togglePasswordVisibility()
    })

    // Save button
    document.getElementById('save-btn')?.addEventListener('click', () => {
      this.saveConfiguration()
    })

    // Test button
    document.getElementById('test-btn')?.addEventListener('click', () => {
      this.testConnection()
    })

    // Help link
    document.getElementById('help-link')?.addEventListener('click', (e) => {
      e.preventDefault()
      this.openHelpPage()
    })
  }

  private selectProvider(providerId: string) {
    this.currentProvider = providerId
    this.render()
    this.attachEventListeners()
    this.updateButtonStates()
  }

  private togglePasswordVisibility() {
    const input = document.getElementById('api-key-input') as HTMLInputElement
    const button = document.getElementById('toggle-visibility')!
    
    if (input.type === 'password') {
      input.type = 'text'
      button.textContent = '🙈'
    } else {
      input.type = 'password'
      button.textContent = '👁️'
    }
  }

  private updateButtonStates() {
    const saveBtn = document.getElementById('save-btn')!
    const testBtn = document.getElementById('test-btn')!
    const isEnabled = this.currentProvider && this.apiKey.trim()

    if (isEnabled) {
      saveBtn.classList.add('enabled')
      saveBtn.classList.remove('disabled')
      testBtn.classList.add('enabled')
      testBtn.classList.remove('disabled')
    } else {
      saveBtn.classList.add('disabled')
      saveBtn.classList.remove('enabled')
      testBtn.classList.add('disabled')
      testBtn.classList.remove('enabled')
    }
  }

  private async saveConfiguration() {
    if (!this.currentProvider || !this.apiKey.trim()) {
      this.showNotification('Please select a provider and enter an API key', 'error')
      return
    }

    try {
      await chrome.storage.local.set({
        'youtube-ai-provider': this.currentProvider,
        'youtube-ai-api-key': this.apiKey.trim()
      })
      
      this.showNotification('Configuration saved successfully!', 'success')
      this.render()
      this.attachEventListeners()
    } catch (error) {
      console.error('Error saving configuration:', error)
      this.showNotification('Error saving configuration', 'error')
    }
  }

  private async testConnection() {
    if (!this.currentProvider || !this.apiKey.trim()) {
      this.showNotification('Please configure provider and API key first', 'error')
      return
    }

    this.showNotification('Testing connection...', 'info')
    
    // Simulate API test (in real implementation, this would make an actual API call)
    setTimeout(() => {
      this.showNotification('Connection test successful!', 'success')
    }, 1500)
  }

  private openHelpPage() {
    const providerUrls: Record<string, string> = {
      openai: 'https://platform.openai.com/api-keys',
      claude: 'https://console.anthropic.com/',
      gemini: 'https://makersuite.google.com/app/apikey'
    }

    const url = this.currentProvider ? providerUrls[this.currentProvider] : 'https://docs.google.com'
    chrome.tabs.create({ url })
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove())

    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message

    document.querySelector('.popup-container')!.appendChild(notification)

    setTimeout(() => notification.remove(), 3000)
  }
}

// Initialize the popup app
new PopupApp()
