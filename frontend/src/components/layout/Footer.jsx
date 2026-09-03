import { Link } from 'react-router-dom';
import { HiOutlinePhone, HiOutlineEnvelope, HiOutlineMapPin } from 'react-icons/hi2';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Store Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="text-xl font-bold text-white">SmartPhone<span className="text-blue-400">Store</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              Toko smartphone terpercaya dengan produk original dan garansi resmi. 
              Belanja mudah, aman, dan nyaman.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Menu</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-white transition-colors">Produk</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><Link to="/orders" className="hover:text-white transition-colors">Pesanan Saya</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Layanan Pelanggan</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white transition-colors cursor-pointer">FAQ</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Kebijakan Pengembalian</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Syarat & Ketentuan</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Kebijakan Privasi</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <HiOutlinePhone className="w-4 h-4 text-blue-400" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiOutlineEnvelope className="w-4 h-4 text-blue-400" />
                <span>info@smartphonestore.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <HiOutlineMapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <span>Jl. Teknologi No. 1, Jakarta Selatan, 12110</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} SmartPhone Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
