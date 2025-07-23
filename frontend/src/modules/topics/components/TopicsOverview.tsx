import React, { useState } from 'react'

export const TopicsOverview: React.FC = () => {
  const [topics] = useState([
    { id: 1, name: 'React Fundamentals', progress: 75, pdfs: 3, sessions: 8, lastStudied: '2 hours ago' },
    { id: 2, name: 'TypeScript Advanced', progress: 40, pdfs: 5, sessions: 4, lastStudied: '1 day ago' },
    { id: 3, name: 'System Design', progress: 20, pdfs: 8, sessions: 2, lastStudied: '3 days ago' },
  ])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
          📚 Topics
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Organize and track your study topics
        </p>
      </div>

      {/* Action Bar */}
      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '12px', 
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          placeholder="Search topics..." 
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            width: '300px',
            fontSize: '1rem'
          }}
        />
        <button style={{
          background: '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          border: 'none',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          + Add New Topic
        </button>
      </div>

      {/* Topics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {topics.map(topic => (
          <div key={topic.id} style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>
                {topic.name}
              </h3>
              <span style={{ 
                background: '#dbeafe', 
                color: '#1d4ed8', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {topic.progress}%
              </span>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Progress</span>
                <span style={{ color: '#374151', fontSize: '0.875rem', fontWeight: '500' }}>{topic.progress}%</span>
              </div>
              <div style={{ 
                background: '#f3f4f6', 
                height: '8px', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  background: '#3b82f6', 
                  height: '100%', 
                  width: `${topic.progress}%`,
                  transition: 'width 0.3s'
                }}></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>{topic.pdfs}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>PDFs</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>{topic.sessions}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Sessions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Last studied</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>{topic.lastStudied}</div>
              </div>
            </div>

            <button style={{
              width: '100%',
              background: '#f3f4f6',
              color: '#374151',
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              Continue Studying →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
