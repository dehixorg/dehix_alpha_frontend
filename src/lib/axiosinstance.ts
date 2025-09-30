import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Default base URL if environment variable is not set
const DEFAULT_BASE_URL = 'http://localhost:8080';

// Get base URL from environment variable with fallback
const getBaseUrl = () => {
  // Try both NEXT_PUBLIC_BASE_URL and NEXT_PUBLIC__BASE_URL for backward compatibility
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC__BASE_URL ||
    DEFAULT_BASE_URL
  );
};

// Log the base URL for debugging
console.log('Initializing axios with base URL:', getBaseUrl());

// Create an Axios instance
let axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 second timeout
});

// Function to initialize Axios with Bearer token
const initializeAxiosWithToken = (token: string | null) => {
  if (!token) {
    console.warn('No token provided to initializeAxiosWithToken');
    return;
  }

  axiosInstance = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000, // 10 second timeout
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('Axios instance reinitialized with token');
};

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the config for debugging

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

    return response;
  },
  (error) => {
    // Handle errors if needed
    console.error('Response error:', error);
    return Promise.reject(error);
  },
);

export { axiosInstance, initializeAxiosWithToken };
