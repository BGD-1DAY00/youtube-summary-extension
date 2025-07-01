console.log('[CRXJS] YouTube metadata button overlay script loaded!');

// Get video ID from current YouTube page
function getVideoId(): string | null {
  // TODO: Implement video ID extraction logic
  return null;
}

// Check authentication and show appropriate content
function checkAuthAndShowContent() {
  const panel = document.getElementById('youtube-ai-panel');
  if (!panel) return;
  
  const loadingState = panel.querySelector('#loading-state') as HTMLElement;
  const authRequired = panel.querySelector('#auth-required') as HTMLElement;
  const mainContent = panel.querySelector('#main-content') as HTMLElement;
  
  // Show loading state
  loadingState.style.display = 'block';
  authRequired.style.display = 'none';
  mainContent.style.display = 'none';
  
  // Check for stored API key
  chrome.storage.local.get(['youtube-ai-api-key'], (result) => {
    setTimeout(() => {
      loadingState.style.display = 'none';
      
      if (result['youtube-ai-api-key']) {
        // API key exists, show main content
        mainContent.style.display = 'block';
        console.log('User authenticated');
      } else {
        // No API key, show auth required
        authRequired.style.display = 'block';
        console.log('Authentication required');
      }
    }, 800);
  });
}

// Clean up any existing overlays
function cleanupExistingOverlays() {
  const existingOverlays = document.querySelectorAll('.metadata-button, .grid-metadata-button');
  existingOverlays.forEach(overlay => overlay.remove());
  console.log(`Cleaned up ${existingOverlays.length} existing overlays`);
}

// Button click handler
function handleButtonClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  console.log('Hello from metadata button!');
  
  const body = document.body;
  let panel = document.getElementById('youtube-ai-panel');
  
  if (!panel) {
    // Create panel if it doesn't exist
    panel = document.createElement('div');
    panel.id = 'youtube-ai-panel';
    panel.className = 'youtube-ai-panel';
    panel.innerHTML = `
      <div class="panel-header"> 
        <h2>🎬 YouTube AI Summarizer</h2>
        <button class="close-button" id="close-panel">×</button>
      </div>
      <div class="panel-content" id="panel-content">
        <div class="loading-state" id="loading-state" style="display: none;">
          <div class="spinner"></div>
          <p>Checking authentication...</p>
        </div>
        <div class="auth-required" id="auth-required" style="display: none;">
          <div class="auth-icon">🔐</div>
          <h3>API Key Required</h3>
          <p>Please enter your API key to continue:</p>
          <input type="password" id="api-key-input" placeholder="sk-..." />
          <button id="save-api-key" class="primary-button">Save API Key</button>
        </div>
        <div class="main-content" id="main-content" style="display: none;">
          <div class="video-info">
            <div class="video-icon">📹</div>
            <p>Ready to analyze video</p>
          </div>
          <button id="analyze-video" class="primary-button">Analyze Video</button>
        </div>
      </div>
    `;
    
    // Add panel styles
    panel.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      right: -420px !important;
      width: 420px !important;
      height: 100vh !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-left: 3px solid #4facfe !important;
      box-shadow: -5px 0 25px rgba(0,0,0,0.2) !important;
      z-index: 10000 !important;
      transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      color: white !important;
      overflow: hidden !important;
    `;
    
    // Add enhanced styles for panel elements
    const style = document.createElement('style');
    style.textContent = `
      .youtube-ai-panel .panel-header {
        background: rgba(255,255,255,0.1) !important;
        backdrop-filter: blur(10px) !important;
        padding: 20px !important;
        border-bottom: 1px solid rgba(255,255,255,0.2) !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }
      
      .youtube-ai-panel .panel-header h2 {
        margin: 0 !important;
        font-size: 18px !important;
        font-weight: 600 !important;
        color: white !important;
      }
      
      .youtube-ai-panel .close-button {
        background: rgba(255,255,255,0.2) !important;
        border: none !important;
        color: white !important;
        width: 32px !important;
        height: 32px !important;
        border-radius: 50% !important;
        cursor: pointer !important;
        font-size: 18px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: background 0.2s ease !important;
      }
      
      .youtube-ai-panel .close-button:hover {
        background: rgba(255,255,255,0.3) !important;
      }
      
      .youtube-ai-panel .panel-content {
        padding: 30px 20px !important;
        height: calc(100vh - 80px) !important;
        overflow-y: auto !important;
      }
      
      .youtube-ai-panel .loading-state,
      .youtube-ai-panel .auth-required,
      .youtube-ai-panel .main-content {
        text-align: center !important;
      }
      
      .youtube-ai-panel .spinner {
        width: 40px !important;
        height: 40px !important;
        border: 3px solid rgba(255,255,255,0.3) !important;
        border-top: 3px solid white !important;
        border-radius: 50% !important;
        animation: spin 1s linear infinite !important;
        margin: 0 auto 20px auto !important;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .youtube-ai-panel .auth-icon,
      .youtube-ai-panel .video-icon {
        font-size: 48px !important;
        margin-bottom: 16px !important;
      }
      
      .youtube-ai-panel h3 {
        margin: 0 0 12px 0 !important;
        font-size: 20px !important;
        font-weight: 600 !important;
        color: white !important;
      }
      
      .youtube-ai-panel p {
        margin: 0 0 20px 0 !important;
        color: rgba(255,255,255,0.9) !important;
        line-height: 1.5 !important;
      }
      
      .youtube-ai-panel input {
        width: 100% !important;
        padding: 12px 16px !important;
        border: 2px solid rgba(255,255,255,0.3) !important;
        border-radius: 8px !important;
        background: rgba(255,255,255,0.1) !important;
        color: white !important;
        font-size: 14px !important;
        margin-bottom: 16px !important;
        box-sizing: border-box !important;
        transition: border-color 0.2s ease !important;
      }
      
      .youtube-ai-panel input::placeholder {
        color: rgba(255,255,255,0.6) !important;
      }
      
      .youtube-ai-panel input:focus {
        outline: none !important;
        border-color: #4facfe !important;
      }
      
      .youtube-ai-panel .primary-button {
        width: 100% !important;
        padding: 12px 20px !important;
        background: linear-gradient(45deg, #4facfe 0%, #00f2fe 100%) !important;
        border: none !important;
        border-radius: 8px !important;
        color: white !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        cursor: pointer !important;
        transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3) !important;
      }
      
      .youtube-ai-panel .primary-button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4) !important;
      }
      
      .youtube-ai-panel .video-info {
        background: rgba(255,255,255,0.1) !important;
        border-radius: 12px !important;
        padding: 24px !important;
        margin-bottom: 24px !important;
        backdrop-filter: blur(10px) !important;
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(panel);
    
    // Add close button handler
    const closeButton = panel.querySelector('#close-panel') as HTMLButtonElement;
    closeButton?.addEventListener('click', () => {
      panel!.style.right = '-420px';
    });
    
    // Add save button handler
    const saveButton = panel.querySelector('#save-api-key') as HTMLButtonElement;
    saveButton?.addEventListener('click', () => {
      const input = panel!.querySelector('#api-key-input') as HTMLInputElement;
      const apiKey = input.value.trim();
      if (apiKey) {
        chrome.storage.local.set({ 'youtube-ai-api-key': apiKey }, () => {
          console.log('API key saved!');
          input.value = '';
          checkAuthAndShowContent();
        });
      }
    });
    
    // Add analyze video button handler
    const analyzeButton = panel.querySelector('#analyze-video') as HTMLButtonElement;
    analyzeButton?.addEventListener('click', () => {
      const videoId = getVideoId();
      console.log('Analyzing video:', videoId);
    });
  }
  
  // Check authentication and show appropriate content
  checkAuthAndShowContent();
  
  // Toggle panel visibility
  const isOpen = panel.style.right === '0px';
  panel.style.right = isOpen ? '-420px' : '0px';
}

