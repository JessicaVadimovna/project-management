import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTasks } from '../store/tasksSlice';
import { openModal } from '../store/modalSlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBoardWithTasks, updateTaskStatus } from '../api/api';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, Row, Col, Button, message } from 'antd';
import { Task } from '../types/task';
import './BoardPage.css';

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const tasks = useAppSelector(state => state.tasks.tasks);
  const users = useAppSelector(state => state.users.users);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['boardWithTasks', id],
    queryFn: ({ signal }) => fetchBoardWithTasks(id!, signal),
  });

  useEffect(() => {
    if (data) {
      dispatch(setTasks(data.tasks));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (location.state?.openTaskId) {
      const task = tasks.find((t: Task) => t.id === location.state.openTaskId);
      if (task && task.boardId === id) {
        dispatch(openModal({ taskId: task.id, initialValues: task, redirectToBoard: id }));
      }
    }
  }, [location.state, tasks, dispatch, id]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardWithTasks', id] });
      message.success('Статус задачи обновлен', 3);
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
    updateStatusMutation.mutate({ taskId, status: newStatus });
    dispatch(setTasks(tasks.map((task: Task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )));
  };

  const handleTaskClick = (task: Task) => {
    dispatch(openModal({ taskId: task.id, initialValues: task, redirectToBoard: id }));
  };

  const handleCreateTask = () => {
    dispatch(openModal({ initialValues: { boardId: id }, isCreatingFromBoard: true }));
  };

  const getAssigneeName = (assigneeId: string) => {
    const user = users.find((user: { id: string }) => user.id === assigneeId);
    return user ? user.name : 'Не назначен';
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">Ошибка: {(error as Error).message}</div>;

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
        <Button type="primary" onClick={handleCreateTask} className="create-task-button">
          Создать задачу
        </Button>
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