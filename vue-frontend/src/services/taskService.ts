import type { Task, TaskCreateDTO, TaskUpdateDTO } from '../types/tasks'
// import api from '@/utils/api'
import API_DOMAIN from '@/utils/APIdomain'
import axios from 'axios'

const api = axios.create({
  baseURL: API_DOMAIN
})

export default {
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks')
    return response.data
  },
  async createTask(taskData: TaskCreateDTO): Promise<Task> {
    const response = await api.post('/tasks', taskData)
    return response.data
  },
  async updateTask(id: string, taskData: TaskUpdateDTO): Promise<Task> {
    const response = await api.patch(`/tasks/${id}`, taskData)
    return response.data
  },
  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  }
}