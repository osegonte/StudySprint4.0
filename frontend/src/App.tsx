import React from 'react'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>StudySprint 4.0</h1>
        <p>
          Complete Personal Study Tool with Advanced Analytics
        </p>
        <div className="status-grid">
          <div className="status-card">
            <h3>📚 PDF Management</h3>
            <span className="status pending">Coming Soon</span>
          </div>
          <div className="status-card">
            <h3>🗂️ Topics</h3>
            <span className="status pending">Coming Soon</span>
          </div>
          <div className="status-card">
            <h3>⏱️ Study Timer</h3>
            <span className="status pending">Coming Soon</span>
          </div>
          <div className="status-card">
            <h3>🗒️ Notes</h3>
            <span className="status pending">Coming Soon</span>
          </div>
          <div className="status-card">
            <h3>💪 Exercises</h3>
            <span className="status pending">Coming Soon</span>
          </div>
          <div className="status-card">
            <h3>🎯 Goals</h3>
            <span className="status pending">Coming Soon</span>
          </div>
        </div>
        <p className="build-info">
          Stage 1: Foundation Complete ✅<br/>
          Next: Stage 2 - PDF Management & Viewer
        </p>
      </header>
    </div>
  )
}

export default App
