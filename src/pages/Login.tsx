import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('correo', email)
        .eq('contraseña', password)
        .single();

      if (error) {
        console.error('Error en consulta:', error);
        setError('Error al consultar usuario');
        return;
      }

      if (data) {
        // Guardamos el usuario en sessionStorage para mantener la sesión
        sessionStorage.setItem('currentUser', JSON.stringify(data));
        navigate('/app');
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error inesperado al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('correo')
        .eq('correo', email)
        .single();

      if (error) {
        setError('Error al verificar el correo electrónico');
      } else if (data) {
        // Aquí deberías implementar tu lógica de recuperación de contraseña
        alert('Por favor, contacta al administrador para restablecer tu contraseña');
      } else {
        setError('No existe un usuario con ese correo electrónico');
      }
    } catch (err) {
      console.error('Error en recuperación:', err);
      setError('Ocurrió un error al procesar tu solicitud');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Iniciar Sesión</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <button
          onClick={handleResetPassword}
          className="w-full text-blue-600 text-sm mt-4 hover:text-blue-700 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </div>
  );
}