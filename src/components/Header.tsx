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
      <nav>
        <Link to="/issues">Все задачи</Link>
        <Link to="/boards">Доски</Link>
        <Button type="primary" onClick={handleCreateTask}>
          Создать задачу
        </Button>
      </nav>
    </header>
  );
};

export default Header;
