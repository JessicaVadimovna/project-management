import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setTasks } from '../store/tasksSlice';
import { openModal } from '../store/modalSlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasksByBoard, mapServerTaskToClient, updateTaskStatus } from '../api/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card } from 'antd';
import './BoardPage.css';

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => state.tasks.tasks); // Убрана фильтрация по boardId
  const queryClient = useQueryClient();

  const { data: serverTasks, isLoading, error } = useQuery({
    queryKey: ['boardTasks', id],
    queryFn: () => fetchTasksByBoard(id!),
  });

  useEffect(() => {
    console.log('serverTasks raw:', serverTasks);
    if (serverTasks && Array.isArray(serverTasks)) {
      console.log('tasksArray processed:', serverTasks);
      const mappedTasks = serverTasks.map(mapServerTaskToClient);
      console.log('mappedTasks:', mappedTasks);
      dispatch(setTasks(mappedTasks));
    }
  }, [serverTasks, dispatch]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boardTasks', id] });
    },
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];
    console.log('Drag-and-drop: taskId:', taskId, 'newStatus:', newStatus);
    updateStatusMutation.mutate({ taskId, status: newStatus });
    dispatch(setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )));
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    dispatch(
      openModal({
        taskId: task.id,
        initialValues: task,
        redirectToBoard: id,
      })
    );
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки задач: {(error as Error).message}</div>;

  const columns = {
    todo: tasks.filter(task => task.status === 'todo'),
    inprogress: tasks.filter(task => task.status === 'inprogress'),
    done: tasks.filter(task => task.status === 'done'),
  };

  console.log('Tasks by status:', columns);
  console.log('All tasks:', tasks);

  return (
    <div className="board-page">
      <h1>Доска {id}</h1>
      {tasks.length === 0 ? (
        <div>Задачи отсутствуют</div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="columns">
            {(['todo', 'inprogress', 'done'] as const).map(status => (
              <Droppable droppableId={status} key={status}>
                {(provided) => (
                  <div className="column" {...provided.droppableProps} ref={provided.innerRef}>
                    <h2>
                      {status === 'todo' ? 'К выполнению' : status === 'inprogress' ? 'В процессе' : 'Завершено'}
                    </h2>
                    {columns[status].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Card
                            title={task.title}
                            hoverable
                            onClick={() => handleTaskClick(task)}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <p>{task.description || 'Нет описания'}</p>
                            <p>Статус: {task.status}</p>
                            <p>Приоритет: {task.priority}</p>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default BoardPage;