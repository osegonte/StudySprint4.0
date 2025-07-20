import React, { useState } from 'react';
import { Topic } from '../types';

interface TopicSidebarProps {
  topics: Topic[];
  selectedTopic: Topic | null;
  onTopicSelect: (topic: Topic | null) => void;
}

export const TopicSidebar: React.FC<TopicSidebarProps> = ({
  topics,
  selectedTopic,
  onTopicSelect
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedTopics = filteredTopics.sort((a, b) => b.priority_level - a.priority_level);

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-40
      ${isCollapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="font-semibold text-gray-900">Topics</h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Topics</span>
                <span className="font-semibold">{topics.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Progress</span>
                <span className="font-semibold">
                  {topics.length > 0 
                    ? Math.round(topics.reduce((sum, t) => sum + t.study_progress, 0) / topics.length)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Topics List */}
      <div className="flex-1 overflow-y-auto">
        {isCollapsed ? (
          // Collapsed view - just icons
          <div className="p-2 space-y-2">
            {sortedTopics.slice(0, 8).map(topic => (
              <button
                key={topic.id}
                onClick={() => onTopicSelect(topic)}
                className={`
                  w-12 h-12 rounded-lg flex items-center justify-center transition-colors
                  ${selectedTopic?.id === topic.id 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'hover:bg-gray-100'
                  }
                `}
                style={{ backgroundColor: selectedTopic?.id === topic.id ? undefined : `${topic.color}20` }}
                title={topic.name}
              >
                {topic.icon === 'book' ? '📚' : 
                 topic.icon === 'science' ? '🔬' : 
                 topic.icon === 'math' ? '📐' : 
                 topic.icon === 'history' ? '🏛️' : 
                 topic.icon === 'language' ? '🗣️' : '📚'}
              </button>
            ))}
          </div>
        ) : (
          // Expanded view
          <div className="p-2">
            {/* All Topics Button */}
            <button
              onClick={() => onTopicSelect(null)}
              className={`
                w-full p-3 rounded-lg mb-2 flex items-center space-x-3 transition-colors text-left
                ${!selectedTopic 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'hover:bg-gray-100'
                }
              `}
            >
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                📋
              </div>
              <div>
                <div className="font-medium">All Topics</div>
                <div className="text-xs text-gray-500">{topics.length} topics</div>
              </div>
            </button>

            {/* Topic Items */}
            <div className="space-y-1">
              {sortedTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => onTopicSelect(topic)}
                  className={`
                    w-full p-3 rounded-lg flex items-center space-x-3 transition-colors text-left
                    ${selectedTopic?.id === topic.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: topic.color }}
                  >
                    {topic.icon === 'book' ? '📚' : 
                     topic.icon === 'science' ? '🔬' : 
                     topic.icon === 'math' ? '📐' : 
                     topic.icon === 'history' ? '🏛️' : 
                     topic.icon === 'language' ? '🗣️' : '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{topic.name}</div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{topic.total_pdfs} PDFs</span>
                      <span>•</span>
                      <span>{Math.round(topic.study_progress)}%</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>

            {/* Show more button if there are many topics */}
            {topics.length > sortedTopics.length && (
              <button className="w-full p-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Show {topics.length - sortedTopics.length} more...
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
