import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create an Axios instance
let axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC__BASE_URL,
  timeout: 30000, // 30 seconds timeout
  maxContentLength: 5 * 1024 * 1024, // 5MB max content length
  maxBodyLength: 5 * 1024 * 1024, // 5MB max body length
});

// Log the base URL for debugging
console.log('Base URL:', process.env.NEXT_PUBLIC__BASE_URL);

// Function to initialize Axios with Bearer token
const initializeAxiosWithToken = (token: string | null) => {
  console.log('Initializing Axios with token:', token);
  axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC__BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    timeout: 30000, // 30 seconds timeout
    maxContentLength: 5 * 1024 * 1024, // 5MB max content length
    maxBodyLength: 5 * 1024 * 1024, // 5MB max body length
  });
};

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the config for debugging
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data instanceof FormData ? 'FormData' : config.data
    });
    return config;
  },
  (error) => {
    // Handle request errors
    console.error('Request error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor (optional)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log the response for debugging
    console.log('Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Handle errors if needed
    console.error('Response error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data instanceof FormData ? 'FormData' : error.config?.data
      }
    });
    return Promise.reject(error);
  },
);

export { axiosInstance, initializeAxiosWithToken };
