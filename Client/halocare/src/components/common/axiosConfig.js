// src/components/common/axiosConfig.js
import axios from 'axios';
import { Navigate } from 'react-router-dom';

// Set the base URL
// axios.defaults.baseURL = 'https://localhost:7225/api';
axios.defaults.baseURL = 'https://proj.ruppin.ac.il/bgroup3/prod/api';

// 🔥 List of public endpoints that do not require a token
const publicEndpoints = [
  '/ParentForm/validate',
  '/ParentForm/form/',
  '/ParentForm/submit',
  '/Auth/reset-password',
  '/Auth/forgot-password', 
  '/Auth/login',
];

// 🔥 Check if the path is public
const isPublicEndpoint = (url) => {
  return publicEndpoints.some((endpoint) => url.includes(endpoint));
};

// Add an interceptor to include the token only for private requests
axios.interceptors.request.use(
  (config) => {
    // Add token only if it's not a public endpoint
    if (!isPublicEndpoint(config.url)) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors (401)
axios.interceptors.response.use(
  
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {

      // 🔥 Extended check for public pages
      const currentPath = window.location.pathname + window.location.hash;
      const publicPaths = ['/login', '/reset-password', '/parent-form'];
      const isPublicPage = publicPaths.some((path) => currentPath.includes(path));

      // 🔥 Redirect to login only if it's not a public page
      if (!isPublicPage) {
        // window.location.href = `${window.location.origin}/bgroup3/prod/#/login`;
        window.location.href = `${window.location.origin}/#/login`;
        // const navigate = useNavigate();
        // navigate('/login');
      }

      return Promise.reject({ silent: true });
    }
    return Promise.reject(error);
  }
);

export default axios;

export const baseURL = axios.defaults.baseURL;