import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAdminProducts, createProduct, updateProduct } from '../../api/admin';
import { getBrands, getCategories, getProduct } from '../../api/products';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePhoto } from 'react-icons/hi2';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    name: '', brand_id: '', category_id: '', description: '', price: '', discount: '0',
    stock: '0', warranty: '1 Tahun Garansi Resmi', is_featured: false,
    specs: { display: '', processor: '', ram: '', storage: '', camera: '', battery: '', os: '', connectivity: '', dimensions: '', weight: '' }
  });
  const [variants, setVariants] = useState([{ ram: '', storage: '', color: '', price: '', stock: '0' }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([getBrands(), getCategories()])
      .then(([bRes, cRes]) => { setBrands(bRes.data.brands); setCategories(cRes.data.categories); })
      .catch(() => {});

    if (isEdit) {
      setLoading(true);
      getProduct(id).then(res => {
        const p = res.data.product;
        let specs = p.specifications || {};
        if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch { specs = {}; } }
        setForm({
          name: p.name, brand_id: String(p.brand_id), category_id: String(p.category_id || ''),
          description: p.description || '', price: String(p.price), discount: String(p.discount || 0),
          stock: String(p.stock || 0), warranty: p.warranty || '', is_featured: !!p.is_featured,
          specs: { display: specs.display || '', processor: specs.processor || '', ram: specs.ram || '',
            storage: specs.storage || '', camera: specs.camera || '', battery: specs.battery || '',
            os: specs.os || '', connectivity: specs.connectivity || '', dimensions: specs.dimensions || '', weight: specs.weight || '' }
        });
        if (p.variants?.length) setVariants(p.variants.map(v => ({ id: v.id, ram: v.ram || '', storage: v.storage || '', color: v.color || '', price: String(v.price), stock: String(v.stock || 0) })));
        if (p.image) setImagePreview(p.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${p.image}` : p.image);
      }).catch(() => toast.error('Gagal memuat produk.'))
      .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const handleSpecChange = (field, value) => setForm(prev => ({ ...prev, specs: { ...prev.specs, [field]: value } }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const addVariant = () => setVariants([...variants, { ram: '', storage: '', color: '', price: form.price, stock: '0' }]);
  const removeVariant = (index) => { if (variants.length > 1) setVariants(variants.filter((_, i) => i !== index)); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Nama produk wajib diisi.';
    if (!form.brand_id) e.brand_id = 'Brand wajib dipilih.';
    if (!form.price || parseFloat(form.price) <= 0) e.price = 'Harga harus lebih dari 0.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('brand_id', form.brand_id);
      if (form.category_id) formData.append('category_id', form.category_id);
      formData.append('description', form.description);
      formData.append('price', form.price);
      formData.append('discount', form.discount);
      formData.append('stock', form.stock);
      formData.append('warranty', form.warranty);
      formData.append('is_featured', form.is_featured);
      formData.append('specifications', JSON.stringify(form.specs));
      formData.append('variants', JSON.stringify(variants.filter(v => v.ram || v.storage)));
      if (imageFile) formData.append('image', imageFile);

      if (isEdit) {
        await updateProduct(id, formData);
        toast.success('Produk berhasil diperbarui.');
      } else {
        await createProduct(formData);
        toast.success('Produk berhasil ditambahkan.');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-200 rounded-lg" />)}</div>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Informasi Dasar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
              <input type="text" value={form.name} onChange={e => handleChange('name', e.target.value)} className={`input-field ${errors.name ? 'border-red-500' : ''}`} />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
              <select value={form.brand_id} onChange={e => handleChange('brand_id', e.target.value)} className={`input-field ${errors.brand_id ? 'border-red-500' : ''}`}>
                <option value="">Pilih Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              {errors.brand_id && <p className="text-red-500 text-xs mt-1">{errors.brand_id}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select value={form.category_id} onChange={e => handleChange('category_id', e.target.value)} className="input-field">
                <option value="">Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
              <input type="number" value={form.price} onChange={e => handleChange('price', e.target.value)} className={`input-field ${errors.price ? 'border-red-500' : ''}`} />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diskon (%)</label>
              <input type="number" min="0" max="100" value={form.discount} onChange={e => handleChange('discount', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
              <input type="number" min="0" value={form.stock} onChange={e => handleChange('stock', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Garansi</label>
              <input type="text" value={form.warranty} onChange={e => handleChange('warranty', e.target.value)} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea rows={4} value={form.description} onChange={e => handleChange('description', e.target.value)} className="input-field" />
            </div>
            <div className="md:col-span-2 flex items-center space-x-2">
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => handleChange('is_featured', e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
              <label htmlFor="featured" className="text-sm text-gray-700">Produk Unggulan</label>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Foto Produk</h3>
          <div className="flex items-center space-x-4">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border" />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <HiOutlinePhoto className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <label className="btn-secondary cursor-pointer text-sm">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              Pilih Foto
            </label>
          </div>
        </div>

        {/* Specifications */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Spesifikasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({ display: 'Display', processor: 'Processor', ram: 'RAM', storage: 'Storage', camera: 'Kamera', battery: 'Baterai', os: 'Sistem Operasi', connectivity: 'Konektivitas', dimensions: 'Dimensi', weight: 'Berat' }).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type="text" value={form.specs[key]} onChange={e => handleSpecChange(key, e.target.value)} className="input-field" />
              </div>
            ))}
          </div>
        </div>

        {/* Variants */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Varian Produk</h3>
            <button type="button" onClick={addVariant} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
              <HiOutlinePlus className="w-4 h-4" /><span>Tambah Varian</span>
            </button>
          </div>
          {variants.map((variant, index) => (
            <div key={index} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end p-3 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">RAM</label>
                <input type="text" placeholder="8GB" value={variant.ram} onChange={e => handleVariantChange(index, 'ram', e.target.value)} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Storage</label>
                <input type="text" placeholder="256GB" value={variant.storage} onChange={e => handleVariantChange(index, 'storage', e.target.value)} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Warna</label>
                <input type="text" placeholder="Black" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Harga</label>
                <input type="number" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stok</label>
                <input type="number" min="0" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} className="input-field text-sm" />
              </div>
              <div>
                <button type="button" onClick={() => removeVariant(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" disabled={variants.length <= 1}>
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex items-center space-x-4">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : isEdit ? 'Perbarui Produk' : 'Simpan Produk'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">Batal</button>
        </div>
      </form>
    </div>
  );
}
