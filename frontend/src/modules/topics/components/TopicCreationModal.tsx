import React, { useState } from 'react';
import { useTopics } from '../hooks';

interface TopicCreationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const TopicCreationModal: React.FC<TopicCreationModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { createTopic } = useTopics();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db',
    icon: 'book',
    difficulty_level: 1,
    priority_level: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predefinedColors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#34495e', '#e67e22', '#1abc9c', '#f1c40f', '#95a5a6'
  ];

  const iconOptions = [
    { value: 'book', label: '📚 Book', emoji: '📚' },
    { value: 'science', label: '🔬 Science', emoji: '🔬' },
    { value: 'math', label: '📐 Math', emoji: '📐' },
    { value: 'history', label: '🏛️ History', emoji: '🏛️' },
    { value: 'language', label: '🗣️ Language', emoji: '🗣️' },
    { value: 'art', label: '🎨 Art', emoji: '🎨' },
    { value: 'music', label: '🎵 Music', emoji: '🎵' },
    { value: 'computer', label: '💻 Computer', emoji: '💻' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createTopic(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create topic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New Topic</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Topic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter topic name"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Optional description"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color Theme
              </label>
              <div className="grid grid-cols-5 gap-3">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`
                      w-12 h-12 rounded-lg border-2 transition-all
                      ${formData.color === color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-200 hover:border-gray-400'
                      }
                    `}
                    style={{ backgroundColor: color }}
                  >
                    {formData.color === color && (
                      <svg className="w-6 h-6 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map(icon => (
                  <button
                    key={icon.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                    className={`
                      p-3 rounded-lg border transition-all text-center
                      ${formData.icon === icon.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-600' 
                        : 'border-gray-200 hover:border-gray-400'
                      }
                    `}
                  >
                    <div className="text-xl mb-1">{icon.emoji}</div>
                    <div className="text-xs">{icon.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty_level: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 - Beginner</option>
                  <option value={2}>2 - Easy</option>
                  <option value={3}>3 - Intermediate</option>
                  <option value={4}>4 - Advanced</option>
                  <option value={5}>5 - Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={formData.priority_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority_level: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 - Low</option>
                  <option value={2}>2 - Normal</option>
                  <option value={3}>3 - Medium</option>
                  <option value={4}>4 - High</option>
                  <option value={5}>5 - Critical</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.color }}
                >
                  {iconOptions.find(i => i.value === formData.icon)?.emoji}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {formData.name || 'Topic Name'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Level {formData.difficulty_level} • Priority {formData.priority_level}
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim()}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Topic'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
