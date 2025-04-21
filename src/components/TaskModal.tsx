import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  useMutation,
  useQueryClient,
  MutationFunction,
} from '@tanstack/react-query';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { closeModal } from '../store/modalSlice';
import { setTasks } from '../store/tasksSlice';
import { createTask, updateTask } from '../api/api';
import { Task, Board, User } from '../types/types';

const { Option } = Select;

interface TaskModalProps {
  visible: boolean;
  taskId: string | null;
  initialValues:
    | (Partial<Omit<Task, 'id'>> & { boardName?: string })
    | undefined;
  redirectToBoard: string | null;
  isCreatingFromBoard: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({
  visible,
  taskId,
  initialValues = {},
  redirectToBoard,
  isCreatingFromBoard,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const boards = useSelector(
    (state: RootState) => state.boards.boards
  ) as Board[];
  const users = useSelector((state: RootState) => state.users.users) as User[];
  const tasks = useSelector((state: RootState) => state.tasks.tasks) as Task[];

  const isEditing = !!taskId;
  const openedFrom =
    redirectToBoard || isCreatingFromBoard ? 'board' : 'allTasks';

  // Восстанавливаем черновик при открытии модального окна
  useEffect(() => {
    if (visible) {
      if (!isEditing) {
        const draft = localStorage.getItem('taskDraft');
        if (draft) {
          const draftValues = JSON.parse(draft);
          form.setFieldsValue({
            title: draftValues.title || '',
            description: draftValues.description || '',
            priority: draftValues.priority || 'medium',
            status: draftValues.status || 'backlog',
            assignee: draftValues.assignee || '',
            boardId: draftValues.boardId
              ? {
                  key: draftValues.boardId,
                  label:
                    boards.find(b => b.id === draftValues.boardId)?.title ||
                    'Не указана',
                }
              : initialValues.boardId
                ? {
                    key: initialValues.boardId,
                    label:
                      initialValues.boardName ||
                      boards.find(b => b.id === initialValues.boardId)?.title ||
                      'Не указана',
                  }
                : undefined,
          });
        } else {
          form.setFieldsValue({
            title: initialValues.title || '',
            description: initialValues.description || '',
            priority: initialValues.priority || 'medium',
            status: initialValues.status || 'backlog',
            assignee: initialValues.assignee || '',
            boardId: initialValues.boardId
              ? {
                  key: initialValues.boardId,
                  label:
                    initialValues.boardName ||
                    boards.find(b => b.id === initialValues.boardId)?.title ||
                    'Не указана',
                }
              : undefined,
          });
        }
      } else {
        form.setFieldsValue({
          title: initialValues.title || '',
          description: initialValues.description || '',
          priority: initialValues.priority || 'medium',
          status: initialValues.status || 'backlog',
          assignee: initialValues.assignee || '',
          boardId: initialValues.boardId
            ? {
                key: initialValues.boardId,
                label:
                  initialValues.boardName ||
                  boards.find(b => b.id === initialValues.boardId)?.title ||
                  'Не указана',
              }
            : undefined,
        });
      }
    }
  }, [visible, initialValues, form, boards, isEditing]);

  // Сохраняем черновик при изменении формы
  const handleFieldsChange = () => {
    if (!isEditing) {
      const values = form.getFieldsValue();
      localStorage.setItem(
        'taskDraft',
        JSON.stringify({
          title: values.title,
          description: values.description,
          priority: values.priority,
          status: values.status,
          assignee: values.assignee,
          boardId: values.boardId?.key || values.boardId,
        })
      );
    }
  };

  const createTaskMutation = useMutation({
    mutationFn: createTask as MutationFunction<Task, Omit<Task, 'id'>>,
    onSuccess: (data, variables) => {
      message.success('Задача создана', 3);
      queryClient.invalidateQueries({
        queryKey: ['boardWithTasks', redirectToBoard],
      });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const newTask = {
        ...variables,
        id: data.id?.toString() || Date.now().toString(),
      };
      dispatch(setTasks([...tasks, newTask]));
      localStorage.removeItem('taskDraft');
      handleCancel();
    },
    onError: (error: Error) => {
      message.error('Не удалось создать задачу', 3);
      console.error('createTask error:', error.message);
    },
  });

  // Мутация для обновления задачи с уведомлением
  const updateTaskMutation = useMutation({
    mutationFn: updateTask as MutationFunction<Task, Task>,
    onSuccess: () => {
      message.success('Задача обновлена', 3);
      const updatedTask = { ...form.getFieldsValue(), id: taskId };
      dispatch(
        setTasks(
          tasks.map((task: Task) => (task.id === taskId ? updatedTask : task))
        )
      );
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({
        queryKey: ['boardWithTasks', redirectToBoard],
      });
      handleCancel();
    },
    onError: (error: Error) => {
      message.error('Не удалось обновить задачу', 3);
      console.error('updateTask error:', error.message);
    },
  });

  // Мутация для обновления задачи без уведомления (для перехода на доску)
  const updateTaskForNavigationMutation = useMutation({
    mutationFn: updateTask as MutationFunction<Task, Task>,
    onSuccess: () => {
      const updatedTask = { ...form.getFieldsValue(), id: taskId };
      dispatch(
        setTasks(
          tasks.map((task: Task) => (task.id === taskId ? updatedTask : task))
        )
      );
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({
        queryKey: ['boardWithTasks', redirectToBoard],
      });
    },
    onError: (error: Error) => {
      message.error('Не удалось обновить задачу', 3);
      console.error('updateTask error:', error.message);
    },
  });

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        const taskData: Task = {
          id: taskId || '',
          title: values.title,
          description: values.description,
          priority: values.priority,
          status: values.status,
          assignee: values.assignee,
          boardId: values.boardId?.key || values.boardId,
        };

        if (isEditing) {
          updateTaskMutation.mutate(taskData);
        } else {
          createTaskMutation.mutate(taskData);
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    dispatch(closeModal());
    form.resetFields();
  };

  const handleGoToBoard = () => {
    form
      .validateFields()
      .then(values => {
        const taskData: Task = {
          id: taskId || '',
          title: values.title,
          description: values.description,
          priority: values.priority,
          status: values.status,
          assignee: values.assignee,
          boardId: values.boardId?.key || values.boardId,
        };
        updateTaskForNavigationMutation.mutate(taskData);
        navigate(`/board/${values.boardId?.key || values.boardId}`);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const getFooterButtons = () => {
    if (!isEditing) {
      return [
        <Button key="submit" type="primary" onClick={handleOk}>
          Создать
        </Button>,
      ];
    } else if (openedFrom === 'allTasks') {
      return [
        <Button key="goToBoard" onClick={handleGoToBoard}>
          Перейти на доску
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Обновить
        </Button>,
      ];
    }
    return [
      <Button key="submit" type="primary" onClick={handleOk}>
        Обновить
      </Button>,
    ];
  };

  return (
    <Modal
      title={isEditing ? 'Редактировать задачу' : 'Создать задачу'}
      open={visible}
      onCancel={handleCancel}
      maskClosable={true}
      footer={getFooterButtons()}
    >
      <Form form={form} layout="vertical" onFieldsChange={handleFieldsChange}>
        <Form.Item
          name="title"
          label="Название"
          rules={[
            { required: true, message: 'Введите название задачи' },
            { min: 3, message: 'Название должно содержать минимум 3 символа' },
          ]}
        >
          <Input placeholder="Введите название задачи" />
        </Form.Item>
        <Form.Item name="description" label="Описание">
          <Input.TextArea rows={4} placeholder="Введите описание задачи" />
        </Form.Item>
        <Form.Item
          name="boardId"
          label="Доска"
          rules={[{ required: true, message: 'Выберите доску' }]}
        >
          <Select
            placeholder="Выберите доску"
            disabled={isEditing || isCreatingFromBoard}
            labelInValue
          >
            {boards.map(board => (
              <Option key={board.id} value={board.id}>
                {board.title}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="priority"
          label="Приоритет"
          rules={[{ required: true, message: 'Выберите приоритет' }]}
        >
          <Select placeholder="Выберите приоритет">
            <Option value="low">Низкий</Option>
            <Option value="medium">Средний</Option>
            <Option value="high">Высокий</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="Статус"
          rules={[{ required: true, message: 'Выберите статус' }]}
        >
          <Select placeholder="Выберите статус">
            <Option value="backlog">Бэклог</Option>
            <Option value="inprogress">В процессе</Option>
            <Option value="done">Завершено</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="assignee"
          label="Исполнитель"
          rules={[{ required: true, message: 'Выберите исполнителя' }]}
        >
          <Select placeholder="Выберите исполнителя">
            {users.map(user => (
              <Option key={user.id} value={user.id}>
                {user.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;
