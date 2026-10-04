import { UrlNormalizerUtil } from './url-normalizer.util';

describe('UrlNormalizerUtil', () => {
  it('should trim trailing slashes from base URL and append clean path', () => {
    const url = UrlNormalizerUtil.normalizeApiUrl('http://localhost:4000///', '/trails/search');
    expect(url).toBe('http://localhost:4000/trails/search');
  });

  it('should avoid duplicate /api/v1 prefix when baseUrl already ends with /api/v1', () => {
    const url = UrlNormalizerUtil.normalizeApiUrl(
      'https://api.hiking-explorer.com/api/v1',
      '/api/v1/trails/search',
    );
    expect(url).toBe('https://api.hiking-explorer.com/api/v1/trails/search');
  });

  it('should clean internal redundant slashes', () => {
    const cleaned = UrlNormalizerUtil.cleanPathSlashes('https://domain.com//api///v1//trails');
    expect(cleaned).toBe('https://domain.com/api/v1/trails');
  });
});
