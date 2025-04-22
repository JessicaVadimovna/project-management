import { server } from '..//../mocks/server';
import { http, HttpResponse } from 'msw';

describe('API Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should fetch users successfully', async () => {
    const response = await fetch('http://127.0.0.1:8080/api/v1/users');
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.data).toHaveLength(2);
    expect(data.data[0]).toEqual({
      id: 1,
      fullName: 'User One',
      email: 'user1@example.com',
    });
  });

  it('should handle server error', async () => {
    server.use(
      http.get('http://127.0.0.1:8080/api/v1/users', () => {
        return HttpResponse.json([], { status: 500 });
      })
    );

    const response = await fetch('http://127.0.0.1:8080/api/v1/users');
    expect(response.status).toBe(500);
  });
});