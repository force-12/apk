import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiCheckCircle } from 'react-icons/hi2';
import { getOrder } from '../api/orders';
import { formatCurrency, formatOrderStatus } from '../utils/formatters';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id)
      .then(res => setOrder(res.data.order || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
          <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <HiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil Dibuat!</h1>
        <p className="text-gray-500 mb-6">Terima kasih atas pesanan Anda.</p>

        {order && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nomor Pesanan</span>
              <span className="font-medium text-gray-900">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-blue-600">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-medium text-gray-900">{formatOrderStatus(order.status)}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={order ? `/orders/${order.id}` : '/orders'}
            className="flex-1 py-3 text-sm font-medium border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Lihat Pesanan
          </Link>
          <Link
            to="/products"
            className="flex-1 py-3 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  );
}
