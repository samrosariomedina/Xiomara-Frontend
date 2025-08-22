import { useState, useEffect, useCallback } from 'react'
import { authAPI, clientsAPI, campaignsAPI, uploadAPI, ClientData, CampaignData } from '../lib/api'

// Custom hook for authentication
export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load token from localStorage on mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      setToken(storedToken)
    }
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authAPI.login(credentials)
      if (response.token) {
        setToken(response.token)
        localStorage.setItem('token', response.token)
      }
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: { email: string; password: string; name: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authAPI.signup(userData)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
  }

  return {
    token,
    isLoading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: !!token
  }
}

// Custom hook for clients API
export const useClients = () => {
  const [clients, setClients] = useState<ClientData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async (token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await clientsAPI.getClients(token)
      setClients(response.data || response)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clients'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, []) // Empty dependency array since it doesn't depend on any props or state

  const createClient = useCallback(async (clientData: ClientData, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await clientsAPI.createClient(clientData, token)
      // Refresh clients list
      await fetchClients(token)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create client'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchClients])

  const editClient = useCallback(async (clientData: ClientData, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await clientsAPI.editClient(clientData, token)
      // Refresh clients list
      await fetchClients(token)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to edit client'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchClients])

  const deleteClient = useCallback(async (clientId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await clientsAPI.deleteClient(clientId, token)
      // Refresh clients list
      await fetchClients(token)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete client'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchClients])

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    editClient,
    deleteClient
  }
}

// Custom hook for campaigns API
export const useCampaigns = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCampaign = async (campaignData: CampaignData, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await campaignsAPI.createCampaign(campaignData, token)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create campaign'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    createCampaign
  }
}

// Custom hook for file uploads
export const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await uploadAPI.uploadFile(formData)
      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
      setUploadError(errorMessage)
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return {
    isUploading,
    uploadError,
    uploadFile
  }
}
