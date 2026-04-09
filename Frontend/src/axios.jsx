import axios from "axios";

const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

// API instance for backend calls
const API = axios.create({
  baseURL: configuredBaseUrl || "/api",
});

// Image instance for static image requests
const IMAGE_API = axios.create({
  baseURL: "/images",
});

// Request interceptor for API calls
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Request interceptor for image requests (no auth needed typically)
IMAGE_API.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  return config;
});

// Error handling for both
const setupErrorInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
};

setupErrorInterceptor(API);
setupErrorInterceptor(IMAGE_API);

export { API, IMAGE_API };
export default API;
