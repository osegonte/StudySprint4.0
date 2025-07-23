import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './common/components/layout/MainLayout'
import { DashboardOverview } from './modules/dashboard/components/DashboardOverview'
import { TopicsOverview } from './modules/topics/components/TopicsOverview'
import { PDFsOverview } from './modules/pdfs/components/PDFsOverview'
import { StudyOverview } from './modules/sessions/components/StudyOverview'

// Simple loading component
const LoadingScreen = () => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px',
    fontSize: '1.125rem',
    color: '#6b7280'
  }}>
    Loading...
  </div>
)

// Placeholder component for modules not yet implemented
const ModulePlaceholder = ({ title, emoji }: { title: string; emoji: string }) => (
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
    <div style={{
      background: 'white',
      padding: '4rem 2rem',
      borderRadius: '12px',
      textAlign: 'center',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{emoji}</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
        {title}
      </h2>
      <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
        This feature will be implemented in Stage 2 of the development process.
      </p>
      <button style={{
        background: '#3b82f6',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '600',
        cursor: 'pointer'
      }}>
        Coming Soon 🚀
      </button>
    </div>
  </div>
)

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Working Pages */}
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingScreen />}>
            <DashboardOverview />
          </Suspense>
        } />
        
        <Route path="topics" element={
          <Suspense fallback={<LoadingScreen />}>
            <TopicsOverview />
          </Suspense>
        } />
        
        <Route path="pdfs" element={
          <Suspense fallback={<LoadingScreen />}>
            <PDFsOverview />
          </Suspense>
        } />
        
        <Route path="study" element={
          <Suspense fallback={<LoadingScreen />}>
            <StudyOverview />
          </Suspense>
        } />
        
        {/* Placeholder Pages */}
        <Route path="notes" element={<ModulePlaceholder title="Notes" emoji="📝" />} />
        <Route path="exercises" element={<ModulePlaceholder title="Exercises" emoji="🎯" />} />
        <Route path="goals" element={<ModulePlaceholder title="Goals" emoji="🏆" />} />
        <Route path="analytics" element={<ModulePlaceholder title="Analytics" emoji="📈" />} />
        <Route path="settings" element={<ModulePlaceholder title="Settings" emoji="⚙️" />} />
      </Route>
    </Routes>
  )
}
