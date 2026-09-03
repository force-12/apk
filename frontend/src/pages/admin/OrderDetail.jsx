import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminOrder, updateOrderStatus } from '../../api/admin';
import { formatCurrency, formatDate, formatDateTime, formatOrderStatus, formatPaymentMethod } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const statusSteps = ['pending', 'processing', 'packed', 'shipped', 'completed'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');

  const fetchOrder = () => {
    setLoading(true);
    getAdminOrder(id)
      .then(res => { setOrder(res.data.order); setNewStatus(res.data.order.status); })
      .catch(() => toast.error('Gagal memuat pesanan.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus(id, { status: newStatus });
      toast.success('Status berhasil diperbarui.');
      fetchOrder();
    } catch (err) { toast.error(err.response?.data?.message || 'Gagal mengubah status.'); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}</div>;
  if (!order) return <p className="text-gray-500">Pesanan tidak ditemukan.</p>;

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block">&larr; Kembali</Link>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan {order.order_number}</h1>
        </div>
        <Badge status={order.status} />
      </div>

      {/* Status Update */}
      {order.status !== 'cancelled' && order.status !== 'completed' && (
        <div className="card p-5 flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Ubah Status:</label>
          <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-field max-w-xs text-sm">
            {statusSteps.map(s => <option key={s} value={s}>{formatOrderStatus(s)}</option>)}
            <option value="cancelled">Dibatalkan</option>
          </select>
          <button onClick={handleStatusUpdate} className="btn-primary text-sm" disabled={newStatus === order.status}>Ubah</button>
        </div>
      )}

      {/* Progress */}
      {order.status !== 'cancelled' && (
        <div className="card p-5">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1}
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {statusSteps.map(step => (
              <span key={step} className="text-xs text-gray-500 flex-1 text-center">{formatOrderStatus(step)}</span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Informasi Customer</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Nama</dt><dd className="text-gray-900">{order.customer_name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="text-gray-900">{order.customer_email}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Telepon</dt><dd className="text-gray-900">{order.customer_phone || '-'}</dd></div>
          </dl>
        </div>

        {/* Shipping Info */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Informasi Pengiriman</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Penerima</dt><dd className="text-gray-900">{order.recipient_name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Telepon</dt><dd className="text-gray-900">{order.recipient_phone}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Alamat</dt><dd className="text-gray-900 text-right max-w-[200px]">{order.shipping_address}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Kota</dt><dd className="text-gray-900">{order.city}, {order.province}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Kurir</dt><dd className="text-gray-900">{order.courier}</dd></div>
          </dl>
        </div>
      </div>

      {/* Items */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Item Pesanan</h3>
        <div className="space-y-3">
          {order.items?.map(item => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">📱</div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                  {(item.ram || item.storage || item.color) && (
                    <p className="text-xs text-gray-500">{[item.ram, item.storage, item.color].filter(Boolean).join(' / ')}</p>
                  )}
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-500">{item.quantity}x {formatCurrency(item.price)}</p>
                <p className="font-medium text-gray-900">{formatCurrency(item.subtotal)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Ongkir</span><span>{formatCurrency(order.shipping_cost)}</span></div>
          {order.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Diskon</span><span className="text-red-600">-{formatCurrency(order.discount)}</span></div>}
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>
      </div>

      {/* Payment */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Informasi Pembayaran</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Metode</dt><dd className="text-gray-900">{formatPaymentMethod(order.payment_method)}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd><Badge status={order.payment?.payment_status || 'pending'} text={order.payment?.payment_status === 'paid' ? 'Lunas' : 'Belum Dibayar'} /></dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Tanggal Pesanan</dt><dd className="text-gray-900">{formatDateTime(order.created_at)}</dd></div>
        </dl>
      </div>
    </div>
  );
}
