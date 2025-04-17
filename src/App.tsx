import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BoardsPage from './pages/BoardsPage';
import BoardPage from './pages/BoardPage';
import IssuesPage from './pages/IssuesPage';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/boards" element={<BoardsPage />} />
        <Route path="/board/:id" element={<BoardPage />} />
        <Route path="/issues" element={<IssuesPage />} />
      </Routes>
    </div>
  );
}

export default App;
