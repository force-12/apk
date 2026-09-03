import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart, HiMinus, HiPlus, HiStar } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { getProduct } from '../api/products';
import { formatCurrency, getDiscountedPrice, formatDate } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import Rating from '../components/ui/Rating';
import { DetailSkeleton } from '../components/ui/LoadingSkeleton';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [quantity, setQuantity] = useState(1);
  const [selectedRam, setSelectedRam] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(res => {
        const p = res.data.product || res.data;
        setProduct(p);
        if (p.variants && p.variants.length > 0) {
          const v = p.variants[0];
          setSelectedRam(v.ram);
          setSelectedStorage(v.storage);
          setSelectedColor(v.color);
          setSelectedVariant(v);
        }
      })
      .catch(() => {
        toast.error('Gagal memuat data produk.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!product?.variants) return;
    const match = product.variants.find(
      v => v.ram === selectedRam && v.storage === selectedStorage && v.color === selectedColor
    );
    setSelectedVariant(match || null);
  }, [selectedRam, selectedStorage, selectedColor, product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500">Produk tidak ditemukan.</p>
      </div>
    );
  }

  const uniqueRams = [...new Set(product.variants?.map(v => v.ram).filter(Boolean))];
  const uniqueStorages = [...new Set(product.variants?.map(v => v.storage).filter(Boolean))];
  const uniqueColors = [...new Set(product.variants?.map(v => v.color).filter(Boolean))];

  const price = selectedVariant?.price || product.price;
  const discount = product.discount || 0;
  const discountedPrice = getDiscountedPrice(price, discount);
  const stock = selectedVariant?.stock ?? product.stock ?? 0;

  const imgSrc = product.image?.startsWith('/uploads')
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${product.image}`
    : null;

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, selectedVariant?.id || null, quantity);
    if (success) setQuantity(1);
  };

  const handleBuyNow = async () => {
    const success = await addToCart(product.id, selectedVariant?.id || null, quantity);
    if (success) navigate('/cart');
  };

  const specifications = product.specifications
    ? (typeof product.specifications === 'string' ? JSON.parse(product.specifications) : product.specifications)
    : {};

  const reviews = product.reviews || [];

  const tabs = [
    { key: 'description', label: 'Deskripsi' },
    { key: 'specifications', label: 'Spesifikasi' },
    { key: 'reviews', label: `Ulasan (${reviews.length})` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="bg-gray-50 rounded-xl flex items-center justify-center aspect-square">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">📱</span>
              </div>
              <p className="text-sm text-gray-400">{product.brand_name}</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm font-medium text-blue-600 mb-1">{product.brand_name}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

          <div className="flex items-center space-x-4 mb-4">
            <Rating value={product.rating || 0} size="md" />
            <span className="text-sm text-gray-500">
              {product.sold_count || 0} terjual
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            {discount > 0 ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 line-through">{formatCurrency(price)}</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                  -{discount}%
                </span>
              </div>
            ) : null}
            <p className={`text-3xl font-bold ${discount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(discountedPrice)}
            </p>
          </div>

          {/* Variant Selectors */}
          {uniqueRams.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">RAM</p>
              <div className="flex flex-wrap gap-2">
                {uniqueRams.map(ram => (
                  <button
                    key={ram}
                    onClick={() => setSelectedRam(ram)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      selectedRam === ram
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniqueStorages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Storage</p>
              <div className="flex flex-wrap gap-2">
                {uniqueStorages.map(storage => (
                  <button
                    key={storage}
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      selectedStorage === storage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniqueColors.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Warna</p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      selectedColor === color
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Stok: <span className={`font-semibold ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock > 0 ? `${stock} tersedia` : 'Habis'}
              </span>
            </p>
          </div>

          {/* Quantity */}
          <div className="flex items-center space-x-3 mb-6">
            <p className="text-sm font-medium text-gray-700">Jumlah</p>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 rounded-l-lg"
              >
                <HiMinus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-[48px] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                disabled={quantity >= stock}
                className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40 rounded-r-lg"
              >
                <HiPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className="flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-medium border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
              <span>Tambah ke Keranjang</span>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={stock <= 0}
              className="flex-1 py-3 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Beli Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'description' && (
          <div className="prose max-w-none text-gray-700">
            <p>{product.description || 'Tidak ada deskripsi.'}</p>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <tbody>
                {Object.entries(specifications).length > 0 ? (
                  Object.entries(specifications).map(([key, value], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 w-1/3">{key}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{value}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={2}>
                      Belum ada data spesifikasi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <div key={review.id || idx} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{review.user_name || review.user?.name || 'Pengguna'}</p>
                        <Rating value={review.rating} />
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Belum ada ulasan untuk produk ini.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
