import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '../../api/admin';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [name, setName] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    getAdminCategories()
      .then(res => setCategories(res.data.categories))
      .catch(() => toast.error('Gagal memuat kategori.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setEditCat(null); setName(''); setModalOpen(true); };
  const openEdit = (cat) => { setEditCat(cat); setName(cat.name); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Nama kategori wajib diisi.'); return; }
    setSaving(true);
    try {
      if (editCat) {
        await updateCategory(editCat.id, { name });
        toast.success('Kategori berhasil diperbarui.');
      } else {
        await createCategory({ name });
        toast.success('Kategori berhasil ditambahkan.');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteId);
      toast.success('Kategori berhasil dihapus.');
      setDeleteId(null);
      fetchCategories();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal menghapus.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
        <button onClick={openAdd} className="btn-primary inline-flex items-center space-x-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /><span>Tambah Kategori</span>
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 w-16">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Nama Kategori</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Jumlah Produk</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500 w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-500">Memuat...</td></tr>
              ) : categories.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{c.product_count || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><HiOutlinePencilSquare className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && categories.length === 0 && (
                <tr><td colSpan={4} className="text-center py-12 text-gray-500">Belum ada kategori.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit Kategori' : 'Tambah Kategori'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" autoFocus />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Hapus Kategori" message="Kategori yang memiliki produk tidak dapat dihapus." />
    </div>
  );
}
