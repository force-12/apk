import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiMagnifyingGlass, HiOutlineEye } from 'react-icons/hi2';
import { getAdminOrders, updateOrderStatus } from '../../api/admin';
import { formatCurrency, formatDate, formatOrderStatus, formatPaymentMethod } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import Pagination from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

const statusTabs = [
  { value: '', label: 'Semua' },
  { value: 'pending', label: 'Menunggu Pembayaran' },
  { value: 'processing', label: 'Diproses' },
  { value: 'packed', label: 'Dikemas' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (status) params.status = status;
      if (search) params.search = search;
      const res = await getAdminOrders(params);
      setOrders(res.data.orders);
      setPagination(res.data.pagination);
    } catch { toast.error('Gagal memuat pesanan.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, status, search]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success('Status pesanan berhasil diperbarui.');
      fetchOrders();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal mengubah status.'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Pesanan</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map(tab => (
          <button key={tab.value} onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === tab.value ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Cari pesanan atau customer..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <div className="p-6"><TableSkeleton rows={5} cols={6} /></div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">No. Pesanan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Tanggal</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Pembayaran</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{o.order_number}</td>
                    <td className="px-4 py-3 text-gray-700">{o.customer_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(o.total)}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-600">{formatPaymentMethod(o.payment_method)}</td>
                    <td className="px-4 py-3 text-center">
                      <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500">
                        {statusTabs.filter(s => s.value).map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link to={`/admin/orders/${o.id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg inline-flex">
                        <HiOutlineEye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-500">Tidak ada pesanan ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
    </div>
  );
}
