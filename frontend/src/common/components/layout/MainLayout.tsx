import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', emoji: '📊', color: 'from-blue-400 to-blue-600' },
  { name: 'Topics', href: '/topics', emoji: '📚', color: 'from-green-400 to-green-600' },
  { name: 'PDFs', href: '/pdfs', emoji: '📄', color: 'from-red-400 to-red-600' },
  { name: 'Study', href: '/study', emoji: '⏰', color: 'from-yellow-400 to-orange-500' },
  { name: 'Notes', href: '/notes', emoji: '📝', color: 'from-purple-400 to-purple-600' },
  { name: 'Exercises', href: '/exercises', emoji: '🎯', color: 'from-pink-400 to-pink-600' },
  { name: 'Goals', href: '/goals', emoji: '🏆', color: 'from-yellow-400 to-yellow-600' },
  { name: 'Analytics', href: '/analytics', emoji: '📈', color: 'from-indigo-400 to-indigo-600' },
  { name: 'Settings', href: '/settings', emoji: '⚙️', color: 'from-gray-400 to-gray-600' },
]

export const MainLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()
  const location = useLocation()
  
  const getPageTitle = () => {
    const path = location.pathname.split('/')[1]
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : 'Dashboard'
  }

  const getSidebarClasses = () => {
    const baseClasses = 'apple-sidebar flex flex-col transition-all duration-300 ease-out'
    const widthClass = sidebarCollapsed ? 'w-20' : 'w-80'
    return `${baseClasses} ${widthClass}`
  }

  const getNavLinkClasses = (isActive: boolean) => {
    const baseClasses = 'flex items-center px-4 py-3 rounded-apple text-base font-semibold transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 group'
    if (isActive) {
      return `${baseClasses} bg-blue-500 text-white shadow-apple-lg hover:bg-blue-600 hover:shadow-xl`
    }
    const justifyClass = sidebarCollapsed ? 'justify-center px-4' : ''
    return `${baseClasses} text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 ${justifyClass}`
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Beautiful Sidebar */}
      <div className={getSidebarClasses()}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-apple-lg flex items-center justify-center shadow-apple-lg">
                <span className="text-white font-bold text-xl">SS</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">StudySprint</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">4.0</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-apple hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg className={`w-5 h-5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => getNavLinkClasses(isActive)}
            >
              <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mr-3 shadow-apple group-hover:shadow-apple-lg transition-all duration-200`}>
                <span className="text-lg">{item.emoji}</span>
              </div>
              {!sidebarCollapsed && (
                <span>{item.name}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Beautiful Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Apple HIG Design System
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Beautiful • Functional • Fast
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Beautiful Header */}
        <header className="apple-card m-4 mb-0 rounded-apple-lg">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {getPageTitle()}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                {getPageTitle() === 'Dashboard' ? 'Overview of your study progress and achievements' : `Manage and organize your ${getPageTitle().toLowerCase()}`}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button className="p-3 rounded-apple hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shadow-apple hover:shadow-apple-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Notifications */}
              <button className="p-3 rounded-apple hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 relative shadow-apple hover:shadow-apple-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.823 17.177l-.396-.396M8.823 17.177l.396.396M8.823 17.177A4.963 4.963 0 017 13a5 5 0 0110 0 4.963 4.963 0 01-1.823 4.177z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                </span>
              </button>

              {/* Beautiful Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-3 rounded-apple hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 shadow-apple hover:shadow-apple-lg"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
