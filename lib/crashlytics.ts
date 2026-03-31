import crashlytics from '@react-native-firebase/crashlytics';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Log an error to Firebase Crashlytics with optional context
 */
export const logError = (error: Error | string, context?: ErrorContext) => {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log to Crashlytics
    if (errorStack) {
      crashlytics().recordError(error instanceof Error ? error : new Error(errorMessage));
    } else {
      crashlytics().recordError(new Error(errorMessage));
    }

    // Add context as custom keys
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        crashlytics().setAttribute(key, String(value));
      });
    }

    // Also log to console for development
    console.error(`[Crashlytics] ${errorMessage}`, context);
  } catch (err) {
    // Fallback if Crashlytics fails
    console.error('Failed to log error to Crashlytics:', err);
  }
};

/**
 * Set user context for better error tracking
 */
export const setUserContext = (userId: string, userName?: string) => {
  try {
    crashlytics().setUserId(userId);
    if (userName) {
      crashlytics().setAttribute('userName', userName);
    }
  } catch (err) {
    console.error('Failed to set user context:', err);
  }
};

/**
 * Clear user context (e.g., on logout)
 */
export const clearUserContext = () => {
  try {
    crashlytics().setUserId('');
  } catch (err) {
    console.error('Failed to clear user context:', err);
  }
};
