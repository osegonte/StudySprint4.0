// src/pages/Dashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to StudySprint 4.0</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="study-card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/study" className="block p-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Start Study Session
            </Link>
            <Link to="/topics" className="block p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90">
              Browse Topics
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="study-card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground">No recent activity to show.</p>
        </div>

        {/* Goals Progress */}
        <div className="study-card">
          <h2 className="text-xl font-semibold mb-4">Goals Progress</h2>
          <p className="text-muted-foreground">Set your first study goal to get started!</p>
          <Link to="/goals" className="mt-4 inline-block text-primary hover:underline">
            Set Goals →
          </Link>
        </div>
      </div>
    </div>
  );
}