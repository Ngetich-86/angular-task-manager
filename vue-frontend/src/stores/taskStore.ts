import { defineStore } from 'pinia'
import tasksService from '@/services/tasks.service'
import { Task,  TaskCreateDTO, TaskUpdateDTO } from '@/types/tasks'

interface TasksState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    tasks: [],
    isLoading: false,
    error: null
  }),
  actions: {
    async fetchTasks(): Promise<void> {
      try {
        this.isLoading = true
        this.error = null
        this.tasks = await tasksService.getTasks()
      } catch (error) {
        this.error = 'Failed to fetch tasks'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },
    async addTask(taskData: TaskCreateDTO): Promise<void> {
      try {
        const newTask = await tasksService.createTask(taskData)
        this.tasks.unshift(newTask)
      } catch (error) {
        console.error('Failed to add task:', error)
        throw error
      }
    },
    async toggleTaskCompletion(id: string): Promise<void> {
      try {
        const task = this.tasks.find(t => t.id === id)
        if (!task) return
        
        const updatedTask = await tasksService.updateTask(id, {
          completed: !task.completed
        })
        
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tasks.splice(index, 1, updatedTask)
        }
      } catch (error) {
        console.error('Failed to update task:', error)
        throw error
      }
    }
  },
  getters: {
    completedTasks(): Task[] {
      return this.tasks.filter(task => task.completed)
    },
    pendingTasks(): Task[] {
      return this.tasks.filter(task => !task.completed)
    }
  }
})