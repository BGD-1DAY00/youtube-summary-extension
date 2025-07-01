console.log('[CRXJS] YouTube metadata button overlay script loaded!');

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
        <h2>YouTube AI Summarizer</h2>
        <button class="close-button" id="close-panel">×</button>
      </div>
      <div class="panel-content">
        <p>Enter your API key:</p>
        <input type="text" id="api-key-input" placeholder="sk-..." />
        <button id="save-api-key">Save API Key</button>
      </div>
    `;
    
    // Add panel styles
    panel.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      right: -400px !important;
      width: 400px !important;
      height: 100vh !important;
      background: white !important;
      box-shadow: -2px 0 10px rgba(0,0,0,0.3) !important;
      z-index: 10000 !important;
      transition: right 0.3s ease !important;
      padding: 20px !important;
      box-sizing: border-box !important;
      font-family: Roboto, Arial, sans-serif !important;
    `;
    
    document.body.appendChild(panel);
    
    // Add close button handler
    const closeButton = panel.querySelector('#close-panel') as HTMLButtonElement;
    closeButton?.addEventListener('click', () => {
      panel!.style.right = '-400px';
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
          panel!.style.right = '-400px';
        });
      }
    });
  }
  
  // Toggle panel visibility
  const isOpen = panel.style.right === '0px';
  panel.style.right = isOpen ? '-400px' : '0px';
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
