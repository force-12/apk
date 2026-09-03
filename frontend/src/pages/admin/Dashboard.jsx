import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCube, HiOutlineClipboardDocumentList, HiOutlineUsers, HiOutlineBanknotes, HiOutlineCalendarDays } from 'react-icons/hi2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { getDashboard } from '../../api/admin';
import { formatCurrency, formatDate, formatOrderStatus, getStatusColor } from '../../utils/formatters';
import Badge from '../../components/ui/Badge';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 rounded-xl" />
          <div className="h-72 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-gray-500">Gagal memuat dashboard.</p>;

  const statCards = [
    { label: 'Total Produk', value: data.stats.totalProducts, icon: HiOutlineCube, color: 'bg-blue-500' },
    { label: 'Total Pesanan', value: data.stats.totalOrders, icon: HiOutlineClipboardDocumentList, color: 'bg-green-500' },
    { label: 'Total Customer', value: data.stats.totalCustomers, icon: HiOutlineUsers, color: 'bg-purple-500' },
    { label: 'Total Pendapatan', value: formatCurrency(data.stats.totalRevenue), icon: HiOutlineBanknotes, color: 'bg-amber-500' },
  ];

  const revenueChart = {
    labels: data.monthlyRevenue.map(m => m.label),
    datasets: [{
      label: 'Pendapatan',
      data: data.monthlyRevenue.map(m => m.revenue),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const statusColors = {
    pending: '#fbbf24', processing: '#3b82f6', packed: '#6366f1',
    shipped: '#a855f7', completed: '#22c55e', cancelled: '#ef4444'
  };
  const statusChart = {
    labels: data.ordersByStatus.map(s => formatOrderStatus(s.status)),
    datasets: [{
      data: data.ordersByStatus.map(s => s.count),
      backgroundColor: data.ordersByStatus.map(s => statusColors[s.status] || '#9ca3af'),
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <HiOutlineCalendarDays className="w-4 h-4" />
          <span>Pesanan hari ini: <strong className="text-gray-900">{data.stats.todayOrders}</strong></span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center space-x-4">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Pendapatan Bulanan</h3>
          <Line data={revenueChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Status Pesanan</h3>
          <div className="max-w-xs mx-auto">
            <Doughnut data={statusChart} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left py-2 font-medium text-gray-500">Produk</th>
                <th className="text-right py-2 font-medium text-gray-500">Terjual</th>
                <th className="text-right py-2 font-medium text-gray-500">Harga</th>
              </tr></thead>
              <tbody>
                {data.topProducts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50">
                    <td className="py-2.5">
                      <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.brand_name}</p>
                    </td>
                    <td className="text-right text-gray-700">{p.sold}</td>
                    <td className="text-right text-gray-700">{formatCurrency(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Pesanan Terbaru</h3>
            <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">Lihat Semua</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left py-2 font-medium text-gray-500">No. Pesanan</th>
                <th className="text-left py-2 font-medium text-gray-500">Customer</th>
                <th className="text-right py-2 font-medium text-gray-500">Total</th>
                <th className="text-right py-2 font-medium text-gray-500">Status</th>
              </tr></thead>
              <tbody>
                {data.recentOrders.slice(0, 5).map(o => (
                  <tr key={o.id} className="border-b border-gray-50">
                    <td className="py-2.5 font-medium text-gray-900">{o.order_number}</td>
                    <td className="text-gray-700">{o.customer_name}</td>
                    <td className="text-right text-gray-700">{formatCurrency(o.total)}</td>
                    <td className="text-right"><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
