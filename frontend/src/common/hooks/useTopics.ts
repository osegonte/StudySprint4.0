// frontend/src/common/hooks/useTopics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TopicsService, Topic } from '../services/api'
import toast from 'react-hot-toast'

export const useTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: TopicsService.getAll,
  })
}

export const useTopic = (id: string) => {
  return useQuery({
    queryKey: ['topics', id],
    queryFn: () => TopicsService.getById(id),
    enabled: !!id,
  })
}

export const useCreateTopic = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: TopicsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      toast.success('Topic created successfully!')
    },
    onError: () => {
      toast.error('Failed to create topic')
    }
  })
}

export const useUpdateTopic = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Topic> }) =>
      TopicsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      toast.success('Topic updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update topic')
    }
  })
}

export const useDeleteTopic = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: TopicsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      toast.success('Topic deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete topic')
    }
  })
}
