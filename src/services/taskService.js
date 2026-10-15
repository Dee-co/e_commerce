import api from './api';

export const getTasks = async () => {
  const response = await api.get('/tasks?limit=50');
  return response.data;
};
export const getSelectedTasks = async () => {
  const response = await api.get('/tasks/selected');
  return response.data;
};
export const selectTasks = async taskIds => {
  const response = await api.post('/tasks/select', {
    taskIds,
  });
  return response.data;
};