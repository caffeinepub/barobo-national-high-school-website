/**
 * Enhanced URL converter for cloud storage sharing URLs
 * Automatically detects and converts Google Drive, OneDrive, Dropbox, and Google Photos links
 * to direct media access URLs - all processing happens client-side with improved fallback handling
 */

export function convertToDirectImageUrl(url: string): string {
  const trimmedUrl = url.trim();

  // Google Photos conversion with enhanced handling
  if (trimmedUrl.includes('photos.google.com') || trimmedUrl.includes('photos.app.goo.gl')) {
    // Pattern 1: Shortened album links
    if (trimmedUrl.includes('photos.app.goo.gl')) {
      // Return as-is, backend proxy will handle redirect and conversion
      return trimmedUrl;
    }

    // Pattern 2: Direct photo link with photo ID
    const photoIdMatch = trimmedUrl.match(/\/photo\/([a-zA-Z0-9_-]+)/);
    if (photoIdMatch && photoIdMatch[1]) {
      // Return original URL, backend proxy will handle authentication
      return trimmedUrl;
    }

    // Pattern 3: Album share link
    const albumMatch = trimmedUrl.match(/\/share\/([a-zA-Z0-9_-]+)/);
    if (albumMatch && albumMatch[1]) {
      return trimmedUrl;
    }

    // Pattern 4: Direct image URL from Google Photos CDN
    if (trimmedUrl.includes('googleusercontent.com')) {
      return trimmedUrl;
    }

    // Pattern 5: Google Photos with parameters
    if (trimmedUrl.includes('?')) {
      // Try to extract direct image URL from parameters
      try {
        const urlObj = new URL(trimmedUrl);
        const imgUrl = urlObj.searchParams.get('imgurl');
        if (imgUrl) {
          return decodeURIComponent(imgUrl);
        }
      } catch (e) {
        console.warn('Failed to parse Google Photos URL parameters:', e);
      }
    }

    console.warn('Google Photos URL format not recognized, returning as-is for backend processing:', trimmedUrl);
    return trimmedUrl;
  }

  // Google Drive conversion with comprehensive pattern matching
  if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com')) {
    // Pattern 1: /file/d/FILEID/ or /file/d/FILEID/view
    const fileIdMatch1 = trimmedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch1 && fileIdMatch1[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch1[1]}`;
    }

    // Pattern 2: /d/FILEID/ or /d/FILEID/view
    const fileIdMatch2 = trimmedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch2 && fileIdMatch2[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch2[1]}`;
    }

    // Pattern 3: ?id=FILEID or &id=FILEID
    const fileIdMatch3 = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch3 && fileIdMatch3[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch3[1]}`;
    }

    // Pattern 4: Already in direct format (uc?export=view or uc?export=download)
    if (trimmedUrl.includes('/uc?') && (trimmedUrl.includes('export=view') || trimmedUrl.includes('export=download'))) {
      // Prefer download over view for better compatibility
      return trimmedUrl.replace('export=view', 'export=download');
    }

    // Pattern 5: Google Docs viewer format
    const docsMatch = trimmedUrl.match(/docs\.google\.com\/.*\/d\/([a-zA-Z0-9_-]+)/);
    if (docsMatch && docsMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${docsMatch[1]}`;
    }

    console.warn('Could not extract Google Drive file ID, returning as-is for backend processing:', trimmedUrl);
    return trimmedUrl;
  }

  // OneDrive conversion with enhanced handling
  if (trimmedUrl.includes('onedrive.live.com') || trimmedUrl.includes('1drv.ms') || trimmedUrl.includes('sharepoint.com')) {
    // Handle shortened links
    if (trimmedUrl.includes('1drv.ms')) {
      // Return as-is, backend will follow redirect
      return trimmedUrl;
    }

    // SharePoint links
    if (trimmedUrl.includes('sharepoint.com')) {
      // Try to convert to download format
      let directUrl = trimmedUrl.replace(/\?.*$/, '');
      return `${directUrl}?download=1`;
    }

    // OneDrive direct links
    if (trimmedUrl.includes('onedrive.live.com')) {
      // Method 1: Convert view to download
      if (trimmedUrl.includes('/view.aspx')) {
        let directUrl = trimmedUrl.replace(/\/view\.aspx/i, '/download.aspx');
        return directUrl;
      }

      // Method 2: Extract resid and authkey for direct download
      const residMatch = trimmedUrl.match(/[?&]resid=([^&]+)/i);
      const authkeyMatch = trimmedUrl.match(/[?&]authkey=([^&]+)/i);
      
      if (residMatch && authkeyMatch) {
        return `https://onedrive.live.com/download?resid=${encodeURIComponent(residMatch[1])}&authkey=${encodeURIComponent(authkeyMatch[1])}`;
      }

      // Method 3: Try embed format
      const cidMatch = trimmedUrl.match(/[?&]cid=([^&]+)/i);
      const idMatch = trimmedUrl.match(/[?&]id=([^&]+)/i);
      
      if (cidMatch && idMatch) {
        return `https://onedrive.live.com/download?cid=${encodeURIComponent(cidMatch[1])}&id=${encodeURIComponent(idMatch[1])}${authkeyMatch ? '&authkey=' + encodeURIComponent(authkeyMatch[1]) : ''}`;
      }

      // Method 4: Add download parameter
      if (trimmedUrl.includes('?')) {
        return `${trimmedUrl}&download=1`;
      } else {
        return `${trimmedUrl}?download=1`;
      }
    }
    
    return trimmedUrl;
  }

  // Dropbox conversion with enhanced handling
  if (trimmedUrl.includes('dropbox.com') || trimmedUrl.includes('db.tt')) {
    // Handle shortened Dropbox links
    if (trimmedUrl.includes('db.tt')) {
      return trimmedUrl;
    }

    // New Dropbox sharing format (/scl/fi/)
    if (trimmedUrl.includes('/scl/fi/')) {
      let directUrl = trimmedUrl.replace(/[?&]dl=0/g, '').replace(/[?&]dl=1/g, '');
      
      // Add raw=1 parameter for direct access
      if (directUrl.includes('?')) {
        directUrl = directUrl.replace(/\?/, '?raw=1&');
      } else {
        directUrl = directUrl + '?raw=1';
      }
      
      return directUrl;
    }
    
    // Classic Dropbox format
    let directUrl = trimmedUrl;
    
    // Replace domain for direct access
    directUrl = directUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    directUrl = directUrl.replace(/^https?:\/\/dropbox\.com/, 'https://dl.dropboxusercontent.com');
    
    // Remove dl=0 parameter and clean up
    directUrl = directUrl.replace(/[?&]dl=0/g, '');
    directUrl = directUrl.replace(/[?&]dl=1/g, '');
    directUrl = directUrl.replace(/\?$/, '');
    
    // If still has dropbox.com domain, add raw=1
    if (directUrl.includes('dropbox.com') && !directUrl.includes('dl.dropboxusercontent.com')) {
      if (directUrl.includes('?')) {
        directUrl = directUrl + '&raw=1';
      } else {
        directUrl = directUrl + '?raw=1';
      }
    }
    
    return directUrl;
  }

  // Return original URL if not a recognized cloud provider
  return trimmedUrl;
}

