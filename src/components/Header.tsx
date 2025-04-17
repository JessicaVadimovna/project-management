import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { useAppDispatch } from '../store/hooks';
import { openModal } from '../store/modalSlice';
import './Header.css';

const Header = () => {
  const dispatch = useAppDispatch();

  return (
    <header className="header">
      <nav>
        <Link to="/issues">Все задачи</Link>
        <Link to="/boards">Доски</Link>
        <Button
          type="primary"
          onClick={() => dispatch(openModal({ initialValues: {} }))}
        >
          Создать задачу
        </Button>
      </nav>
    </header>
  );
};

export default Header;
