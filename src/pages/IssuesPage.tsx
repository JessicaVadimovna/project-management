import { useState, useEffect } from 'react';
import { Button, Table, Select, Input } from 'antd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTasks } from '../store/tasksSlice';
import { openModal } from '../store/modalSlice';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks, mapServerTaskToClient } from '../api/api';
import { Task } from '../types/task';
import { useNavigate } from 'react-router-dom';

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
    queryFn: fetchTasks,
  });

  useEffect(() => {
    console.log('serverTasks raw:', serverTasks);
    if (serverTasks && Array.isArray(serverTasks)) {
      console.log('tasksArray processed:', serverTasks);
      dispatch(setTasks(serverTasks.map(mapServerTaskToClient)));
    }
  }, [serverTasks, dispatch]);

  if (isLoading) return <div>Загрузка...</div>;

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    const matchesBoard = boardFilter ? task.boardId === boardFilter : true;
    const matchesSearch =
      task.title.toLowerCase().includes(searchText.toLowerCase()) ||
      users
        .find(user => user.id === task.assignee)
        ?.name.toLowerCase()
        .includes(searchText.toLowerCase()) ||
      false;
    return matchesStatus && matchesBoard && matchesSearch;
  });

  const handleRowClick = (task: Task) => {
    dispatch(
      openModal({
        taskId: task.id,
        initialValues: task,
        redirectToBoard: task.boardId,
      })
    );
  };

  const handleGoToBoard = (task: Task) => {
    navigate(`/board/${task.boardId}`, {
      state: { openTaskId: task.id },
    });
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
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
        <Button onClick={() => handleGoToBoard(task)}>Перейти на доску</Button>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}
      >
        <Button
          type="primary"
          onClick={() => dispatch(openModal({ initialValues: {} }))}
        >
          Создать задачу
        </Button>
        <Select
          placeholder="Фильтр по статусу"
          style={{ width: 200 }}
          allowClear
          onChange={value => setStatusFilter(value)}
        >
          <Option value="todo">К выполнению</Option>
          <Option value="inprogress">В процессе</Option>
          <Option value="done">Завершено</Option>
        </Select>
        <Select
          placeholder="Фильтр по доске"
          style={{ width: 200 }}
          allowClear
          onChange={value => setBoardFilter(value)}
        >
          {boards.map(board => (
            <Option key={board.id} value={board.id}>
              {board.title}
            </Option>
          ))}
        </Select>
        <Search
          placeholder="Поиск по названию или исполнителю"
          onSearch={value => setSearchText(value)}
          style={{ width: 300 }}
        />
      </div>
      <Table
        dataSource={filteredTasks}
        columns={columns}
        rowKey="id"
        onRow={record => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  );
};

export default IssuesPage;
