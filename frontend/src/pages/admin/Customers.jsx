import { useState, useEffect } from 'react';
import { HiMagnifyingGlass, HiOutlineEye } from 'react-icons/hi2';
import { getCustomers, getCustomer, toggleCustomerStatus } from '../../api/admin';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Pagination from '../../components/ui/Pagination';
import Modal from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers({ search, page, limit: 10 });
      setCustomers(res.data.customers);
      setPagination(res.data.pagination);
    } catch { toast.error('Gagal memuat pelanggan.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [page, search]);

  const handleToggle = async (id) => {
    try {
      const res = await toggleCustomerStatus(id);
      toast.success(res.data.message);
      fetchCustomers();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal mengubah status.'); }
  };

  const viewDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await getCustomer(id);
      setDetail(res.data.customer);
    } catch { toast.error('Gagal memuat detail.'); }
    finally { setDetailLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manajemen Pelanggan</h1>

      <div className="relative max-w-md">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Cari pelanggan..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <div className="p-6"><TableSkeleton rows={5} cols={6} /></div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Nama</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Telepon</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Pesanan</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Total Belanja</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phone || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{c.order_count}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(c.total_spent)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggle(c.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.is_active ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => viewDetail(c.id)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <HiOutlineEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-500">Tidak ada pelanggan ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Detail Pelanggan" size="md">
        {detail && (
          <div className="space-y-4 text-sm">
            <dl className="space-y-2">
              <div className="flex justify-between"><dt className="text-gray-500">Nama</dt><dd className="font-medium">{detail.name}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd>{detail.email}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Telepon</dt><dd>{detail.phone || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Alamat</dt><dd className="text-right max-w-[200px]">{detail.address || '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Kota</dt><dd>{detail.city ? `${detail.city}, ${detail.province}` : '-'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Bergabung</dt><dd>{formatDate(detail.created_at)}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Total Pesanan</dt><dd className="font-medium">{detail.total_orders}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Total Belanja</dt><dd className="font-medium text-blue-600">{formatCurrency(detail.total_spent)}</dd></div>
            </dl>
            {detail.recent_orders?.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="font-medium text-gray-900 mb-2">Pesanan Terakhir</h4>
                {detail.recent_orders.map(o => (
                  <div key={o.id} className="flex justify-between py-1.5 text-xs">
                    <span className="text-gray-600">{o.order_number}</span>
                    <span className="font-medium">{formatCurrency(o.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
