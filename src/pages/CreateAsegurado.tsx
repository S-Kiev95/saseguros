import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAseguradosStore } from '../store/aseguradosStore';
import { toast } from 'react-hot-toast';

// Define tipos como constantes para evitar errores
const TIPO_SEGURO = ['Moto', 'Camioneta', 'Alquiler', 'Automóvil'] as const;
const ESTADO_VENCIMIENTO = [
  '+30', '15-30', '10-15', '5-10', '0-5', 'Hoy',
  '-1-5', '-5-10', '-10-15', '-15-30', '-30'
] as const;

export default function CreateAsegurado() {
  const navigate = useNavigate();
  const fetchAsegurados = useAseguradosStore(state => state.fetchAsegurados);
  const [formData, setFormData] = useState({
    numero_cliente: '',
    asegurado: '',
    telefono: '',
    poliza: '',
    tipo_seguro: 'Moto',
    marca_vehiculo: '',
    cuotas_pagadas: 0,
    cuotas_por_pagar: 0,
    vencimiento_cuotas: '',
    vigente_desde: '',
    vigente_hasta: '',
    matricula: '',
    estado_vencimiento: 'Hoy'
  });

  const formatPhoneNumber = (phone: string) => {
    // Eliminar cualquier caracter que no sea número
    const numbers = phone.replace(/\D/g, '');
    
    if (numbers.length === 9) {
      // Si tiene 9 dígitos, quitar el primer dígito (0) y agregar 598
      return '598' + numbers.substring(1);
    } else if (numbers.length === 11) {
      // Si ya tiene 11 dígitos, devolverlo tal cual
      return numbers;
    }
    return numbers;
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 9 || numbers.length === 11;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      // Solo permitir números y limitar la longitud
      const numbersOnly = value.replace(/\D/g, '');
      if (numbersOnly.length <= 11) {
        setFormData(prev => ({
          ...prev,
          [name]: numbersOnly
        }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar el teléfono antes de enviar
    if (!validatePhone(formData.telefono)) {
      toast.error('El teléfono debe tener 9 o 11 dígitos');
      return;
    }

    // Formatear el teléfono
    const formattedData = {
      ...formData,
      telefono: formatPhoneNumber(formData.telefono)
    };

    try {
      const { error } = await supabase
        .from('asegurados')
        .insert([formattedData]);

      if (error) throw error;
      
      // Mostrar mensaje de éxito
      toast.success('Asegurado creado exitosamente');
      
      // Actualizar el store
      await fetchAsegurados();
      
      // Redirigir al listado
      navigate('/app');
      
    } catch (error: any) {
      console.error('Error creating asegurado:', error);
      toast.error(`Error al crear el asegurado: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Crear Nuevo Asegurado</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Número de Cliente</label>
            <input
              type="text"
              name="numero_cliente"
              value={formData.numero_cliente}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              placeholder="Ej: CLI-001"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Nombre del Asegurado</label>
            <input
              type="text"
              name="asegurado"
              value={formData.asegurado}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              placeholder="Ej: 097464651 o 59897464651"
            />
            <p className="text-sm text-gray-500">
              Ingrese 9 dígitos (ej: 097464651) o 11 dígitos con prefijo 598
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Póliza</label>
            <input
              type="text"
              name="poliza"
              value={formData.poliza}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              placeholder="Ej: POL-2024-001"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tipo de Seguro</label>
            <select
              name="tipo_seguro"
              value={formData.tipo_seguro}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            >
              {TIPO_SEGURO.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Marca del Vehículo</label>
            <input
              type="text"
              name="marca_vehiculo"
              value={formData.marca_vehiculo}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              placeholder="Marca y modelo"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Matrícula</label>
            <input
              type="text"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              placeholder="Matrícula del vehículo"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Cuotas Pagadas</label>
            <input
              type="number"
              name="cuotas_pagadas"
              value={formData.cuotas_pagadas}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Cuotas por Pagar</label>
            <input
              type="number"
              name="cuotas_por_pagar"
              value={formData.cuotas_por_pagar}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Estado Vencimiento</label>
            <select
              name="estado_vencimiento"
              value={formData.estado_vencimiento}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            >
              {ESTADO_VENCIMIENTO.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Vencimiento de Cuotas</label>
            <input
              type="date"
              name="vencimiento_cuotas"
              value={formData.vencimiento_cuotas}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Vigente Desde</label>
            <input
              type="date"
              name="vigente_desde"
              value={formData.vigente_desde}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Vigente Hasta</label>
            <input
              type="date"
              name="vigente_hasta"
              value={formData.vigente_hasta}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
          >
            Crear Asegurado
          </button>
        </div>
      </form>
    </div>
  );
}
