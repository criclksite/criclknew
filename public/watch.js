// public/watch.js
document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const iframe = document.getElementById('playerIframe');
  const loadingSpinner = document.getElementById('loading-spinner');
  const channelButtons = document.querySelectorAll('.channel-button');
  
  // Set up channel button click event
  channelButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Show loading spinner
      loadingSpinner.style.display = 'flex';
      
      // Update active button
      channelButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Get channel source
      const channelSrc = this.getAttribute('data-src');
      
      // Change iframe source
      iframe.src = channelSrc;
    });
  });
  
  // Hide loading spinner after iframe loads
  iframe.addEventListener('load', function() {
    setTimeout(() => {
      loadingSpinner.style.display = 'none';
    }, 2000);
    
    // Set up popup blocker
    setupPopupBlocker();
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
});