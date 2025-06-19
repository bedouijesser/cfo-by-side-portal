
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, FileText, Calendar, Search, Download, BookOpen, Percent, DollarSign, TrendingUp, Scale } from 'lucide-react';

export function ResourceCenter() {
  const [vatAmount, setVatAmount] = useState('');
  const [vatRate, setVatRate] = useState('19');
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate VAT
  const calculateVat = () => {
    const amount = parseFloat(vatAmount);
    const rate = parseFloat(vatRate);
    if (amount && rate) {
      const vatValue = (amount * rate) / 100;
      const totalWithVat = amount + vatValue;
      return { vatValue, totalWithVat };
    }
    return null;
  };

  // Calculate loan payment
  const calculateLoanPayment = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100 / 12;
    const term = parseFloat(loanTerm) * 12;
    
    if (principal && rate && term) {
      const monthlyPayment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      const totalPayment = monthlyPayment * term;
      const totalInterest = totalPayment - principal;
      return { monthlyPayment, totalPayment, totalInterest };
    }
    return null;
  };

  const vatResult = calculateVat();
  const loanResult = calculateLoanPayment();

  // Document templates
  const documentTemplates = [
    {
      name: 'Service Agreement Template',
      category: 'Legal',
      description: 'Standard service agreement for professional services',
      type: 'PDF',
      downloads: 245
    },
    {
      name: 'Invoice Template (Tunisia)',
      category: 'Finance',
      description: 'Compliant invoice template for Tunisian businesses',
      type: 'Excel',
      downloads: 892
    },
    {
      name: 'VAT Declaration Form',
      category: 'Tax',
      description: 'Monthly VAT declaration template',
      type: 'PDF',
      downloads: 567
    },
    {
      name: 'Employment Contract',
      category: 'Legal',
      description: 'Standard employment contract template',
      type: 'Word',
      downloads: 423
    },
    {
      name: 'Financial Statement Template',
      category: 'Finance',
      description: 'Basic financial statement format',
      type: 'Excel',
      downloads: 334
    },
    {
      name: 'Company Formation Checklist',
      category: 'Legal',
      description: 'Complete checklist for incorporating in Tunisia',
      type: 'PDF',
      downloads: 189
    }
  ];

  // Tax calendar events
  const taxCalendar = [
    { date: '2024-01-28', event: 'Monthly VAT Declaration Due', type: 'VAT', status: 'upcoming' },
    { date: '2024-01-31', event: 'Quarterly Social Security Declaration', type: 'Social', status: 'upcoming' },
    { date: '2024-02-15', event: 'Annual Tax Return Filing Opens', type: 'Income Tax', status: 'info' },
    { date: '2024-02-28', event: 'Monthly VAT Declaration Due', type: 'VAT', status: 'future' },
    { date: '2024-03-31', event: 'Annual Tax Return Deadline', type: 'Income Tax', status: 'important' },
    { date: '2024-04-30', event: 'Q1 Financial Statements Due', type: 'Reporting', status: 'future' }
  ];

  const filteredTemplates = documentTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'important': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'future': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource Center</h2>
        <p className="text-gray-600">Financial calculators, document templates, and compliance tools</p>
      </div>

      <Tabs defaultValue="calculators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculators" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Calculators</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Tax Calendar</span>
          </TabsTrigger>
        </TabsList>

        {/* Calculators Tab */}
        <TabsContent value="calculators">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VAT Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Percent className="h-5 w-5 text-green-600" />
                  <span>VAT Calculator</span>
                </CardTitle>
                <CardDescription>
                  Calculate VAT amounts for your invoices and purchases
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount (Excluding VAT)</label>
                  <Input
                    type="number"
                    value={vatAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVatAmount(e.target.value)}
                    placeholder="Enter amount..."
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">VAT Rate (%)</label>
                  <select 
                    value={vatRate}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVatRate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="19">19% (Standard Rate)</option>
                    <option value="13">13% (Reduced Rate)</option>
                    <option value="0">0% (Zero Rate)</option>
                  </select>
                </div>
                {vatResult && (
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>VAT Amount:</span>
                      <span className="font-semibold">{vatResult.vatValue.toFixed(2)} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total (Including VAT):</span>
                      <span className="font-bold text-green-600">{vatResult.totalWithVat.toFixed(2)} TND</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Loan Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <span>Loan Payment Calculator</span>
                </CardTitle>
                <CardDescription>
                  Calculate monthly loan payments and total interest
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Loan Amount (TND)</label>
                  <Input
                    type="number"
                    value={loanAmount}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanAmount(e.target.value)}
                    placeholder="Enter loan amount..."
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Annual Interest Rate (%)</label>
                  <Input
                    type="number"
                    value={interestRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterestRate(e.target.value)}
                    placeholder="Enter interest rate..."
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Term (Years)</label>
                  <Input
                    type="number"
                    value={loanTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoanTerm(e.target.value)}
                    placeholder="Enter loan term..."
                  />
                </div>
                {loanResult && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Monthly Payment:</span>
                      <span className="font-bold text-blue-600">{loanResult.monthlyPayment.toFixed(2)} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Payment:</span>
                      <span className="font-semibold">{loanResult.totalPayment.toFixed(2)} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-semibold">{loanResult.totalInterest.toFixed(2)} TND</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ROI Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>ROI Calculator</span>
                </CardTitle>
                <CardDescription>
                  Calculate return on investment for your business decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Initial Investment (TND)</label>
                  <Input
                    type="number"
                    placeholder="Enter initial investment..."
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Final Value (TND)</label>
                  <Input
                    type="number"
                    placeholder="Enter final value..."
                    step="0.01"
                  />
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Calculate ROI
                </Button>
              </CardContent>
            </Card>

            {/* Corporate Tax Estimator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-orange-600" />
                  <span>Corporate Tax Estimator</span>
                </CardTitle>
                <CardDescription>
                  Estimate your corporate income tax liability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Annual Revenue (TND)</label>
                  <Input
                    type="number"
                    placeholder="Enter annual revenue..."
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Deductible Expenses (TND)</label>
                  <Input
                    type="number"
                    placeholder="Enter total expenses..."
                    step="0.01"
                  />
                </div>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Estimate Tax
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="pl-10"
              />
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                      <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.type}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {template.downloads} downloads
                      </span>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tax Calendar Tab */}
        <TabsContent value="calendar">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  <span>Tunisian Tax & Compliance Calendar</span>
                </CardTitle>
                <CardDescription>
                  Important dates and deadlines for tax and regulatory compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taxCalendar.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-2xl font-bold text-indigo-600">
                            {new Date(item.date).getDate()}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{item.event}</h4>
                          <p className="text-sm text-gray-600">{item.type}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium">Tax Guide</h4>
                  <p className="text-xs text-gray-600 mt-1">Comprehensive tax planning guide</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Download
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Scale className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium">Compliance Checklist</h4>
                  <p className="text-xs text-gray-600 mt-1">Monthly compliance requirements</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Download
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium">Sync Calendar</h4>
                  <p className="text-xs text-gray-600 mt-1">Add dates to your calendar</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Export
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
