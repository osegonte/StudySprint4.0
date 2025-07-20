import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Topic } from '../types';
import { useTopics } from '../hooks';
import { TopicCard } from './TopicCard';
import { TopicCreationModal } from './TopicCreationModal';
import { TopicSidebar } from './TopicSidebar';

export const TopicDashboard: React.FC = () => {
  const { topics, loading, error, updateTopic, archiveTopic, refetch } = useTopics();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'progress' | 'updated'>('priority');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedTopics = useMemo(() => {
    let filtered = topics.filter(topic => !topic.is_archived);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(topic =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (filterLevel) {
      filtered = filtered.filter(topic => topic.difficulty_level === filterLevel);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priority':
          return b.priority_level - a.priority_level;
        case 'progress':
          return b.study_progress - a.study_progress;
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [topics, searchQuery, filterLevel, sortBy]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.index === destination.index) return;

    // Reorder topics based on drag result
    const reorderedTopics = Array.from(filteredAndSortedTopics);
    const [movedTopic] = reorderedTopics.splice(source.index, 1);
    reorderedTopics.splice(destination.index, 0, movedTopic);

    // Update priority levels based on new order
    const updates = reorderedTopics.map((topic, index) => ({
      id: topic.id,
      priority_level: reorderedTopics.length - index
    }));

    // Apply updates
    for (const update of updates) {
      await updateTopic(update.id, { priority_level: update.priority_level });
    }

    refetch();
  };

  const handleArchiveTopic = async (topic: Topic) => {
    if (window.confirm(`Are you sure you want to archive "${topic.name}"?`)) {
      await archiveTopic(topic.id);
      refetch();
    }
  };

  const getOverviewStats = () => {
    const activeTopics = topics.filter(t => !t.is_archived);
    const totalPDFs = activeTopics.reduce((sum, t) => sum + t.total_pdfs, 0);
    const totalExercises = activeTopics.reduce((sum, t) => sum + t.total_exercises, 0);
    const avgProgress = activeTopics.length > 0 
      ? activeTopics.reduce((sum, t) => sum + t.study_progress, 0) / activeTopics.length 
      : 0;

    return { totalTopics: activeTopics.length, totalPDFs, totalExercises, avgProgress };
  };

  const stats = getOverviewStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading topics...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TopicSidebar 
        topics={topics.filter(t => !t.is_archived)}
        selectedTopic={selectedTopic}
        onTopicSelect={setSelectedTopic}
      />

      {/* Main Content */}
      <div className="lg:ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Topic Dashboard</h1>
              <p className="text-gray-600">Organize and track your study topics</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              + New Topic
            </button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Topics</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTopics}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  📚
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total PDFs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPDFs}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  📄
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Exercises</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExercises}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  ✏️
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgProgress)}%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  📊
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <select
                value={filterLevel || ''}
                onChange={(e) => setFilterLevel(e.target.value ? parseInt(e.target.value) : null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Levels</option>
                <option value="1">Level 1 - Beginner</option>
                <option value="2">Level 2 - Easy</option>
                <option value="3">Level 3 - Intermediate</option>
                <option value="4">Level 4 - Advanced</option>
                <option value="5">Level 5 - Expert</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="priority">Sort by Priority</option>
                <option value="name">Sort by Name</option>
                <option value="progress">Sort by Progress</option>
                <option value="updated">Sort by Updated</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Topics Grid/List */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-2">Error loading topics</div>
            <div className="text-gray-500">{error}</div>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredAndSortedTopics.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              📚
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No topics found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterLevel 
                ? 'Try adjusting your search criteria.' 
                : 'Create your first topic to get started with organized studying.'
              }
            </p>
            {!searchQuery && !filterLevel && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create First Topic
              </button>
            )}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="topics">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredAndSortedTopics.map((topic, index) => (
                    <Draggable key={topic.id} draggableId={topic.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TopicCard
                            topic={topic}
                            onSelect={setSelectedTopic}
                            onEdit={(topic) => console.log('Edit topic:', topic)}
                            onArchive={handleArchiveTopic}
                            isSelected={selectedTopic?.id === topic.id}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <TopicCreationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};