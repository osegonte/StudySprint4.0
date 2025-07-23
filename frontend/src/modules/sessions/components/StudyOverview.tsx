import React, { useState } from 'react'

export const StudyOverview: React.FC = () => {
  const [activeSession, setActiveSession] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
          ⏰ Study Sessions
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Track your study time and focus
        </p>
      </div>

      {/* Active Session Card */}
      <div style={{
        background: activeSession ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)' : 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: activeSession ? '1px solid #86efac' : '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        {!activeSession ? (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>
              Ready to start studying?
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Choose a topic and begin your focused study session
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
              <select style={{
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                minWidth: '200px'
              }}>
                <option>Select Topic</option>
                <option>React Fundamentals</option>
                <option>TypeScript Advanced</option>
                <option>System Design</option>
              </select>
              <select style={{
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                minWidth: '150px'
              }}>
                <option>25 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
                <option>90 minutes</option>
              </select>
            </div>
            <button 
              onClick={() => setActiveSession(true)}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🚀 Start Study Session
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⏱️</div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#166534' }}>
              25:00
            </h2>
            <p style={{ color: '#15803d', marginBottom: '2rem', fontSize: '1.125rem' }}>
              Studying React Fundamentals
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button style={{
                background: '#dc2626',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={() => setActiveSession(false)}>
                ⏸️ Pause
              </button>
              <button style={{
                background: '#f59e0b',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              onClick={() => setActiveSession(false)}>
                ⏹️ End Session
              </button>
            </div>
          </>
        )}
      </div>

      {/* Recent Sessions */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#111827' }}>
          📈 Recent Sessions
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { topic: 'React Fundamentals', duration: '45 min', date: '2024-01-15', focus: '92%' },
            { topic: 'TypeScript Advanced', duration: '30 min', date: '2024-01-15', focus: '87%' },
            { topic: 'System Design', duration: '60 min', date: '2024-01-14', focus: '94%' },
          ].map((session, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div>
                <h4 style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                  {session.topic}
                </h4>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {session.date}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '600', color: '#111827' }}>{session.duration}</div>
                <div style={{ color: '#059669', fontSize: '0.875rem' }}>Focus: {session.focus}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
