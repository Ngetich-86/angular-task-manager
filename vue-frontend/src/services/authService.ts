import type { AuthResponse, LoginCredentials, RegisterData } from '../types/user'
// import api from '@/utils/api'
import API_DOMAIN from '@/utils/APIdomain'

export default {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_DOMAIN}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    return response.json()
  },
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_DOMAIN}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    return response.json()
  }
}