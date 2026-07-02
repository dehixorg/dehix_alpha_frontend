/* eslint-disable @typescript-eslint/no-unused-vars */
type Handler = (...args: any[]) => void;

export type Socket = {
  emit: (event: string, payload?: unknown) => void;
  on: (event: string, handler: Handler) => void;
  disconnect: () => void;
};

export function io(..._args: any[]): Socket {
  return {
    emit: () => undefined,
    on: () => undefined,
    disconnect: () => undefined,
  };
}
