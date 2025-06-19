
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, AlertCircle, CheckCircle, User, Filter } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Request, Task } from '../../../server/src/schema';

interface TasksPanelProps {
  requests: Request[];
  getStatusColor: (status: string) => string;
}

export function TasksPanel({ requests, getStatusColor }: TasksPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Create a map of request titles for easy lookup
  const requestTitleMap = requests.reduce((acc: Record<string, string>, request: Request) => {
    acc[request.id] = request.title;
    return acc;
  }, {});

  // Load tasks for all requests
  const loadTasks = useCallback(async () => {
    if (requests.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const taskPromises = requests.map((request: Request) =>
        trpc.getTasksByRequest.query({ requestId: request.id })
      );
      const allTasks = await Promise.all(taskPromises);
      const flatTasks = allTasks.flat();
      setTasks(flatTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [requests]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Filter tasks
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleStatusUpdate = async (taskId: string, newStatus: 'Not Started' | 'In Progress' | 'Awaiting Client Feedback' | 'Completed') => {
    try {
      await trpc.updateTask.mutate({
        id: taskId,
        status: newStatus
      });
      setTasks((prev: Task[]) => prev.map((task: Task) => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'Medium': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const isOverdue = (task: Task) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Tasks & Activities</h2>
        <p className="text-gray-600">Track progress on individual tasks across your requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Awaiting Client Feedback">Awaiting Feedback</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High Priority</SelectItem>
            <SelectItem value="Medium">Medium Priority</SelectItem>
            <SelectItem value="Low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-600">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter((t: Task) => t.status === 'In Progress').length}
                </p>
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
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter((t: Task) => t.status === 'Completed').length}
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {tasks.filter((t: Task) => isOverdue(t)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}
              </h3>
              <p className="text-gray-600">
                {tasks.length === 0 
                  ? 'Tasks will appear here as your requests are processed.'
                  : 'Try adjusting your filter criteria.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task: Task) => (
            <Card 
              key={task.id} 
              className={`hover:shadow-md transition-shadow ${
                isOverdue(task) ? 'border-l-4 border-l-red-500' : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getPriorityIcon(task.priority)}
                      <Badge className={getStatusColor(task.priority)} variant="outline">
                        {task.priority}
                      </Badge>
                      {isOverdue(task) && (
                        <Badge className="bg-red-100 text-red-800">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <CardDescription className="mt-2">
                      {task.description}
                    </CardDescription>
                    <p className="text-sm text-indigo-600 mt-2 font-medium">
                      Request: {requestTitleMap[task.requestId] || 'Unknown Request'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created {task.createdAt.toLocaleDateString()}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {task.assigneeId && (
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>Assigned</span>
                      </div>
                    )}
                  </div>
                  
                  {task.status === 'Awaiting Client Feedback' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(task.id, 'In Progress')}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Provide Feedback
                    </Button>
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
