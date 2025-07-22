/* ===================================
   9. COPY THIS TO: src/pages/Dashboard.tsx
   ================================ */
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { TopicsService } from '../common/services/api'
import { Card } from '../common/components/ui/Card'
import { Button } from '../common/components/ui/Button'
import { 
  BookOpen, Clock, Target, TrendingUp, 
  Calendar, Zap, Award, ChevronRight,
  Plus, Play
} from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { data: topics, isLoading } = useQuery({
    queryKey: ['topics'],
    queryFn: TopicsService.getAll,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600 dark:text-gray-400 text-lg">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl"></div>
        <Card gradient className="relative">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Ready to continue your learning journey? Let's make today productive!
              </p>
            </div>
            <Button size="lg" className="shadow-xl">
              <Play className="w-5 h-5 mr-2" />
              Start Studying
            </Button>
          </div>
        </Card>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover gradient className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Streak</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">7 days</p>
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Keep it up!
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card hover gradient className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Topics</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{topics?.length || 0}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                <BookOpen className="w-4 h-4 mr-1" />
                In progress
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card hover gradient className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">12h 30m</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" />
                Study time
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card hover gradient className="group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goals</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">5/8</p>
              <p className="text-sm text-orange-600 dark:text-orange-400 flex items-center mt-1">
                <Target className="w-4 h-4 mr-1" />
                Completed
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Topics */}
        <div className="lg:col-span-2">
          <Card gradient className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Topics</h2>
              <Button variant="secondary" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {topics && topics.length > 0 ? (
              <div className="space-y-4">
                {topics.slice(0, 5).map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all cursor-pointer group">
                    <div className="flex items-center space-x-4 flex-1">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: topic.color + '20' }}
                      >
                        <BookOpen className="w-5 h-5" style={{ color: topic.color }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {topic.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {topic.total_pdfs} PDFs • Level {topic.difficulty_level}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.round(topic.study_progress)}%
                        </p>
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all" 
                            style={{ width: `${topic.study_progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No topics yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create your first topic to start your learning journey!
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Topic
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions & Progress */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card gradient>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button className="w-full justify-start text-left" size="lg">
                <Play className="w-5 h-5 mr-3" />
                Start Study Session
              </Button>
              <Button variant="secondary" className="w-full justify-start text-left" size="lg">
                <BookOpen className="w-5 h-5 mr-3" />
                Browse Topics
              </Button>
              <Button variant="secondary" className="w-full justify-start text-left" size="lg">
                <Target className="w-5 h-5 mr-3" />
                Set New Goal
              </Button>
            </div>
          </Card>

          {/* Today's Progress */}
          <Card gradient>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Today's Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Study Goal</span>
                  <span className="font-medium text-gray-900 dark:text-white">68%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500" style={{ width: '68%' }}></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  1.4 hours completed • 36 minutes remaining
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Reading Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">3/5 pages</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Weekly Goal</span>
                  <span className="font-medium text-gray-900 dark:text-white">12h 30m / 20h</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-500" style={{ width: '62%' }}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* Achievement Badge */}
          <Card gradient className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">7-Day Streak!</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">You're on fire! Keep it up.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}