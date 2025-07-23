import React from 'react'
import { Button } from '../../../common/components/ui/Button'

export const DashboardOverview: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Hero Section */}
      <div className="hero-section">
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 2rem auto',
          boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>🚀</span>
        </div>
        <h1 className="hero-title">Welcome to StudySprint 4.0</h1>
        <p className="hero-subtitle">
          Your complete study management system built with Apple Human Interface Guidelines for the ultimate learning experience.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        {[
          { name: 'Study Time Today', value: '2.5 hours', emoji: '⏰', color: '#3b82f6' },
          { name: 'Topics Studied', value: '3 active', emoji: '📚', color: '#10b981' },
          { name: 'Goals Completed', value: '2/5', emoji: '🎯', color: '#f59e0b' },
          { name: 'Focus Score', value: '85%', emoji: '🎖️', color: '#8b5cf6' },
        ].map((stat, index) => (
          <div key={stat.name} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{stat.name}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: stat.color, 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {stat.emoji}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="content-card">
        <h2 className="section-title">⚡ Quick Actions</h2>
        <div className="button-grid">
          <button className="primary-button">
            🎯 Start Study Session
          </button>
          <button className="secondary-button">
            📝 Add New Topic
          </button>
          <button className="secondary-button">
            📄 Upload PDF
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="content-card">
        <h2 className="section-title">📈 Recent Activity</h2>
        {[
          { activity: 'Studied React Fundamentals', time: '25 minutes ago', duration: '45 min', emoji: '⚛️' },
          { activity: 'Completed TypeScript Exercise', time: '1 hour ago', duration: '30 min', emoji: '📘' },
          { activity: 'Read Advanced Patterns PDF', time: '2 hours ago', duration: '60 min', emoji: '📖' },
        ].map((item, index) => (
          <div key={index} className="activity-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                background: '#f3f4f6', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>
                {item.emoji}
              </div>
              <div>
                <div style={{ fontWeight: '600', color: '#111827', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  {item.activity}
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {item.time}
                </div>
              </div>
            </div>
            <div style={{ 
              background: '#e5e7eb', 
              color: '#374151', 
              padding: '0.25rem 0.75rem', 
              borderRadius: '16px', 
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              {item.duration}
            </div>
          </div>
        ))}
      </div>

      {/* Success Card */}
      <div style={{
        background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
        border: '1px solid #93c5fd',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 1.5rem auto',
          fontSize: '2rem'
        }}>
          🎉
        </div>
        <h3 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 'bold', 
          color: '#1d4ed8', 
          marginBottom: '1rem' 
        }}>
          Stage 1 Foundation Complete!
        </h3>
        <p style={{ 
          fontSize: '1.125rem', 
          color: '#1e40af', 
          marginBottom: '1.5rem',
          lineHeight: '1.6'
        }}>
          🎨 Apple HIG design system ready • 📱 All 9 modules scaffolded • 🌙 Theme system active
        </p>
        <button className="primary-button" style={{ 
          fontSize: '1.125rem', 
          padding: '1rem 2rem',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
        }}>
          🚀 Ready for Stage 2 Implementation
        </button>
      </div>
    </div>
  )
}
