import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import BoardPage from '../pages/BoardPage';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';

const mockStore = configureStore([]);
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

const renderComponent = (store: MockStoreEnhanced<unknown, {}>, initialEntries = ['/board/1']) =>
    render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={initialEntries}>
                    <Routes>
                        <Route path="/board/:id" element={<BoardPage />} />
                    </Routes>
                </MemoryRouter>
            </QueryClientProvider>
        </Provider>
    );

describe('BoardPage', () => {
    it('должен отображать состояние загрузки', () => {
        const store = mockStore({ tasks: { tasks: [] }, users: { users: [] }, boards: { boards: [] } });
        renderComponent(store);
        expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    });

    it('должен отображать название доски и задачи', async () => {
        const store = mockStore({
            tasks: { tasks: [] },
            users: { users: [{ id: '1', name: 'User One' }] },
            boards: { boards: [{ id: '1', name: 'Board 1' }] },
        });
        renderComponent(store);
        await waitFor(() => {
            expect(screen.getByText('Board 1')).toBeInTheDocument();
            expect(screen.getByText('Task 1')).toBeInTheDocument();
        });
    });

    it('должен отображать сообщение "Задачи отсутствуют"', async () => {
        server.use(
            http.get('http://127.0.0.1:8080/api/v1/boards/1', () => {
                return HttpResponse.json({ data: [] });
            })
        );
        const store = mockStore({
            tasks: { tasks: [] },
            users: { users: [] },
            boards: { boards: [{ id: '1', name: 'Board 1' }] },
        });
        renderComponent(store);
        await waitFor(() => {
            expect(screen.getByText('Задачи отсутствуют')).toBeInTheDocument();
        });
    });
});