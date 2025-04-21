import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTasks } from '../store/tasksSlice';
import { setUsers } from '../store/usersSlice';
import { setBoards } from '../store/boardsSlice';
import { openModal } from '../store/modalSlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBoardWithTasks, updateTaskStatus, fetchUsers, fetchBoards, mapServerUserToClient, mapServerBoardToClient } from '../api/api'; // Добавляем fetchBoards
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, Row, Col, message } from 'antd';
import { Task, User } from '../types/types';
import './BoardPage.css';

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const tasks = useAppSelector(state => state.tasks.tasks) as Task[];
  const users = useAppSelector(state => state.users.users) as User[];
  const queryClient = useQueryClient();

  // Запрос для загрузки данных доски и задач
  const { data, isLoading, error } = useQuery({
    queryKey: ['boardWithTasks', id],
    queryFn: ({ signal }) => fetchBoardWithTasks(id!, signal),
  });

  // Запрос для загрузки пользователей
  const { data: serverUsers, isLoading: isUsersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: ({ signal }) => fetchUsers(signal),
  });

  // Запрос для загрузки списка досок
  const { data: serverBoards, isLoading: isBoardsLoading, error: boardsError } = useQuery({
    queryKey: ['boards'],
    queryFn: ({ signal }) => fetchBoards(signal),
  });

  // Сохраняем задачи в Redux
  useEffect(() => {
    if (data) {
      console.log('Tasks saved to Redux:', data.tasks);
      dispatch(setTasks(data.tasks));
    }
  }, [data, dispatch]);

  // Сохраняем пользователей в Redux
  useEffect(() => {
    if (serverUsers && Array.isArray(serverUsers)) {
      console.log('Loaded serverUsers:', serverUsers);
      const mappedUsers = serverUsers.map(mapServerUserToClient);
      console.log('Mapped users:', mappedUsers);
      dispatch(setUsers(mappedUsers));
    }
  }, [serverUsers, dispatch]);

  // Сохраняем доски в Redux
  useEffect(() => {
    if (serverBoards && Array.isArray(serverBoards)) {
      console.log('Loaded serverBoards:', serverBoards);
      const mappedBoards = serverBoards.map(mapServerBoardToClient);
      console.log('Mapped boards:', mappedBoards);
      dispatch(setBoards(mappedBoards));
    }
  }, [serverBoards, dispatch]);

  // Открытие модального окна для задачи, если передан openTaskId
  useEffect(() => {
    if (location.state?.openTaskId) {
      const task = tasks.find((t: Task) => t.id === location.state.openTaskId);
      if (task && task.boardId === id) {
        dispatch(openModal({
          taskId: task.id,
          initialValues: {
            ...task,
            boardId: task.boardId || id,
            boardName: task.boardName || data?.board?.title || `Доска ${id}`,
          },
          redirectToBoard: id,
        }));
      }
    }
  }, [location.state, tasks, dispatch, id, data]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      message.success('Статус задачи обновлен', 3);
      queryClient.invalidateQueries({ queryKey: ['boardWithTasks', id] });
    },
    onError: (error: Error) => {
      message.error('Не удалось обновить статус задачи', 3);
      console.error('updateTaskStatus error:', error.message);
    },
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];

    dispatch(setTasks(tasks.map((task: Task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )));

    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  const handleTaskClick = (task: Task) => {
    dispatch(openModal({
      taskId: task.id,
      initialValues: {
        ...task,
        boardId: task.boardId || id,
        boardName: task.boardName || data?.board?.title || `Доска ${id}`,
      },
      redirectToBoard: id,
    }));
  };

  const handleCreateTask = () => {
    dispatch(openModal({
      initialValues: {
        boardId: id,
        boardName: data?.board?.title || `Доска ${id}`,
      },
      isCreatingFromBoard: true,
      redirectToBoard: id,
    }));
  };

  const getAssigneeName = (assigneeId: string) => {
    const user = users.find((user: User) => user.id === assigneeId);
    console.log(`Looking for assigneeId: ${assigneeId}, Found user:`, user);
    return user ? user.name : 'Не назначен';
  };

  if (isLoading || isUsersLoading || isBoardsLoading) return <div className="loading">Загрузка...</div>;
  if (error || usersError || boardsError) return <div className="error">Ошибка: {(error as Error)?.message || (usersError as Error)?.message || (boardsError as Error)?.message}</div>;

  const { board, tasks: boardTasks } = data || { board: null, tasks: [] };

  const columns = {
    backlog: boardTasks.filter((task: Task) => task.status === 'backlog'),
    inprogress: boardTasks.filter((task: Task) => task.status === 'inprogress'),
    done: boardTasks.filter((task: Task) => task.status === 'done'),
  };

  return (
    <div className="board-page page-container">
      <div className="board-title-section">
        <h1>{board ? board.title : `Доска ${id}`}</h1>
      </div>
      {boardTasks.length === 0 ? (
        <div className="no-tasks">Задачи отсутствуют</div>
      ) : (
        <div className="columns-container">
          <DragDropContext onDragEnd={onDragEnd}>
            <Row gutter={[16, 16]} justify="center">
              {(['backlog', 'inprogress', 'done'] as const).map(status => (
                <Col xs={24} sm={12} md={8} key={status}>
                  <Droppable droppableId={status}>
                    {(provided) => (
                      <div className="column" {...provided.droppableProps} ref={provided.innerRef}>
                        <h2>
                          {status === 'backlog' ? 'Бэклог' :
                            status === 'inprogress' ? 'В процессе' : 'Завершено'}
                        </h2>
                        {columns[status].map((task: Task, index: number) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <Card
                                title={task.title}
                                hoverable
                                onClick={() => handleTaskClick(task)}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="task-card"
                              >
                                <p>{task.description || 'Нет описания'}</p>
                                <p>Приоритет: {
                                  task.priority === 'low' ? 'Низкий' :
                                    task.priority === 'medium' ? 'Средний' : 'Высокий'
                                }</p>
                                <p>Исполнитель: {getAssigneeName(task.assignee)}</p>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Col>
              ))}
            </Row>
          </DragDropContext>
        </div>
      )}
    </div>
  );
};

export default BoardPage;