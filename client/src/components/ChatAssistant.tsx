
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Bot, User as UserIcon, Sparkles, BookOpen, Calculator, Scale } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { User, Organization, ChatHistory, CreateChatHistoryInput } from '../../../server/src/schema';

interface ChatAssistantProps {
  currentUser: User;
  currentOrganization: Organization;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatAssistant({ currentUser, currentOrganization }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  // Load chat history on mount
  const loadChatHistory = useCallback(async () => {
    try {
      const history = await trpc.getChatHistoryByUser.query({ userId: currentUser.id });
      setChatHistory(history);
      
      // Convert history to messages format
      const historyMessages: ChatMessage[] = history.flatMap((chat: ChatHistory) => [
        {
          id: `${chat.id}-query`,
          type: 'user' as const,
          content: chat.query,
          timestamp: chat.timestamp
        },
        {
          id: `${chat.id}-response`,
          type: 'assistant' as const,
          content: chat.response,
          timestamp: chat.timestamp
        }
      ]);
      setMessages(historyMessages);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, [currentUser.id]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  // Sample responses based on query type
  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('tax') || lowerQuery.includes('vat')) {
      return `📊 **Tax Guidance for Tunisia**

Based on your query about ${lowerQuery.includes('vat') ? 'VAT' : 'tax'}, here's what you need to know:

**Current VAT Rates in Tunisia:**
- Standard rate: 19%
- Reduced rate: 13% (essential goods)
- Zero rate: 0% (exports, certain services)

**Key Compliance Requirements:**
- Monthly VAT declarations for businesses with turnover > 100,000 TND
- Quarterly declarations for smaller businesses
- Electronic filing required through the tax portal

**Upcoming Deadlines:**
- VAT declaration: 28th of each month
- Annual tax return: March 31st

Would you like me to help you calculate your VAT liability or explain specific compliance requirements?`;
    }
    
    if (lowerQuery.includes('company') || lowerQuery.includes('business') || lowerQuery.includes('incorporation')) {
      return `🏢 **Business Formation in Tunisia**

For setting up your business in Tunisia, here are the key steps:

**Business Structure Options:**
- SARL (Limited Liability Company) - Most common
- SA (Joint Stock Company) - For larger businesses
- SUARL (Single-person LLC) - For sole proprietors

**Required Documentation:**
- Company name reservation
- Articles of incorporation
- Initial capital deposit (minimum 1,000 TND for SARL)
- Registration with Commercial Registry

**Timeline:** Typically 15-30 days for complete registration

**Our Services:** We can help you through the entire incorporation process, including legal documentation and tax registration.

Would you like specific guidance on any aspect of business formation?`;
    }
    
    if (lowerQuery.includes('invoice') || lowerQuery.includes('billing') || lowerQuery.includes('payment')) {
      return `💼 **Invoicing & Payment Guidelines**

Here's important information about invoicing in Tunisia:

**Legal Requirements:**
- Sequential numbering system
- Company details and tax ID
- Client information and tax status
- Clear description of services/goods
- VAT breakdown (if applicable)

**Payment Terms:**
- Standard terms: 30 days from invoice date
- Late payment interest: Currently 7.5% annually
- Electronic payment increasingly required for B2B transactions

**Best Practices:**
- Issue invoices promptly upon service completion
- Include clear payment instructions
- Follow up on overdue payments systematically

I can help you review your invoicing process or calculate payment terms. What specific aspect would you like to discuss?`;
    }
    
    if (lowerQuery.includes('financial') || lowerQuery.includes('accounting') || lowerQuery.includes('bookkeeping')) {
      return `📈 **Financial Management Guidance**

Essential financial management practices for Tunisian businesses:

**Monthly Requirements:**
- Bank reconciliation
- Expense categorization
- Revenue recognition
- VAT calculation and filing

**Annual Obligations:**
- Financial statements preparation
- Tax return filing
- Audit requirements (for companies > certain thresholds)
- Social security declarations

**Key Ratios to Monitor:**
- Current ratio (liquidity)
- Gross profit margin
- Cash flow trends
- Accounts receivable turnover

**Our Support:** We provide comprehensive bookkeeping services, financial statement preparation, and advisory services.

What specific financial management area would you like to focus on?`;
    }
    
    // Default response
    return `🤖 **Lucapacioli GPT - Your Financial & Legal Assistant**

Thank you for your question! I'm here to help with:

**Financial Services:**
- Tax planning and compliance
- VAT calculations and filings
- Financial statement analysis
- Cash flow management
- Investment advisory

**Legal Services:**
- Business formation and registration
- Contract review and drafting
- Regulatory compliance
- Employment law guidance
- Commercial law matters

**Specialized Tools:**
- Financial calculators (VAT, loan payments, ROI)
- Document templates
- Compliance checklists
- Tax calendar reminders

Could you please provide more specific details about what you need help with? I'm designed to understand Tunisian financial and legal requirements and can provide tailored guidance for your situation.`;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = generateResponse(inputValue);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save to chat history
      const chatInput: CreateChatHistoryInput = {
        userId: currentUser.id,
        query: inputValue,
        response: response,
        isGuest: false,
        organizationId: currentOrganization.id
      };

      await trpc.createChatHistory.mutate(chatInput);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are the current VAT rates in Tunisia?",
    "How do I register a new company?",
    "What are my monthly tax obligations?",
    "Help me understand invoice requirements",
    "What financial reports should I prepare monthly?"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lucapacioli GPT</h2>
            <p className="text-gray-600">Your AI-powered financial & legal assistant</p>
          </div>
        </div>
        <div className="flex justify-center space-x-2">
          <Badge className="bg-purple-100 text-purple-800">
            <Scale className="h-3 w-3 mr-1" />
            Tunisian Law
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            <Calculator className="h-3 w-3 mr-1" />
            Financial Analysis
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <BookOpen className="h-3 w-3 mr-1" />
            Tax Guidance
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <span>Chat with Lucapacioli</span>
              </CardTitle>
              <CardDescription>
                Ask me anything about Tunisian finance, tax, and legal matters
              </CardDescription>
            </CardHeader>
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Welcome to Lucapacioli GPT! 👋
                    </h3>
                    <p className="text-gray-600 mb-4">
                      I'm here to help with your financial and legal questions specific to Tunisia.
                    </p>
                    <p className="text-sm text-gray-500">
                      Try asking about VAT rates, company registration, or tax compliance.
                    </p>
                  </div>
                )}
                
                {messages.map((message: ChatMessage) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className={message.type === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}>
                          {message.type === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex space-x-2 max-w-[80%]">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-600">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="p-3 rounded-lg bg-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            {/* Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                  placeholder="Ask me about tax, legal, or financial matters..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <span>Suggested Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-3 text-xs"
                  onClick={() => setInputValue(question)}
                >
                  {question}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Tools</CardTitle>
              <CardDescription>Access financial calculators and resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Calculator className="h-4 w-4 mr-2" />
                VAT Calculator
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Document Templates
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Scale className="h-4 w-4 mr-2" />
                Compliance Checklist
              </Button>
            </CardContent>
          </Card>

          {/* Chat Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Conversations:</span>
                  <span className="font-semibold">{chatHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-semibold">
                    {chatHistory.filter((chat: ChatHistory) => {
                      const chatDate = new Date(chat.timestamp);
                      const now = new Date();
                      return chatDate.getMonth() === now.getMonth() && chatDate.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
