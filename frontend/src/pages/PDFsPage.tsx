
// frontend/src/pages/PDFsPage.tsx
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Upload, Search, FileText, Eye } from 'lucide-react'
import { PDFService } from '../common/services/api'
import { Card } from '../common/components/ui/Card'
import { Button } from '../common/components/ui/Button'
import { Input } from '../common/components/ui/Input'
import { Badge } from '../common/components/ui/Badge'
import { Progress } from '../common/components/ui/Progress'

export const PDFsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: pdfs = [], isLoading } = useQuery({
    queryKey: ['pdfs'],
    queryFn: PDFService.getAll,
  })

  const filteredPDFs = pdfs.filter(pdf =>
    pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return <div className="animate-pulse">Loading PDFs...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">PDF Library</h1>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload PDF
        </Button>
      </div>

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search PDFs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPDFs.map((pdf) => (
          <Card key={pdf.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-3 rounded-lg flex-shrink-0">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{pdf.title}</h3>
                {pdf.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{pdf.description}</p>
                )}
                
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>{pdf.total_pages} pages</span>
                  <span>{Math.round(pdf.file_size / 1024)} KB</span>
                  <Badge variant="secondary" size="sm">
                    {pdf.pdf_type}
                  </Badge>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">Reading Progress</span>
                    <span className="text-sm font-medium">{Math.round(pdf.reading_progress)}%</span>
                  </div>
                  <Progress value={pdf.reading_progress} size="sm" />
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <Button size="sm" variant="secondary">
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>
                  <Button size="sm" variant="ghost">
                    Continue Reading
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredPDFs.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchTerm ? 'No PDFs match your search.' : 'No PDFs uploaded yet. Upload your first PDF to get started!'}
          </div>
          {!searchTerm && (
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload First PDF
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
