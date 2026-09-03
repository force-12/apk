import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import { getAdminBrands, createBrand, updateBrand, deleteBrand } from '../../api/admin';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [name, setName] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchBrands = () => {
    setLoading(true);
    getAdminBrands()
      .then(res => setBrands(res.data.brands))
      .catch(() => toast.error('Gagal memuat brand.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBrands(); }, []);

  const openAdd = () => { setEditBrand(null); setName(''); setModalOpen(true); };
  const openEdit = (brand) => { setEditBrand(brand); setName(brand.name); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Nama brand wajib diisi.'); return; }
    setSaving(true);
    try {
      if (editBrand) {
        await updateBrand(editBrand.id, { name });
        toast.success('Brand berhasil diperbarui.');
      } else {
        await createBrand({ name });
        toast.success('Brand berhasil ditambahkan.');
      }
      setModalOpen(false);
      fetchBrands();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteBrand(deleteId);
      toast.success('Brand berhasil dihapus.');
      setDeleteId(null);
      fetchBrands();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Brand</h1>
        <button onClick={openAdd} className="btn-primary inline-flex items-center space-x-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /><span>Tambah Brand</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-16">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nama Brand</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Jumlah Produk</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-500">Memuat...</td></tr>
              ) : brands.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{b.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{b.product_count || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => openEdit(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(b.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && brands.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-gray-500">Belum ada brand.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editBrand ? 'Edit Brand' : 'Tambah Brand'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Brand</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" autoFocus />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Hapus Brand" message="Brand yang memiliki produk tidak dapat dihapus." />
    </div>
  );
}
