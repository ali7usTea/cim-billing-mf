import axios, { AxiosError } from "axios";
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  withCredentials: true
});
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.location.href =
        import.meta.env.VITE_PUBLIC_AUTH_SERVER_URL == undefined
          ? ""
          : import.meta.env.VITE_PUBLIC_AUTH_SERVER_URL;
    }
    return Promise.reject(error);
  }
);
export default axiosClient;
