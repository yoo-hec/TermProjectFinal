// Save this as /public/fix-images.js

document.addEventListener('DOMContentLoaded', function() {
    // Find all images on the page
    const images = document.querySelectorAll('img');
    
    // Loop through each image
    images.forEach(function(img) {
      // Get the original src attribute
      const originalSrc = img.getAttribute('src');
      
      // Check if it's one of our product images with a blue icon showing
      if (originalSrc && originalSrc.includes('/images/Product') && img.offsetWidth < 50) {
        // Try to repair the image path by explicitly setting proper case
        const productId = originalSrc.match(/Product(\d+)\.png/i)?.[1];
        
        if (productId) {
          // Force the correct case for the path
          const newSrc = `/images/Product${productId}.png`;
          img.setAttribute('src', newSrc);
          
          // Add error handling to help debug
          img.onerror = function() {
            console.error('Failed to load image:', newSrc);
            // Try a fallback approach - direct browser cache bypass
            this.setAttribute('src', newSrc + '?t=' + new Date().getTime());
            
            // If still failing, we'll show a placeholder
            this.onerror = function() {
              this.setAttribute('src', '/images/ctrl-fit.png');
              this.onerror = null;  // Prevent infinite error loop
            };
          };
        }
      }
    });
  });