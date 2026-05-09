import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assigneeIds: '' });

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/projects/${id}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      alert("Failed to delete task.");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const ids = newTask.assigneeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      await api.post(`/projects/${id}/tasks`, {
        title: newTask.title,
        description: newTask.description,
        assigneeIds: ids
      });
      setNewTask({ title: '', description: '', assigneeIds: '' });
      fetchTasks();
    } catch (error) {
      alert("Failed to create task. Check if assignee IDs are valid.");
    }
  };

  return (
    <div className="container p-6 mx-auto max-w-5xl">
      <Link to="/dashboard" className="text-blue-500 hover:underline mb-4 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-3xl font-bold mb-6">Project Tasks</h1>

      {user?.role === 'ROLE_ADMIN' && (
        <div className="p-4 mb-8 bg-white rounded shadow">
          <h2 className="text-xl font-bold mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium">Title</label>
              <input type="text" required className="w-full border rounded px-2 py-1" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium">Description</label>
              <input type="text" required className="w-full border rounded px-2 py-1" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium">Assignee IDs (comma separated)</label>
              <input type="text" required placeholder="1,3" className="w-full border rounded px-2 py-1" value={newTask.assigneeIds} onChange={e => setNewTask({...newTask, assigneeIds: e.target.value})} />
            </div>
            <button type="submit" className="px-4 py-1 text-white bg-green-600 rounded hover:bg-green-700">Add Task</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['TODO', 'IN_PROGRESS', 'DONE'].map(statusColumn => (
          <div key={statusColumn} className="bg-gray-200 rounded p-4">
            <h2 className="font-bold text-lg mb-4 capitalize">{statusColumn.replace('_', ' ')}</h2>
            <div className="space-y-4">
              {tasks.filter(t => t.status === statusColumn).map(task => (
                <div key={task.id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                  <h3 className="font-bold">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    Assignees: {task.assignees?.map(a => a.name).join(', ') || 'None'}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <select
                      className="text-sm border rounded px-1"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                    {user?.role === 'ROLE_ADMIN' && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-sm px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
