import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Asegurado {
  id: number;
  numero_cliente: string;
  asegurado: string;
  telefono: string;
  poliza: string;
  tipo_seguro: string;
  marca_vehiculo: string;
  matricula: string;
  cuotas_pagadas: number;
  cuotas_por_pagar: number;
  vencimiento_cuotas: string;
  vigente_desde: string;
  vigente_hasta: string;
  estado_vencimiento: string;
}

export default function AseguradoDetail() {
  const { id } = useParams<{ id: string }>();
  const [asegurado, setAsegurado] = useState<Asegurado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setAsegurado(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar el asegurado';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAsegurado();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando asegurado...</div>
      </div>
    );
  }

  if (error || !asegurado) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-gray-600 mb-6">{error || 'Asegurado no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Detalle del Asegurado</h1>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">N° Cliente</h3>
            <p className="mt-1 text-lg text-gray-900">{asegurado.numero_cliente}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Nombre del Asegurado</h3>
            <p className="mt-1 text-lg text-gray-900">{asegurado.asegurado}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
            <p className="mt-1 text-lg text-gray-900">{asegurado.telefono}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Póliza</h3>
            <p className="mt-1 text-lg text-gray-900">{asegurado.poliza}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Tipo de Seguro</h3>
            <p className="mt-1 text-lg text-gray-900">{asegurado.tipo_seguro}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Marca/Modelo</h3>
            <p className="mt-1 text-lg text-gray-900">{asegurado.marca_vehiculo}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Matrícula</h3>
            <p className="mt-1 text-lg text-gray-900">{asegurado.matricula}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Cuotas</h3>
            <p className="mt-1 text-lg text-gray-900">
              {asegurado.cuotas_pagadas} de {asegurado.cuotas_por_pagar}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Vencimiento de Cuotas</h3>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(asegurado.vencimiento_cuotas).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Vigencia</h3>
            <p className="mt-1 text-lg text-gray-900">
              {new Date(asegurado.vigente_desde).toLocaleDateString()} - {new Date(asegurado.vigente_hasta).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Estado</h3>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                asegurado.estado_vencimiento.includes('-') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {asegurado.estado_vencimiento}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}