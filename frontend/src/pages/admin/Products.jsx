import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash, HiMagnifyingGlass } from 'react-icons/hi2';
import { getAdminProducts, deleteProduct } from '../../api/admin';
import { formatCurrency } from '../../utils/formatters';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { TableSkeleton } from '../../components/ui/LoadingSkeleton';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getAdminProducts({ search, page, limit: 10 });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch { toast.error('Gagal memuat produk.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId);
      toast.success('Produk berhasil dihapus.');
      setDeleteId(null);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Produk</h1>
        <Link to="/admin/products/new" className="btn-primary inline-flex items-center space-x-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /><span>Tambah Produk</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" placeholder="Cari produk..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-10" />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <div className="p-6"><TableSkeleton rows={5} cols={7} /></div> : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Produk</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Brand</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Harga</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Stok</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Terjual</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">📱</div>
                        <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.brand_name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(p.price)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.stock}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{p.sold}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Link to={`/admin/products/${p.id}/edit`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <HiOutlinePencilSquare className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-500">Tidak ada produk ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Hapus Produk" message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan." />
    </div>
  );
}
