import axios, { AxiosInstance, AxiosResponse } from 'axios'

// Types for API requests
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  name: string
}

export interface ClientData {
  id?: string
  name: string
  email?: string
  description?: string
  [key: string]: unknown
}

export interface CampaignData {
  id?: string
  name: string
  clientId: string
  description?: string
  [key: string]: unknown
}

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or wherever you store it
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API calls
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },
  
  signup: async (userData: SignupData) => {
    const response = await apiClient.post('/auth/signup', userData)
    return response.data
  },
  
  check: async (token: string) => {
    const response = await apiClient.post('/auth/check', { token })
    return response.data
  }
}

// Clients API calls
export const clientsAPI = {
  getClients: async (token: string) => {
    const response = await apiClient.post('/folders', { token })
    return response.data
  },
  
  createClient: async (clientData: ClientData, token: string) => {
    const response = await apiClient.post('/clients/create', { ...clientData, token })
    return response.data
  },
  
  editClient: async (clientData: ClientData, token: string) => {
    const response = await apiClient.post('/clients/edit', { ...clientData, token })
    return response.data
  },
  
  deleteClient: async (clientId: string, token: string) => {
    const response = await apiClient.post('/clients/delete', { clientId, token })
    return response.data
  }
}

// Campaigns API calls
export const campaignsAPI = {
  createCampaign: async (campaignData: CampaignData, token: string) => {
    const response = await apiClient.post('/campaigns/create', { ...campaignData, token })
    return response.data
  }
}

// Upload API calls
export const uploadAPI = {
  uploadFile: async (formData: FormData) => {
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

// Generic API call function
export const apiCall = {
  get: async (endpoint: string, params?: Record<string, unknown>) => {
    const response = await apiClient.get(endpoint, { params })
    return response.data
  },
  
  post: async (endpoint: string, data?: Record<string, unknown>) => {
    const response = await apiClient.post(endpoint, data)
    return response.data
  },
  
  put: async (endpoint: string, data?: Record<string, unknown>) => {
    const response = await apiClient.put(endpoint, data)
    return response.data
  },
  
  delete: async (endpoint: string, data?: Record<string, unknown>) => {
    const response = await apiClient.delete(endpoint, { data })
    return response.data
  }
}

export default apiClient
