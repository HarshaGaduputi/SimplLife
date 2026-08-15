export const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[SimplLife INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[SimplLife WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`[SimplLife ERROR] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    console.debug(`[SimplLife DEBUG] ${message}`, ...args);
  },
};
