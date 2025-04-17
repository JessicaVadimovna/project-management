import { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Task } from '../types/task';
import { addTask, updateTask } from '../store/tasksSlice';
import { closeModal } from '../store/modalSlice';
import { useNavigate } from 'react-router-dom';

interface TaskModalProps {
  visible: boolean;
  taskId: string | null;
  initialValues: Partial<Omit<Task, 'id'>> | null;
  redirectToBoard: string | null;
}

const TaskModal = ({
  visible,
  taskId,
  initialValues,
  redirectToBoard,
}: TaskModalProps) => {
  const [form] = Form.useForm<Omit<Task, 'id'>>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const boards = useAppSelector(state => state.boards.boards);
  const users = useAppSelector(state => state.users.users);

  useEffect(() => {
    if (visible) {
      const draft = localStorage.getItem('taskDraft');
      form.setFieldsValue(draft ? JSON.parse(draft) : initialValues);
    }
  }, [visible, initialValues, form]);

  const onFinish = (values: Omit<Task, 'id'>) => {
    const task: Task = {
      ...values,
      id: taskId || `${Date.now()}`,
    };
    if (taskId) {
      dispatch(updateTask(task));
    } else {
      dispatch(addTask(task));
    }
    localStorage.removeItem('taskDraft');
    dispatch(closeModal());
    if (redirectToBoard) {
      navigate(`/board/${redirectToBoard}`);
    }
    form.resetFields();
  };

  const onValuesChange = (
    _: Partial<Omit<Task, 'id'>>,
    allValues: Omit<Task, 'id'>
  ) => {
    localStorage.setItem('taskDraft', JSON.stringify(allValues));
  };

  const handleCancel = () => {
    dispatch(closeModal());
    localStorage.removeItem('taskDraft');
    form.resetFields();
  };

  return (
    <Modal
      title={taskId ? 'Редактировать задачу' : 'Создать задачу'}
      open={visible}
      onCancel={handleCancel}
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
          rules={[{ required: true, message: 'Выберите исполнителя' }]}
        >
          <Select>
            {users.map(user => (
              <Select.Option key={user.id} value={user.id}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="boardId"
          label="Доска"
          rules={[{ required: true, message: 'Выберите доску' }]}
        >
          <Select>
            {boards.map(board => (
              <Select.Option key={board.id} value={board.id}>
                {board.title}
              </Select.Option>
            ))}
          </Select>
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
