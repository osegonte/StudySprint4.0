import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🚀 StudySprint 4.0
        </h1>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">✅ Stage 1 Complete!</h2>
          <div className="space-y-2 text-gray-600">
            <p>✅ React + TypeScript + Vite configured</p>
            <p>✅ Tailwind CSS with Apple HIG design tokens</p>
            <p>✅ Project structure created</p>
            <p>✅ Development environment ready</p>
          </div>
          <div className="mt-6">
            <button className="btn-primary">
              Ready for Stage 2 Implementation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App
