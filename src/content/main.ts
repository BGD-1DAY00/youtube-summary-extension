console.log('[CRXJS] YouTube metadata button overlay script loaded!');

// Clean up any existing overlays
function cleanupExistingOverlays() {
  const existingOverlays = document.querySelectorAll('.metadata-button, .grid-metadata-button');
  existingOverlays.forEach(overlay => overlay.remove());
  console.log(`Cleaned up ${existingOverlays.length} existing overlays`);
}

// Extract YouTube video ID from container
function extractYouTubeId(container: Element): string | null {
  // Method 1: Look for video links with /watch?v= pattern
  const videoLinks = container.querySelectorAll('a[href*="/watch?v="]');
  if (videoLinks.length > 0) {
    const href = videoLinks[0].getAttribute('href');
    if (href) {
      const match = href.match(/[?&]v=([^&]+)/);
      if (match) return match[1];
    }
  }
  
  // Method 2: Look for thumbnail images with /vi/ pattern
  const thumbnailImages = container.querySelectorAll('img[src*="/vi/"]');
  if (thumbnailImages.length > 0) {
    const src = thumbnailImages[0].getAttribute('src');
    if (src) {
      const match = src.match(/\/vi\/([^\/]+)/);
      if (match) return match[1];
    }
  }
  
  // Method 3: Look for any element with data-context-item-id (sometimes used by YouTube)
  const contextElements = container.querySelectorAll('[data-context-item-id]');
  if (contextElements.length > 0) {
    const contextId = contextElements[0].getAttribute('data-context-item-id');
    if (contextId) return contextId;
  }
  
  return null;
}

// Button click handler
function handleButtonClick(event: Event) {
  event.preventDefault();
  event.stopPropagation();
  
  // Find the video container and extract YouTube ID
  const button = event.target as HTMLButtonElement;
  const videoContainerSelectors = [
    'ytd-rich-grid-media',
    'ytd-video-renderer', 
    'ytd-compact-video-renderer',
    'ytd-grid-video-renderer',
    'ytd-playlist-video-renderer'
  ];
  
  let videoContainer: Element | null = null;
  for (const selector of videoContainerSelectors) {
    videoContainer = button.closest(selector);
    if (videoContainer) break;
  }
  
  if (videoContainer) {
    const youtubeId = extractYouTubeId(videoContainer);
    if (youtubeId) {
      console.log('🎥 YouTube Video ID:', youtubeId);
      console.log('🔗 Full YouTube URL:', `https://www.youtube.com/watch?v=${youtubeId}`);
    } else {
      console.log('❌ Could not extract YouTube ID from container');
      console.log('Container HTML:', videoContainer.outerHTML.substring(0, 500) + '...');
    }
  } else {
    console.log('❌ Could not find video container');
  }
  
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

// Add button to a video container
function addButtonToContainer(container: Element, buttonClass: string): boolean {
  if (container.querySelector(`.${buttonClass}`)) {
    return false; // Already has button
  }
  
  // Find the best video container for positioning
  const videoContainers = [
    'ytd-rich-grid-media',           // Grid view videos
    'ytd-video-renderer',            // List view videos  
    'ytd-compact-video-renderer',    // Sidebar videos
    'ytd-grid-video-renderer',       // Channel grid videos
    'ytd-playlist-video-renderer'    // Playlist videos
  ];
  
  let targetContainer: Element | null = null;
  
  for (const containerType of videoContainers) {
    targetContainer = container.closest(containerType);
    if (targetContainer) break;
  }
  
  if (!targetContainer) {
    console.log('❌ Could not find suitable video container for button placement');
    return false;
  }
  
  // Check if we already added a button to this container
  if (targetContainer.querySelector(`.${buttonClass}`)) {
    return false;
  }
  
  // Verify we can extract YouTube ID from this container before adding button
  const youtubeId = extractYouTubeId(targetContainer);
  if (!youtubeId) {
    console.log('⚠️ Skipping container - no YouTube ID found:', targetContainer.tagName);
    return false;
  }
  
  const button = createButton(buttonClass);
  const currentPos = window.getComputedStyle(targetContainer as Element).position;
  if (currentPos === 'static') {
    (targetContainer as HTMLElement).style.position = 'relative';
  }
  targetContainer.appendChild(button);
  console.log('✅ Added button with YouTube ID:', youtubeId);
  return true;
}

// Find and add buttons to metadata blocks
function addMetadataButtons() {
  const selectors = [
    // Grid view videos
    'ytd-video-meta-block.grid #metadata',
    'ytd-rich-grid-media ytd-video-meta-block #metadata',
    
    // List view videos  
    'ytd-video-renderer ytd-video-meta-block #metadata',
    
    // Compact videos (sidebar)
    'ytd-compact-video-renderer #metadata',
    
    // Channel grid videos
    'ytd-grid-video-renderer #metadata',
    
    // Playlist videos
    'ytd-playlist-video-renderer #metadata',
    
    // Search results
    'ytd-video-renderer #meta #metadata',
    
    // Generic fallback
    '[class*="video"] ytd-video-meta-block #metadata'
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
