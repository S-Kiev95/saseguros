import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Asegurado {
  id: number;
  numero_cliente: string;
  asegurado: string;
  telefono: string;
  poliza: string;
  tipo_seguro: string;
  marca_vehiculo: string;
  cuotas_pagadas: number;
  cuotas_por_pagar: number;
  vencimiento_cuotas: string;
  vigente_desde: string;
  vigente_hasta: string;
  estado_vencimiento: string;
  matricula: string;
}

interface AseguradosState {
  asegurados: Asegurado[];
  filteredAsegurados: Asegurado[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  filterField: string;
  filterValue: string;
  fetchAsegurados: () => Promise<void>;
  setFilter: (field: string, value: string) => void;
  applyFilters: () => void;
}

export const useAseguradosStore = create<AseguradosState>((set, get) => ({
  asegurados: [],
  filteredAsegurados: [],
  totalCount: 0,
  loading: false,
  error: null,
  filterField: 'asegurado',
  filterValue: '',

  fetchAsegurados: async () => {
    try {
      set({ loading: true, error: null });

      const { data, error, count } = await supabase
        .from('asegurados')
        .select('*', { count: 'exact' })
        .order('numero_cliente', { ascending: true });

      if (error) throw error;

      set({
        asegurados: data || [],
        filteredAsegurados: data || [],
        totalCount: count || 0,
        loading: false
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los datos';
      set({ error: errorMessage, loading: false });
      console.error('Error al cargar asegurados:', err);
    }
  },

  setFilter: (field: string, value: string) => {
    set({ filterField: field, filterValue: value });
    get().applyFilters();
  },

  applyFilters: () => {
    const { asegurados, filterField, filterValue } = get();
    let filtered = [...asegurados];

    if (filterValue) {
      if (filterField === 'pago') {
        const isPaid = filterValue === 'SI';
        filtered = filtered.filter(asegurado => 
          isPaid ? 
            asegurado.cuotas_pagadas === asegurado.cuotas_por_pagar : 
            asegurado.cuotas_pagadas < asegurado.cuotas_por_pagar
        );
      } else if (filterField === 'estado') {
        filtered = filtered.filter(asegurado => 
          asegurado.estado_vencimiento === filterValue
        );
      } else {
        filtered = filtered.filter(asegurado => 
          String(asegurado[filterField as keyof Asegurado])
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        );
      }
    }

    set({ 
      filteredAsegurados: filtered,
      totalCount: filtered.length
    });
  }
}));