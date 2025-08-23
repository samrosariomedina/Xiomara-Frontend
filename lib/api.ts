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

export interface FolderData {
  _id?: string
  title?: string | null
  parent?: string | null
  metadata?: {
    type?: 'client' | 'campaign'
    address?: string
    deadline?: string
    [key: string]: unknown
  } | null
  files?: {
    sources?: string[]
    references?: string[]
    directives?: string[]
    summaries?: string[]
    outputs?: string[]
    templates?: string[]
  }
  timestamp?: string
}

export interface SourceData {
  _id?: string
  type: 'text' | 'image' | 'voice' | 'youtube' | 'webpage'
  title?: string | null
  content?: string
  timestamp?: string
  origin?: string | null
  edited?: string | null | boolean
  listener?: string | null
}

export interface ReferenceData {
  _id?: string
  type: string
  title: string
  content: string
  timestamp?: string
}

export interface SummaryData {
  _id?: string
  source: string
  content: string
  timestamp?: string
}

export interface OutputData {
  _id?: string
  template: string
  content: string
  timestamp?: string
}

export interface TemplateData {
  _id?: string
  title: string
  content: string
  global?: boolean
  timestamp?: string
}

export interface DirectiveData {
  _id?: string
  title: string
  content: string
  timestamp?: string
}

export interface ListenerData {
  _id?: string
  type: string
  url?: string
  config: object
  timestamp?: string
}

// Legacy types for backward compatibility
export interface ClientData {
  id?: string
  name: string
  email: string
  description?: string
}

export interface CampaignData {
  id?: string
  name: string
  clientId: string
  deadline?: string
  description?: string
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
    // Don't add token to auth endpoints
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/signup');
    
    // Get token from localStorage only for non-auth endpoints
    if (typeof window !== 'undefined' && !isAuthEndpoint) {
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
  },
  
  logout: async (token: string) => {
    const response = await apiClient.post('/auth/logout', { token })
    return response.data
  },
  
  kick: async (token: string) => {
    const response = await apiClient.post('/auth/kick', { token })
    return response.data
  }
}

// Folders API calls (used for clients/campaigns)
export const foldersAPI = {
  getFolders: async (token: string, params?: {
    folders?: string[]
    user?: string
    metadata?: object
    parent?: string | null
    before?: string
    after?: string
  }) => {
    const response = await apiClient.post('/folders', { token, ...params })
    return response.data
  },
  
  createFolder: async (folderData: FolderData, token: string) => {
    const response = await apiClient.post('/folders/create', { ...folderData, token })
    return response.data
  },
  
  editFolder: async (folderId: string, folderData: Partial<FolderData>, token: string) => {
    const response = await apiClient.post('/folders/edit', { folder: folderId, ...folderData, token })
    return response.data
  },
  
  deleteFolder: async (folderId: string, token: string) => {
    const response = await apiClient.post('/folders/remove', { folder: folderId, token })
    return response.data
  },
  
  pushToFolder: async (folderId: string, data: object, token: string) => {
    const response = await apiClient.post('/folders/push', { folder: folderId, ...data, token })
    return response.data
  },
  
  pullFromFolder: async (folderId: string, data: object, token: string) => {
    const response = await apiClient.post('/folders/pull', { folder: folderId, ...data, token })
    return response.data
  }
}

// Sources API calls
export const sourcesAPI = {
  getSources: async (token: string, params?: {
    sources?: string[]
    types?: string[]
    user?: string
    before?: string
    after?: string
  }) => {
    const response = await apiClient.post('/sources', { token, ...params })
    return response.data
  },
  
  createSource: async (sourceData: SourceData, token: string) => {
    const response = await apiClient.post('/sources/add', { ...sourceData, token })
    return response.data
  },
  
  editSource: async (sourceId: string, sourceData: Partial<SourceData>, token: string) => {
    const response = await apiClient.post('/sources/edit', { source: sourceId, ...sourceData, token })
    return response.data
  },
  
  deleteSource: async (sourceId: string, token: string) => {
    const response = await apiClient.post('/sources/remove', { source: sourceId, token })
    return response.data
  }
}

// References API calls
export const referencesAPI = {
  getReferences: async (token: string, params?: {
    references?: string[]
    user?: string
    before?: string
    after?: string
  }) => {
    const response = await apiClient.post('/references', { token, ...params })
    return response.data
  },
  
  createReference: async (referenceData: ReferenceData, token: string) => {
    const response = await apiClient.post('/references/add', { ...referenceData, token })
    return response.data
  },
  
  editReference: async (referenceId: string, referenceData: Partial<ReferenceData>, token: string) => {
    const response = await apiClient.post('/references/edit', { reference: referenceId, ...referenceData, token })
    return response.data
  },
  
  deleteReference: async (referenceId: string, token: string) => {
    const response = await apiClient.post('/references/remove', { reference: referenceId, token })
    return response.data
  }
}

