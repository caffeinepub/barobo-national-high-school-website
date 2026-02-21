/**
 * Utility to convert upload failures into clear, actionable English messages
 * with detailed error classification and logging
 */

export interface UploadError {
  message: string;
  originalError?: Error;
  isRecoverable: boolean;
  category: 'permission' | 'network' | 'validation' | 'backend' | 'size' | 'generic';
}

/**
 * Parse and normalize upload error messages with detailed categorization
 */
export function parseUploadError(error: unknown): UploadError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // Check for permission/auth errors
  if (
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('permission') ||
    lowerMessage.includes('forbidden') ||
    lowerMessage.includes('not allowed') ||
    lowerMessage.includes('access denied')
  ) {
    return {
      message: 'You do not have permission to upload files. Please log in again or contact the administrator.',
      originalError: error instanceof Error ? error : undefined,
      isRecoverable: true,
      category: 'permission',
    };
  }

  // Check for backend trap errors
  if (
    lowerMessage.includes('trap') ||
    lowerMessage.includes('canister') ||
    lowerMessage.includes('rejected')
  ) {
    return {
      message: 'The server rejected the upload. Please try again or contact the administrator if the problem persists.',
      originalError: error instanceof Error ? error : undefined,
      isRecoverable: true,
      category: 'backend',
    };
  }

  // Check for network/CORS/connectivity errors
  if (
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('network') ||
    lowerMessage.includes('cors') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('networkerror')
  ) {
    return {
      message: 'Network error during upload. Please check your internet connection and try again.',
      originalError: error instanceof Error ? error : undefined,
      isRecoverable: true,
      category: 'network',
    };
  }

  // Check for upload validation errors (blob not yet accessible - eventual consistency)
  if (
    lowerMessage.includes('not yet accessible') ||
    lowerMessage.includes('still being processed') ||
    lowerMessage.includes('wait a moment') ||
    lowerMessage.includes('should be available shortly')
  ) {
    return {
      message: 'Upload completed but the file is still being processed. Please wait a moment and refresh the page.',
      originalError: error instanceof Error ? error : undefined,
      isRecoverable: true,
      category: 'validation',
    };
  }

  // Check for 404/Not Found errors (after validation retries)
  if (lowerMessage.includes('not found') || lowerMessage.includes('404')) {
    return {
      message: 'Upload completed but the file could not be verified. Please refresh the page. If the file does not appear, try uploading again.',
      originalError: error instanceof Error ? error : undefined,
      isRecoverable: true,
      category: 'validation',
    };
  }

  // Check for file size errors
  if (lowerMessage.includes('size') || lowerMessage.includes('too large') || lowerMessage.includes('exceeds')) {
    return {
      message: 'File is too large. Please try a smaller file.',
      originalError: error instanceof Error ? error : undefined,
      isRecoverable: true,
      category: 'size',
    };
  }

  // Generic error
  return {
    message: `Upload failed: ${errorMessage}. Please try again or contact the administrator if the problem persists.`,
    originalError: error instanceof Error ? error : undefined,
    isRecoverable: true,
    category: 'generic',
  };
}

/**
 * Get a user-friendly error message for display
 */
export function getUploadErrorMessage(error: unknown): string {
  return parseUploadError(error).message;
}

/**
 * Log detailed error information to console without exposing sensitive data
 */
export function logUploadError(error: unknown, context: string): void {
  const parsedError = parseUploadError(error);
  console.error(`[Upload Error - ${context}]`, {
    category: parsedError.category,
    message: parsedError.message,
    isRecoverable: parsedError.isRecoverable,
    originalError: parsedError.originalError?.message,
    stack: parsedError.originalError?.stack,
  });
}
