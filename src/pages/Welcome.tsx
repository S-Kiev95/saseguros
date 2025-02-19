import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, AlertCircle, Search, FileSpreadsheet, FileDown, Users, Car, List, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useAseguradosStore } from '../store/aseguradosStore';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type FilterField = 'asegurado' | 'numero_cliente' | 'poliza' | 'tipo_seguro' | 'marca_vehiculo' | 'matricula' | 'pago' | 'estado';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  subItems: {
    icon: React.ReactNode;
    label: string;
    action: () => void;
  }[];
}

export default function Welcome() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    filteredAsegurados: asegurados,
    totalCount,
    loading,
    error,
    filterField,
    filterValue,
    fetchAsegurados,
    setFilter
  } = useAseguradosStore();

  const menuItems: MenuItem[] = [
    {
      icon: <Users size={20} />,
      label: 'Usuarios',
      subItems: [
        { icon: <List size={16} />, label: 'Ver Listado', action: () => navigate('/users') },
        { icon: <Plus size={16} />, label: 'Crear', action: () => console.log('Crear usuario') },
        { icon: <Edit2 size={16} />, label: 'Modificar', action: () => console.log('Modificar usuario') },
        { icon: <Trash2 size={16} />, label: 'Eliminar', action: () => console.log('Eliminar usuario') },
      ]
    },
    {
      icon: <Car size={20} />,
      label: 'Asegurados',
      subItems: [
        { icon: <List size={16} />, label: 'Ver Listado', action: () => setIsSidebarOpen(false) },
        { icon: <Plus size={16} />, label: 'Crear', action: () => console.log('Crear asegurado') },
        { icon: <Edit2 size={16} />, label: 'Modificar', action: () => console.log('Modificar asegurado') },
        { icon: <Trash2 size={16} />, label: 'Eliminar', action: () => console.log('Eliminar asegurado') },
      ]
    }
  ];

  const handleDelete = async (aseguradoId: number) => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('asegurados')
        .delete()
        .eq('id', aseguradoId);

      if (error) throw error;

      setDeleteConfirm(null);
      fetchAsegurados();
    } catch (err) {
      console.error('Error al eliminar asegurado:', err);
      alert('Error al eliminar el asegurado');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/');
  };

  const calcularDiasVencimiento = (fecha: string) => {
    const hoy = new Date();
    const fechaVencimiento = new Date(fecha);
    const diferencia = fechaVencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const calcularDiasRenovacion = (fecha: string) => {
    const hoy = new Date();
    const fechaVigencia = new Date(fecha);
    const diferencia = fechaVigencia.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const getEstadoVencimiento = (estado: string): { text: string; color: string } => {
    const estados: { [key: string]: { text: string; color: string } } = {
      '+30': { text: '+30 días', color: 'bg-green-100 text-green-800' },
      '15-30': { text: '15 a 30 días', color: 'bg-green-50 text-green-600' },
      '10-15': { text: '10 a 15 días', color: 'bg-yellow-50 text-yellow-600' },
      '5-10': { text: '5 a 10 días', color: 'bg-orange-50 text-orange-600' },
      '0-5': { text: '0 a 5 días', color: 'bg-red-50 text-red-600' },
      'Hoy': { text: 'Hoy', color: 'bg-red-100 text-red-800' },
      '-30': { text: '+30 días vencido', color: 'bg-red-200 text-red-900' },
      '-15-30': { text: '15 a 30 días vencido', color: 'bg-red-100 text-red-800' },
      '-10-15': { text: '10 a 15 días vencido', color: 'bg-red-100 text-red-800' },
      '-5-10': { text: '5 a 10 días vencido', color: 'bg-red-100 text-red-800' },
      '-1-5': { text: '1 a 5 días vencido', color: 'bg-red-100 text-red-800' }
    };
    return estados[estado] || { text: estado, color: 'bg-gray-100 text-gray-800' };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text('Lista de Asegurados', 14, 15);
    doc.setFontSize(10);
    
    // Preparar datos para la tabla
    const tableData = asegurados.map(asegurado => [
      asegurado.numero_cliente,
      asegurado.asegurado,
      asegurado.telefono,
      asegurado.poliza,
      asegurado.tipo_seguro,
      asegurado.marca_vehiculo,
      asegurado.matricula,
      `${asegurado.cuotas_pagadas}/${asegurado.cuotas_por_pagar}`,
      new Date(asegurado.vencimiento_cuotas).toLocaleDateString(),
      calcularDiasVencimiento(asegurado.vencimiento_cuotas),
      asegurado.cuotas_pagadas === asegurado.cuotas_por_pagar ? "SI" : "NO",
      new Date(asegurado.vigente_desde).toLocaleDateString(),
      new Date(asegurado.vigente_hasta).toLocaleDateString(),
      calcularDiasRenovacion(asegurado.vigente_hasta),
      getEstadoVencimiento(asegurado.estado_vencimiento).text
    ]);

    autoTable(doc, {
      head: [['N° Cliente', 'Asegurado', 'Teléfono', 'Póliza', 'Tipo', 'Marca/Modelo', 'Matrícula', 'Cuotas', 'Vence', 'Días', 'Pago', 'Desde', 'Hasta', 'Días Ren.', 'Estado']],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    doc.save('asegurados.pdf');
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Preparar datos para Excel
    const excelData = asegurados.map(asegurado => ({
      'N° Cliente': asegurado.numero_cliente,
      'Asegurado': asegurado.asegurado,
      'Teléfono': asegurado.telefono,
      'Póliza': asegurado.poliza,
      'Tipo': asegurado.tipo_seguro,
      'Marca/Modelo': asegurado.marca_vehiculo,
      'Matrícula': asegurado.matricula,
      'Cuotas Pagadas': asegurado.cuotas_pagadas,
      'Total Cuotas': asegurado.cuotas_por_pagar,
      'Vencimiento': new Date(asegurado.vencimiento_cuotas).toLocaleDateString(),
      'Días para Vencimiento': calcularDiasVencimiento(asegurado.vencimiento_cuotas),
      'Estado de Pago': asegurado.cuotas_pagadas === asegurado.cuotas_por_pagar ? "SI" : "NO",
      'Vigencia Desde': new Date(asegurado.vigente_desde).toLocaleDateString(),
      'Vigencia Hasta': new Date(asegurado.vigente_hasta).toLocaleDateString(),
      'Días para Renovación': calcularDiasRenovacion(asegurado.vigente_hasta),
      'Estado': getEstadoVencimiento(asegurado.estado_vencimiento).text
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Asegurados');
    XLSX.writeFile(workbook, 'asegurados.xlsx');
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedAsegurados = asegurados.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterChange = (field: FilterField, value: string) => {
    setFilter(field, value);
    setCurrentPage(1);
  };

  React.useEffect(() => {
    const userData = sessionStorage.getItem('currentUser');
    if (!userData) {
      navigate('/');
      return;
    }

    if (asegurados.length === 0) {
      fetchAsegurados();
    }
  }, [navigate, fetchAsegurados, asegurados.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-semibold">Error de conexión</h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-between">
            <button
              onClick={() => fetchAsegurados()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Menú</h2>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.label} className="rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                  className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 transition-colors"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
                <div
                  className={`space-y-1 overflow-hidden transition-all duration-300 ${
                    expandedItem === item.label ? 'max-h-48' : 'max-h-0'
                  }`}
                >
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.label}
                      onClick={subItem.action}
                      className="w-full flex items-center gap-2 p-2 pl-8 hover:bg-gray-100 transition-colors text-sm"
                    >
                      {subItem.icon}
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6">
          <div className="max-w-[98%] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronRight
                    size={24}
                    className={`transform transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Lista de Asegurados</h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileSpreadsheet size={20} />
                  Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FileDown size={20} />
                  PDF
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut size={20} />
                  Cerrar Sesión
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-4 flex gap-4 items-center">
              <div className="flex-1 flex gap-4">
                <select
                  value={filterField}
                  onChange={(e) => handleFilterChange(e.target.value as FilterField, '')}
                  className="border rounded-lg px-3 py-2 min-w-[200px]"
                >
                  <option value="asegurado">Nombre del Asegurado</option>
                  <option value="numero_cliente">N° Cliente</option>
                  <option value="poliza">Póliza</option>
                  <option value="tipo_seguro">Tipo de Seguro</option>
                  <option value="marca_vehiculo">Marca/Modelo</option>
                  <option value="matricula">Matrícula</option>
                  <option value="pago">Estado de Pago</option>
                  <option value="estado">Estado de Vencimiento</option>
                </select>

                {filterField === 'pago' ? (
                  <select
                    value={filterValue}
                    onChange={(e) => handleFilterChange(filterField, e.target.value)}
                    className="border rounded-lg px-3 py-2 flex-1"
                  >
                    <option value="">Todos</option>
                    <option value="SI">Pagado</option>
                    <option value="NO">Pendiente</option>
                  </select>
                ) : filterField === 'estado' ? (
                  <select
                    value={filterValue}
                    onChange={(e) => handleFilterChange(filterField, e.target.value)}
                    className="border rounded-lg px-3 py-2 flex-1"
                  >
                    <option value="">Todos</option>
                    <option value="+30">Más de 30 días</option>
                    <option value="15-30">Entre 15 y 30 días</option>
                    <option value="10-15">Entre 10 y 15 días</option>
                    <option value="5-10">Entre 5 y 10 días</option>
                    <option value="0-5">Menos de 5 días</option>
                    <option value="Hoy">Vence hoy</option>
                    <option value="-30">Más de 30 días vencido</option>
                    <option value="-15-30">Entre 15 y 30 días vencido</option>
                    <option value="-10-15">Entre 10 y 15 días vencido</option>
                    <option value="-5-10">Entre 5 y 10 días vencido</option>
                    <option value="-1-5">Menos de 5 días vencido</option>
                  </select>
                ) : (
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={filterValue}
                      onChange={(e) => handleFilterChange(filterField, e.target.value)}
                      placeholder="Buscar..."
                      className="border rounded-lg pl-10 pr-4 py-2 w-full"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                )}
              </div>

              {filterValue && (
                <button
                  onClick={() => handleFilterChange(filterField, '')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Limpiar filtro
                </button>
              )}
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">N° Cliente</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Asegurado</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Teléfono</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Póliza</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Tipo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Marca/Modelo</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Matrícula</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Cuotas</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Vence</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Días</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Pago</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Desde</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Hasta</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Días Ren.</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Estado</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAsegurados.map((asegurado) => {
                    const diasVencimiento = calcularDiasVencimiento(asegurado.vencimiento_cuotas);
                    const diasRenovacion = calcularDiasRenovacion(asegurado.vigente_hasta);
                    const todoPago = asegurado.cuotas_pagadas === asegurado.cuotas_por_pagar ? "SI" : "NO";
                    const estado = getEstadoVencimiento(asegurado.estado_vencimiento);

                    return (
                      <tr key={asegurado.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.numero_cliente}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.asegurado}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.telefono}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.poliza}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.tipo_seguro}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.marca_vehiculo}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.matricula}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.cuotas_pagadas}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{asegurado.cuotas_por_pagar}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{new Date(asegurado.vencimiento_cuotas).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{diasVencimiento}</td>
                        <td className={`px-3 py-2 text-sm whitespace-nowrap ${todoPago === "SI" ? "text-green-600 font-semibold" : "text-red-600"}`}>
                          {todoPago}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{new Date(asegurado.vigente_desde).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{new Date(asegurado.vigente_hasta).toLocaleDateString()}</td>
                        <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{diasRenovacion}</td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${estado.color}`}>
                            {estado.text}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-sm whitespace-nowrap">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => navigate(`/app/asegurados/${asegurado.id}`)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Ver detalle"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => navigate(`/app/asegurados/${asegurado.id}/edit`)}
                              className="text-green-600 hover:text-green-800 transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={18} />
                            </button>
                            {deleteConfirm === asegurado.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDelete(asegurado.id)}
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
                                onClick={() => setDeleteConfirm(asegurado.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, totalCount)} de {totalCount} resultados
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-4 py-2">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}