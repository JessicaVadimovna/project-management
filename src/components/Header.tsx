import { Button } from 'antd';
import { useAppDispatch } from '../store/hooks';
import { openModal } from '../store/modalSlice';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const dispatch = useAppDispatch();

  const handleCreateTask = () => {
    dispatch(openModal({ initialValues: {} }));
  };

  return (
    <header className="header">
      <nav className="nav-container">
        <div className="nav-links">
          <Link to="/issues">Все задачи</Link>
          <Link to="/boards">Проекты</Link>
        </div>
        <Button type="primary" onClick={handleCreateTask} className="create-task-btn">
          Создать задачу
        </Button>
      </nav>
    </header>
  );
};

export default Header;
