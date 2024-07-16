import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Create an Axios instance
let axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC__BASE_URL,
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
  });
};

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the config for debugging
    console.log('Request config:', config);
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
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    // Handle errors if needed
    console.error('Response error:', error);
    return Promise.reject(error);
  },
);

export { axiosInstance, initializeAxiosWithToken };
