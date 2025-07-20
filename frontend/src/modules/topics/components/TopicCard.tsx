import React from 'react';
import { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  onSelect?: (topic: Topic) => void;
  onEdit?: (topic: Topic) => void;
  onArchive?: (topic: Topic) => void;
  isSelected?: boolean;
  isDragging?: boolean;
}

export const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onSelect,
  onEdit,
  onArchive,
  isSelected = false,
  isDragging = false
}) => {
  const getProgressRingStyle = (progress: number) => {
    const circumference = 2 * Math.PI * 20; // radius = 20
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return { strokeDasharray, strokeDashoffset };
  };

  const getDifficultyColor = (level: number) => {
    const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
    return colors[level - 1] || colors[0];
  };

  const getPriorityIcon = (level: number) => {
    if (level >= 4) return '🔥';
    if (level >= 3) return '⚡';
    if (level >= 2) return '📌';
    return '📝';
  };

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${isDragging ? 'opacity-50 transform rotate-3' : ''}
        border-l-4 hover:transform hover:scale-105
      `}
      style={{ borderLeftColor: topic.color }}
      onClick={() => onSelect?.(topic)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: topic.color }}
          >
            {topic.icon === 'book' ? '📚' : 
             topic.icon === 'science' ? '🔬' : 
             topic.icon === 'math' ? '📐' : 
             topic.icon === 'history' ? '🏛️' : 
             topic.icon === 'language' ? '🗣️' : '📚'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{topic.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{getPriorityIcon(topic.priority_level)}</span>
              <span className={`w-2 h-2 rounded-full ${getDifficultyColor(topic.difficulty_level)}`}></span>
              <span>Level {topic.difficulty_level}</span>
            </div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              stroke={topic.color}
              strokeWidth="2"
              fill="none"
              className="transition-all duration-300"
              style={getProgressRingStyle(topic.study_progress)}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-700">
              {Math.round(topic.study_progress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {topic.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {topic.description}
        </p>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="font-semibold text-lg text-gray-900">{topic.total_pdfs}</div>
          <div className="text-xs text-gray-500">PDFs</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg text-gray-900">{topic.total_exercises}</div>
          <div className="text-xs text-gray-500">Exercises</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg text-gray-900">{topic.estimated_completion_hours}h</div>
          <div className="text-xs text-gray-500">Est. Time</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(topic);
            }}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit topic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchive?.(topic);
            }}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Archive topic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4m0 0l4-4m-4 4V3" />
            </svg>
          </button>
        </div>
        
        <div className="text-xs text-gray-500">
          Updated {new Date(topic.updated_at).toLocaleDateString()}
        </div>
      </div>

      {/* Drag Handle */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>
    </div>
  );
};