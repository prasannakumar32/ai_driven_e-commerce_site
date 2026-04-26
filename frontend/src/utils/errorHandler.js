/**
 * Centralized Error Handler
 * Converts HTTP status codes and network errors into friendly, human-readable messages.
 */

const STATUS_MESSAGES = {
  400: 'The information you provided is invalid. Please check your details and try again.',
  401: 'You need to log in to do that. Please sign in and try again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'We couldn\'t find what you were looking for. It may have been moved or deleted.',
  408: 'The request took too long. Please check your connection and try again.',
  409: 'There\'s a conflict with your request. The item may already exist.',
  422: 'Some of the information you provided is invalid. Please review and try again.',
  429: 'Too many requests. Please wait a moment before trying again.',
  500: 'Something went wrong on our end. Our team has been notified. Please try again shortly.',
  502: 'Our server is temporarily unavailable. Please try again in a few minutes.',
  503: 'The service is currently under maintenance. Please try again later.',
  504: 'The server took too long to respond. Please try again.',
};

const NETWORK_MESSAGES = {
  ERR_NETWORK: 'Unable to connect to the server. Please check your internet connection.',
  ECONNABORTED: 'The request timed out. Please try again.',
  ERR_CANCELED: 'The request was cancelled. Please try again.',
};

/**
 * Extracts a user-friendly error message from an Axios error object.
 * Priority: backend message > status-based message > network message > generic fallback
 *
 * @param {Error} error - The Axios error object
 * @param {string} [fallback] - An optional custom fallback message
 * @returns {string} A user-friendly error message
 */
export const getFriendlyError = (error, fallback = 'Something went wrong. Please try again.') => {
  // If the error already has a friendlyMessage attached by the interceptor, use it
  if (error?.friendlyMessage) {
    return error.friendlyMessage;
  }

  // Network / timeout errors
  if (error?.code && NETWORK_MESSAGES[error.code]) {
    return NETWORK_MESSAGES[error.code];
  }

  // If there's a response from the server
  if (error?.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;

    // For 400 and 422, prefer the server's specific validation message
    if ((status === 400 || status === 422) && serverMessage) {
      return serverMessage;
    }

    // For 500+, never show raw server internals, use generic message
    if (status >= 500) {
      return STATUS_MESSAGES[status] || STATUS_MESSAGES[500];
    }

    // Use server message if available, otherwise use the status-based message
    return serverMessage || STATUS_MESSAGES[status] || fallback;
  }

  // Error has a message but no response (e.g. thrown manually)
  if (error?.message && !error.message.includes('status code')) {
    return error.message;
  }

  return fallback;
};

/**
 * Returns the appropriate severity for a MUI Alert based on the error type.
 * @param {Error} error
 * @returns {'error'|'warning'|'info'}
 */
export const getErrorSeverity = (error) => {
  const status = error?.response?.status;
  if (!status) return 'error';
  if (status === 401 || status === 403) return 'warning';
  if (status === 404) return 'info';
  return 'error';
};

export default getFriendlyError;
