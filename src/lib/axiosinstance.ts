import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create an Axios instance
let axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC__BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

// Simple in-flight request tracking for cancellation helpers
const inFlightControllers = new Map<string, AbortController>();
let requestCounter = 0;
const nextRequestId = () => `req_${Date.now()}_${++requestCounter}`;

// Interceptors attacher so new instances get the same behavior
function attachInterceptors(instance: AxiosInstance) {
  // Request interceptor to add cancellation without custom headers (avoids CORS preflight)
  instance.interceptors.request.use(
    (config) => {
      // Ensure each request has a signal and a request id held in config metadata (not headers)
      const meta = ((config as any).metadata ||= {});
      if (!meta.requestId) meta.requestId = nextRequestId();
      const requestId: string = meta.requestId;

      if (!config.signal) {
        const controller = new AbortController();
        config.signal = controller.signal;
        inFlightControllers.set(requestId, controller);
      }
      return config;
    },
    (error) => {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Request error');
      }
      return Promise.reject(error);
    },
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      const requestId = (response.config as any)?.metadata?.requestId as
        | string
        | undefined;
      if (requestId) inFlightControllers.delete(requestId);
      return response;
    },
    (error) => {
      // Skip noisy logs for cancellations
      const isCanceled =
        error?.code === 'ERR_CANCELED' ||
        error?.name === 'CanceledError' ||
        error?.name === 'AbortError';
      if (!isCanceled && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Response error');
      }
      try {
        const requestId = (error?.config as any)?.metadata?.requestId as
          | string
          | undefined;
        if (requestId) inFlightControllers.delete(requestId);
      } catch (err) {
        console.error('Error deleting request from inFlightControllers', err);
      }
      return Promise.reject(error);
    },
  );
}

attachInterceptors(axiosInstance);

// Function to initialize Axios with Bearer token
const initializeAxiosWithToken = (token: string | null) => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC__BASE_URL,
    timeout: 15000,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  attachInterceptors(instance);
  axiosInstance = instance;
};

// Helper: programmatically make a cancelable request with id exposure
export function makeCancelable<T = any>(
  method: 'get' | 'post' | 'put' | 'delete' | 'patch',
  url: string,
  config: AxiosRequestConfig = {},
) {
  const meta = ((config as any).metadata ||= {} as any);
  const id = meta.requestId || nextRequestId();
  const controller = new AbortController();
  inFlightControllers.set(id, controller);
  const finalConfig: AxiosRequestConfig = {
    ...config,
    signal: controller.signal,
    // Store request id in metadata only; do not add custom headers to avoid CORS preflight
    ...(meta.requestId
      ? {}
      : ({ metadata: { ...meta, requestId: id } } as any)),
  };

  const promise = (axiosInstance as any)[method](url, finalConfig) as Promise<
    AxiosResponse<T>
  >;
  const cancel = () => cancelRequest(id);
  return { id, cancel, promise } as const;
}

export function cancelRequest(id: string) {
  const controller = inFlightControllers.get(id);
  if (controller) {
    controller.abort();
    inFlightControllers.delete(id);
    return true;
  }
  return false;
}

export function cancelAllRequests() {
  inFlightControllers.forEach((controller, id) => {
    try {
      controller.abort();
    } finally {
      inFlightControllers.delete(id);
    }
  });
}

export { axiosInstance, initializeAxiosWithToken };
