import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

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
    const statuses = ['todo', 'inprogress', 'done'];
    const tasks: Tasks = {
        todo: [{ id: '1', title: 'Задача 1' }],
        inprogress: [{ id: '2', title: 'Задача 2' }],
        done: [],
    };

    const onDragEnd = (result: DropResult) => {
        // Логика перемещения задачи
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            {statuses.map((status) => (
                <Droppable droppableId={status} key={status}>
                    {(provided: DroppableProvided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps}>
                            <h2>{status}</h2>
                            {tasks[status as keyof Tasks].map((task, index) => (
                                <Draggable draggableId={task.id} index={index} key={task.id}>
                                    {(provided: DraggableProvided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
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