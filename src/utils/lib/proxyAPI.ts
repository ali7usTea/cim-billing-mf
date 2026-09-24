import axios from "axios";
// export const proxyURL = `/api/proxy?url=${import.meta.env.VITE_PUBLIC_API_PROXY}`;
export const proxyURL = import.meta.env.VITE_PUBLIC_API_PROXY;
export const imageURL = import.meta.env.VITE_PUBLIC_IMAGE_URL;
export const debugReportURL = import.meta.env.VITE_PUBLIC_DEBUG_REPORT_URL;

const apiAxios = axios.create({
  baseURL: proxyURL // Proxy URL from .env for Axios.
});

// Optional: Set up interceptors or handlers if needed
// apiAxios.interceptors.request.use(config => {
//     // you can add headers or modify the request before sending.
//     console.log("Request sent:", config);
//     return config;
// })

export default apiAxios;
