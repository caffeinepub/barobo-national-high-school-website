import { ExternalBlob } from '../backend';

/**
 * Shared utility for uploading files using ExternalBlob with progress tracking,
 * post-upload URL validation with resilient retry logic, and standardized error handling.
 */

export interface UploadOptions {
  onProgress?: (percentage: number) => void;
  onError?: (error: Error) => void;
}

export type ValidationResult = 
  | { status: 'success' }
  | { status: 'pending'; message: string }
  | { status: 'failed'; error: Error };

/**
 * Validate that an ExternalBlob direct URL is accessible
 * Uses both HEAD and GET fallback with extended retries for eventual consistency
 */
async function validateBlobURL(
  blob: ExternalBlob,
  maxRetries: number = 8,
  initialDelay: number = 1000
): Promise<ValidationResult> {
  const directURL = blob.getDirectURL();
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Try HEAD request first (lightweight)
      const headResponse = await fetch(directURL, { 
        method: 'HEAD',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (headResponse.ok) {
        return { status: 'success' };
      }
      
      // If HEAD fails with 404, try GET with minimal transfer as fallback
      if (headResponse.status === 404 || headResponse.status === 0) {
        try {
          const getResponse = await fetch(directURL, {
            method: 'GET',
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Range': 'bytes=0-1023' // Only fetch first 1KB
            }
          });
          
          if (getResponse.ok || getResponse.status === 206) {
            return { status: 'success' };
          }
        } catch (getFallbackError) {
          // GET also failed, continue to retry logic
        }
      }
      
      // Retry with exponential backoff for transient failures
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(1.5, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
    } catch (error) {
      // Network error, CORS issue, or timeout - these are retryable
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isRetryable = 
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('CORS') ||
        errorMessage.includes('timeout');
      
      if (isRetryable && attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(1.5, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Last attempt failed
      if (attempt === maxRetries - 1) {
        return {
          status: 'failed',
          error: new Error(
            `Upload validation failed after ${maxRetries} attempts. The file may still be processing. Please wait a moment and refresh the page.`
          )
        };
      }
    }
  }
  
  return {
    status: 'pending',
    message: 'File is still being processed. It should be available shortly.'
  };
}

/**
 * Upload a file from bytes with progress tracking
 */
export async function uploadFromBytes(
  fileData: Uint8Array<ArrayBuffer>,
  options: UploadOptions = {}
): Promise<ExternalBlob> {
  try {
    let blob = ExternalBlob.fromBytes(fileData);
    
    if (options.onProgress) {
      blob = blob.withUploadProgress(options.onProgress);
    }
    
    return blob;
  } catch (error) {
    const uploadError = error instanceof Error ? error : new Error('Upload failed');
    if (options.onError) {
      options.onError(uploadError);
    }
    throw uploadError;
  }
}

/**
 * Create an ExternalBlob from a URL
 */
export function uploadFromURL(url: string): ExternalBlob {
  try {
    return ExternalBlob.fromURL(url);
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to create blob from URL');
  }
}

/**
 * Upload a File object with progress tracking
 */
export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<ExternalBlob> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer) as Uint8Array<ArrayBuffer>;
    return uploadFromBytes(uint8Array, options);
  } catch (error) {
    const uploadError = error instanceof Error ? error : new Error('File upload failed');
    if (options.onError) {
      options.onError(uploadError);
    }
    throw uploadError;
  }
}

/**
 * Validate that an uploaded blob's direct URL is accessible
 * Returns a result object instead of throwing, allowing callers to handle pending states
 */
export async function validateUploadedBlob(blob: ExternalBlob): Promise<ValidationResult> {
  return validateBlobURL(blob);
}

/**
 * Validate and throw on failure (for backward compatibility with strict validation)
 */
export async function validateUploadedBlobStrict(blob: ExternalBlob): Promise<void> {
  const result = await validateBlobURL(blob);
  
  if (result.status === 'failed') {
    throw result.error;
  }
  
  if (result.status === 'pending') {
    throw new Error(result.message);
  }
}
