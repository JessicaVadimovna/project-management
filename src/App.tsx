import { Routes, Route } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import Header from './components/Header';
import IssuesPage from './pages/IssuesPage';
import BoardsPage from './pages/BoardsPage';
import BoardPage from './pages/BoardPage';
import TaskModal from './components/TaskModal';
import './App.css';

function App() {
  const { isOpen, taskId, initialValues, redirectToBoard } = useAppSelector(
    state => state.modal
  );

  return (
    <div className="app">
      <Header />
      <Routes>
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
