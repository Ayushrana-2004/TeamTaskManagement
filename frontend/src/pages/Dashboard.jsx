import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', memberIds: '' });
  const { user, logout } = useAuth();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const ids = newProject.memberIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      await api.post('/projects', {
        name: newProject.name,
        description: newProject.description,
        memberIds: ids
      });
      setNewProject({ name: '', description: '', memberIds: '' });
      fetchProjects();
    } catch (error) {
      alert("Failed to create project.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure? This will delete the project and all its tasks.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      alert("Failed to delete project.");
    }
  };

  return (
    <div className="container p-6 mx-auto max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Projects</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {user?.name} ({user?.role})</span>
          <button onClick={logout} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {user?.role === 'ROLE_ADMIN' && (
          <div className="col-span-full p-4 mb-4 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium">Name</label>
                <input type="text" required className="w-full border rounded px-2 py-1" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="block text-sm font-medium">Description</label>
                <input type="text" required className="w-full border rounded px-2 py-1" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium">Member IDs (comma separated)</label>
                <input type="text" required placeholder="1,2,3" className="w-full border rounded px-2 py-1" value={newProject.memberIds} onChange={e => setNewProject({...newProject, memberIds: e.target.value})} />
              </div>
              <button type="submit" className="px-4 py-1 text-white bg-green-600 rounded hover:bg-green-700">Create</button>
            </form>
          </div>
        )}
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          projects.map(project => (
            <div key={project.id} className="p-6 bg-white rounded shadow hover:shadow-lg transition relative">
              {user?.role === 'ROLE_ADMIN' && (
                <button
                  onClick={(e) => { e.preventDefault(); handleDeleteProject(project.id); }}
                  className="absolute top-2 right-2 text-xs px-2 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
              <Link to={`/project/${project.id}`} className="block">
                <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
                <p className="text-gray-600">{project.description}</p>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}