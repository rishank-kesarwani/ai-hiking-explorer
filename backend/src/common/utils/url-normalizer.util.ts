/**
 * Utility functions for normalizing and sanitizing API URLs
 */
export class UrlNormalizerUtil {
  /**
   * Normalizes a base URL and path, ensuring no trailing slash on base,
   * no duplicate `/api/v1` prefixes, and properly formatted paths.
   */
  static normalizeApiUrl(baseUrl: string, path: string): string {
    const cleanBase = (baseUrl || '').trim().replace(/\/+$/, '');
    let cleanPath = (path || '').trim();

    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    // Check if base already includes /api/v1 and path starts with /api/v1
    const baseHasApiV1 = /\/api\/v1\/?$/i.test(cleanBase);
    const pathHasApiV1 = /^\/api\/v1/i.test(cleanPath);

    if (baseHasApiV1 && pathHasApiV1) {
      cleanPath = cleanPath.replace(/^\/api\/v1/, '');
    }

    return `${cleanBase}${cleanPath}`;
  }

  /**
   * Strips duplicate slashes within paths while preserving http(s):// protocols
   */
  static cleanPathSlashes(url: string): string {
    return url.replace(/([^:]\/)\/+/g, '$1');
  }
}
