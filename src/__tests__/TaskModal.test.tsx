import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import TaskModal from '../components/TaskModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

const mockStore = configureStore([]);
const queryClient = new QueryClient();

const renderComponent = (store: MockStoreEnhanced<unknown, {}>, props: TaskModalProps) =>
    render(
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <TaskModal {...props} />
                </MemoryRouter>
            </QueryClientProvider>
        </Provider>
    );

describe('TaskModal', () => {
    const store = mockStore({
        boards: { boards: [{ id: '1', title: 'Board 1' }] },
        users: { users: [{ id: '1', name: 'User One' }] },
        tasks: { tasks: [] },
    });

    it('должен отображать форму создания задачи', () => {
        renderComponent(store, { visible: true, taskId: null, initialValues: {}, redirectToBoard: null, isCreatingFromBoard: false });
        expect(screen.getByText('Создать задачу')).toBeInTheDocument();
        expect(screen.getByLabelText('Название')).toBeInTheDocument();
    });

    it('должен валидировать поля формы', async () => {
        renderComponent(store, { visible: true, taskId: null, initialValues: {}, redirectToBoard: null, isCreatingFromBoard: false });
        fireEvent.click(screen.getByText('Создать'));
        await waitFor(() => {
            expect(screen.getByText('Введите название задачи')).toBeInTheDocument();
        });
    });

    it('должен сохранять черновик', async () => {
        renderComponent(store, { visible: true, taskId: null, initialValues: {}, redirectToBoard: null, isCreatingFromBoard: false });
        fireEvent.input(screen.getByLabelText('Название'), { target: { value: 'Test Task' } });
        const draft = JSON.parse(localStorage.getItem('taskDraft') || '{}');
        expect(draft.title).toBe('Test Task');
    });
});