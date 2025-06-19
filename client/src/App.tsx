
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Bell, Calendar, DollarSign, FileText, MessageSquare, Search, User as UserIcon, Users } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { Dashboard } from '@/components/Dashboard';
import { RequestsPanel } from '@/components/RequestsPanel';
import { TasksPanel } from '@/components/TasksPanel';
import { DocumentsPanel } from '@/components/DocumentsPanel';
import { InvoicesPanel } from '@/components/InvoicesPanel';
import { ChatAssistant } from '@/components/ChatAssistant';
import { ResourceCenter } from '@/components/ResourceCenter';
import type { 
  Organization, 
  Request, 
  User as UserType, 
  Invoice, 
  Document
} from '../../server/src/schema';

function App() {
  // Current user - in production this would come from auth context
  const currentUser: UserType = {
    id: 'user-1',
    email: 'client@example.com',
    name: 'John Doe',
    role: 'Client-User',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Current organization - in production this would come from user context
  const currentOrganization: Organization = {
    id: 'org-1',
    name: 'Example Corp',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications] = useState(3);

  // Main data states
  const [requests, setRequests] = useState<Request[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data on mount
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [requestsData, invoicesData, documentsData] = await Promise.all([
        trpc.getRequestsByOrganization.query({ organizationId: currentOrganization.id }),
        trpc.getInvoicesByOrganization.query({ organizationId: currentOrganization.id }),
        trpc.getDocumentsByOrganization.query({ organizationId: currentOrganization.id })
      ]);
      
      setRequests(requestsData);
      setInvoices(invoicesData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-indigo-600 font-medium">Loading CFO-BY-SIDE Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-8 w-8 text-indigo-600" />
                <h1 className="text-xl font-bold text-gray-900">CFO-BY-SIDE</h1>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{currentOrganization.name}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-100 text-indigo-600">
                    {currentUser.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{currentUser.name}</p>
                  <p className="text-xs text-gray-500">{currentUser.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-white rounded-lg shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="resources">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Resources</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard 
              user={currentUser}
              organization={currentOrganization}
              requests={requests}
              invoices={invoices}
              documents={documents}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="requests">
            <RequestsPanel 
              requests={requests}
              currentOrganization={currentOrganization}
              getStatusColor={getStatusColor}
              onRequestsUpdate={setRequests}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <TasksPanel 
              requests={requests}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsPanel 
              documents={documents}
              currentUser={currentUser}
              currentOrganization={currentOrganization}
              onDocumentsUpdate={setDocuments}
            />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoicesPanel 
              invoices={invoices}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="chat">
            <ChatAssistant 
              currentUser={currentUser}
              currentOrganization={currentOrganization}
            />
          </TabsContent>

          <TabsContent value="resources">
            <ResourceCenter />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
