import { useState, useEffect } from 'react';
import { Button, Table, Select, Input } from 'antd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTasks } from '../store/tasksSlice';
import { openModal } from '../store/modalSlice';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, mapServerTaskToClient } from '../api/api';
import { Task } from '../types/task';
import { useNavigate } from 'react-router-dom';
import './IssuesPage.css';

const { Option } = Select;
const { Search } = Input;

const IssuesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const tasks = useAppSelector(state => state.tasks.tasks);
  const boards = useAppSelector(state => state.boards.boards);
  const users = useAppSelector(state => state.users.users);

  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [boardFilter, setBoardFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState('');

  const { data: serverTasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: ({ signal }) => fetchTasks(signal),
  });

  useEffect(() => {
    if (serverTasks && Array.isArray(serverTasks)) {
      dispatch(setTasks(serverTasks.map(mapServerTaskToClient)));
    }
  }, [serverTasks, dispatch]);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    const matchesBoard = boardFilter ? task.boardId === boardFilter : true;
    const assigneeName = users.find(user => user.id === task.assignee)?.name || '';
    const matchesSearch =
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      assigneeName.toLowerCase().includes(searchText.toLowerCase());
    return matchesStatus && matchesBoard && matchesSearch;
  });

  const handleRowClick = (task: Task) => {
    dispatch(openModal({ taskId: task.id, initialValues: task }));
  };

  const handleGoToBoard = (task: Task) => {
    navigate(`/board/${task.boardId}`, { state: { openTaskId: task.id } });
  };

  const columns = [
    { title: 'Название', dataIndex: 'title', key: 'title' },
    { title: 'Описание', dataIndex: 'description', key: 'description' },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) =>
        priority === 'low' ? 'Низкий' :
          priority === 'medium' ? 'Средний' : 'Высокий',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        status === 'backlog' ? 'Бэклог' :
          status === 'inprogress' ? 'В процессе' : 'Завершено',
    },
    {
      title: 'Исполнитель',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assigneeId: string) =>
        users.find(user => user.id === assigneeId)?.name || 'Не назначен',
    },
    {
      title: 'Доска',
      dataIndex: 'boardId',
      key: 'boardId',
      render: (boardId: string) =>
        boards.find(board => board.id === boardId)?.title || 'Без доски',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, task: Task) => (
        <Button onClick={() => handleGoToBoard(task)} className="action-button">
          Перейти на доску
        </Button>
      ),
    },
  ];

  if (isLoading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="issues-page page-container">
      <h1>Все задачи</h1>
      <div className="filters">
        <Button
          type="primary"
          onClick={() => dispatch(openModal({ initialValues: {} }))}
          className="create-task-button"
        >
          Создать задачу
        </Button>
        <Select
          placeholder="Фильтр по статусу"
          style={{ width: 200 }}
          allowClear
          onChange={setStatusFilter}
        >
          <Option value="backlog">Бэклог</Option>
          <Option value="inprogress">В процессе</Option>
          <Option value="done">Завершено</Option>
        </Select>
        <Select
          placeholder="Фильтр по доске"
          style={{ width: 200 }}
          allowClear
          onChange={setBoardFilter}
        >
          {boards.map(board => (
            <Option key={board.id} value={board.id}>{board.title}</Option>
          ))}
        </Select>
        <Search
          placeholder="Поиск по названию или исполнителю"
          onSearch={setSearchText}
          style={{ width: 300 }}
        />
      </div>
      <Table
        dataSource={filteredTasks}
        columns={columns}
        rowKey="id"
        onRow={record => ({ onClick: () => handleRowClick(record), style: { cursor: 'pointer' } })}
        className="issues-table"
      />
    </div>
  );
};

export default IssuesPage;
