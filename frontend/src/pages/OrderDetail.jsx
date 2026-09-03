import { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { HiCheckCircle, HiOutlineTruck, HiOutlineCreditCard, HiOutlineArrowLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { getOrder } from '../api/orders';
import { formatCurrency, formatDate, formatDateTime, formatOrderStatus, getStatusColor, formatPaymentMethod } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';

const statusSteps = [
  { key: 'pending', label: 'Menunggu Pembayaran' },
  { key: 'processing', label: 'Diproses' },
  { key: 'packed', label: 'Dikemas' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'completed', label: 'Selesai' },
];

function getStepIndex(status) {
  if (status === 'cancelled') return -1;
  return statusSteps.findIndex(s => s.key === status);
}

export default function OrderDetail() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    getOrder(id)
      .then(res => setOrder(res.data.order || res.data))
      .catch(() => toast.error('Gagal memuat detail pesanan.'))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500">Pesanan tidak ditemukan.</p>
        <Link to="/orders" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
          Kembali ke Pesanan Saya
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const items = order.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0);
  const shippingCost = order.shipping_cost || 15000;
  const discount = order.discount || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Link to="/orders" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Detail Pesanan</h1>
          <p className="text-sm text-gray-500">{order.order_number}</p>
        </div>
      </div>

      {/* Order Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Tanggal Pesanan</p>
            <p className="font-medium text-gray-900">{formatDateTime(order.created_at)}</p>
          </div>
          <Badge status={order.status} />
        </div>

        {/* Status Timeline */}
        {order.status !== 'cancelled' ? (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              {statusSteps.map((step, idx) => (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && (
                    <div
                      className={`absolute top-4 right-1/2 w-full h-0.5 ${
                        idx <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      style={{ zIndex: 0 }}
                    />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 ${
                      idx <= currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {idx <= currentStep ? (
                      <HiCheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-medium">{idx + 1}</span>
                    )}
                  </div>
                  <p className={`text-xs mt-2 text-center ${
                    idx <= currentStep ? 'text-green-600 font-medium' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg">
            Pesanan ini telah dibatalkan.
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Daftar Produk</h3>
        <div className="space-y-4">
          {items.map((item, idx) => {
            const imgSrc = item.product_image?.startsWith('/uploads')
              ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${item.product_image}`
              : null;

            return (
              <div key={item.id || idx} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl">📱</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product_name}</p>
                  {(item.ram || item.storage || item.color) && (
                    <p className="text-xs text-gray-500">
                      {[item.ram, item.storage, item.color].filter(Boolean).join(' / ')}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">x{item.quantity}</p>
                </div>
                <p className="font-medium text-gray-900 text-sm flex-shrink-0">
                  {formatCurrency(item.subtotal || item.price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shipping Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <HiOutlineTruck className="w-5 h-5 text-blue-600" />
            <span>Informasi Pengiriman</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Penerima</p>
              <p className="font-medium text-gray-900">{order.recipient_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Telepon</p>
              <p className="font-medium text-gray-900">{order.recipient_phone}</p>
            </div>
            <div>
              <p className="text-gray-500">Alamat</p>
              <p className="font-medium text-gray-900">
                {order.shipping_address}
                {order.district && `, ${order.district}`}
                {order.city && `, ${order.city}`}
                {order.province && `, ${order.province}`}
                {order.postal_code && ` ${order.postal_code}`}
              </p>
            </div>
            {order.courier && (
              <div>
                <p className="text-gray-500">Kurir</p>
                <p className="font-medium text-gray-900 uppercase">{order.courier}</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <HiOutlineCreditCard className="w-5 h-5 text-blue-600" />
            <span>Informasi Pembayaran</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-500">Metode Pembayaran</p>
              <p className="font-medium text-gray-900">{formatPaymentMethod(order.payment_method)}</p>
            </div>
            <div>
              <p className="text-gray-500">Status Pembayaran</p>
              <p className="font-medium text-gray-900">{formatOrderStatus(order.status)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rincian Pembayaran</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal Produk</span>
            <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Ongkos Kirim</span>
            <span className="font-medium text-gray-900">{formatCurrency(shippingCost)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Diskon</span>
              <span className="font-medium text-red-600">-{formatCurrency(discount)}</span>
            </div>
          )}
          <hr className="border-gray-100" />
          <div className="flex justify-between text-base">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-blue-600">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Catatan</h3>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
