import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, Book, FileText, Clock, Bookmark, Target, BarChart3, Settings,
  ChevronRight
} from 'lucide-react'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, color: 'from-blue-500 to-blue-600' },
  { name: 'Topics', href: '/topics', icon: Book, color: 'from-green-500 to-green-600' },
  { name: 'PDFs', href: '/pdfs', icon: FileText, color: 'from-red-500 to-red-600' },
  { name: 'Study', href: '/study', icon: Clock, color: 'from-orange-500 to-orange-600' },
  { name: 'Notes', href: '/notes', icon: Bookmark, color: 'from-purple-500 to-purple-600' },
  { name: 'Goals', href: '/goals', icon: Target, color: 'from-pink-500 to-pink-600' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'from-indigo-500 to-indigo-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'from-gray-500 to-gray-600' },
]

export const Sidebar: React.FC = () => {
  return (
    <nav className="fixed left-0 top-16 bottom-0 w-64 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 p-4 overflow-y-auto">
      <div className="space-y-2 mt-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              clsx(
                'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
              )
            }
            style={({ isActive }) => isActive ? {
              background: `linear-gradient(135deg, ${item.color.split(' ')[1]} 0%, ${item.color.split(' ')[3]} 100%)`
            } : {}}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </div>
            <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Today's Focus</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Complete 3 study sessions</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">2 of 3 sessions completed</p>
      </div>
    </nav>
  )
}
