
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Upload, Download, Search, Calendar, User, File, Image, FileSpreadsheet } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Document, User as UserType, Organization, CreateDocumentInput } from '../../../server/src/schema';

interface DocumentsPanelProps {
  documents: Document[];
  currentUser: UserType;
  currentOrganization: Organization;
  onDocumentsUpdate: (documents: Document[]) => void;
}

export function DocumentsPanel({ 
  documents, 
  currentUser, 
  currentOrganization, 
  onDocumentsUpdate 
}: DocumentsPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<CreateDocumentInput>({
    organizationId: currentOrganization.id,
    requestId: null,
    taskId: null,
    uploaderId: currentUser.id,
    fileName: '',
    fileUrl: '',
    mimeType: '',
    fileSize: 0
  });

  // Filter documents based on search
  const filteredDocuments = documents.filter((doc: Document) =>
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-600" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-600" />;
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      // In production, file would be uploaded to storage first
      const documentInput: CreateDocumentInput = {
        ...formData,
        fileUrl: `/uploads/${formData.fileName}`,
        fileSize: Math.floor(Math.random() * 1000000) + 100000,
        mimeType: formData.fileName.endsWith('.pdf') ? 'application/pdf' : 
                 formData.fileName.endsWith('.xlsx') ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                 formData.fileName.endsWith('.jpg') || formData.fileName.endsWith('.png') ? 'image/jpeg' : 'text/plain'
      };

      const newDocument = await trpc.createDocument.mutate(documentInput);
      onDocumentsUpdate([...documents, newDocument]);
      
      setFormData({
        organizationId: currentOrganization.id,
        requestId: null,
        taskId: null,
        uploaderId: currentUser.id,
        fileName: '',
        fileUrl: '',
        mimeType: '',
        fileSize: 0
      });
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-600">Upload, organize, and share your financial documents securely</p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
              <DialogDescription>
                Upload documents related to your financial or legal services.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">File Name</label>
                <Input
                  value={formData.fileName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateDocumentInput) => ({ ...prev, fileName: e.target.value }))
                  }
                  placeholder="e.g., tax-documents-2024.pdf"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  In production, this would be handled by file upload
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          placeholder="Search documents..."
          className="pl-10"
        />
      </div>

      {/* Documents Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Documents</p>
                <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <Upload className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">This Month</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents.filter((d: Document) => {
                    const docDate = new Date(d.createdAt);
                    const now = new Date();
                    return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Download className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Size</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatFileSize(documents.reduce((sum: number, doc: Document) => sum + doc.fileSize, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="grid gap-4">
        {filteredDocuments.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {documents.length === 0 ? 'No documents yet' : 'No matching documents'}
              </h3>
              <p className="text-gray-600 mb-4">
                {documents.length === 0  
                  ? 'Upload your first document to get started.'
                  : 'Try adjusting your search criteria.'
                }
              </p>
              {documents.length === 0 && (
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document: Document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    {getFileIcon(document.mimeType)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-medium truncate">
                        {document.fileName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {formatFileSize(document.fileSize)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Uploaded {document.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>By {document.uploaderId === currentUser.id ? 'You' : 'Team'}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Badge variant="outline" className="text-xs">
                      {document.mimeType.split('/')[0]}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
