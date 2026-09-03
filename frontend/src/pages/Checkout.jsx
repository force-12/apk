import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { HiOutlineTruck, HiOutlineBanknotes, HiOutlineDevicePhoneMobile, HiOutlineCurrencyDollar } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { createOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

const SHIPPING_COST = 15000;

const couriers = [
  { id: 'jne', name: 'JNE', desc: 'JNE Regular (2-3 hari)' },
  { id: 'jnt', name: 'J&T', desc: 'J&T Express (2-3 hari)' },
  { id: 'sicepat', name: 'SiCepat', desc: 'SiCepat REG (1-2 hari)' },
];

const paymentMethods = [
  { id: 'transfer_bank', name: 'Transfer Bank', icon: HiOutlineBanknotes, desc: 'BCA, BNI, BRI, Mandiri' },
  { id: 'e_wallet', name: 'E-Wallet', icon: HiOutlineDevicePhoneMobile, desc: 'GoPay, OVO, DANA, ShopeePay' },
  { id: 'cod', name: 'COD', icon: HiOutlineCurrencyDollar, desc: 'Bayar di Tempat' },
];

function InputField({ label, name, type = 'text', placeholder, colSpan, value, onChange, error }) {
  return (
    <div className={colSpan || ''}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items, cartTotal, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    recipient_name: '',
    recipient_phone: '',
    shipping_address: '',
    province: '',
    city: '',
    district: '',
    postal_code: '',
    courier: 'jne',
    payment_method: 'transfer_bank',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.recipient_name.trim()) errs.recipient_name = 'Nama penerima wajib diisi.';
    if (!form.recipient_phone.trim()) errs.recipient_phone = 'Nomor telepon wajib diisi.';
    if (!form.shipping_address.trim()) errs.shipping_address = 'Alamat wajib diisi.';
    if (!form.province.trim()) errs.province = 'Provinsi wajib diisi.';
    if (!form.city.trim()) errs.city = 'Kota wajib diisi.';
    if (!form.district.trim()) errs.district = 'Kecamatan wajib diisi.';
    if (!form.postal_code.trim()) errs.postal_code = 'Kode pos wajib diisi.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const orderData = {
        recipient_name: form.recipient_name,
        recipient_phone: form.recipient_phone,
        shipping_address: form.shipping_address,
        province: form.province,
        city: form.city,
        district: form.district,
        postal_code: form.postal_code,
        courier: form.courier,
        payment_method: form.payment_method,
        notes: form.notes,
        shipping_cost: SHIPPING_COST,
      };

      const res = await createOrder(orderData);
      const orderId = res.data.order?.id || res.data.id;
      await clearCart();
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!items || items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-500 mb-4">Keranjang Anda kosong.</p>
        <button onClick={() => navigate('/products')} className="btn-primary text-sm">
          Jelajahi Produk
        </button>
      </div>
    );
  }

  const total = cartTotal + SHIPPING_COST;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <HiOutlineTruck className="w-5 h-5 text-blue-600" />
                <span>Informasi Pengiriman</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Nama Penerima" name="recipient_name" value={form.recipient_name} onChange={handleChange} error={errors.recipient_name} placeholder="Nama lengkap penerima" />
                <InputField label="Nomor Telepon" name="recipient_phone" value={form.recipient_phone} onChange={handleChange} error={errors.recipient_phone} placeholder="08xxxxxxxxxx" />
                <div className="sm:col-span-2">
                  <InputField label="Alamat Lengkap" name="shipping_address" value={form.shipping_address} onChange={handleChange} error={errors.shipping_address} placeholder="Jalan, nomor rumah, RT/RW" />
                </div>
                <InputField label="Provinsi" name="province" value={form.province} onChange={handleChange} error={errors.province} placeholder="Provinsi" />
                <InputField label="Kota/Kabupaten" name="city" value={form.city} onChange={handleChange} error={errors.city} placeholder="Kota/Kabupaten" />
                <InputField label="Kecamatan" name="district" value={form.district} onChange={handleChange} error={errors.district} placeholder="Kecamatan" />
                <InputField label="Kode Pos" name="postal_code" value={form.postal_code} onChange={handleChange} error={errors.postal_code} placeholder="Kode Pos" />
              </div>
            </div>

            {/* Courier */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Kurir Pengiriman</h3>
              <div className="space-y-3">
                {couriers.map(courier => (
                  <label
                    key={courier.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      form.courier === courier.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="courier"
                      value={courier.id}
                      checked={form.courier === courier.id}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{courier.name}</p>
                      <p className="text-xs text-gray-500">{courier.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Metode Pembayaran</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {paymentMethods.map(method => (
                  <label
                    key={method.id}
                    className={`flex flex-col items-center p-4 rounded-lg border cursor-pointer transition-colors text-center ${
                      form.payment_method === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={form.payment_method === method.id}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <method.icon className={`w-8 h-8 mb-2 ${form.payment_method === method.id ? 'text-blue-600' : 'text-gray-400'}`} />
                    <p className="text-sm font-medium text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-500">{method.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Catatan</h3>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Catatan untuk penjual (opsional)"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-lg">📱</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product_name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 flex-shrink-0">{formatCurrency(item.subtotal)}</p>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100 my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ongkos Kirim</span>
                  <span className="font-medium">{formatCurrency(SHIPPING_COST)}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-6 py-3 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
