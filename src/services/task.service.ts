import axios from 'axios';
import type { CreateTaskDto, PatchTaskDto, Task, UpdateTaskDto } from '../models';

const API = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const getTasks = () =>
  axios.get<Task[]>(`${API}/tasks`, getHeaders());

export const createTask = (data: CreateTaskDto) =>
  axios.post<Task>(`${API}/tasks`, data, getHeaders());

export const updateTask = (id: number, data: UpdateTaskDto) =>
  axios.put<Task>(`${API}/tasks/${id}`, data, getHeaders());

export const patchTask = (id: number, data: PatchTaskDto) =>
  axios.patch<Task>(`${API}/tasks/${id}`, data, getHeaders());

export const deleteTask = (id: number) =>
  axios.delete(`${API}/tasks/${id}`, getHeaders());