// Create and style a button
function createButton(className: string): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = 'AI';
  button.className = className;
  button.type = 'button';
  button.addEventListener('click', handleButtonClick);
  
  button.style.cssText = `
    position: absolute !important;
    bottom: 0 !important;
    right: 0 !important;
    background: rgba(0, 123, 255, 0.9) !important;
    color: white !important;
    padding: 6px 12px !important;
    border-radius: 16px !important;
    font-weight: bold !important;
    font-size: 12px !important;
    z-index: 1001 !important;
    pointer-events: auto !important;
    font-family: Roboto, Arial, sans-serif !important;
    line-height: 1 !important;
    margin: 0 !important;
    border: none !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    cursor: pointer !important;
    transition: background-color 0.2s ease !important;
    min-width: 40px !important;
  `;
  
  // Add hover effects
  button.addEventListener('mouseenter', () => {
    button.style.background = 'rgba(0, 123, 255, 1) !important';
  });
  button.addEventListener('mouseleave', () => {
    button.style.background = 'rgba(0, 123, 255, 0.9) !important';
  });
  
  return button;
}

// Add button to a metadata container
function addButtonToContainer(container: Element, buttonClass: string): boolean {
  if (container.querySelector(`.${buttonClass}`)) {
    return false; // Already has button
  }
  
  // Find the outermost ytd-rich-grid-media container for consistent positioning
  const richGridContainer = container.closest('ytd-rich-grid-media');
  if (!richGridContainer) return false;
  
  // Check if we already added a button to this rich grid container
  if (richGridContainer.querySelector(`.${buttonClass}`)) {
    return false;
  }
  
  const button = createButton(buttonClass);
  (richGridContainer as HTMLElement).style.position = 'relative';
  richGridContainer.appendChild(button);
  return true;
}

// Find and add buttons to metadata blocks
function addMetadataButtons() {
  const selectors = [
    'ytd-video-meta-block.grid #metadata', // Primary approach
    'ytd-rich-grid-media ytd-video-meta-block #metadata' // Fallback approach
  ];
  
  let buttonsAdded = 0;
  
  selectors.forEach(selector => {
    const containers = document.querySelectorAll(selector);
    containers.forEach(container => {
      if (addButtonToContainer(container, 'metadata-button')) {
        buttonsAdded++;
      }
    });
  });
  
  console.log(`Added ${buttonsAdded} metadata buttons`);
}

// Main refresh function
function refreshMetadataButtons() {
  cleanupExistingOverlays();
  setTimeout(addMetadataButtons, 100);
}

// Initial run
refreshMetadataButtons();

// Debounced observer for new content
let observerTimeout: NodeJS.Timeout;
const observer = new MutationObserver(() => {
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(addMetadataButtons, 300);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Handle YouTube navigation
let currentUrl = location.href;
setInterval(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    setTimeout(refreshMetadataButtons, 1500);
  }
}, 1000);

// Manual functions for testing
(window as any).cleanupOverlays = cleanupExistingOverlays;
(window as any).refreshMetadataButtons = refreshMetadataButtons;

console.log('Metadata button overlay script ready!');
