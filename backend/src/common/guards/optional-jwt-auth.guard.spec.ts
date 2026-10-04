import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

describe('OptionalJwtAuthGuard', () => {
  let guard: OptionalJwtAuthGuard;

  beforeEach(() => {
    guard = new OptionalJwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return null instead of throwing when user is not present or error occurs', () => {
    const resultWithError = guard.handleRequest(new Error('JWT expired'), null);
    expect(resultWithError).toBeNull();

    const resultWithNoUser = guard.handleRequest(null, null);
    expect(resultWithNoUser).toBeNull();
  });

  it('should return user object when valid user is provided', () => {
    const user = { userId: '123', email: 'test@example.com' };
    const result = guard.handleRequest(null, user);
    expect(result).toEqual(user);
  });
});
