import { useState } from 'react';
import { Table, Button } from 'antd';
import TaskModal from '../components/TaskModal';

interface Task {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'inprogress' | 'done';
    assignee: string;
}

const IssuesPage = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const handleTaskSave = (values: Task) => {
        setTasks([...tasks, { ...values, id: `${tasks.length + 1}` }]);
        setModalVisible(false);
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
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={() => setModalVisible(true)}>
                Создать задачу
            </Button>
            <Table dataSource={tasks} columns={columns} rowKey="id" />
            <TaskModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleTaskSave}
            />
        </div>
    );
};

export default IssuesPage;