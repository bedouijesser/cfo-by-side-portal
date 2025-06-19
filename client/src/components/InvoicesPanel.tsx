
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Calendar, AlertCircle, CheckCircle, Clock, CreditCard, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import type { Invoice } from '../../../server/src/schema';

interface InvoicesPanelProps {
  invoices: Invoice[];
  getStatusColor: (status: string) => string;
}

export function InvoicesPanel({ invoices, getStatusColor }: InvoicesPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summary metrics
  const totalOutstanding = invoices
    .filter((i: Invoice) => i.paymentStatus === 'Sent')
    .reduce((sum: number, invoice: Invoice) => sum + invoice.amount, 0);
  
  const overdueInvoices = invoices.filter((i: Invoice) => 
    i.paymentStatus === 'Overdue' || 
    (i.paymentStatus === 'Sent' && new Date(i.dueDate) < new Date())
  );

  const paidThisMonth = invoices
    .filter((i: Invoice) => {
      const invoiceDate = new Date(i.createdAt);
      const now = new Date();
      return i.paymentStatus === 'Paid' && 
             invoiceDate.getMonth() === now.getMonth() && 
             invoiceDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, invoice: Invoice) => sum + invoice.amount, 0);

  const isOverdue = (invoice: Invoice) => {
    return new Date(invoice.dueDate) < new Date() && invoice.paymentStatus !== 'Paid';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Invoices & Billing</h2>
        <p className="text-gray-600">Track your invoices, payments, and billing history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search invoices..."
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
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Sent">Sent</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Outstanding</p>
                <p className="text-2xl font-bold text-blue-600">${totalOutstanding.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Paid This Month</p>
                <p className="text-2xl font-bold text-green-600">${paidThisMonth.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-full">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Invoices</p>
                <p className="text-2xl font-bold text-purple-600">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <div className="grid gap-4">
        {filteredInvoices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {invoices.length === 0 ? 'No invoices yet' : 'No matching invoices'}
              </h3>
              <p className="text-gray-600">
                {invoices.length === 0 
                  ? 'Invoices will appear here as services are provided.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice: Invoice) => (
            <Card 
              key={invoice.id} 
              className={`hover:shadow-md transition-shadow ${
                isOverdue(invoice) ? 'border-l-4 border-l-red-500' : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                      {isOverdue(invoice) && (
                        <Badge className="bg-red-100 text-red-800">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      Amount: <span className="font-semibold text-lg">${invoice.amount.toFixed(2)} {invoice.currency}</span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(invoice.paymentStatus)}>
                    {invoice.paymentStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Issue Date</p>
                      <p>{invoice.issueDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Due Date</p>
                      <p className={isOverdue(invoice) ? 'text-red-600 font-semibold' : ''}>
                        {invoice.dueDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {invoice.paymentTransactionId && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CreditCard className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Transaction</p>
                        <p className="font-mono text-xs">{invoice.paymentTransactionId}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Created {invoice.createdAt.toLocaleDateString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    {invoice.paymentStatus === 'Sent' && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay Now
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <DollarSign className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
