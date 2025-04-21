// import { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import { useQuery } from 'react-query';
// import { fetchUsers, fetchBoards, fetchTasks, mapServerUserToClient, mapServerBoardToClient, mapServerTaskToClient } from '../api/api';
// import { setUsers } from '../store/usersSlice';
// import { setBoards } from '../store/boardsSlice';
// import { setTasks } from '../store/tasksSlice';

// export const useAppInitialization = () => {
//   const dispatch = useDispatch();

//   // Загружаем пользователей
//   const { data: serverUsers } = useQuery({
//     queryKey: ['users'],
//     queryFn: ({ signal }) => fetchUsers(signal),
//   });

//   // Загружаем доски
//   const { data: serverBoards } = useQuery({
//     queryKey: ['boards'],
//     queryFn: ({ signal }) => fetchBoards(signal),
//   });

//   // Загружаем задачи
//   const { data: serverTasks } = useQuery({
//     queryKey: ['tasks'],
//     queryFn: ({ signal }) => fetchTasks(signal),
//   });

//   useEffect(() => {
//     if (serverUsers && Array.isArray(serverUsers)) {
//       dispatch(setUsers(serverUsers.map(mapServerUserToClient)));
//     }
//     if (serverBoards && Array.isArray(serverBoards)) {
//       dispatch(setBoards(serverBoards.map(mapServerBoardToClient)));
//     }
//     if (serverTasks && Array.isArray(serverTasks)) {
//       dispatch(setTasks(serverTasks.map(mapServerTaskToClient)));
//     }
//   }, [serverUsers, serverBoards, serverTasks, dispatch]);
// };
