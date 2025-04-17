import { Link } from 'react-router-dom';
import { Button } from 'antd';

const Header = () => {
  return (
    <header style={{ padding: '10px', background: '#f0f2f5' }}>
      <Link to="/issues">Все задачи</Link> | <Link to="/boards">Доски</Link> |{' '}
      <Button type="primary">Создать задачу</Button>
    </header>
  );
};

export default Header;
