export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface TaskCreateDTO {
  title: string
  description?: string
  dueDate?: string
}

export interface TaskUpdateDTO {
  title?: string
  description?: string
  completed?: boolean
  dueDate?: string
}