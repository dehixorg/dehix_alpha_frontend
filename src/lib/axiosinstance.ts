import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC__BASE_URL, 
});

axiosInstance.interceptors.request.use(
  config => {
    // You can modify the request configuration here
    // For example, adding authentication headers
    config.headers['Authorization'] = `Bearer YOUR_ACCESS_TOKEN`;
    return config;
  },
  error => {
    // Handle request errors
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => {
    // You can modify the response here
    console.log("RESPONSE:",response.data)
    return response;
  },
  error => {
    // Handle response errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
