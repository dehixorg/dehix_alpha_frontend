import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create an Axios instance
let axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC__BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

// Simple in flight request tracking for cancellation helpers
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
      return handleRetry(error);
    },
  );
}

// -----------------------------
// Lightweight retry/backoff
// -----------------------------

type RetryMeta = {
  retryCount?: number;
  requestId?: string;
};

const MAX_RETRIES = Number(process.env.NEXT_PUBLIC_HTTP_MAX_RETRIES || 2);
const BASE_DELAY_MS = Number(
  process.env.NEXT_PUBLIC_HTTP_RETRY_BASE_DELAY_MS || 300,
);
const MAX_DELAY_MS = Number(
  process.env.NEXT_PUBLIC_HTTP_RETRY_MAX_DELAY_MS || 3000,
);

function isIdempotent(method?: string) {
  const m = (method || 'get').toUpperCase();
  return m === 'GET' || m === 'HEAD' || m === 'OPTIONS';
}

function isRetriableStatus(status?: number) {
  if (!status) return false;
  return status === 429 || status === 503 || status === 502 || status === 408; // too many, service unavailable, bad gateway, timeout
}

function isNetworkError(err: any) {
  const code = err?.code;
  return (
    err?.message === 'Network Error' ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    code === 'ERR_NETWORK'
  );
}

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function computeDelay(attempt: number) {
  const exp = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * Math.pow(2, attempt));
  const jitter = Math.random() * 0.25 * exp; // +/- 25% jitter
  return Math.floor(exp - jitter);
}

async function handleRetry(error: any) {
  const config = error?.config as AxiosRequestConfig & { metadata?: RetryMeta };
  if (!config) return Promise.reject(error);

  // Do not retry if explicitly disabled
  const retryDisabled = (config as any)?.noRetry === true;
  if (retryDisabled) return Promise.reject(error);

  // Only retry idempotent methods
  if (!isIdempotent(config.method)) return Promise.reject(error);

  // Determine if error is retriable
  const status = error?.response?.status as number | undefined;
  const retriable = isNetworkError(error) || isRetriableStatus(status);
  if (!retriable) return Promise.reject(error);

  // Track attempts on metadata
  const meta = (config.metadata ||= {} as RetryMeta);
  meta.retryCount = (meta.retryCount || 0) + 1;
  if (meta.retryCount > MAX_RETRIES) return Promise.reject(error);

  const delay = computeDelay(meta.retryCount - 1);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      `Retrying ${config.method?.toUpperCase()} ${config.url} (attempt ${meta.retryCount}/${MAX_RETRIES}) in ${delay}ms`,
    );
  }
  await sleep(delay);

  // Recreate AbortController for the retry
  const newController = new AbortController();
  (config as any).signal = newController.signal;
  // Preserve requestId if present; keep it tracked
  try {
    const requestId = meta.requestId;
    if (requestId) inFlightControllers.set(requestId, newController);
  } catch (err) {
    console.error('Error deleting request from inFlightControllers', err);
  }

  return axiosInstance.request(config);
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
