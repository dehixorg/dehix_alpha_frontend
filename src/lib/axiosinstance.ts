import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create an Axios instance
let axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC__BASE_URL,
});

// Log the base URL for debugging

// Function to initialize Axios with Bearer token
const initializeAxiosWithToken = (token: string | null) => {
  axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC__BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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
