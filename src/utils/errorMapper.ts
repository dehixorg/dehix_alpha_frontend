export const mapErrorMessage = (originalMessage: string): string => {
  const errorMap: Record<string, string> = {
    'Internal Server Error':
      'Service temporarily unavailable. Please try again later.',
    '500': 'Service temporarily unavailable. Please try again later.',
    '502': 'Service temporarily unavailable. Please try again later.',
    '503': 'Service temporarily unavailable. Please try again later.',
    '504': 'Request timed out. Please check your connection and try again.',
    'Network Error':
      'Connection issue detected. Please check your internet connection.',
    ERR_CANCELED: 'Request was cancelled.',
    ECONNABORTED: 'Request was cancelled.',
    ETIMEDOUT: 'Connection timed out. Please try again.',
    ERR_NETWORK: 'Network connection failed. Please check your internet.',
    'No response from server': 'Server is not responding. Please try again.',
    'Request failed with status code 500': 'Service temporarily unavailable.',
    'Failed to load job listings': 'Projects are temporarily unavailable.',
    'Failed to load job listings. Please try again.':
      'Projects are temporarily unavailable.',
    'An unexpected error occurred while loading job listings.':
      'Projects are temporarily unavailable.',
    'Something went wrong. Please try again.':
      'Projects are temporarily unavailable.',
    'Failed to load filter options.': 'Filters are temporarily unavailable.',
    'Failed to update project status.':
      'Project update temporarily unavailable.',
    default: 'An unexpected error occurred. Please try again.',
  };

  return (
    errorMap[originalMessage] ||
    errorMap[originalMessage.split(' ').pop() || ''] ||
    errorMap.default ||
    originalMessage.replace(
      'Internal Server Error',
      'Service temporarily unavailable',
    )
  );
};
