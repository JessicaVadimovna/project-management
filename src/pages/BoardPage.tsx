import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateTask } from '../store/tasksSlice';
import { openModal } from '../store/modalSlice';
import { useParams } from 'react-router-dom';
import './BoardPage.css';

const BoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state =>
    state.tasks.tasks.filter(task => task.boardId === id)
  );
  const board = useAppSelector(state =>
    state.boards.boards.find(board => board.id === id)
  );

  const statuses = ['todo', 'inprogress', 'done'];

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const task = tasks.find(t => t.id === result.draggableId);
    if (task) {
      dispatch(
        updateTask({
          ...task,
          status: destination.droppableId as 'todo' | 'inprogress' | 'done',
        })
      );
    }
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      dispatch(
        openModal({
          taskId: task.id,
          initialValues: task,
        })
      );
    }
  };

  return (
    <div className="board-page">
      <h1>{board?.title || 'Доска'}</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns">
          {statuses.map(status => (
            <Droppable droppableId={status} key={status}>
              {provided => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{status}</h2>
                  {tasks
                    .filter(task => task.status === status)
                    .map((task, index) => (
                      <Draggable
                        draggableId={task.id}
                        index={index}
                        key={task.id}
                      >
                        {draggableProvided => (
                          <div
                            className="task"
                            ref={draggableProvided.innerRef}
                            {...draggableProvided.draggableProps}
                            {...draggableProvided.dragHandleProps}
                            onClick={() => handleTaskClick(task.id)}
                          >
                            {task.title}
                          </div>
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
    </div>
  );
};

export default BoardPage;
