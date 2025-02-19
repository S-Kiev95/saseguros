import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Users, Car, List, Plus, ChevronRight, Menu } from 'lucide-react';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  subItems: {
    icon: React.ReactNode;
    label: string;
    action: () => void;
    adminOnly?: boolean;
  }[];
}

export default function Layout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = () => {
      const userData = sessionStorage.getItem('currentUser');
      if (!userData) {
        navigate('/', { replace: true });
        return;
      }
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        sessionStorage.removeItem('currentUser');
        navigate('/', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  const isAdmin = user?.rol === 'administrador';

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    navigate('/', { replace: true });
  };

  const menuItems: MenuItem[] = [
    {
      icon: <Users size={20} />,
      label: 'Usuarios',
      subItems: [
        { icon: <List size={16} />, label: 'Ver Listado', action: () => navigate('/app/users') },
        { icon: <Plus size={16} />, label: 'Crear', action: () => navigate('/app/users/create'), adminOnly: true },
      ]
    },
    {
      icon: <Car size={20} />,
      label: 'Asegurados',
      subItems: [
        { icon: <List size={16} />, label: 'Ver Listado', action: () => navigate('/app') },
        { icon: <Plus size={16} />, label: 'Crear', action: () => navigate('/app/asegurados/create') },
      ]
    }
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toggle button for collapsed state */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}
      >
        {isSidebarOpen ? <ChevronRight size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Menú</h2>
          </div>
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
                  {item.subItems.map((subItem) => {
                    if (subItem.adminOnly && !isAdmin) return null;
                    return (
                      <button
                        key={subItem.label}
                        onClick={subItem.action}
                        className="w-full flex items-center gap-2 p-2 pl-8 hover:bg-gray-100 transition-colors text-sm"
                      >
                        {subItem.icon}
                        <span>{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6 pt-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
}