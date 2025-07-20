// frontend/src/modules/sessions/components/SessionHistory.tsx
import React, { useState } from 'react';
import { useSessionHistory } from '../hooks';
import { StudySession } from '../types';

interface SessionHistoryProps {
  topicId?: string;
  onSessionSelect?: (session: StudySession) => void;
}

export const SessionHistory: React.FC<SessionHistoryProps> = ({ topicId, onSessionSelect }) => {
  const [filters, setFilters] = useState({
    topic_id: topicId,
    page: 1,
    page_size: 10,
    sort_by: 'start_time',
    sort_order: 'desc'
  });

  const { sessions, loading, error, pagination, refetch } = useSessionHistory(filters);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionTypeColor = (type: string): string => {
    const colors = {
      study: 'bg-blue-100 text-blue-800',
      review: 'bg-green-100 text-green-800',
      exercise: 'bg-purple-100 text-purple-800',
      research: 'bg-orange-100 text-orange-800'
    };
    return colors[type as keyof typeof colors] || colors.study;
  };

  const getFocusScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Session History</h3>
          <div className="text-sm text-gray-500">
            {pagination.total} sessions
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-6 text-center">
          <div className="text-red-600 mb-2">Error loading sessions</div>
          <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Retry
          </button>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            📚
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No sessions yet</h4>
          <p className="text-gray-500">Start your first study session to see it here</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSessionSelect?.(session)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSessionTypeColor(session.session_type)}`}>
                      {session.session_type}
                    </span>
                    <h4 className="font-medium text-gray-900">
                      {session.session_name || `${session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session`}
                    </h4>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(session.start_time)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{formatDuration(session.total_minutes)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Focus Score</div>
                    <div className={`font-medium ${getFocusScoreColor(session.focus_score)}`}>
                      {Math.round(session.focus_score)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Pages</div>
                    <div className="font-medium">{session.pages_completed}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">XP Earned</div>
                    <div className="font-medium text-purple-600">{session.xp_earned}</div>
                  </div>
                </div>

                {session.goals_achieved.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {session.goals_achieved.map((goal, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        ✓ {goal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="p-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.page_size + 1} to{' '}
                  {Math.min(pagination.page * pagination.page_size, pagination.total)} of{' '}
                  {pagination.total} sessions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.total_pages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
Smart