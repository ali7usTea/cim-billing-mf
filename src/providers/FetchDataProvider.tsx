import { useEffect, useState } from "react";
import axiosClient from "../utils/axios";

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const useFetchData = <T,>(endpoint: string): ApiResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosClient.get<T>(endpoint);
        setData(response.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

export default useFetchData;
