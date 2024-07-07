import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

// Create an Axios instance
let axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC__BASE_URL,
});

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

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // You can modify the request configuration here
    // For example, adding authentication headers
    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response interceptor (optional)
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle responses if needed
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    // Handle errors if needed
    return Promise.reject(error);
  }
);

export { axiosInstance, initializeAxiosWithToken };
