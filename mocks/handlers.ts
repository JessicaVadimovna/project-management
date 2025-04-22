import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('http://127.0.0.1:8080/api/v1/users', () => {
    return HttpResponse.json({
      data: [
        { id: 1, fullName: 'User One', email: 'user1@example.com' },
        { id: 2, fullName: 'User Two', email: 'user2@example.com' },
      ],
    });
  }),
  http.post('http://127.0.0.1:8080/api/v1/users', async ({ request }) => {
    const newUser = await request.json();
    return HttpResponse.json({ id: 3, ...newUser }, { status: 201 });
  }),
];