import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { HiOutlineChevronRight, HiOutlineShoppingBag } from 'react-icons/hi2';
import { getOrders } from '../api/orders';
import { formatCurrency, formatDate, formatOrderStatus, getStatusColor } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';

const statusTabs = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu Pembayaran' },
  { value: 'processing', label: 'Diproses' },
  { value: 'packed', label: 'Dikemas' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function Orders() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page };
      if (status) params.status = status;
      const res = await getOrders(params);
      setOrders(res.data.orders || []);
      setTotalPages(res.data.totalPages || res.data.total_pages || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [fetchOrders, isAuthenticated]);

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setPage(1);
  };

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pesanan Saya</h1>

      {/* Status Tabs */}
      <div className="flex overflow-x-auto space-x-1 mb-6 pb-2 -mx-1 px-1">
        {statusTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              status === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-xl" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge status={order.status} />
                  <HiOutlineChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Items Preview */}
              {order.items && order.items.length > 0 && (
                <div className="mb-3">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 py-1">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">📱</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-400 mt-1">
                      +{order.items.length - 2} produk lainnya
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">Total Pesanan</span>
                <span className="font-bold text-blue-600">{formatCurrency(order.total)}</span>
              </div>
            </Link>
          ))}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      ) : (
        <EmptyState
          icon={HiOutlineShoppingBag}
          title="Belum ada pesanan"
          description="Anda belum memiliki pesanan. Mulai belanja sekarang!"
          actionLabel="Jelajahi Produk"
          actionTo="/products"
        />
      )}
    </div>
  );
}
