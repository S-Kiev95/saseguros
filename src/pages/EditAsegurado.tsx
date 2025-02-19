import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EditAsegurado() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    numero_cliente: '',
    asegurado: '',
    telefono: '',
    poliza: '',
    tipo_seguro: '',
    marca_vehiculo: '',
    matricula: '',
    cuotas_pagadas: 0,
    cuotas_por_pagar: 0,
    vencimiento_cuotas: '',
    vigente_desde: '',
    vigente_hasta: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAsegurado = async () => {
      try {
        if (!id) throw new Error('ID no proporcionado');

        const { data, error } = await supabase
          .from('asegurados')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          // Format dates for input fields
          const formattedData = {
            ...data,
            vencimiento_cuotas: data.vencimiento_cuotas.split('T')[0],
            vigente_desde: data.vigente_desde.split('T')[0],
            vigente_hasta: data.vigente_hasta.split('T')[0],
          };
          setFormData(formattedData);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el asegurado';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAsegurado();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const { error } = await supabase
        .from('asegurados')
        .update(formData)
        .eq('id', id);

      if (error) throw error;

      navigate('/app');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el asegurado';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando asegurado...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Asegurado</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="numero_cliente" className="block text-sm font-medium text-gray-700 mb-1">
              N° Cliente
            </label>
            <input
              type="text"
              id="numero_cliente"
              name="numero_cliente"
              value={formData.numero_cliente}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="asegurado" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Asegurado
            </label>
            <input
              type="text"
              id="asegurado"
              name="asegurado"
              value={formData.asegurado}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="poliza" className="block text-sm font-medium text-gray-700 mb-1">
              Póliza
            </label>
            <input
              type="text"
              id="poliza"
              name="poliza"
              value={formData.poliza}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="tipo_seguro" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Seguro
            </label>
            <input
              type="text"
              id="tipo_seguro"
              name="tipo_seguro"
              value={formData.tipo_seguro}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="marca_vehiculo" className="block text-sm font-medium text-gray-700 mb-1">
              Marca/Modelo
            </label>
            <input
              type="text"
              id="marca_vehiculo"
              name="marca_vehiculo"
              value={formData.marca_vehiculo}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="matricula" className="block text-sm font-medium text-gray-700 mb-1">
              Matrícula
            </label>
            <input
              type="text"
              id="matricula"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="cuotas_pagadas" className="block text-sm font-medium text-gray-700 mb-1">
              Cuotas Pagadas
            </label>
            <input
              type="number"
              id="cuotas_pagadas"
              name="cuotas_pagadas"
              value={formData.cuotas_pagadas}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="cuotas_por_pagar" className="block text-sm font-medium text-gray-700 mb-1">
              Total de Cuotas
            </label>
            <input
              type="number"
              id="cuotas_por_pagar"
              name="cuotas_por_pagar"
              value={formData.cuotas_por_pagar}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="vencimiento_cuotas" className="block text-sm font-medium text-gray-700 mb-1">
              Vencimiento de Cuotas
            </label>
            <input
              type="date"
              id="vencimiento_cuotas"
              name="vencimiento_cuotas"
              value={formData.vencimiento_cuotas}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="vigente_desde" className="block text-sm font-medium text-gray-700 mb-1">
              Vigente Desde
            </label>
            <input
              type="date"
              id="vigente_desde"
              name="vigente_desde"
              value={formData.vigente_desde}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="vigente_hasta" className="block text-sm font-medium text-gray-700 mb-1">
              Vigente Hasta
            </label>
            <input
              type="date"
              id="vigente_hasta"
              name="vigente_hasta"
              value={formData.vigente_hasta}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 mt-6"
        >
          {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}