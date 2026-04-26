import { env } from "@/config/env";
import { getToken } from "./auth";

export const API_BASE_URL = env.API_URL;

export interface ApiErrorResponse {
  message: string;
  success?: boolean;
  stack?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: ApiErrorResponse,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data.message || `API Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiError(error.message, 500);
    }
    throw new ApiError("An unexpected error occurred", 500);
  }
}
