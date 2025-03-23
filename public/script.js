// public/script.js
document.addEventListener('DOMContentLoaded', function() {
  // Player elements
  const iframe = document.getElementById('playerIframe');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playPauseIcon = playPauseBtn.querySelector('i');
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = muteBtn.querySelector('i');
  const volumeSlider = document.getElementById('volumeSlider');
  const fullScreenBtn = document.getElementById('fullScreenBtn');
  const loadingSpinner = document.getElementById('loading-spinner');
  
  // Iframe communication
  let iframeWindow = null;
  let isPlaying = false;
  let isMuted = false;
  let currentVolume = 100;
  
  // Load the iframe with sandbox restrictions to help limit popups
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-presentation');
  
  // Load the iframe with the original source
  setTimeout(() => {
    iframe.src = "https://cdn.crichdplays.ru/embed2.php?id=starsp";
  }, 1000);
  
  // Wait for iframe to load
  iframe.addEventListener('load', function() {
    // Hide loading spinner after iframe loads
    setTimeout(() => {
      loadingSpinner.style.display = 'none';
    }, 2000);
    
    try {
      iframeWindow = iframe.contentWindow;
      
      // Create a MutationObserver to detect and close popup attempts
      setupPopupBlocker();
    } catch (error) {
      console.error('Error accessing iframe content:', error);
    }
  });
  
  // Play/Pause button
  playPauseBtn.addEventListener('click', function() {
    if (iframeWindow) {
      try {
        // Find and control the video element inside the iframe
        const message = {
          action: isPlaying ? 'pause' : 'play'
        };
        
        // Try to send postMessage to iframe
        iframeWindow.postMessage(JSON.stringify(message), '*');
        
        // Fallback: Try to directly access video element
        const videoElements = iframe.contentDocument.querySelectorAll('video');
        if (videoElements.length > 0) {
          isPlaying ? videoElements[0].pause() : videoElements[0].play();
        }
        
        // Toggle play state and icon
        isPlaying = !isPlaying;
        playPauseIcon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
      } catch (error) {
        console.error('Error controlling video:', error);
      }
    }
  });
  
  // Mute button
  muteBtn.addEventListener('click', function() {
    if (iframeWindow) {
      try {
        // Find and control the video element inside the iframe
        const message = {
          action: 'volume',
          value: isMuted ? currentVolume : 0
        };
        
        // Try to send postMessage to iframe
        iframeWindow.postMessage(JSON.stringify(message), '*');
        
        // Fallback: Try to directly access video element
        const videoElements = iframe.contentDocument.querySelectorAll('video');
        if (videoElements.length > 0) {
          videoElements[0].volume = isMuted ? currentVolume / 100 : 0;
          videoElements[0].muted = !isMuted;
        }
        
        // Toggle mute state and icon
        isMuted = !isMuted;
        muteIcon.className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
      } catch (error) {
        console.error('Error controlling volume:', error);
      }
    }
  });
  
  // Volume slider
  volumeSlider.addEventListener('input', function() {
    if (iframeWindow) {
      try {
        currentVolume = this.value;
        
        // Only adjust volume if not muted
        if (!isMuted) {
          // Find and control the video element inside the iframe
          const message = {
            action: 'volume',
            value: currentVolume
          };
          
          // Try to send postMessage to iframe
          iframeWindow.postMessage(JSON.stringify(message), '*');
          
          // Fallback: Try to directly access video element
          const videoElements = iframe.contentDocument.querySelectorAll('video');
          if (videoElements.length > 0) {
            videoElements[0].volume = currentVolume / 100;
          }
        }
      } catch (error) {
        console.error('Error adjusting volume:', error);
      }
    }
  });
  
  // Fullscreen button
  fullScreenBtn.addEventListener('click', function() {
    try {
      const playerContainer = document.querySelector('.player-container');
      
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainer.requestFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  });
  
  // Function to set up popup blocker
  function setupPopupBlocker() {
    try {
      // Block popup windows
      const originalOpen = window.open;
      window.open = function() {
        console.log('Popup blocked');
        return null;
      };
      
      // Try to block popups in the iframe
      if (iframe.contentWindow) {
        iframe.contentWindow.open = function() {
          console.log('Iframe popup blocked');
          return null;
        };
      }
      
      // Create style to hide popup elements
      const iframeDoc = iframe.contentDocument;
      if (iframeDoc) {
        const style = iframeDoc.createElement('style');
        style.textContent = `
          a[target="_blank"], 
          a[href*="http"],
          [onclick*="window.open"],
          [data-ad],
          [class*="ad-"],
          [id*="ad-"],
          [class*="popup"],
          [id*="popup"],
          iframe:not([src*="crichdplays"]) {
            display: none !important;
            pointer-events: none !important;
          }
        `;
        iframeDoc.head.appendChild(style);
      }
      
      // Watch for new elements that might be ads
      const observer = new MutationObserver((mutations) => {
        if (iframeDoc) {
          // Find and remove popup triggers
          const adElements = iframeDoc.querySelectorAll('a[target="_blank"], [onclick*="window.open"], [data-ad], [class*="ad-"], [id*="ad-"], [class*="popup"], [id*="popup"], iframe:not([src*="crichdplays"])');
          adElements.forEach(el => {
            el.style.display = 'none';
            el.style.pointerEvents = 'none';
            el.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            };
          });
        }
      });
      
      // Start observing the iframe document
      if (iframeDoc) {
        observer.observe(iframeDoc, {
          childList: true,
          subtree: true
        });
      }
    } catch (error) {
      console.error('Error setting up popup blocker:', error);
    }
  }
  
  // Message listener for postMessage communication with iframe
  window.addEventListener('message', function(event) {
    try {
      const data = JSON.parse(event.data);
      
      // Handle player state updates from iframe
      if (data.event === 'playerStateChange') {
        if (data.state === 'playing') {
          isPlaying = true;
          playPauseIcon.className = 'fas fa-pause';
        } else if (data.state === 'paused') {
          isPlaying = false;
          playPauseIcon.className = 'fas fa-play';
        }
      }
    } catch (e) {
      // Not a JSON message, ignore
    }
  });
});
