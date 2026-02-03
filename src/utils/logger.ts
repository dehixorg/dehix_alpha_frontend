/**
 * Central logger – no-op in production, console in development.
 * Replace with Sentry/LogRocket in production if needed.
 */
const isDev =
  typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (isDev) console.error(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDev) console.warn(message, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDev) console.info(message, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (isDev) console.debug(message, ...args);
  },
};
