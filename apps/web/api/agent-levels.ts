import { api } from "@/lib/axios"
import type { ApiResponse, PaginatedResponse } from "@/lib/types"

export type AgentLevelsQuery = {
  page?: number
  limit?: number
  search?: string
}

export type AgentLevelListItem = {
  id: string
  code: string
  description: string
  yearsOfExperience: number
  maxConcurrentConversations: number
  createdAt: string
  updatedAt: string
}

export type CreateAgentLevelPayload = {
  code: string
  description: string
  yearsOfExperience: number
  maxConcurrentConversations: number
}

export type UpdateAgentLevelPayload = Partial<CreateAgentLevelPayload>

export const agentLevels = {
  getAll: (query?: AgentLevelsQuery) =>
    api.get<ApiResponse<PaginatedResponse<AgentLevelListItem>>>("/agent-levels", {
      params: query,
    }),
  getById: (id: string) => api.get<ApiResponse<AgentLevelListItem>>(`/agent-levels/${id}`),
  create: (payload: CreateAgentLevelPayload) =>
    api.post<ApiResponse<AgentLevelListItem>>("/agent-levels", payload),
  update: (id: string, payload: UpdateAgentLevelPayload) =>
    api.patch<ApiResponse<AgentLevelListItem>>(`/agent-levels/${id}`, payload),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/agent-levels/${id}`),
}
