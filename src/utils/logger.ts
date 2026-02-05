/**
 * Central logger for consistent logging across the application.
 * - Errors are always logged (important for production monitoring)
 * - Warnings/info/debug only in development
 * Replace with Sentry/LogRocket in production if needed.
 */
const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    // Always log errors, even in production (for error tracking)
    // eslint-disable-next-line no-console
    console.error(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    if (isDev) console.warn(message, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    if (isDev) console.info(message, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    // eslint-disable-next-line no-console
    if (isDev) console.debug(message, ...args);
  },
};
