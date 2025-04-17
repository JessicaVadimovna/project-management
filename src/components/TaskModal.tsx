import { Modal, Form, Input, Select } from 'antd';
import { useEffect } from 'react';

const { Option } = Select;

interface TaskModalProps {
    visible: boolean;
    onCancel: () => void;
    initialValues?: any;
}

const TaskModal = ({ visible, onCancel, initialValues }: TaskModalProps) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            const draft = localStorage.getItem('taskDraft');
            form.setFieldsValue(draft ? JSON.parse(draft) : initialValues);
        }
    }, [visible, initialValues, form]);

    const onFinish = (values: any) => {
        console.log('Сохранено:', values);
        localStorage.removeItem('taskDraft');
        onCancel();
    };

    const onValuesChange = (_: any, allValues: any) => {
        localStorage.setItem('taskDraft', JSON.stringify(allValues));
    };

    return (
        <Modal visible={visible} onCancel={onCancel} onOk={() => form.submit()} title="Задача">
            <Form form={form} onFinish={onFinish} onValuesChange={onValuesChange}>
                <Form.Item name="title" label="Название" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Описание">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item name="priority" label="Приоритет">
                    <Select>
                        <Option value="low">Низкий</Option>
                        <Option value="medium">Средний</Option>
                        <Option value="high">Высокий</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="status" label="Статус">
                    <Select>
                        <Option value="todo">К выполнению</Option>
                        <Option value="inprogress">В работе</Option>
                        <Option value="done">Завершено</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="assignee" label="Исполнитель">
                    <Select>
                        <Option value="user1">Пользователь 1</Option>
                        <Option value="user2">Пользователь 2</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TaskModal;