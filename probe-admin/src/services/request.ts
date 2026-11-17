import axios, { AxiosRequestConfig } from 'axios';

interface ApiResponse<T> {
  code: number;
  desc: string;
  data: T;
}

export async function request<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
  const token = localStorage.getItem('token');
  const response = await axios.request<ApiResponse<T>>({
    url,
    ...options,
    headers: { ...options?.headers, ...(token ? { token } : {}) },
  });
  if (response.data.code !== 0) throw new Error(response.data.desc);
  return response.data.data;
}
