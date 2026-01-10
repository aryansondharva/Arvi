'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const supabase = createClient();

interface ServerTask {
  id: string;
  task_name: string;
  task_description: string;
  task_type: string;
  priority: string;
  assigned_to: string;
  due_date: string;
  status: string;
  completion_notes: string;
  created_at: string;
}

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
}

export default function ServerTasks() {
  const [tasks, setTasks] = useState<ServerTask[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    task_name: '',
    task_description: '',
    task_type: 'collection',
    priority: 'medium',
    assigned_to: '',
    due_date: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel('server_tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'server_tasks' })
      .subscribe((payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new as ServerTask]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => 
            prev.map(task => 
              task.id === payload.new.id ? payload.new as ServerTask : task
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(task => task.id !== payload.old.id));
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('server_tasks')
        .select(`
          *,
          profiles!server_tasks_assigned_to_fkey (
            full_name,
            email
          )
        `)
        .eq('server_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .neq('id', user.id) // Exclude the server user
        .order('full_name', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const createTask = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('server_tasks')
        .insert({
          server_id: user.id,
          task_name: newTask.task_name,
          task_description: newTask.task_description,
          task_type: newTask.task_type,
          priority: newTask.priority,
          assigned_to: newTask.assigned_to || null,
          due_date: newTask.due_date || null,
          status: 'pending'
        });

      if (error) throw error;

      // Reset form and refresh tasks
      setNewTask({
        task_name: '',
        task_description: '',
        task_type: 'collection',
        priority: 'medium',
        assigned_to: '',
        due_date: ''
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('server_tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status.');
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTaskTypeIcon = (type: string) => {
    const icons = {
      collection: '🗑️',
      planting: '🌱',
      cleanup: '🧹',
      monitoring: '📊',
      certification: '🏆'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  const filterTasks = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tasks Management</h1>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>Create New Task</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="task_name">Task Name</Label>
                <Input
                  id="task_name"
                  value={newTask.task_name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, task_name: e.target.value }))}
                  placeholder="Enter task name"
                />
              </div>

              <div>
                <Label htmlFor="task_description">Description</Label>
                <Textarea
                  id="task_description"
                  value={newTask.task_description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, task_description: e.target.value }))}
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="task_type">Task Type</Label>
                <Select
                  value={newTask.task_type}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, task_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collection">Collection</SelectItem>
                    <SelectItem value="planting">Planting</SelectItem>
                    <SelectItem value="cleanup">Cleanup</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select
                  value={newTask.assigned_to}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, assigned_to: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createTask}>Create Task</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterTasks('pending').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterTasks('in_progress').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterTasks('completed').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tasks.filter(task => 
                task.status !== 'completed' && 
                new Date(task.due_date) < new Date()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filterTasks('pending').concat(filterTasks('in_progress')).length === 0 ? (
                <p className="text-center text-gray-500 py-8">No active tasks</p>
              ) : (
                filterTasks('pending').concat(filterTasks('in_progress')).map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTaskTypeIcon(task.task_type)}</span>
                          <h4 className="font-semibold">{task.task_name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{task.task_description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Assigned to: {task.profiles?.full_name || 'Unassigned'}</span>
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                        >
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Completed Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filterTasks('completed').length === 0 ? (
                <p className="text-center text-gray-500 py-8">No completed tasks yet</p>
              ) : (
                filterTasks('completed').map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-2 opacity-75">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTaskTypeIcon(task.task_type)}</span>
                          <h4 className="font-semibold line-through">{task.task_name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{task.task_description}</p>
                        {task.completion_notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            <strong>Notes:</strong> {task.completion_notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          COMPLETED
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span>Completed by: {task.profiles?.full_name || 'Unassigned'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
