import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
}

interface Tasks {
  todo: Task[];
  inprogress: Task[];
  done: Task[];
}

const BoardPage = () => {
  const [tasks, setTasks] = useState<Tasks>({
    todo: [{ id: '1', title: 'Задача 1' }],
    inprogress: [{ id: '2', title: 'Задача 2' }],
    done: [],
  });

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

    const newTasks = { ...tasks };
    const sourceColumn = newTasks[source.droppableId as keyof Tasks];
    const destinationColumn = newTasks[destination.droppableId as keyof Tasks];

    const [movedTask] = sourceColumn.splice(source.index, 1);
    destinationColumn.splice(destination.index, 0, movedTask);

    setTasks(newTasks);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {statuses.map(status => (
        <Droppable droppableId={status} key={status}>
          {provided => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <h2>{status}</h2>
              {tasks[status as keyof Tasks].map((task, index) => (
                <Draggable draggableId={task.id} index={index} key={task.id}>
                  {draggableProvided => (
                    <div
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
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
    </DragDropContext>
  );
};

export default BoardPage;
