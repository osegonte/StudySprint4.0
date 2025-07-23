import React, { useState } from 'react'

export const PDFsOverview: React.FC = () => {
  const [pdfs] = useState([
    { id: 1, name: 'React Design Patterns.pdf', size: '2.4 MB', pages: 156, uploadDate: '2024-01-15', topic: 'React Fundamentals' },
    { id: 2, name: 'TypeScript Handbook.pdf', size: '3.1 MB', pages: 203, uploadDate: '2024-01-12', topic: 'TypeScript Advanced' },
    { id: 3, name: 'System Design Interview.pdf', size: '5.2 MB', pages: 289, uploadDate: '2024-01-10', topic: 'System Design' },
    { id: 4, name: 'Advanced JavaScript.pdf', size: '1.8 MB', pages: 124, uploadDate: '2024-01-08', topic: 'React Fundamentals' },
  ])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
          📄 PDF Library
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Manage and study your PDF documents
        </p>
      </div>

      {/* Upload Area */}
      <div style={{
        background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
        border: '2px dashed #93c5fd',
        borderRadius: '12px',
        padding: '3rem 2rem',
        textAlign: 'center',
        marginBottom: '2rem',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1d4ed8' }}>
          Drop PDF files here or click to upload
        </h3>
        <p style={{ color: '#3730a3', fontSize: '1rem' }}>
          Support for PDF files up to 500MB
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <input 
          type="text" 
          placeholder="Search PDFs..." 
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            width: '300px',
            fontSize: '1rem'
          }}
        />
        <select style={{
          padding: '0.75rem 1rem',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '1rem'
        }}>
          <option>All Topics</option>
          <option>React Fundamentals</option>
          <option>TypeScript Advanced</option>
          <option>System Design</option>
        </select>
        <select style={{
          padding: '0.75rem 1rem',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '1rem'
        }}>
          <option>Sort by Date</option>
          <option>Sort by Name</option>
          <option>Sort by Size</option>
        </select>
      </div>

      {/* PDFs Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {pdfs.map(pdf => (
          <div key={pdf.id} style={{
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
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#dc2626',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem' }}>PDF</span>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>
                  {pdf.name}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {pdf.size} • {pdf.pages} pages
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Topic</span>
                <span style={{ 
                  background: '#f3f4f6', 
                  color: '#374151', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '8px',
                  fontSize: '0.75rem'
                }}>
                  {pdf.topic}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Uploaded</span>
                <span style={{ color: '#374151', fontSize: '0.875rem' }}>{pdf.uploadDate}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                flex: 1,
                background: '#3b82f6',
                color: 'white',
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Open
              </button>
              <button style={{
                flex: 1,
                background: '#f3f4f6',
                color: '#374151',
                padding: '0.5rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Study
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
