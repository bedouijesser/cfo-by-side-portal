
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Calendar, DollarSign, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import type { User, Organization, Request, Invoice, Document } from '../../../server/src/schema';

interface DashboardProps {
  user: User;
  organization: Organization;
  requests: Request[];
  invoices: Invoice[];
  documents: Document[];
  getStatusColor: (status: string) => string;
}

export function Dashboard({ 
  user, 
  organization, 
  requests, 
  invoices, 
  getStatusColor 
}: DashboardProps) {
  // Calculate dashboard metrics
  const activeRequests = requests.filter((r: Request) => r.status === 'Open' || r.status === 'In Progress');
  const completedRequests = requests.filter((r: Request) => r.status === 'Completed');
  const pendingInvoices = invoices.filter((i: Invoice) => i.paymentStatus === 'Sent');
  const overdueInvoices = invoices.filter((i: Invoice) => i.paymentStatus === 'Overdue');
  const totalOutstanding = pendingInvoices.reduce((sum: number, invoice: Invoice) => sum + invoice.amount, 0);
  
  const completionRate = requests.length > 0 ? (completedRequests.length / requests.length) * 100 : 0;

  // Recent activity data
  const recentActivity = [
    { type: 'request', title: 'Tax filing assistance', time: '2 hours ago', status: 'In Progress' },
    { type: 'invoice', title: 'Invoice #INV-2024-001', time: '1 day ago', status: 'Paid' },
    { type: 'document', title: 'Financial statements.pdf', time: '2 days ago', status: 'Uploaded' },
    { type: 'task', title: 'Review compliance checklist', time: '3 days ago', status: 'Completed' }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h2>
        <p className="text-indigo-100">
          Here's what's happening with your {organization.name} account today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              {requests.length} total requests
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completionRate.toFixed(0)}%</div>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              ${totalOutstanding.toFixed(2)} outstanding
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices.length}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>Recent Requests</span>
            </CardTitle>
            <CardDescription>Your latest service requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.slice(0, 3).map((request: Request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{request.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Created {request.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-center text-gray-500 py-4">No requests yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>Latest updates across your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'request' && <FileText className="h-4 w-4 text-blue-600 mt-0.5" />}
                    {activity.type === 'invoice' && <DollarSign className="h-4 w-4 text-green-600 mt-0.5" />}
                    {activity.type === 'document' && <FileText className="h-4 w-4 text-purple-600 mt-0.5" />}
                    {activity.type === 'task' && <CheckCircle className="h-4 w-4 text-indigo-600 mt-0.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">{activity.time}</p>
                      <Badge variant="outline" className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <FileText className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <h4 className="font-medium">Submit New Request</h4>
              <p className="text-xs text-gray-600 mt-1">Start a new service request</p>
            </div>
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-medium">Schedule Consultation</p>
              <p className="text-xs text-gray-600 mt-1">Book time with your advisor</p>
            </div>
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center hover:bg-gray-50 cursor-pointer transition-colors">
              <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium">View Financial Reports</h4>
              <p className="text-xs text-gray-600 mt-1">Access your latest reports</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
