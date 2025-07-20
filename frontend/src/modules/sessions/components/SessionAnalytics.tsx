// frontend/src/modules/sessions/components/SessionAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useSessionAnalytics } from '../hooks';
import { SessionAnalytics as AnalyticsData } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface SessionAnalyticsProps {
  topicId?: string;
  timeRange?: 'week' | 'month' | 'quarter';
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ 
  topicId, 
  timeRange = 'week' 
}) => {
  const { analytics, loading, error, refetch } = useSessionAnalytics(topicId, timeRange);
  const [selectedChart, setSelectedChart] = useState<'focus' | 'productivity' | 'daily'>('focus');

  const focusTrendData = {
    labels: analytics?.focus_trend?.map((_, index) => `Session ${index + 1}`) || [],
    datasets: [
      {
        label: 'Focus Score',
        data: analytics?.focus_trend || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const productivityTrendData = {
    labels: analytics?.productivity_trend?.map((_, index) => `Session ${index + 1}`) || [],
    datasets: [
      {
        label: 'Productivity Score',
        data: analytics?.productivity_trend || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const dailyStudyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Study Minutes',
        data: analytics?.daily_study_minutes || [],
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 1,
      },
    ],
  };

  const sessionTypeData = {
    labels: ['Study', 'Review', 'Exercise', 'Research'],
    datasets: [
      {
        data: [65, 20, 10, 5], // Mock data - would come from analytics
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: selectedChart === 'daily' ? undefined : 100,
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading analytics</div>
          <button onClick={refetch} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.total_sessions || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              📚
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((analytics?.total_study_time_minutes || 0) / 60)}h
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              ⏱️
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Focus</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analytics?.average_focus_score || 0)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              🎯
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pages Read</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.total_pages_read || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              📖
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedChart('focus')}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedChart === 'focus' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => setSelectedChart('productivity')}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedChart === 'productivity' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Productivity
            </button>
            <button
              onClick={() => setSelectedChart('daily')}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedChart === 'daily' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily
            </button>
          </div>
        </div>

        <div className="h-64">
          {selectedChart === 'focus' && (
            <Line data={focusTrendData} options={chartOptions} />
          )}
          {selectedChart === 'productivity' && (
            <Line data={productivityTrendData} options={chartOptions} />
          )}
          {selectedChart === 'daily' && (
            <Bar data={dailyStudyData} options={chartOptions} />
          )}
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium text-blue-900">Best Study Time</div>
                <div className="text-sm text-blue-700">{analytics?.best_study_time || 'Not enough data'}</div>
              </div>
              <div className="text-2xl">🌅</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-900">Most Productive Environment</div>
                <div className="text-sm text-green-700">{analytics?.most_productive_environment || 'Not enough data'}</div>
              </div>
              <div className="text-2xl">🏠</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium text-purple-900">Average Session Rating</div>
                <div className="text-sm text-purple-700">{analytics?.average_session_rating || 0}/5 stars</div>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Distribution</h3>
          <div className="h-64">
            <Doughnut data={sessionTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};
