import { useEffect } from 'react';
import { Card } from 'antd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setBoards } from '../store/boardsSlice';
import { useQuery } from '@tanstack/react-query';
import { fetchBoards, mapServerBoardToClient } from '../api/api';
import './BoardsPage.css';
import { Link } from 'react-router-dom';

const BoardsPage = () => {
  const dispatch = useAppDispatch();
  const boards = useAppSelector(state => state.boards.boards);

  const { data: serverBoards, isLoading, error } = useQuery({
    queryKey: ['boards'],
    queryFn: fetchBoards,
  });

  useEffect(() => {
    if (serverBoards && Array.isArray(serverBoards)) {
      dispatch(setBoards(serverBoards.map(mapServerBoardToClient)));
    }
  }, [serverBoards, dispatch]);

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки досок: {(error as Error).message}</div>;

  return (
    <div className="boards-page page-container">
      <h1>Доски</h1>
      {boards.length === 0 ? (
        <div>Доски отсутствуют</div>
      ) : (
        <div className="boards-grid">
          {boards.map(board => (
            <Link to={`/board/${board.id}`} key={board.id}>
              <Card title={board.title} hoverable>
                {board.description || 'Нет описания'}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardsPage;
