import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://tansiqy.runasp.net";

/** Build proxy URL used in dev (Vite) and production (Vercel serverless). */
export function proxyUrl(endpoint) {
    const path = endpoint.replace(/^\//, "");
    return `/api/proxy?path=${encodeURIComponent(path)}`;
}

/** Direct backend URL — only when proxy is unavailable. */
export function backendUrl(endpoint) {
    const path = endpoint.replace(/^\//, "");
    return `${API_BASE.replace(/\/$/, "")}/${path}`;
}

const apiClient = axios.create({
    timeout: 60000,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("adminToken");
    if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("adminToken");
            if (!window.location.pathname.startsWith("/login")) {
                window.location.assign("/login");
            }
        }
        return Promise.reject(error);
    }
);

function resolveUrl(endpoint) {
    return proxyUrl(endpoint);
}

export const api = {
    get: (endpoint, config) => apiClient.get(resolveUrl(endpoint), config),
    post: (endpoint, data, config) => apiClient.post(resolveUrl(endpoint), data, config),
    put: (endpoint, data, config) => apiClient.put(resolveUrl(endpoint), data, config),
    patch: (endpoint, data, config) => apiClient.patch(resolveUrl(endpoint), data, config),
    delete: (endpoint, config) => apiClient.delete(resolveUrl(endpoint), config),
};

export function getErrorMessage(error, fallback = "حدث خطأ غير متوقع") {
    const data = error.response?.data;
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.title) return data.title;
    if (data.errors) return Object.values(data.errors).flat().join(" | ");
    return fallback;
}

export default apiClient;