/**
 * Detects the cloud storage provider from a URL
 * Returns the provider type for specialized handling
 */
export function detectCloudProvider(url: string): 'google-drive' | 'onedrive' | 'dropbox' | 'google-photos' | 'other' {
  const trimmedUrl = url.trim().toLowerCase();

  if (trimmedUrl.includes('photos.google.com') || trimmedUrl.includes('photos.app.goo.gl') || 
      (trimmedUrl.includes('googleusercontent.com') && trimmedUrl.includes('lh3'))) {
    return 'google-photos';
  }
  if (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com')) {
    return 'google-drive';
  }
  if (trimmedUrl.includes('onedrive.live.com') || trimmedUrl.includes('1drv.ms') || trimmedUrl.includes('sharepoint.com')) {
    return 'onedrive';
  }
  if (trimmedUrl.includes('dropbox.com') || trimmedUrl.includes('db.tt')) {
    return 'dropbox';
  }

  return 'other';
}

/**
 * Validates if a URL is likely to be a media URL (image or video)
 * Checks for media extensions and known cloud storage providers
 */
export function isLikelyMediaUrl(url: string): boolean {
  const trimmedUrl = url.trim().toLowerCase();
  
  // Check for common media extensions
  const mediaExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg',
    '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'
  ];
  const hasMediaExtension = mediaExtensions.some(ext => trimmedUrl.includes(ext));
  
  // Cloud storage URLs are likely media if shared
  const isCloudStorage = detectCloudProvider(url) !== 'other';
  
  // Check for known media hosting domains
  const mediaHostingDomains = [
    'imgur.com',
    'i.imgur.com',
    'postimg.cc',
    'imgbb.com',
    'ibb.co',
    'flickr.com',
    'staticflickr.com',
    'youtube.com',
    'youtu.be',
    'vimeo.com',
  ];
  const isMediaHosting = mediaHostingDomains.some(domain => trimmedUrl.includes(domain));
  
  return hasMediaExtension || isCloudStorage || isMediaHosting;
}

/**
 * Validates if a URL is likely to be an image URL
 * Checks for image extensions and known cloud storage providers
 */
export function isLikelyImageUrl(url: string): boolean {
  const trimmedUrl = url.trim().toLowerCase();
  
  // Check for common image extensions
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => trimmedUrl.includes(ext));
  
  // Cloud storage URLs are likely images if shared
  const isCloudStorage = detectCloudProvider(url) !== 'other';
  
  // Check for known image hosting domains
  const imageHostingDomains = [
    'imgur.com',
    'i.imgur.com',
    'postimg.cc',
    'imgbb.com',
    'ibb.co',
    'flickr.com',
    'staticflickr.com',
  ];
  const isImageHosting = imageHostingDomains.some(domain => trimmedUrl.includes(domain));
  
  return hasImageExtension || isCloudStorage || isImageHosting;
}

/**
 * Gets a user-friendly provider name for display
 */
export function getProviderName(provider: ReturnType<typeof detectCloudProvider>): string {
  switch (provider) {
    case 'google-photos':
      return 'Google Photos';
    case 'google-drive':
      return 'Google Drive';
    case 'onedrive':
      return 'OneDrive';
    case 'dropbox':
      return 'Dropbox';
    default:
      return 'external link';
  }
}

