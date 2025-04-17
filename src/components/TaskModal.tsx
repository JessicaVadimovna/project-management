import { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

interface Task {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'inprogress' | 'done';
    assignee: string;
}

interface TaskModalProps {
    visible: boolean;
    onCancel: () => void;
    initialValues?: Partial<Task>;
}

const TaskModal = ({ visible, onCancel, initialValues }: TaskModalProps) => {
    const [form] = Form.useForm<Task>();

    useEffect(() => {
        if (visible) {
            const draft = localStorage.getItem('taskDraft');
            form.setFieldsValue(draft ? JSON.parse(draft) : initialValues);
        }
    }, [visible, initialValues, form]);

    const onFinish = (values: Task) => {
        console.log('Сохранено:', values);
        localStorage.removeItem('taskDraft');
        onCancel();
    };

    const onValuesChange = (_: Partial<Task>, allValues: Task) => {
        localStorage.setItem('taskDraft', JSON.stringify(allValues));
    };

    return (
        <Modal
            title="Создать задачу"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={onValuesChange}
                initialValues={initialValues}
            >
                <Form.Item
                    name="title"
                    label="Название"
                    rules={[{ required: true, message: 'Введите название' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Описание"
                    rules={[{ required: true, message: 'Введите описание' }]}
                >
                    <Input.TextArea />
                </Form.Item>
                <Form.Item
                    name="priority"
                    label="Приоритет"
                    rules={[{ required: true, message: 'Выберите приоритет' }]}
                >
                    <Select>
                        <Select.Option value="low">Низкий</Select.Option>
                        <Select.Option value="medium">Средний</Select.Option>
                        <Select.Option value="high">Высокий</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="status"
                    label="Статус"
                    rules={[{ required: true, message: 'Выберите статус' }]}
                >
                    <Select>
                        <Select.Option value="todo">К выполнению</Select.Option>
                        <Select.Option value="inprogress">В процессе</Select.Option>
                        <Select.Option value="done">Завершено</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="assignee"
                    label="Исполнитель"
                    rules={[{ required: true, message: 'Введите исполнителя' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Сохранить
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TaskModal;