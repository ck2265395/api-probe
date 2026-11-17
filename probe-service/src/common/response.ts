export interface ApiResponse<T> {
  code: number;
  desc: string;
  data: T;
}

export function success<T>(data: T, desc = 'success'): ApiResponse<T> {
  return { code: 0, desc, data };
}

