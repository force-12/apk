import { Link } from 'react-router-dom';
import { HiMinus, HiPlus, HiOutlineTrash, HiOutlineShoppingBag } from 'react-icons/hi2';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import EmptyState from '../components/ui/EmptyState';

const SHIPPING_COST = 15000;

export default function Cart() {
  const { items, loading, updateQuantity, removeItem, cartTotal } = useCart();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Belanja</h1>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Belanja</h1>
        <EmptyState
          icon={HiOutlineShoppingBag}
          title="Keranjang kosong"
          description="Anda belum menambahkan produk ke keranjang."
          actionLabel="Jelajahi Produk"
          actionTo="/products"
        />
      </div>
    );
  }

  const total = cartTotal + SHIPPING_COST;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const imgSrc = item.product_image?.startsWith('/uploads')
              ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${item.product_image}`
              : null;

            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">📱</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium">{item.brand_name}</p>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{item.product_name}</h3>
                      {(item.ram || item.storage || item.color) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[item.ram, item.storage, item.color].filter(Boolean).join(' / ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 rounded-l-lg"
                      >
                        <HiMinus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                      >
                        <HiPlus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-400">{formatCurrency(item.price)} x {item.quantity}</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-20">
            <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} produk)</span>
                <span className="font-medium text-gray-900">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="font-medium text-gray-900">{formatCurrency(SHIPPING_COST)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-blue-600">{formatCurrency(total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full mt-6 py-3 text-center text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
