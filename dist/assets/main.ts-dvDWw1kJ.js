(function(){console.log("[CRXJS] YouTube metadata button overlay script loaded!");function b(){return null}function l(){const o=document.getElementById("youtube-ai-panel");if(!o)return;const t=o.querySelector("#loading-state"),e=o.querySelector("#auth-required"),n=o.querySelector("#main-content");t.style.display="block",e.style.display="none",n.style.display="none",chrome.storage.local.get(["youtube-ai-api-key"],i=>{setTimeout(()=>{t.style.display="none",i["youtube-ai-api-key"]?(n.style.display="block",console.log("User authenticated")):(e.style.display="block",console.log("Authentication required"))},800)})}function m(){const o=document.querySelectorAll(".metadata-button, .grid-metadata-button");o.forEach(t=>t.remove()),console.log(`Cleaned up ${o.length} existing overlays`)}function g(o){o.preventDefault(),o.stopPropagation(),console.log("Hello from metadata button!");let t=document.getElementById("youtube-ai-panel");if(!t){t=document.createElement("div"),t.id="youtube-ai-panel",t.className="youtube-ai-panel",t.innerHTML=`
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
    `,t.style.cssText=`
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
    `;const n=document.createElement("style");n.textContent=`
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
    `,document.head.appendChild(n),document.body.appendChild(t);const i=t.querySelector("#close-panel");i==null||i.addEventListener("click",()=>{t.style.right="-420px"});const a=t.querySelector("#refresh-auth");a==null||a.addEventListener("click",()=>{l()});const r=t.querySelector("#analyze-video");r==null||r.addEventListener("click",()=>{const c=b();console.log("Analyzing video:",c)})}l();const e=t.style.right==="0px";t.style.right=e?"-420px":"0px"}function y(o){const t=document.createElement("button");return t.innerHTML=`
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 6px; vertical-align: middle;">
      <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" fill="currentColor"/>
    </svg>
    <span style="vertical-align: middle;">Sum</span>
  `,t.className=o,t.type="button",t.addEventListener("click",g),t.style.cssText=`
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
  `,t.addEventListener("mouseenter",()=>{t.style.background="rgba(0, 123, 255, 1) !important"}),t.addEventListener("mouseleave",()=>{t.style.background="rgba(0, 123, 255, 0.9) !important"}),t}function h(o,t){if(o.querySelector(`.${t}`))return!1;const e=o.closest("ytd-rich-grid-media");if(!e||e.querySelector(`.${t}`))return!1;const n=y(t);return e.style.position="relative",e.appendChild(n),!0}function u(){const o=["ytd-video-meta-block.grid #metadata","ytd-rich-grid-media ytd-video-meta-block #metadata"];let t=0;o.forEach(e=>{document.querySelectorAll(e).forEach(i=>{h(i,"metadata-button")&&t++})}),console.log(`Added ${t} metadata buttons`)}function p(){m(),setTimeout(u,100)}p();let s;const x=new MutationObserver(()=>{clearTimeout(s),s=setTimeout(u,300)});x.observe(document.body,{childList:!0,subtree:!0});let d=location.href;setInterval(()=>{location.href!==d&&(d=location.href,setTimeout(p,1500))},1e3);window.cleanupOverlays=m;window.refreshMetadataButtons=p;console.log("Metadata button overlay script ready!");
})()
