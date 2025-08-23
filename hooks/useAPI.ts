import { useState, useEffect, useCallback } from 'react'
import { 
  authAPI, 
  foldersAPI, 
  sourcesAPI, 
  referencesAPI, 
  summariesAPI, 
  templatesAPI, 
  outputsAPI, 
  directivesAPI, 
  listenersAPI 
} from '@/lib/api'
import type { 
  FolderData, 
  SourceData, 
  ReferenceData, 
  SummaryData, 
  TemplateData, 
  OutputData, 
  DirectiveData, 
  ListenerData,
  ClientData,
  CampaignData
} from '@/lib/api'

// Authentication Hook
export const useAuth = () => {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      setIsAuthenticated(true)
    }
  }, [])

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setIsLoading(true)
    setError(null)
    console.log('Login attempt with email:', credentials.email)
    try {
      const response = await authAPI.login(credentials)
      console.log('Login response:', response)
      const userToken = response.token
      setToken(userToken)
      setIsAuthenticated(true)
      localStorage.setItem('token', userToken)
      return response
    } catch (err) {
      console.error('Login error details:', err)
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const signup = useCallback(async (data: { email: string; password: string; name: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authAPI.signup(data)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      if (token) {
        await authAPI.logout(token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setToken(null)
      setIsAuthenticated(false)
      localStorage.removeItem('token')
      setIsLoading(false)
    }
  }, [token])

  const checkAuth = useCallback(async () => {
    if (!token) return false
    try {
      await authAPI.check(token)
      return true
    } catch {
      setToken(null)
      setIsAuthenticated(false)
      localStorage.removeItem('token')
      return false
    }
  }, [token])

  return {
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    checkAuth
  }
}

// Folders Hook (for Clients/Campaigns)
export const useFolders = () => {
  const [folders, setFolders] = useState<FolderData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFolders = useCallback(async (token: string, filters?: {
    folders?: string[]
    metadata?: Record<string, unknown>
    parent?: string | null
    before?: string
    after?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await foldersAPI.getFolders(token, filters)
      setFolders(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch folders'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createFolder = useCallback(async (folderData: Omit<FolderData, '_id' | 'timestamp'>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const newFolder = await foldersAPI.createFolder(folderData, token)
      setFolders(prev => [...prev, newFolder])
      return newFolder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create folder'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const editFolder = useCallback(async (folderId: string, updates: Partial<FolderData>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedFolder = await foldersAPI.editFolder(folderId, updates, token)
      setFolders(prev => prev.map(folder => 
        folder._id === folderId ? { ...folder, ...updates } : folder
      ))
      return updatedFolder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update folder'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteFolder = useCallback(async (folderId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await foldersAPI.deleteFolder(folderId, token)
      setFolders(prev => prev.filter(folder => folder._id !== folderId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete folder'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    folders,
    isLoading,
    error,
    fetchFolders,
    createFolder,
    editFolder,
    deleteFolder
  }
}

// Sources Hook
export const useSources = () => {
  const [sources, setSources] = useState<SourceData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSources = useCallback(async (token: string, filters?: {
    sources?: string[]
    types?: string[]
    before?: string
    after?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await sourcesAPI.getSources(token, filters)
      setSources(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sources'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createSource = useCallback(async (sourceData: Omit<SourceData, '_id' | 'timestamp'>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const newSource = await sourcesAPI.createSource(sourceData, token)
      setSources(prev => [...prev, newSource])
      return newSource
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create source'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const editSource = useCallback(async (sourceId: string, updates: Partial<SourceData>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedSource = await sourcesAPI.editSource(sourceId, updates, token)
      setSources(prev => prev.map(source => 
        source._id === sourceId ? { ...source, ...updates } : source
      ))
      return updatedSource
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update source'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteSource = useCallback(async (sourceId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await sourcesAPI.deleteSource(sourceId, token)
      setSources(prev => prev.filter(source => source._id !== sourceId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete source'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    sources,
    isLoading,
    error,
    fetchSources,
    createSource,
    editSource,
    deleteSource
  }
}

// References Hook
export const useReferences = () => {
  const [references, setReferences] = useState<ReferenceData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReferences = useCallback(async (token: string, filters?: {
    references?: string[]
    before?: string
    after?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await referencesAPI.getReferences(token, filters)
      setReferences(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch references'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createReference = useCallback(async (referenceData: Omit<ReferenceData, '_id' | 'timestamp'>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const newReference = await referencesAPI.createReference(referenceData, token)
      setReferences(prev => [...prev, newReference])
      return newReference
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reference'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const editReference = useCallback(async (referenceId: string, updates: Partial<ReferenceData>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedReference = await referencesAPI.editReference(referenceId, updates, token)
      setReferences(prev => prev.map(reference => 
        reference._id === referenceId ? { ...reference, ...updates } : reference
      ))
      return updatedReference
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update reference'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteReference = useCallback(async (referenceId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await referencesAPI.deleteReference(referenceId, token)
      setReferences(prev => prev.filter(reference => reference._id !== referenceId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reference'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    references,
    isLoading,
    error,
    fetchReferences,
    createReference,
    editReference,
    deleteReference
  }
}

// Summaries Hook
export const useSummaries = () => {
  const [summaries, setSummaries] = useState<SummaryData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSummaries = useCallback(async (token: string, filters?: {
    summaries?: string[]
    before?: string
    after?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await summariesAPI.getSummaries(token, filters)
      setSummaries(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch summaries'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateSummary = useCallback(async (sourceIds: string[], token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const newSummary = await summariesAPI.generateSummary(sourceIds, token)
      setSummaries(prev => [...prev, newSummary])
      return newSummary
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteSummary = useCallback(async (summaryId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await summariesAPI.deleteSummary(summaryId, token)
      setSummaries(prev => prev.filter(summary => summary._id !== summaryId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete summary'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    summaries,
    isLoading,
    error,
    fetchSummaries,
    generateSummary,
    deleteSummary
  }
}

// Templates Hook
export const useTemplates = () => {
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTemplates = useCallback(async (token: string, filters?: {
    templates?: string[]
    global?: boolean
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await templatesAPI.getTemplates(token, filters)
      setTemplates(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch templates'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTemplate = useCallback(async (templateData: Omit<TemplateData, '_id' | 'timestamp'>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const newTemplate = await templatesAPI.createTemplate(templateData, token)
      setTemplates(prev => [...prev, newTemplate])
      return newTemplate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create template'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const editTemplate = useCallback(async (templateId: string, updates: Partial<TemplateData>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedTemplate = await templatesAPI.editTemplate(templateId, updates, token)
      setTemplates(prev => prev.map(template => 
        template._id === templateId ? { ...template, ...updates } : template
      ))
      return updatedTemplate
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update template'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteTemplate = useCallback(async (templateId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await templatesAPI.deleteTemplate(templateId, token)
      setTemplates(prev => prev.filter(template => template._id !== templateId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete template'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    editTemplate,
    deleteTemplate
  }
}

// Outputs Hook
export const useOutputs = () => {
  const [outputs, setOutputs] = useState<OutputData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOutputs = useCallback(async (token: string, filters?: {
    outputs?: string[]
    before?: string
    after?: string
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await outputsAPI.getOutputs(token, filters)
      setOutputs(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch outputs'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateOutput = useCallback(async (templateId: string, sourceIds: string[], token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const newOutput = await outputsAPI.generateOutput(templateId, sourceIds, token)
      setOutputs(prev => [...prev, newOutput])
      return newOutput
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate output'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteOutput = useCallback(async (outputId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await outputsAPI.deleteOutput(outputId, token)
      setOutputs(prev => prev.filter(output => output._id !== outputId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete output'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    outputs,
    isLoading,
    error,
    fetchOutputs,
    generateOutput,
    deleteOutput
  }
}

// Directives Hook
export const useDirectives = () => {
  const [directives, setDirectives] = useState<DirectiveData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDirectives = useCallback(async (token: string, filters?: {
    directives?: string[]
    global?: boolean
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await directivesAPI.getDirectives(token, filters)
      setDirectives(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch directives'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createDirective = useCallback(async (directiveData: Omit<DirectiveData, '_id' | 'timestamp'>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const newDirective = await directivesAPI.createDirective(directiveData, token)
      setDirectives(prev => [...prev, newDirective])
      return newDirective
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create directive'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const editDirective = useCallback(async (directiveId: string, updates: Partial<DirectiveData>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedDirective = await directivesAPI.editDirective(directiveId, updates, token)
      setDirectives(prev => prev.map(directive => 
        directive._id === directiveId ? { ...directive, ...updates } : directive
      ))
      return updatedDirective
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update directive'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteDirective = useCallback(async (directiveId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await directivesAPI.deleteDirective(directiveId, token)
      setDirectives(prev => prev.filter(directive => directive._id !== directiveId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete directive'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    directives,
    isLoading,
    error,
    fetchDirectives,
    createDirective,
    editDirective,
    deleteDirective
  }
}

// Listeners Hook
export const useListeners = () => {
  const [listeners, setListeners] = useState<ListenerData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchListeners = useCallback(async (token: string, filters?: {
    listeners?: string[]
    types?: string[]
    active?: boolean
  }) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await listenersAPI.getListeners(token, filters)
      setListeners(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch listeners'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createListener = useCallback(async (listenerData: Omit<ListenerData, '_id' | 'timestamp'>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const newListener = await listenersAPI.createListener(listenerData, token)
      setListeners(prev => [...prev, newListener])
      return newListener
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create listener'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const editListener = useCallback(async (listenerId: string, updates: Partial<ListenerData>, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const updatedListener = await listenersAPI.editListener(listenerId, updates, token)
      setListeners(prev => prev.map(listener => 
        listener._id === listenerId ? { ...listener, ...updates } : listener
      ))
      return updatedListener
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update listener'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteListener = useCallback(async (listenerId: string, token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await listenersAPI.deleteListener(listenerId, token)
      setListeners(prev => prev.filter(listener => listener._id !== listenerId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete listener'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    listeners,
    isLoading,
    error,
    fetchListeners,
    createListener,
    editListener,
    deleteListener
  }
}

// Legacy hooks for backward compatibility
export const useClients = () => {
  const { folders, isLoading, error, fetchFolders, createFolder, deleteFolder } = useFolders()
  
  const clients = folders
    .filter(folder => folder.metadata?.type === 'client')
    .map(folder => ({
      id: folder._id || '',
      name: folder.title || '',
      email: folder.metadata?.email as string || '',
      description: folder.metadata?.description as string || ''
    }))

  const createClient = useCallback(async (clientData: ClientData, token: string) => {
    return createFolder({
      title: clientData.name,
      metadata: {
        type: 'client',
        email: clientData.email,
        description: clientData.description
      }
    }, token)
  }, [createFolder])

  const fetchClients = useCallback(async (token: string) => {
    return fetchFolders(token, {
      metadata: { type: 'client' },
      parent: null
    })
  }, [fetchFolders])

  const deleteClient = useCallback(async (clientId: string, token: string) => {
    return deleteFolder(clientId, token)
  }, [deleteFolder])

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    deleteClient
  }
}

export const useCampaigns = () => {
  const folderHook = useFolders()
  
  const campaigns = folderHook.folders
    .filter(folder => folder.metadata?.type === 'campaign')
    .map(folder => ({
      id: folder._id || '',
      name: folder.title || '',
      clientId: folder.parent || '',
      deadline: folder.metadata?.deadline as string || '',
      description: folder.metadata?.description as string || ''
    }))

  const createCampaign = useCallback(async (campaignData: CampaignData, token: string) => {
    return folderHook.createFolder({
      title: campaignData.name,
      parent: campaignData.clientId,
      metadata: {
        type: 'campaign',
        deadline: campaignData.deadline,
        description: campaignData.description
      }
    }, token)
  }, [folderHook])

  const fetchCampaigns = useCallback(async (token: string, clientId?: string) => {
    const filters: { metadata: { type: string }; parent?: string } = { metadata: { type: 'campaign' } }
    if (clientId) {
      filters.parent = clientId
    }
    return folderHook.fetchFolders(token, filters)
  }, [folderHook])

  const deleteCampaign = useCallback(async (campaignId: string, token: string) => {
    return folderHook.deleteFolder(campaignId, token)
  }, [folderHook])

  return {
    campaigns,
    isLoading: folderHook.isLoading,
    error: folderHook.error,
    fetchCampaigns,
    createCampaign,
    deleteCampaign
  }
}
