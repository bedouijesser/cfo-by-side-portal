
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, FileText, Calendar } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Request, Organization, CreateRequestInput } from '../../../server/src/schema';

interface RequestsPanelProps {
  requests: Request[];
  currentOrganization: Organization;
  getStatusColor: (status: string) => string;
  onRequestsUpdate: (requests: Request[]) => void;
}

export function RequestsPanel({ 
  requests, 
  currentOrganization, 
  getStatusColor, 
  onRequestsUpdate 
}: RequestsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [formData, setFormData] = useState<CreateRequestInput>({
    organizationId: currentOrganization.id,
    title: '',
    description: ''
  });

  // Filter requests based on search and status
  const filteredRequests = requests.filter((request: Request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newRequest = await trpc.createRequest.mutate(formData);
      onRequestsUpdate([...requests, newRequest]);
      setFormData({
        organizationId: currentOrganization.id,
        title: '',
        description: ''
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: 'Open' | 'In Progress' | 'Completed' | 'Closed') => {
    try {
      await trpc.updateRequest.mutate({
        id: requestId,
        status: newStatus
      });
      onRequestsUpdate(requests.map((r: Request) => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ));
    } catch (error) {
      console.error('Failed to update request status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>
          <p className="text-gray-600">Manage your requests for financial and legal services</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Service Request</DialogTitle>
              <DialogDescription>
                Submit a new request for financial or legal assistance.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Request Title</label>
                <Input
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateRequestInput) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g., Tax filing assistance for Q4 2024"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateRequestInput) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Please provide details about what assistance you need..."
                  rows={4}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search requests..."
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {requests.length === 0 ? 'No requests yet' : 'No matching requests'}
              </h3>
              <p className="text-gray-600 mb-4">
                {requests.length === 0 
                  ? 'Create your first service request to get started.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {requests.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Request
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request: Request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{request.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {request.description}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {request.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>ID: {request.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  
                  {request.status !== 'Closed' && (
                    <div className="flex space-x-2">
                      {request.status === 'Open' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(request.id, 'In Progress')}
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {request.status === 'In Progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(request.id, 'Completed')}
                        >
                          Mark Completed
                        </Button>
                      )}
                      {request.status === 'Completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(request.id, 'Closed')}
                        >
                          Close Request
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
