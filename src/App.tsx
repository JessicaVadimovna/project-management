import { Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from './components/Header';
import BoardsPage from './pages/BoardsPage';
import IssuesPage from './pages/IssuesPage';
import BoardPage from './pages/BoardPage';
import TaskModal from './components/TaskModal';
import { store } from './store';
import { useAppSelector } from './store/hooks';
import { RootState } from './store';
import { Task } from './types/types';
import './App.css';

const queryClient = new QueryClient();

interface ModalState {
  isOpen: boolean;
  taskId: string | null;
  initialValues: Partial<Task>;
  redirectToBoard: string | null;
  isCreatingFromBoard: boolean;
}

function AppContent() {
  const {
    isOpen,
    taskId,
    initialValues,
    redirectToBoard,
    isCreatingFromBoard,
  } = useAppSelector((state: RootState) => state.modal) as ModalState;

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<BoardsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/boards" element={<BoardsPage />} />
          <Route path="/board/:id" element={<BoardPage />} />
        </Routes>
      </main>
      <TaskModal
        visible={isOpen}
        taskId={taskId}
        initialValues={initialValues}
        redirectToBoard={redirectToBoard}
        isCreatingFromBoard={isCreatingFromBoard}
      />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
