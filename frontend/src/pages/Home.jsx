import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineShieldCheck, HiOutlineDocumentCheck, HiOutlineTruck, HiOutlineLockClosed } from 'react-icons/hi2';
import { getFeaturedProducts, getLatestProducts } from '../api/products';
import ProductGrid from '../components/product/ProductGrid';
import { ProductCardSkeleton } from '../components/ui/LoadingSkeleton';

const brands = [
  { id: 1, name: 'Samsung', emoji: '📱' },
  { id: 2, name: 'Apple', emoji: '🍎' },
  { id: 3, name: 'Xiaomi', emoji: '📲' },
  { id: 4, name: 'OPPO', emoji: '📳' },
  { id: 5, name: 'vivo', emoji: '🔋' },
  { id: 6, name: 'realme', emoji: '⚡' },
  { id: 7, name: 'Infinix', emoji: '🌟' },
  { id: 8, name: 'TECNO', emoji: '🔷' },
  { id: 9, name: 'ASUS', emoji: '🎮' },
];

const advantages = [
  { icon: HiOutlineShieldCheck, title: 'Produk Original', desc: 'Semua produk yang kami jual 100% original dan bergaransi resmi dari distributor.' },
  { icon: HiOutlineDocumentCheck, title: 'Garansi Resmi', desc: 'Dapatkan garansi resmi hingga 1 tahun untuk setiap pembelian smartphone.' },
  { icon: HiOutlineTruck, title: 'Pengiriman Cepat', desc: 'Pesanan diproses dan dikirim dalam waktu 1x24 jam ke seluruh Indonesia.' },
  { icon: HiOutlineLockClosed, title: 'Pembayaran Aman', desc: 'Transaksi aman dengan berbagai metode pembayaran terpercaya.' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingLatest, setLoadingLatest] = useState(true);

  useEffect(() => {
    getFeaturedProducts()
      .then(res => setFeaturedProducts(res.data.products || res.data))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false));

    getLatestProducts()
      .then(res => setLatestProducts(res.data.products || res.data))
      .catch(() => {})
      .finally(() => setLoadingLatest(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Temukan Smartphone Impianmu
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Koleksi smartphone terlengkap dengan harga terbaik. Dapatkan penawaran eksklusif dan produk original bergaransi resmi hanya di SmartPhone Store.
            </p>
            <Link
              to="/products"
              className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              Jelajahi Produk
            </Link>
          </div>
        </div>
      </section>

      {/* Produk Unggulan */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Produk Unggulan</h2>
          <Link to="/products" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Lihat Semua &rarr;
          </Link>
        </div>
        {loadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <p className="text-center text-gray-500 py-8">Belum ada produk unggulan.</p>
        )}
      </section>

      {/* Produk Terbaru */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Produk Terbaru</h2>
            <Link to="/products?sort=latest" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Lihat Semua &rarr;
            </Link>
          </div>
          {loadingLatest ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : latestProducts.length > 0 ? (
            <ProductGrid products={latestProducts} />
          ) : (
            <p className="text-center text-gray-500 py-8">Belum ada produk terbaru.</p>
          )}
        </div>
      </section>

      {/* Kategori Brand */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Kategori Brand</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {brands.map(brand => (
            <Link
              key={brand.id}
              to={`/products?brand_id=${brand.id}`}
              className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <span className="text-3xl mb-2">{brand.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Keunggulan Kami */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Keunggulan Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
