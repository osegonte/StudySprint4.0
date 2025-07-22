// frontend/src/pages/TopicsPage.tsx
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Archive } from 'lucide-react'
import { TopicsService, Topic } from '../common/services/api'
import { Card } from '../common/components/ui/Card'
import { Button } from '../common/components/ui/Button'
import { Input } from '../common/components/ui/Input'
import { Badge } from '../common/components/ui/Badge'
import { Progress } from '../common/components/ui/Progress'
import { Modal } from '../common/components/ui/Modal'
import toast from 'react-hot-toast'

export const TopicsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTopic, setNewTopic] = useState({ name: '', description: '', color: '#3b82f6' })
  
  const queryClient = useQueryClient()
  
  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: TopicsService.getAll,
  })

  const createMutation = useMutation({
    mutationFn: TopicsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] })
      toast.success('Topic created successfully!')
      setShowCreateModal(false)
      setNewTopic({ name: '', description: '', color: '#3b82f6' })
    },
    onError: () => {
      toast.error('Failed to create topic')
    }
  })

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateTopic = () => {
    if (!newTopic.name.trim()) return
    createMutation.mutate(newTopic)
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading topics...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Topics</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Topic
        </Button>
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search topics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTopics.map((topic) => (
          <Card key={topic.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: topic.color }}
                />
                <h3 className="font-semibold text-gray-900">{topic.name}</h3>
              </div>
              {topic.is_archived && (
                <Badge variant="secondary" size="sm">
                  <Archive className="w-3 h-3 mr-1" />
                  Archived
                </Badge>
              )}
            </div>
            
            {topic.description && (
              <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
            )}
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Progress</span>
                <span className="font-medium">{Math.round(topic.study_progress)}%</span>
              </div>
              <Progress value={topic.study_progress} size="sm" />
              
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="flex space-x-4 text-sm text-gray-500">
                  <span>{topic.total_pdfs} PDFs</span>
                  <span>{topic.total_exercises} Exercises</span>
                </div>
                <Badge 
                  variant={topic.difficulty_level <= 2 ? 'success' : topic.difficulty_level <= 4 ? 'warning' : 'danger'}
                  size="sm"
                >
                  Level {topic.difficulty_level}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm ? 'No topics match your search.' : 'No topics yet. Create your first topic to get started!'}
          </div>
          {!searchTerm && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Topic
            </Button>
          )}
        </Card>
      )}

      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Create New Topic"
      >
        <div className="space-y-4">
          <Input
            label="Topic Name"
            placeholder="Enter topic name..."
            value={newTopic.name}
            onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Description (Optional)"
            placeholder="Brief description..."
            value={newTopic.description}
            onChange={(e) => setNewTopic(prev => ({ ...prev, description: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              value={newTopic.color}
              onChange={(e) => setNewTopic(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex space-x-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTopic}
              loading={createMutation.isPending}
              className="flex-1"
            >
              Create Topic
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}