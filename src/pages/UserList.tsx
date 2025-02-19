import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import { useUsuariosStore } from '../store/usuariosStore';
import { supabase } from '../lib/supabase';

export default function UserList() {
  const navigate = useNavigate();
  const { usuarios, loading, error, fetchUsuarios } = useUsuariosStore();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleDelete = async (userId: string) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setDeleteConfirm(null);
      fetchUsuarios();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('Error al eliminar el usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando usuarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-semibold">Error de conexión</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchUsuarios()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Lista de Usuarios</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {usuario.nombre_usuario}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.correo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => navigate(`/app/users/${usuario.id}`)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/app/users/${usuario.id}/edit`)}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    {deleteConfirm === usuario.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-800 transition-colors font-medium"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(usuario.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}