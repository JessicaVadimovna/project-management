import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setBoards } from '../store/boardsSlice';
import { useQuery } from '@tanstack/react-query';
import { fetchBoards, mapServerBoardToClient } from '../api/api';
import { Board } from '../types/types';
import { Link } from 'react-router-dom';
import './BoardsPage.css';

const BoardsPage = () => {
  const dispatch = useAppDispatch();
  const boards = useAppSelector(state => state.boards.boards) as Board[];

  const {
    data: serverBoards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['boards'],
    queryFn: ({ signal }) => fetchBoards(signal),
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
        <div className="boards-list">
          {boards.map(board => (
            <div className="board-item" key={board.id}>
              <span className="board-title">{board.title}</span>
              <Link to={`/board/${board.id}`}>
                <button className="go-to-board-button">Перейти к доске</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardsPage;
