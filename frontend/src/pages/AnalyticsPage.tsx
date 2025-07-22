// frontend/src/pages/AnalyticsPage.tsx
import React from 'react'
import { Card } from '../common/components/ui/Card'

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      <Card className="text-center py-12">
        <p className="text-gray-600">Analytics dashboard coming in Stage 3</p>
      </Card>
    </div>
  )
}