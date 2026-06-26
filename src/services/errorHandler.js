/**
 * Error Handler & Logger
 * Centralized error handling and logging system
 */

export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  STATE_ERROR: 'STATE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN_ERROR, context = {}) {
    super(message);
    this.type = type;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      message: this.message,
      type: this.type,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
    this.listeners = [];
  }

  /**
   * Handle an error
   */
  handle(error, context = {}) {
    const appError = error instanceof AppError ? error : this.wrapError(error, context);

    // Store error
    this.errors.push(appError);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${appError.type}]`, appError.message, appError.context);
    }

    // Notify listeners
    this.notifyListeners(appError);

    return appError;
  }

  /**
   * Wrap raw errors into AppError
   */
  wrapError(error, context) {
    if (error instanceof TypeError) {
      return new AppError(error.message, ERROR_TYPES.VALIDATION_ERROR, context);
    }

    if (error instanceof NetworkError || error.message?.includes('fetch')) {
      return new AppError(
        'Network request failed. Please check your connection.',
        ERROR_TYPES.NETWORK_ERROR,
        context,
      );
    }

    return new AppError(error.message, ERROR_TYPES.UNKNOWN_ERROR, context);
  }

  /**
   * Subscribe to error events
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(error) {
    this.listeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  /**
   * Get recent errors
   */
  getRecent(limit = 10) {
    return this.errors.slice(-limit);
  }

  /**
   * Clear error history
   */
  clear() {
    this.errors = [];
  }

  /**
   * Get error statistics
   */
  getStats() {
    const stats = {};

    this.errors.forEach((error) => {
      stats[error.type] = (stats[error.type] || 0) + 1;
    });

    return stats;
  }
}

export const errorHandler = new ErrorHandler();

// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handle(event.reason, { source: 'unhandledRejection' });
  });

  window.addEventListener('error', (event) => {
    errorHandler.handle(event.error, { source: 'globalError' });
  });
}
