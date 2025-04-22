import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import Header from '../components/Header';
import { MemoryRouter } from 'react-router-dom';

const mockStore = configureStore([]);

describe('Header', () => {
    it('должен отображать навигационные ссылки', () => {
        const store = mockStore({});
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            </Provider>
        );
        expect(screen.getByText('Все задачи')).toBeInTheDocument();
        expect(screen.getByText('Проекты')).toBeInTheDocument();
    });

    it('должен открывать модальное окно при клике на кнопку', () => {
        const store = mockStore({});
        const dispatch = jest.spyOn(store, 'dispatch');
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Header />
                </MemoryRouter>
            </Provider>
        );
        fireEvent.click(screen.getByText('Создать задачу'));
        expect(dispatch).toHaveBeenCalledWith({ type: 'modal/openModal', payload: { initialValues: {} } });
    });
});