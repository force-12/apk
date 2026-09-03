import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart, HiOutlineUser, HiBars3, HiXMark, HiOutlineArrowRightOnRectangle, HiOutlineClipboardDocumentList, HiOutlineCog6Tooth } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Produk' },
    { to: '/about', label: 'Tentang Kami' },
  ];

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <span className="text-xl font-bold text-gray-900">SmartPhone<span className="text-blue-600">Store</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <HiOutlineShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button onClick={() => setUserMenu(!userMenu)} className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <HiOutlineUser className="w-6 h-6" />
                  <span className="hidden sm:inline text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </button>
                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenu(false)}>
                          <HiOutlineCog6Tooth className="w-4 h-4" /><span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link to="/profile" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenu(false)}>
                        <HiOutlineUser className="w-4 h-4" /><span>Profil Saya</span>
                      </Link>
                      <Link to="/orders" className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenu(false)}>
                        <HiOutlineClipboardDocumentList className="w-4 h-4" /><span>Pesanan Saya</span>
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                        <HiOutlineArrowRightOnRectangle className="w-4 h-4" /><span>Keluar</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Masuk</Link>
                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Daftar</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
              {mobileOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 pb-4">
          <div className="px-4 pt-2 space-y-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2 space-y-2 border-t border-gray-100 mt-2">
                <Link to="/login" className="block px-4 py-2 text-center text-gray-700 hover:bg-gray-50 rounded-lg font-medium" onClick={() => setMobileOpen(false)}>Masuk</Link>
                <Link to="/register" className="block px-4 py-2 text-center bg-blue-600 text-white rounded-lg font-medium" onClick={() => setMobileOpen(false)}>Daftar</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
