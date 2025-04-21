import { useState, useEffect } from 'react';
import { Button, Table, Select, Input } from 'antd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTasks } from '../store/tasksSlice';
import { setBoards } from '../store/boardsSlice';
import { setUsers } from '../store/usersSlice';
import { openModal } from '../store/modalSlice';
import { useQuery } from '@tanstack/react-query';
import {
  fetchTasks,
  fetchBoards,
  fetchUsers,
  mapServerTaskToClient,
  mapServerBoardToClient,
  mapServerUserToClient,
} from '../api/api';
import { Task, User, Board } from '../types/types';
// Импорт useNavigate оставляем для будущего использования
// import { useNavigate } from 'react-router-dom';
import { ColumnsType } from 'antd/es/table';
import './IssuesPage.css';

const { Option, OptGroup } = Select;
const { Search } = Input;

const IssuesPage = () => {
  const dispatch = useAppDispatch();
  // Оставляем навигацию для будущего использования
  // const navigate = useNavigate();
  // QueryClient также оставляем для будущего использования

  const tasks = useAppSelector(state => state.tasks.tasks) as Task[];
  const boards = useAppSelector(state => state.boards.boards) as Board[];
  const users = useAppSelector(state => state.users.users) as User[];

  const [filters, setFilters] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: serverUsers, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: ({ signal }) => fetchUsers(signal),
  });

  const { data: serverTasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: ({ signal }) => fetchTasks(signal),
  });

  const { data: serverBoards, isLoading: isBoardsLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: ({ signal }) => fetchBoards(signal),
  });

  useEffect(() => {
    if (serverUsers && Array.isArray(serverUsers)) {
      dispatch(setUsers(serverUsers.map(mapServerUserToClient)));
    }
  }, [serverUsers, dispatch]);

  useEffect(() => {
    if (serverTasks && Array.isArray(serverTasks)) {
      dispatch(setTasks(serverTasks.map(mapServerTaskToClient)));
    }
  }, [serverTasks, dispatch]);

  useEffect(() => {
    if (serverBoards && Array.isArray(serverBoards)) {
      dispatch(setBoards(serverBoards.map(mapServerBoardToClient)));
    }
  }, [serverBoards, dispatch]);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filters.some(f => f.startsWith('status:'))
      ? filters.some(f => f === `status:${task.status}`)
      : true;
    const matchesBoard = filters.some(f => f.startsWith('board:'))
      ? filters.some(f => f === `board:${task.boardId}`)
      : true;
    const assigneeName =
      users.find(user => user.id === task.assignee)?.name || '';
    const matchesSearch =
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      assigneeName.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesBoard && matchesSearch;
  });

  const handleRowClick = (task: Task) => {
    dispatch(openModal({ taskId: task.id, initialValues: task }));
  };

  // Закомментированная функция оставлена для будущего использования
  /*
  const handleGoToBoard = (task: Task) => {
    if (task.boardId) {
      navigate(`/board/${task.boardId}`, { state: { openTaskId: task.id } });
    }
  };
  */

  const handleCreateTask = () => {
    dispatch(openModal({ initialValues: {} }));
  };

  const columns: ColumnsType<Task> = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
    },
  ];

  // Эти колонки для расширенного просмотра, когда понадобится
  /*
  const columns: ColumnsType<Task> = [
    { title: 'Название', dataIndex: 'title', key: 'title' },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      responsive: ['md'] as const,
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: Task['priority']) =>
        priority === 'low' ? 'Низкий' : priority === 'medium' ? 'Средний' : 'Высокий',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: Task['status']) =>
        status === 'backlog' ? 'Бэклог' : status === 'inprogress' ? 'В процессе' : 'Завершено',
    },
    {
      title: 'Исполнитель',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assigneeId: string) => {
        const user = users.find((user) => user.id === assigneeId);
        return user ? user.name : 'Не назначен';
      },
    },
    {
      title: 'Доска',
      dataIndex: 'boardId',
      key: 'boardId',
      render: (boardId: string) => {
        return boards.find((board) => board.id === boardId)?.title || 'Без доски';
      },
    },
    {
      title: 'Действия',
      key: 'actions',
      responsive: ['md'] as const,
      render: (_: unknown, task: Task) => (
        <Button
          onClick={() => handleGoToBoard(task)}
          className="action-button"
          disabled={!task.boardId}
        >
          Перейти на доску
        </Button>
      ),
    },
  ];
  */

  if (isTasksLoading || isBoardsLoading || isUsersLoading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="issues-page">
      <h1>Все задачи</h1>
      <div className="filters">
        <div className="left-filters">
          <Search
            placeholder="Поиск по названию или исполнителю"
            onSearch={setSearchText}
            className="search-input"
          />
        </div>
        <div className="right-filters">
          <Select
            mode="multiple"
            placeholder="Фильтр по статусу или доске"
            className="combined-filter"
            allowClear
            onChange={setFilters}
            value={filters}
          >
            <OptGroup label="Статусы">
              <Option value="status:backlog">Бэклог</Option>
              <Option value="status:inprogress">В процессе</Option>
              <Option value="status:done">Завершено</Option>
            </OptGroup>
            <OptGroup label="Доски">
              {boards.map(board => (
                <Option key={`board:${board.id}`} value={`board:${board.id}`}>
                  {board.title}
                </Option>
              ))}
            </OptGroup>
          </Select>
        </div>
      </div>
      <Table
        dataSource={filteredTasks}
        columns={columns}
        rowKey="id"
        onRow={record => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
        className="issues-table"
        pagination={
          isMobile
            ? {
                current: currentPage,
                pageSize,
                total: filteredTasks.length,
                onChange: page => setCurrentPage(page),
                showSizeChanger: false,
              }
            : false
        }
      />
      <div className="bottom-create-task">
        <Button
          type="primary"
          onClick={handleCreateTask}
          className="create-task-button"
        >
          Создать задачу
        </Button>
      </div>
    </div>
  );
};

export default IssuesPage;
