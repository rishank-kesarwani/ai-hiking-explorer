/**
 * Production API Client for AI Hiking Explorer
 * Includes:
 * - URL normalization & duplicate /api/v1 prevention
 * - Request timeout handling with AbortController
 * - Concurrency-safe 401 token refresh (refreshes exactly once)
 * - Infinite loop prevention
 * - Network error handling & friendlier messages
 */

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

export interface ApiResponseEnvelope<T> {
  statusCode: number;
  data: T;
  meta?: Record<string, any>;
  timestamp: string;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string | null) => void> = [];
  private onAuthRequiredCallback: (() => void) | null = null;

  constructor() {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    this.baseUrl = this.cleanBaseUrl(rawUrl);
  }

  public setOnAuthRequired(callback: () => void) {
    this.onAuthRequiredCallback = callback;
  }

  public cleanBaseUrl(url: string): string {
    return (url || '').trim().replace(/\/+$/, '');
  }

  public buildUrl(path: string): string {
    const cleanBase = this.baseUrl;
    let cleanPath = (path || '').trim();

    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    // Check if base ends with /api/v1 and path starts with /api/v1
    const baseHasV1 = /\/api\/v1$/i.test(cleanBase);
    const pathHasV1 = /^\/api\/v1(\/|$)/i.test(cleanPath);

    if (baseHasV1 && pathHasV1) {
      cleanPath = cleanPath.replace(/^\/api\/v1/, '');
      if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    }

    const full = `${cleanBase}${cleanPath}`;
    return full.replace(/([^:]\/)\/+/g, '$1');
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('hiking_access_token');
  }

  public setStoredToken(token: string | null) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem('hiking_access_token', token);
    } else {
      localStorage.removeItem('hiking_access_token');
    }
  }

  private onTokenRefreshed(token: string | null) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string | null) => void) {
    this.refreshSubscribers.push(callback);
  }

  public async request<T = any>(
    path: string,
    options: ApiRequestOptions = {},
    isRetry = false,
  ): Promise<T> {
    const url = this.buildUrl(path);
    const timeoutMs = options.timeoutMs || 15000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // If external signal provided, listen to it
    if (options.signal) {
      options.signal.addEventListener('abort', () => controller.abort());
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!options.skipAuth) {
      const token = this.getStoredToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include HTTP-only cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized with single refresh attempt
      if (response.status === 401 && !options.skipAuth && !isRetry) {
        return this.handle401AndRetry<T>(path, options);
      }

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMsg =
          typeof responseData === 'object' && responseData !== null
            ? (responseData as any).message || (responseData as any).error || `Request failed with status ${response.status}`
            : responseData || `HTTP ${response.status}`;

        const err: any = new Error(Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg);
        err.statusCode = response.status;
        err.data = responseData;
        throw err;
      }

      // If NestJS TransformInterceptor wrapped the response in { statusCode, data }
      if (responseData && typeof responseData === 'object' && 'data' in responseData && 'statusCode' in responseData) {
        return responseData.data as T;
      }

      return responseData as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        const timeoutError: any = new Error('Network request timed out. Please check your internet connection.');
        timeoutError.isTimeout = true;
        throw timeoutError;
      }

      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const netError: any = new Error('Unable to connect to server. Please check your network.');
        netError.isNetworkError = true;
        throw netError;
      }

      throw error;
    }
  }

  private async handle401AndRetry<T>(path: string, options: ApiRequestOptions): Promise<T> {
    if (this.isRefreshing) {
      // Queue concurrent request until refresh completes
      return new Promise((resolve, reject) => {
        this.addRefreshSubscriber((newToken) => {
          if (newToken) {
            resolve(this.request<T>(path, options, true));
          } else {
            reject(new Error('Session expired. Please log in again.'));
          }
        });
      });
    }

    this.isRefreshing = true;

    try {
      const refreshRes = await fetch(this.buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!refreshRes.ok) {
        throw new Error('Refresh failed');
      }

      const refreshData = await refreshRes.json();
      const newAccessToken =
        refreshData?.data?.accessToken ||
        refreshData?.accessToken ||
        null;

      if (newAccessToken) {
        this.setStoredToken(newAccessToken);
      }

      this.isRefreshing = false;
      this.onTokenRefreshed(newAccessToken);

      // Retry original request exactly once
      return this.request<T>(path, options, true);
    } catch (refreshErr) {
      this.isRefreshing = false;
      this.setStoredToken(null);
      this.onTokenRefreshed(null);

      if (this.onAuthRequiredCallback) {
        this.onAuthRequiredCallback();
      }

      const err: any = new Error('Session expired. Please sign in to continue.');
      err.statusCode = 401;
      throw err;
    }
  }

  // HTTP Helper Methods
  get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient();
