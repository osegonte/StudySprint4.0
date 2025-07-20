import React, { useState, useEffect } from 'react';
import './App.css';

interface APIStatus {
  project: string;
  current_stage: string;
  completed: string[];
  in_progress: string[];
  next: string[];
  api_endpoints: {
    topics: string;
    pdfs: string;
    total_implemented: number;
  };
  modules: Record<string, string>;
}

interface SystemStats {
  topics: {
    total: number;
    active: number;
    archived: number;
  };
  pdfs: {
    total: number;
    completed: number;
    in_progress: number;
    completion_rate: number;
  };
}

interface Topic {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  total_pdfs: number;
  study_progress: number;
  priority_level: number;
  difficulty_level: number;
  created_at: string;
}

function App() {
  const [apiStatus, setApiStatus] = useState<APIStatus | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [recentTopics, setRecentTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statusResponse = await fetch('http://localhost:8000/api/v1/status');
        const statusData = await statusResponse.json();
        setApiStatus(statusData);

        const statsResponse = await fetch('http://localhost:8000/api/v1/stats');
        const statsData = await statsResponse.json();
        setSystemStats(statsData);

        const topicsResponse = await fetch('http://localhost:8000/api/v1/topics');
        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          setRecentTopics(topicsData.topics.slice(0, 4) || []);
        }

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
    setActiveDemo('topic-creation');
    try {
      const topicData = {
        name: `Sample Topic ${Date.now()}`,
        description: 'A comprehensive study topic created from the enhanced frontend',
        color: '#3498db',
        icon: 'book',
        difficulty_level: 2,
        priority_level: 3
      };

      const response = await fetch('http://localhost:8000/api/v1/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(topicData)
      });

      if (response.ok) {
        const newTopic = await response.json();
        setRecentTopics(prev => [newTopic, ...prev.slice(0, 3)]);
        alert('✅ Enhanced topic created successfully! Check the topics section.');
      } else {
        alert('❌ Error creating topic');
      }
    } catch (err) {
      alert('❌ Error connecting to API');
    } finally {
      setActiveDemo(null);
    }
  };

  const testTopicAnalytics = async () => {
    setActiveDemo('analytics');
    if (recentTopics.length === 0) {
      alert('Create a topic first to test analytics');
      return;
    }

    try {
      const topicId = recentTopics[0].id;
      const response = await fetch(`http://localhost:8000/api/v1/topics/${topicId}/analytics`);
      
      if (response.ok) {
        const analytics = await response.json();
        console.log('Topic Analytics:', analytics);
        alert('✅ Analytics retrieved! Check browser console for details.');
      } else {
        alert('❌ Error fetching analytics');
      }
    } catch (err) {
      alert('❌ Error connecting to API');
    } finally {
      setActiveDemo(null);
    }
  };

  const testHierarchy = async () => {
    setActiveDemo('hierarchy');
    try {
      const response = await fetch('http://localhost:8000/api/v1/topics/hierarchy');
      
      if (response.ok) {
        const hierarchy = await response.json();
        console.log('Topic Hierarchy:', hierarchy);
        alert(`✅ Hierarchy loaded! Found ${hierarchy.length} topics with statistics.`);
      } else {
        alert('❌ Error fetching hierarchy');
      }
    } catch (err) {
      alert('❌ Error connecting to API');
    } finally {
      setActiveDemo(null);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="container">
          <h1>🚀 StudySprint 4.0</h1>
          <div className="loading">Loading Enhanced Topic System...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <h1>🚀 StudySprint 4.0</h1>
        <p className="subtitle">Stage 3: Topics Organization - LIVE! 🎯</p>

        {apiStatus && (
          <div className="status-section">
            <h2>�� {apiStatus.current_stage}</h2>
            <div className="api-stats">
              <div className="stat">
                <span className="stat-number">{apiStatus.api_endpoints.total_implemented}</span>
                <span className="stat-label">API Endpoints</span>
              </div>
              {systemStats && (
                <>
                  <div className="stat">
                    <span className="stat-number">{systemStats.topics.total}</span>
                    <span className="stat-label">Topics</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{systemStats.pdfs.total}</span>
                    <span className="stat-label">PDFs</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{Math.round(systemStats.pdfs.completion_rate)}%</span>
                    <span className="stat-label">Completion</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="actions">
          <button onClick={createSampleTopic} className="primary-btn">
            Create Sample Topic
          </button>
          <button onClick={testTopicAnalytics} className="secondary-btn">
            Test Analytics
          </button>
          <button onClick={testHierarchy} className="secondary-btn">
            View Hierarchy
          </button>
          <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="secondary-btn">
            View API Docs
          </a>
        </div>

        {recentTopics.length > 0 && (
          <div className="topics-preview">
            <h3>📚 Recent Topics</h3>
            <div className="topics-grid">
              {recentTopics.map(topic => (
                <div key={topic.id} className="progress-item">
                  <strong>{topic.name}</strong>
                  <br />
                  {topic.description}
                  <br />
                  Progress: {Math.round(topic.study_progress)}%
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error">
            <p>⚠️ {error}</p>
            <p>Make sure backend is running: <code>./scripts/start_backend.sh</code></p>
          </div>
        )}

        <div className="footer">
          <p>🎯 Stage 3: Topics Organization - ACTIVE!</p>
          <p>Backend: ✅ Enhanced with analytics</p>
          <p>Frontend: 🔄 Basic interface working</p>
        </div>
      </div>
    </div>
  );
}

export default App;
