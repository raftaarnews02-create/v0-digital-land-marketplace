'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Download, Eye, Trash2, CheckCircle, Clock } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  status: 'verified' | 'pending_verification' | 'rejected'
  uploadedAt: string
  fileSize: string
  propertyTitle?: string
}

export default function DocumentsPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('khasra')
  const [activeTab, setActiveTab] = useState('my-documents')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  // Mock documents data
  const mockDocuments = [
    {
      id: 'doc_1',
      name: 'Agricultural Land - Khasra Certificate',
      type: 'khasra',
      status: 'verified' as const,
      uploadedAt: '2024-02-01',
      fileSize: '2.4 MB',
      propertyTitle: 'Fertile Agricultural Land - Punjab',
    },
    {
      id: 'doc_2',
      name: 'Land Ownership Deed',
      type: 'deed',
      status: 'verified' as const,
      uploadedAt: '2024-02-01',
      fileSize: '3.1 MB',
      propertyTitle: 'Fertile Agricultural Land - Punjab',
    },
    {
      id: 'doc_3',
      name: 'Tax Payment Receipt 2023',
      type: 'tax',
      status: 'pending_verification' as const,
      uploadedAt: '2024-02-10',
      fileSize: '1.8 MB',
      propertyTitle: 'Urban Residential Plot - Mumbai',
    },
    {
      id: 'doc_4',
      name: 'Water Rights Certificate',
      type: 'water_rights',
      status: 'verified' as const,
      uploadedAt: '2024-02-05',
      fileSize: '2.2 MB',
      propertyTitle: 'Fertile Agricultural Land - Punjab',
    },
  ]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file')
      return
    }

    setLoading(true)
    try {
      // Simulate upload
      setTimeout(() => {
        const newDoc: Document = {
          id: `doc_${Date.now()}`,
          name: selectedFile.name,
          type: documentType,
          status: 'pending_verification',
          uploadedAt: new Date().toLocaleDateString(),
          fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB',
        }
        setDocuments([newDoc, ...documents])
        setSelectedFile(null)
        setLoading(false)
        alert('Document uploaded successfully!')
      }, 1500)
    } catch (error) {
      setLoading(false)
      alert('Failed to upload document')
    }
  }

  const handleDelete = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter((d) => d.id !== docId))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-600">✓ Verified</Badge>
      case 'pending_verification':
        return <Badge className="bg-yellow-600">⏳ Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">✕ Rejected</Badge>
      default:
        return null
    }
  }

  const allDocuments = documents.length > 0 ? documents : mockDocuments

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
              LH
            </div>
            <span className="font-bold text-lg hidden sm:block">LandHub</span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="space-y-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Document Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage land documents for your properties. Verified documents build trust with buyers and sellers.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Documents</p>
                  <p className="text-3xl font-bold text-primary">{allDocuments.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Verified</p>
                  <p className="text-3xl font-bold text-accent">
                    {allDocuments.filter((d) => d.status === 'verified').length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {allDocuments.filter((d) => d.status === 'pending_verification').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-documents">My Documents</TabsTrigger>
            <TabsTrigger value="upload">Upload New Document</TabsTrigger>
          </TabsList>

          {/* My Documents Tab */}
          <TabsContent value="my-documents" className="space-y-4">
            {allDocuments.length > 0 ? (
              <div className="space-y-3">
                {allDocuments.map((doc) => (
                  <Card key={doc.id} className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between gap-4">
                        {/* Document Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
                            📄
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground truncate">
                                {doc.name}
                              </h3>
                              {getStatusBadge(doc.status)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              {doc.propertyTitle && (
                                <p>Property: {doc.propertyTitle}</p>
                              )}
                              <p>Size: {doc.fileSize}</p>
                              <p>Uploaded: {doc.uploadedAt}</p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button variant="ghost" size="sm" title="View document">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Download document">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete document"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-12 text-center pb-12">
                  <p className="text-muted-foreground">
                    No documents uploaded yet. Start by uploading documents for your properties.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab('upload')}
                  >
                    Upload Your First Document
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upload Document Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Type Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Document Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      { value: 'khasra', label: 'Khasra Certificate' },
                      { value: 'deed', label: 'Ownership Deed' },
                      { value: 'tax', label: 'Tax Receipt' },
                      { value: 'water_rights', label: 'Water Rights' },
                      { value: 'survey', label: 'Survey Report' },
                      { value: 'other', label: 'Other' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setDocumentType(type.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          documentType === type.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-primary/50 text-muted-foreground'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload Area */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground">
                    Choose File
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4 hover:border-primary/50 transition-colors">
                    <div className="text-4xl">📁</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Drag and drop your file here, or click to select
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-input"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById('file-input')?.click()
                      }
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>

                  {selectedFile && (
                    <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">✓</span>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        ✕
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                >
                  {loading ? 'Uploading...' : 'Upload Document'}
                </Button>

                {/* Information Box */}
                <Card className="bg-muted/50 border-border">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Document Verification:
                      </span>{' '}
                      All documents are verified by our compliance team within 24-48 hours. Verified documents help build trust with potential buyers and sellers on the LandHub platform.
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
