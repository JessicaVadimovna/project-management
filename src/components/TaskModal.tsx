import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { Task } from '../types/task';
import { closeModal } from '../store/modalSlice';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, updateTask } from '../api/api';

interface TaskModalProps {
  visible: boolean;
  taskId: string | null;
  initialValues: Partial<Omit<Task, 'id'>>;
  redirectToBoard: string | null;
  isCreatingFromBoard?: boolean;
}

const TaskModal = ({
  visible,
  taskId,
  initialValues,
  redirectToBoard,
  isCreatingFromBoard = false,
}: TaskModalProps) => {
  const [form] = Form.useForm<Omit<Task, 'id'>>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const boards = useAppSelector(state => state.boards.boards);
  const users = useAppSelector(state => state.users.users);
  const isFromIssuesPage = !redirectToBoard && taskId;

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      localStorage.removeItem('taskDraft');
      message.success('Задача успешно создана', 3);
    },
    onError: (error: any) => {
      message.error('Не удалось создать задачу. Проверьте данные и попробуйте снова.', 3);
      console.error('createTask error:', error.response?.data || error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['boardTasks'] });
      message.success('Задача успешно обновлена', 3);
    },
    onError: (error: any) => {
      message.error('Не удалось обновить задачу.', 3);
      console.error('updateTask error:', error.response?.data || error.message);
    },
  });

  useEffect(() => {
    if (visible) {
      if (taskId) {
        form.setFieldsValue(initialValues);
      } else {
        const draft = localStorage.getItem('taskDraft');
        form.setFieldsValue(draft ? JSON.parse(draft) : initialValues);
      }
    }
  }, [visible, taskId, initialValues, form]);

  const onValuesChange = (_: Partial<Omit<Task, 'id'>>, allValues: Omit<Task, 'id'>) => {
    if (!taskId) {
      localStorage.setItem('taskDraft', JSON.stringify(allValues));
    }
  };

  const onFinish = (values: Omit<Task, 'id'>) => {
    const task: Task = { ...values, id: taskId || '0' };
    if (taskId) {
      updateMutation.mutate(task);
    } else {
      createMutation.mutate(values);
    }
    dispatch(closeModal());
    if (redirectToBoard) {
      navigate(`/board/${redirectToBoard}`);
    } else if (isFromIssuesPage && task.boardId) {
      navigate(`/board/${task.boardId}`, { state: { openTaskId: task.id } });
    }
    form.resetFields();
  };

  const handleCancel = () => {
    dispatch(closeModal());
    if (taskId) {
      localStorage.removeItem('taskDraft');
    }
    form.resetFields();
  };

  const handleGoToBoard = () => {
    if (taskId && initialValues.boardId) {
      navigate(`/board/${initialValues.boardId}`, { state: { openTaskId: taskId } });
    }
  };

  return (
    <Modal
      title={taskId ? 'Редактировать задачу' : 'Создать задачу'}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      centered
      width={600}
      className="task-modal"
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
          <Input placeholder="Введите название задачи" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Введите описание' }]}
        >
          <Input.TextArea placeholder="Введите описание задачи" rows={4} />
        </Form.Item>
        <Form.Item
          name="boardId"
          label="Доска"
          rules={[{ required: true, message: 'Выберите доску' }]}
        >
          <Select disabled={isCreatingFromBoard} placeholder="Выберите доску">
            {boards.map(board => (
              <Select.Option key={board.id} value={board.id}>
                {board.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="priority"
          label="Приоритет"
          rules={[{ required: true, message: 'Выберите приоритет' }]}
        >
          <Select placeholder="Выберите приоритет">
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
          <Select placeholder="Выберите статус">
            <Select.Option value="backlog">Бэклог</Select.Option>
            <Select.Option value="inprogress">В процессе</Select.Option>
            <Select.Option value="done">Завершено</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="assignee"
          label="Исполнитель"
          rules={[
            { required: true, message: 'Выберите исполнителя' },
            {
              validator: (_, value) => {
                const assigneeId = parseInt(value);
                if (!assigneeId || assigneeId <= 0) {
                  return Promise.reject(new Error('Исполнитель должен быть корректным'));
                }
                const userExists = users.some(user => user.id === value);
                if (!userExists) {
                  return Promise.reject(new Error('Такого исполнителя не существует'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select placeholder="Выберите исполнителя">
            {users.map(user => (
              <Select.Option key={user.id} value={user.id}>
                {user.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {isFromIssuesPage && (
              <Button onClick={handleGoToBoard} className="action-button">Перейти на доску</Button>
            )}
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              className="submit-button"
            >
              {taskId ? 'Обновить' : 'Создать'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;