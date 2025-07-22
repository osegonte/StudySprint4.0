import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { Layout } from './common/components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

// Simple placeholder pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <span className="text-white text-xl">🚀</span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
      <p className="text-gray-600 dark:text-gray-400">Coming in Stage 2</p>
    </div>
  </div>
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/topics" element={<PlaceholderPage title="Topics" />} />
            <Route path="/pdfs" element={<PlaceholderPage title="PDF Library" />} />
            <Route path="/study" element={<PlaceholderPage title="Study Session" />} />
            <Route path="/notes" element={<PlaceholderPage title="Notes" />} />
            <Route path="/goals" element={<PlaceholderPage title="Goals" />} />
            <Route path="/analytics" element={<PlaceholderPage title="Analytics" />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  )
}

export default App
