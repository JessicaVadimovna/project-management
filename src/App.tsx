import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setUsers } from './store/usersSlice';
import Header from './components/Header';
import IssuesPage from './pages/IssuesPage';
import BoardsPage from './pages/BoardsPage';
import BoardPage from './pages/BoardPage';
import TaskModal from './components/TaskModal';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers, mapServerUserToClient } from './api/api';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const { isOpen, taskId, initialValues, redirectToBoard } = useAppSelector(
    state => state.modal
  );

  const { data: serverUsers, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  useEffect(() => {
    if (serverUsers && Array.isArray(serverUsers)) {
      dispatch(setUsers(serverUsers.map(mapServerUserToClient)));
    }
  }, [serverUsers, dispatch]);

  if (isLoading) return <div>Загрузка...</div>;

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<BoardsPage />} /> {/* Добавлен маршрут для корня */}
        <Route path="/issues" element={<IssuesPage />} />
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/board/:id" element={<BoardPage />} />
      </Routes>
      <TaskModal
        visible={isOpen}
        taskId={taskId}
        initialValues={initialValues}
        redirectToBoard={redirectToBoard}
      />
    </div>
  );
}

export default App;
