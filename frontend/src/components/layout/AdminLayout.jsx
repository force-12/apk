import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { HiOutlineHome, HiOutlineCube, HiOutlineClipboardDocumentList, HiOutlineUsers, HiOutlineTag, HiOutlineSquares2X2, HiOutlineChartBar, HiOutlineArrowRightOnRectangle, HiBars3, HiXMark } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { to: '/admin', icon: HiOutlineHome, label: 'Dashboard', exact: true },
  { to: '/admin/products', icon: HiOutlineCube, label: 'Produk' },
  { to: '/admin/orders', icon: HiOutlineClipboardDocumentList, label: 'Pesanan' },
  { to: '/admin/customers', icon: HiOutlineUsers, label: 'Pelanggan' },
  { to: '/admin/brands', icon: HiOutlineTag, label: 'Brand' },
  { to: '/admin/categories', icon: HiOutlineSquares2X2, label: 'Kategori' },
  { to: '/admin/reports', icon: HiOutlineChartBar, label: 'Laporan' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="font-bold text-gray-900">Admin Panel</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
              <HiXMark className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.to, item.exact)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Back to store */}
          <div className="p-3 border-t border-gray-200">
            <Link to="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
              <span>Kembali ke Toko</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
            <HiBars3 className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Halo, <span className="font-medium text-gray-900">{user?.name}</span></span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
