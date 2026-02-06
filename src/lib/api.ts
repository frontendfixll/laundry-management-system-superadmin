import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    // console.log('🔐 API Interceptor - Token exists:', !!token);
    // console.log('🔐 API Interceptor - Token preview:', token?.substring(0, 50) + '...');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    const errorCode = error.response?.data?.code

    if (error.response?.status === 401) {
      const store = useAuthStore.getState()
      if (store.token) {
        store.logout()
        toast.error('Session expired. Please login again.')
        window.location.href = '/auth/login'
      }
    } else if (error.response?.status === 403) {
      if (errorCode !== 'PERMISSION_DENIED') {
        toast.error(message)
      }
    } else if (error.response?.status >= 400) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
