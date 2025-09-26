export const newAbort = () => {
  const controller = new AbortController();
  return { controller, signal: controller.signal } as const;
};
