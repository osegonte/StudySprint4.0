import React, { useState, useEffect } from 'react';
import './App.css';

interface APIStatus {
  project: string;
  current_stage: string;
  completed: string[];
  api_endpoints: {
    topics: string;
    pdfs: string;
    total_implemented: number;
  };
}

function App() {
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusResponse = await fetch('http://localhost:8000/api/v1/status');
        const statusData = await statusResponse.json();
        setApiStatus(statusData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Unable to connect to backend API');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const createSampleTopic = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Sample Topic',
          description: 'A test topic created from the frontend',
          color: '#3498db',
          difficulty_level: 1,
          priority_level: 1
        })
      });

      if (response.ok) {
        alert('✅ Topic created successfully! Check API docs to see it.');
      } else {
        alert('❌ Error creating topic');
      }
    } catch (err) {
      alert('❌ Error connecting to API');
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="container">
          <h1>🚀 StudySprint 4.0</h1>
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <h1>🚀 StudySprint 4.0</h1>
        <p className="subtitle">Complete Personal Study Tool with Advanced Analytics</p>

        {apiStatus && (
          <div className="status-section">
            <h2>📊 {apiStatus.current_stage}</h2>
            <div className="api-stats">
              <div className="stat">
                <span className="stat-number">{apiStatus.api_endpoints.total_implemented}</span>
                <span className="stat-label">API Endpoints</span>
              </div>
            </div>
            
            <div className="progress-list">
              {apiStatus.completed.slice(0, 5).map((item, index) => (
                <div key={index} className="progress-item">
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="actions">
          <button onClick={createSampleTopic} className="primary-btn">
            Create Sample Topic
          </button>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="secondary-btn">
            View API Docs
          </a>
          <a href="http://localhost:8000/api/v1/topics" target="_blank" rel="noopener noreferrer" className="secondary-btn">
            View Topics JSON
          </a>
        </div>

        {error && (
          <div className="error">
            <p>⚠️ {error}</p>
            <p>Make sure backend is running: <code>./scripts/start_backend.sh</code></p>
          </div>
        )}

        <div className="footer">
          <p>🎯 Stage 2: PDF Management & Viewer - COMPLETE!</p>
          <p>Next: Stage 3 - Topics Organization</p>
        </div>
      </div>
    </div>
  );
}

export default App;
