import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Helper to get token
const getStoredToken = () => Cookies.get("token") || null;

// Request Interceptor: Attach JWT to every request
api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor: Handle auth errors (expired tokens)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Only redirect if it's NOT a login/register request
            if (!isAuthRequest) {
                // Token is invalid/expired - clear local session
                Cookies.remove("token");
                Cookies.remove("user");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
