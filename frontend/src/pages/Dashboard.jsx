import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const { user, logout } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    fetchProjects();
  }, []);

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
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects found.</p>
        ) : (
          projects.map(project => (
            <Link to={`/project/${project.id}`} key={project.id} className="p-6 bg-white rounded shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
              <p className="text-gray-600">{project.description}</p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}