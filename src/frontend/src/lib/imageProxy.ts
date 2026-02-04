/**
 * Enhanced image proxy utility for handling external cloud storage URLs
 * Routes Google Drive, OneDrive, Dropbox, and Google Photos URLs through backend proxy
 * to bypass CORS restrictions and handle non-direct URLs with improved error recovery
 */

import { convertToDirectImageUrl, detectCloudProvider } from './urlConverter';

/**
 * Determines if a URL should be proxied through the backend
 */
export function shouldProxyUrl(url: string): boolean {
  const provider = detectCloudProvider(url);
  return provider === 'google-drive' || provider === 'onedrive' || provider === 'dropbox' || provider === 'google-photos';
}

/**
 * Gets the proxied URL for cloud storage media
 * For cloud storage URLs, this converts them to direct URLs first
 * For other URLs, returns them as-is
 */
export function getProxiedImageUrl(url: string): string {
  if (!url) return url;
  
  const provider = detectCloudProvider(url);
  
  // For cloud storage providers, convert to direct URL
  // The backend proxy will handle additional conversion if needed
  if (provider === 'google-drive' || provider === 'onedrive' || provider === 'dropbox' || provider === 'google-photos') {
    return convertToDirectImageUrl(url);
  }
  
  // For other URLs, return as-is
  return url;
}

/**
 * Enhanced validation for media URLs through backend proxy
 * Returns validation status with detailed error messages and instant preview capability
 */
export async function validateProxiedImageUrl(
  url: string,
  actor?: any
): Promise<{ valid: boolean; error?: string; proxyUrl?: string }> {
  const provider = detectCloudProvider(url);
  
  // For cloud storage providers, validate through backend proxy
  if (shouldProxyUrl(url) && actor) {
    try {
      // Convert to direct URL first
      const directUrl = convertToDirectImageUrl(url);
      
      // Call backend proxy to validate and fetch
      const proxyUrl = await actor.proxyPublicImage(directUrl, []);
      
      return { 
        valid: true, 
        proxyUrl 
      };
    } catch (error: any) {
      let errorMessage = 'Failed to validate media through backend proxy. ';
      
      if (provider === 'google-photos') {
        errorMessage += 'For Google Photos: Make sure the photo or album is shared publicly with "Anyone with the link can view" permissions.';
      } else if (provider === 'google-drive') {
        errorMessage += 'For Google Drive: Make sure the file is set to "Anyone with the link can view" in sharing settings.';
      } else if (provider === 'onedrive') {
        errorMessage += 'For OneDrive: Make sure the file is shared publicly and not restricted to specific people.';
      } else if (provider === 'dropbox') {
        errorMessage += 'For Dropbox: Make sure the link is a public sharing link and not a private link.';
      }
      
      return { 
        valid: false, 
        error: errorMessage
      };
    }
  }
  
  // For non-cloud URLs, use client-side validation with enhanced error handling
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = '';
      resolve({ 
        valid: false, 
        error: 'Media loading timed out. The URL may be invalid or the file is not publicly accessible.'
      });
    }, 15000);

    img.onload = () => {
      clearTimeout(timeout);
      resolve({ valid: true, proxyUrl: url });
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve({ 
        valid: false, 
        error: 'Failed to load media. Please check that the URL is correct and the media is publicly accessible.'
      });
    };

    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/**
 * Enhanced validation for video URLs through backend proxy
 * Returns validation status with detailed error messages
 */
export async function validateProxiedVideoUrl(
  url: string,
  actor?: any
): Promise<{ valid: boolean; error?: string; proxyUrl?: string }> {
  const provider = detectCloudProvider(url);
  
  // For cloud storage providers, validate through backend proxy
  if (shouldProxyUrl(url) && actor) {
    try {
      // Convert to direct URL first
      const directUrl = convertToDirectImageUrl(url);
      
      // Call backend proxy to validate and fetch
      const proxyUrl = await actor.proxyPublicImage(directUrl, []);
      
      return { 
        valid: true, 
        proxyUrl 
      };
    } catch (error: any) {
      let errorMessage = 'Failed to validate video through backend proxy. ';
      
      if (provider === 'google-drive') {
        errorMessage += 'For Google Drive: Make sure the file is set to "Anyone with the link can view" in sharing settings.';
      } else if (provider === 'onedrive') {
        errorMessage += 'For OneDrive: Make sure the file is shared publicly and not restricted to specific people.';
      } else if (provider === 'dropbox') {
        errorMessage += 'For Dropbox: Make sure the link is a public sharing link and not a private link.';
      }
      
      return { 
        valid: false, 
        error: errorMessage
      };
    }
  }
  
  // For non-cloud URLs, use client-side validation
  return new Promise((resolve) => {
    const video = document.createElement('video');
    const timeout = setTimeout(() => {
      video.src = '';
      resolve({ 
        valid: false, 
        error: 'Video loading timed out. The URL may be invalid or the file is not publicly accessible.'
      });
    }, 15000);

    video.onloadeddata = () => {
      clearTimeout(timeout);
      resolve({ valid: true, proxyUrl: url });
    };

    video.onerror = () => {
      clearTimeout(timeout);
      resolve({ 
        valid: false, 
        error: 'Failed to load video. Please check that the URL is correct and the video is publicly accessible.'
      });
    };

    video.crossOrigin = 'anonymous';
    video.src = url;
    video.load();
  });
}

