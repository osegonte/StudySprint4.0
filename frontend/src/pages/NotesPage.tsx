// frontend/src/pages/NotesPage.tsx
import React from 'react'
import { Card } from '../common/components/ui/Card'

export const NotesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
      <Card className="text-center py-12">
        <p className="text-gray-600">Notes management coming in Stage 2</p>
      </Card>
    </div>
  )
}