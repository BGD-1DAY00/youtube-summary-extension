interface VideoData {
  id: string;
  title: string;
  description?: string;
  transcript?: string;
  duration?: string;
  channelName?: string;
  viewCount?: string;
  publishDate?: string;
}

class VideoExtractor {
  extractVideoId(): string | null {
    const url = window.location.href;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  }
  
  extractVideoTitle(): string | null {
    // Try multiple selectors for video title
    const selectors = [
      'h1.ytd-video-primary-info-renderer',
      'h1.title.style-scope.ytd-video-primary-info-renderer',
      'h1[class*="title"]',
      'h1.ytd-watch-metadata #title',
      '#title h1'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    
    // Fallback to page title
    const pageTitle = document.title;
    if (pageTitle && pageTitle !== 'YouTube') {
      return pageTitle.replace(' - YouTube', '').trim();
    }
    
    return null;
  }
  
  extractVideoDescription(): string | null {
    const selectors = [
      '#description-text',
      '.description-text',
      '#description ytd-expander #content',
      'ytd-video-secondary-info-renderer #description'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    
    return null;
  }
  
  extractChannelName(): string | null {
    const selectors = [
      '#channel-name a',
      '#owner-text a',
      '.ytd-channel-name a',
      '#channel-container #channel-name a'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        return element.textContent.trim();
      }
    }
    
    return null;
  }
  
  extractVideoMetadata(): Partial<VideoData> {
    const metadata: Partial<VideoData> = {};
    
    // View count
    const viewSelectors = [
      '#count .view-count',
      '.view-count',
      '#info-text .view-count'
    ];
    
    for (const selector of viewSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        metadata.viewCount = element.textContent.trim();
        break;
      }
    }
    
    // Duration
    const durationSelectors = [
      '.ytp-time-duration',
      '.html5-main-video .ytp-time-duration'
    ];
    
    for (const selector of durationSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        metadata.duration = element.textContent.trim();
        break;
      }
    }
    
    // Publish date
    const dateSelectors = [
      '#info-text #date',
      '.date',
      '#upload-info #date'
    ];
    
    for (const selector of dateSelectors) {
      const element = document.querySelector(selector);
      if (element?.textContent?.trim()) {
        metadata.publishDate = element.textContent.trim();
        break;
      }
    }
    
    return metadata;
  }
  
  async extractVideoTranscript(): Promise<string | null> {
    try {
      // First, try to find and click the transcript button
      const transcriptButton = this.findTranscriptButton();
      if (!transcriptButton) {
        console.log('Transcript button not found');
        return null;
      }
      
      // Click the transcript button
      transcriptButton.click();
      
      // Wait for transcript panel to load
      await this.waitForElement('#segments-container', 5000);
      
      // Extract transcript text
      const transcriptSegments = document.querySelectorAll('#segments-container ytd-transcript-segment-renderer');
      if (transcriptSegments.length === 0) {
        console.log('No transcript segments found');
        return null;
      }
      
      const transcriptText = Array.from(transcriptSegments)
        .map(segment => {
          const textElement = segment.querySelector('.segment-text');
          return textElement?.textContent?.trim() || '';
        })
        .filter(text => text.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return transcriptText || null;
    } catch (error) {
      console.error('Error extracting transcript:', error);
      return null;
    }
  }
  
  private findTranscriptButton(): HTMLElement | null {
    // Look for transcript button in various possible locations
    const selectors = [
      'button[aria-label*="transcript"]',
      'button[aria-label*="Transcript"]',
      '[role="button"][aria-label*="transcript"]',
      '.ytd-transcript-search-panel-renderer button',
      '#description button[aria-label*="transcript"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        return element;
      }
    }
    
    // Look for "Show transcript" text
    const buttons = document.querySelectorAll('button, [role="button"]');
    for (const button of buttons) {
      if (button.textContent?.toLowerCase().includes('transcript')) {
        return button as HTMLElement;
      }
    }
    
    return null;
  }
  
  private waitForElement(selector: string, timeout: number = 5000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
  
  async extractFullVideoData(): Promise<VideoData | null> {
    const videoId = this.extractVideoId();
    if (!videoId) {
      return null;
    }
    
    const videoData: VideoData = {
      id: videoId,
      title: this.extractVideoTitle() || '',
      description: this.extractVideoDescription(),
      channelName: this.extractChannelName(),
      ...this.extractVideoMetadata()
    };
    
    // Try to get transcript (this may take time)
    try {
      videoData.transcript = await this.extractVideoTranscript();
    } catch (error) {
      console.log('Could not extract transcript:', error);
    }
    
    return videoData;
  }
}

export { VideoExtractor, VideoData };