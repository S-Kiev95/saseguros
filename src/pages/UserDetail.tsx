import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  nombre_usuario: string;
  correo: string;
  rol: string;
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) throw new Error('ID no proporcionado');

        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setUser(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el usuario';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando usuario...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error || 'Usuario no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detalle del Usuario</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">ID</h3>
            <p className="mt-1 text-lg text-gray-900">{user.id}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Nombre de Usuario</h3>
            <p className="mt-1 text-lg text-gray-900">{user.nombre_usuario}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Correo Electrónico</h3>
            <p className="mt-1 text-lg text-gray-900">{user.correo}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Rol</h3>
            <p className="mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {user.rol}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}