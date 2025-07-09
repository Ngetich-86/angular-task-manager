import { defineStore } from 'pinia'
import router from '@/router'
import type { User, LoginCredentials, RegisterData } from '@/types/user'
import authService from '@/services/authService'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),
  actions: {
    async login(credentials: LoginCredentials): Promise<void> {
      try {
        const response = await authService.login(credentials)
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true
        localStorage.setItem('token', response.token)
        router.push('/tasks')
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      }
    },
    async register(userData: RegisterData): Promise<void> {
      try {
        const response = await authService.register(userData)
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true
        localStorage.setItem('token', response.token)
        router.push('/tasks')
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      }
    },
    logout(): void {
      this.$reset()
      localStorage.removeItem('token')
      router.push('/login')
    },
    initializeAuth(): void {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        this.isAuthenticated = true
        // You might want to fetch user data here
      }
    }
  }
})