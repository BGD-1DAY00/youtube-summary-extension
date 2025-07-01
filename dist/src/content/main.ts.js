console.log("[CRXJS] YouTube metadata button overlay script loaded!");
function cleanupExistingOverlays() {
  const existingOverlays = document.querySelectorAll(".metadata-button, .grid-metadata-button");
  existingOverlays.forEach((overlay) => overlay.remove());
  console.log(`Cleaned up ${existingOverlays.length} existing overlays`);
}
function handleButtonClick(event) {
  event.preventDefault();
  event.stopPropagation();
  console.log("Hello from metadata button!");
  const body = document.body;
  let panel = document.getElementById("youtube-ai-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.id = "youtube-ai-panel";
    panel.className = "youtube-ai-panel";
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
    const closeButton = panel.querySelector("#close-panel");
    closeButton?.addEventListener("click", () => {
      panel.style.right = "-400px";
    });
    const saveButton = panel.querySelector("#save-api-key");
    saveButton?.addEventListener("click", () => {
      const input = panel.querySelector("#api-key-input");
      const apiKey = input.value.trim();
      if (apiKey) {
        chrome.storage.local.set({ "youtube-ai-api-key": apiKey }, () => {
          console.log("API key saved!");
          input.value = "";
          panel.style.right = "-400px";
        });
      }
    });
  }
  const isOpen = panel.style.right === "0px";
  panel.style.right = isOpen ? "-400px" : "0px";
}
function createButton(className) {
  const button = document.createElement("button");
  button.textContent = "AI";
  button.className = className;
  button.type = "button";
  button.addEventListener("click", handleButtonClick);
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
  button.addEventListener("mouseenter", () => {
    button.style.background = "rgba(0, 123, 255, 1) !important";
  });
  button.addEventListener("mouseleave", () => {
    button.style.background = "rgba(0, 123, 255, 0.9) !important";
  });
  return button;
}
function addButtonToContainer(container, buttonClass) {
  if (container.querySelector(`.${buttonClass}`)) {
    return false;
  }
  const richGridContainer = container.closest("ytd-rich-grid-media");
  if (!richGridContainer) return false;
  if (richGridContainer.querySelector(`.${buttonClass}`)) {
    return false;
  }
  const button = createButton(buttonClass);
  richGridContainer.style.position = "relative";
  richGridContainer.appendChild(button);
  return true;
}
function addMetadataButtons() {
  const selectors = [
    "ytd-video-meta-block.grid #metadata",
    // Primary approach
    "ytd-rich-grid-media ytd-video-meta-block #metadata"
    // Fallback approach
  ];
  let buttonsAdded = 0;
  selectors.forEach((selector) => {
    const containers = document.querySelectorAll(selector);
    containers.forEach((container) => {
      if (addButtonToContainer(container, "metadata-button")) {
        buttonsAdded++;
      }
    });
  });
  console.log(`Added ${buttonsAdded} metadata buttons`);
}
function refreshMetadataButtons() {
  cleanupExistingOverlays();
  setTimeout(addMetadataButtons, 100);
}
refreshMetadataButtons();
let observerTimeout;
const observer = new MutationObserver(() => {
  clearTimeout(observerTimeout);
  observerTimeout = setTimeout(addMetadataButtons, 300);
});
observer.observe(document.body, {
  childList: true,
  subtree: true
});
let currentUrl = location.href;
setInterval(() => {
  if (location.href !== currentUrl) {
    currentUrl = location.href;
    setTimeout(refreshMetadataButtons, 1500);
  }
}, 1e3);
window.cleanupOverlays = cleanupExistingOverlays;
window.refreshMetadataButtons = refreshMetadataButtons;
console.log("Metadata button overlay script ready!");
