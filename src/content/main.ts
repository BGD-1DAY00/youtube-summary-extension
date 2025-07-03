import { GeminiAPIService } from './gemini-api';

console.log('[CRXJS] YouTube metadata button overlay script loaded!');

// Get video ID from current YouTube page
function getVideoId(): string | null {
  // Check URL for video ID
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  if (videoId) return videoId;

  // Check if we're on a video page and extract from URL
  const match = window.location.href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

// Get video title from the page
function getVideoTitle(): string {
  const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string') || 
                      document.querySelector('h1.ytd-video-primary-info-renderer');
  return titleElement?.textContent?.trim() || 'Unknown Video';
}

// UI helper functions
function showAnalyzing() {
  const panel = document.getElementById('youtube-ai-panel');
  if (!panel) return;
  
  const mainContent = panel.querySelector('#main-content') as HTMLElement;
  if (!mainContent) return;
  
  mainContent.innerHTML = `
    <div class="analyzing-state">
      <div class="spinner"></div>
      <h3>Analyzing Video...</h3>
      <p>Please wait while we process the video with Gemini AI</p>
    </div>
  `;
}

function showError(message: string) {
  const panel = document.getElementById('youtube-ai-panel');
  if (!panel) return;
  
  const mainContent = panel.querySelector('#main-content') as HTMLElement;
  if (!mainContent) return;
  
  mainContent.innerHTML = `
    <div class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Analysis Failed</h3>
      <p>${message}</p>
      <button id="retry-analysis" class="primary-button">Try Again</button>
    </div>
  `;
  
  // Add retry handler
  const retryButton = mainContent.querySelector('#retry-analysis') as HTMLButtonElement;
  retryButton?.addEventListener('click', () => {
    // Reset to initial state
    mainContent.innerHTML = `
      <div class="video-info">
        <div class="video-icon">📹</div>
        <p>Ready to analyze video</p>
      </div>
      <button id="analyze-video" class="primary-button">Analyze Video</button>
    `;
    
    // Re-add the analyze button handler
    const analyzeButton = mainContent.querySelector('#analyze-video') as HTMLButtonElement;
    if (analyzeButton) {
      // Get the original click handler from the parent function
      analyzeButton.click();
    }
  });
}

function showAnalysisResult(analysis: { summary: string; keyPoints: string[]; error?: string }) {
  const panel = document.getElementById('youtube-ai-panel');
  if (!panel) return;
  
  const mainContent = panel.querySelector('#main-content') as HTMLElement;
  if (!mainContent) return;
  
  const keyPointsHtml = analysis.keyPoints.length > 0 
    ? analysis.keyPoints.map(point => `<li>${point}</li>`).join('')
    : '<li>No key points extracted</li>';
  
  mainContent.innerHTML = `
    <div class="analysis-result">
      <div class="result-icon">✨</div>
      <h3>Analysis Complete</h3>
      
      <div class="summary-section">
        <h4>Summary</h4>
        <p class="summary-text">${analysis.summary}</p>
      </div>
      
      <div class="keypoints-section">
        <h4>Key Points</h4>
        <ul class="keypoints-list">
          ${keyPointsHtml}
        </ul>
      </div>
      
      ${analysis.error ? `<div class="warning"><small>⚠️ ${analysis.error}</small></div>` : ''}
      
      <button id="analyze-again" class="primary-button">Analyze Another Video</button>
    </div>
  `;
  
  // Add analyze again handler
  const analyzeAgainButton = mainContent.querySelector('#analyze-again') as HTMLButtonElement;
  analyzeAgainButton?.addEventListener('click', () => {
    // Reset to initial state
    mainContent.innerHTML = `
      <div class="video-info">
        <div class="video-icon">📹</div>
        <p>Ready to analyze video</p>
      </div>
      <button id="analyze-video" class="primary-button">Analyze Video</button>
    `;
  });
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
          <div class="auth-icon">🔑</div>
          <h3>API Key Not Available</h3>
          <p>Sorry, the API key is not available. To use this extension, please follow these steps:</p>
          <div class="instructions">
            <ol>
              <li>Click on the <strong>Extensions</strong> tab in your browser</li>
              <li>Find and click on the <strong>YouTube AI Summarizer</strong> extension</li>
              <li>View the popup which will allow you to provide your API key</li>
            </ol>
            <div class="providers">
              <p><strong>Supported providers:</strong></p>
              <div class="provider-list">
                <span class="provider">🤖 Gemini</span>
                <span class="provider">🧠 OpenAI</span>
                <span class="provider">⚡ Claude</span>
              </div>
            </div>
          </div>
          <button id="refresh-auth" class="primary-button">Check Again</button>
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
      
      .youtube-ai-panel .instructions {
        text-align: left !important;
        background: rgba(255,255,255,0.05) !important;
        border-radius: 8px !important;
        padding: 20px !important;
        margin: 20px 0 !important;
      }
      
      .youtube-ai-panel .instructions ol {
        margin: 0 0 20px 0 !important;
        padding-left: 20px !important;
        color: rgba(255,255,255,0.9) !important;
      }
      
      .youtube-ai-panel .instructions li {
        margin-bottom: 8px !important;
        line-height: 1.4 !important;
      }
      
      .youtube-ai-panel .instructions strong {
        color: #4facfe !important;
      }
      
      .youtube-ai-panel .providers {
        border-top: 1px solid rgba(255,255,255,0.2) !important;
        padding-top: 16px !important;
        margin-top: 16px !important;
      }
      
      .youtube-ai-panel .providers p {
        margin: 0 0 12px 0 !important;
        font-weight: 600 !important;
        text-align: center !important;
      }
      
      .youtube-ai-panel .provider-list {
        display: flex !important;
        justify-content: space-around !important;
        gap: 8px !important;
      }
      
      .youtube-ai-panel .provider {
        background: rgba(255,255,255,0.1) !important;
        padding: 8px 12px !important;
        border-radius: 16px !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
      }
      
      .youtube-ai-panel .analyzing-state,
      .youtube-ai-panel .error-state,
      .youtube-ai-panel .analysis-result {
        text-align: center !important;
      }
      
      .youtube-ai-panel .error-icon,
      .youtube-ai-panel .result-icon {
        font-size: 48px !important;
        margin-bottom: 16px !important;
      }
      
      .youtube-ai-panel .summary-section,
      .youtube-ai-panel .keypoints-section {
        background: rgba(255,255,255,0.05) !important;
        border-radius: 8px !important;
        padding: 16px !important;
        margin: 16px 0 !important;
        text-align: left !important;
      }
      
      .youtube-ai-panel .summary-section h4,
      .youtube-ai-panel .keypoints-section h4 {
        margin: 0 0 12px 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #4facfe !important;
      }
      
      .youtube-ai-panel .summary-text {
        line-height: 1.6 !important;
        color: rgba(255,255,255,0.9) !important;
      }
      
      .youtube-ai-panel .keypoints-list {
        margin: 0 !important;
        padding-left: 20px !important;
        color: rgba(255,255,255,0.9) !important;
      }
      
      .youtube-ai-panel .keypoints-list li {
        margin-bottom: 8px !important;
        line-height: 1.4 !important;
      }
      
      .youtube-ai-panel .warning {
        background: rgba(255, 193, 7, 0.1) !important;
        border: 1px solid rgba(255, 193, 7, 0.3) !important;
        border-radius: 6px !important;
        padding: 8px 12px !important;
        margin: 12px 0 !important;
        color: #ffc107 !important;
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(panel);
    
    // Add close button handler
    const closeButton = panel.querySelector('#close-panel') as HTMLButtonElement;
    closeButton?.addEventListener('click', () => {
      panel!.style.right = '-420px';
    });
    
    // Add refresh auth button handler
    const refreshButton = panel.querySelector('#refresh-auth') as HTMLButtonElement;
    refreshButton?.addEventListener('click', () => {
      checkAuthAndShowContent();
    });
    
    // Add analyze video button handler
    const analyzeButton = panel.querySelector('#analyze-video') as HTMLButtonElement;
    analyzeButton?.addEventListener('click', async () => {
      const videoId = getVideoId();
      const videoTitle = getVideoTitle();
      console.log('Analyzing video:', videoId, videoTitle);
      
      if (!videoId) {
        showError('Could not extract video ID from the current page');
        return;
      }

      // Get API key from storage
      chrome.storage.local.get(['youtube-ai-api-key'], async (result) => {
        const apiKey = result['youtube-ai-api-key'];
        if (!apiKey) {
          showError('API key not found. Please configure your API key first.');
          return;
        }

        try {
          showAnalyzing();
          const geminiService = new GeminiAPIService(apiKey);
          
          // Get transcript (placeholder for now)
          const transcript = await geminiService.getVideoTranscript(videoId);
          
          // Analyze with Gemini
          const analysis = await geminiService.analyzeVideoTranscript(transcript, videoTitle);
          
          showAnalysisResult(analysis);
        } catch (error) {
          console.error('Analysis failed:', error);
          showError(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });
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
  button.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px; vertical-align: middle;">
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor"/>
    </svg>
    <span style="vertical-align: middle;">Sum</span>
  `;
  button.className = className;
  button.type = 'button';
  button.addEventListener('click', handleButtonClick);
  
  button.style.cssText = `
    position: absolute !important;
    bottom: 0 !important;
    right: 0 !important;
    background: rgba(0, 123, 255, 0.9) !important;
    color: white !important;
    padding: 8px 14px !important;
    border-radius: 18px !important;
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
    min-width: 60px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
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
let observerTimeout: number;
const observer = new MutationObserver(() => {
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(addMetadataButtons, 300) as unknown as number;
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
