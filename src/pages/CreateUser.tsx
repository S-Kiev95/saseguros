import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CreateUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    correo: '',
    contraseña: '',
    rol: 'empleado'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificar si el usuario es administrador
  React.useEffect(() => {
    const userData = sessionStorage.getItem('currentUser');
    const user = userData ? JSON.parse(userData) : null;
    
    if (!user || user.rol !== 'administrador') {
      navigate('/app');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .insert([
          {
            nombre_usuario: formData.nombre_usuario,
            correo: formData.correo,
            contraseña: formData.contraseña,
            rol: formData.rol
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        navigate('/app/users');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el usuario';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Usuario</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="nombre_usuario" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de Usuario
          </label>
          <input
            type="text"
            id="nombre_usuario"
            name="nombre_usuario"
            value={formData.nombre_usuario}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="correo"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="contraseña" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="contraseña"
            name="contraseña"
            value={formData.contraseña}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
            Rol
          </label>
          <select
            id="rol"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="empleado">Empleado</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? 'Creando usuario...' : 'Crear Usuario'}
        </button>
      </form>
    </div>
  );
}