import { useAppSelector } from '../store/hooks';
import { Link } from 'react-router-dom';
import { List, Card } from 'antd';
import './BoardsPage.css';

const BoardsPage = () => {
  const boards = useAppSelector(state => state.boards.boards);

  return (
    <div className="boards-page">
      <h1>Доски</h1>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
        dataSource={boards}
        renderItem={board => (
          <List.Item>
            <Link to={`/board/${board.id}`}>
              <Card title={board.title} hoverable>
                Перейти к доске
              </Card>
            </Link>
          </List.Item>
        )}
      />
    </div>
  );
};

export default BoardsPage;
