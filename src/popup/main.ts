import './style.css'

// Load and display current API key status
function loadApiKeyStatus() {
  chrome.storage.local.get(['youtube-ai-api-key'], (result) => {
    const statusElement = document.getElementById('api-status');
    const keyInput = document.getElementById('api-key-input') as HTMLInputElement;
    
    if (result['youtube-ai-api-key']) {
      statusElement!.textContent = '✅ API Key configured';
      statusElement!.className = 'status-success';
      keyInput.placeholder = 'API key is already set (hidden for security)';
    } else {
      statusElement!.textContent = '❌ No API Key configured';
      statusElement!.className = 'status-error';
      keyInput.placeholder = 'Enter your Gemini API key here';
    }
  });
}

// Save API key
function saveApiKey() {
  const keyInput = document.getElementById('api-key-input') as HTMLInputElement;
  const apiKey = keyInput.value.trim();
  
  if (!apiKey) {
    alert('Please enter a valid API key');
    return;
  }
  
  chrome.storage.local.set({ 'youtube-ai-api-key': apiKey }, () => {
    alert('API key saved successfully!');
    keyInput.value = '';
    loadApiKeyStatus();
  });
}

// Clear API key
function clearApiKey() {
  if (confirm('Are you sure you want to remove the API key?')) {
    chrome.storage.local.remove(['youtube-ai-api-key'], () => {
      alert('API key removed successfully!');
      loadApiKeyStatus();
    });
  }
}

document.querySelector('#app')!.innerHTML = `
  <div class="popup-container">
    <div class="header">
      <h1>🎬 YouTube AI Summarizer</h1>
      <p>Configure your AI provider settings</p>
    </div>
    
    <div class="api-section">
      <h2>🤖 Gemini API Configuration</h2>
      <div id="api-status" class="status"></div>
      
      <div class="input-group">
        <label for="api-key-input">API Key:</label>
        <input type="password" id="api-key-input" placeholder="Enter your Gemini API key here">
      </div>
      
      <div class="button-group">
        <button id="save-key" class="primary-btn">Save Key</button>
        <button id="clear-key" class="secondary-btn">Clear Key</button>
      </div>
    </div>
    
    <div class="instructions">
      <h3>📝 How to get your Gemini API key:</h3>
      <ol>
        <li>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
        <li>Sign in with your Google account</li>
        <li>Click "Create API Key"</li>
        <li>Copy the generated key and paste it above</li>
      </ol>
    </div>
    
    <div class="footer">
      <p>Extension ready! Go to any YouTube video and click the "Sum" button.</p>
    </div>
  </div>
`

// Add event listeners
document.getElementById('save-key')!.addEventListener('click', saveApiKey);
document.getElementById('clear-key')!.addEventListener('click', clearApiKey);

// Load initial status
loadApiKeyStatus();
