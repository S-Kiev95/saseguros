import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Usuario {
  id: string;
  nombre_usuario: string;
  rol: string;
  correo: string;
}

interface UsuariosState {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
  fetchUsuarios: () => Promise<void>;
}

export const useUsuariosStore = create<UsuariosState>((set) => ({
  usuarios: [],
  loading: false,
  error: null,

  fetchUsuarios: async () => {
    try {
      set({ loading: true, error: null });

      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_usuario, rol, correo')
        .order('nombre_usuario');

      if (error) throw error;

      set({
        usuarios: data || [],
        loading: false
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los usuarios';
      set({ error: errorMessage, loading: false });
      console.error('Error al cargar usuarios:', err);
    }
  },
}));