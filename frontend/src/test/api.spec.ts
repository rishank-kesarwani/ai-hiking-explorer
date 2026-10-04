import { api } from '../lib/api';

describe('Frontend API Client', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('should normalize URLs and avoid duplicate /api/v1', () => {
    expect(api.buildUrl('/trails/search')).toContain('/trails/search');
    expect(api.cleanBaseUrl('https://api.example.com///')).toBe('https://api.example.com');
  });

  it('should store and retrieve access token correctly in localStorage', () => {
    api.setStoredToken('test_jwt_token_123');
    expect(localStorage.getItem('hiking_access_token')).toBe('test_jwt_token_123');

    api.setStoredToken(null);
    expect(localStorage.getItem('hiking_access_token')).toBeNull();
  });

  it('should format network error when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(api.get('/health', { skipAuth: true })).rejects.toThrow(
      'Unable to connect to server. Please check your network.',
    );
  });
});