// Summaries API calls
export const summariesAPI = {
  getSummaries: async (token: string, params?: {
    summaries?: string[]
    sources?: string[]
    user?: string
    before?: string
    after?: string
  }) => {
    const response = await apiClient.post('/summaries', { token, ...params })
    return response.data
  },
  
  createSummary: async (summaryData: SummaryData, token: string) => {
    const response = await apiClient.post('/summaries/add', { ...summaryData, token })
    return response.data
  },
  
  generateSummary: async (sources: string[], token: string) => {
    const response = await apiClient.post('/summaries/generate', { sources, token })
    return response.data
  },
  
  editSummary: async (summaryId: string, summaryData: Partial<SummaryData>, token: string) => {
    const response = await apiClient.post('/summaries/edit', { summary: summaryId, ...summaryData, token })
    return response.data
  },
  
  deleteSummary: async (summaryId: string, token: string) => {
    const response = await apiClient.post('/summaries/remove', { summary: summaryId, token })
    return response.data
  }
}

// Templates API calls
export const templatesAPI = {
  getTemplates: async (token: string, params?: {
    templates?: string[]
    global?: boolean
    user?: string
    before?: string
    after?: string
  }) => {
    const response = await apiClient.post('/templates', { token, ...params })
    return response.data
  },
  
  createTemplate: async (templateData: TemplateData, token: string) => {
    const response = await apiClient.post('/templates/add', { ...templateData, token })
    return response.data
  },
  
  editTemplate: async (templateId: string, templateData: Partial<TemplateData>, token: string) => {
    const response = await apiClient.post('/templates/edit', { template: templateId, ...templateData, token })
    return response.data
  },
  
  deleteTemplate: async (templateId: string, token: string) => {
    const response = await apiClient.post('/templates/remove', { template: templateId, token })
    return response.data
  }
}

// Outputs API calls
export const outputsAPI = {
  getOutputs: async (token: string, params?: {
    outputs?: string[]
    templates?: string[]
    user?: string
    before?: string
    after?: string
  }) => {
    const response = await apiClient.post('/outputs', { token, ...params })
    return response.data
  },
  
  createOutput: async (outputData: OutputData, token: string) => {
    const response = await apiClient.post('/outputs/add', { ...outputData, token })
    return response.data
  },
  
  generateOutput: async (template: string, sources: string[], token: string) => {
    const response = await apiClient.post('/outputs/generate', { template, sources, token })
    return response.data
  },
  
  editOutput: async (outputId: string, outputData: Partial<OutputData>, token: string) => {
    const response = await apiClient.post('/outputs/edit', { output: outputId, ...outputData, token })
    return response.data
  },
  
  deleteOutput: async (outputId: string, token: string) => {
    const response = await apiClient.post('/outputs/remove', { output: outputId, token })
    return response.data
  }
}

// Directives API calls
export const directivesAPI = {
  getDirectives: async (token: string, params?: {
    directives?: string[]
    user?: string
    before?: string
    after?: string
  }) => {
    const response = await apiClient.post('/directives', { token, ...params })
    return response.data
  },
  
  createDirective: async (directiveData: DirectiveData, token: string) => {
    const response = await apiClient.post('/directives/add', { ...directiveData, token })
    return response.data
  },
  
  editDirective: async (directiveId: string, directiveData: Partial<DirectiveData>, token: string) => {
    const response = await apiClient.post('/directives/edit', { directive: directiveId, ...directiveData, token })
    return response.data
  },
  
  deleteDirective: async (directiveId: string, token: string) => {
    const response = await apiClient.post('/directives/remove', { directive: directiveId, token })
    return response.data
  }
}

// Listeners API calls
export const listenersAPI = {
  getListeners: async (token: string, params?: {
    listeners?: string[]
    types?: string[]
    user?: string
    before?: string
    after?: string
  }) => {
    const response = await apiClient.post('/listeners', { token, ...params })
    return response.data
  },
  
  createListener: async (listenerData: ListenerData, token: string) => {
    const response = await apiClient.post('/listeners/add', { ...listenerData, token })
    return response.data
  },
  
  editListener: async (listenerId: string, listenerData: Partial<ListenerData>, token: string) => {
    const response = await apiClient.post('/listeners/edit', { listener: listenerId, ...listenerData, token })
    return response.data
  },
  
  deleteListener: async (listenerId: string, token: string) => {
    const response = await apiClient.post('/listeners/remove', { listener: listenerId, token })
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

// Main API object that groups all API modules
export const api = {
  auth: authAPI,
  folders: foldersAPI,
  sources: sourcesAPI,
  references: referencesAPI,
  summaries: summariesAPI,
  templates: templatesAPI,
  outputs: outputsAPI,
  directives: directivesAPI,
  listeners: listenersAPI,
  upload: uploadAPI
}
