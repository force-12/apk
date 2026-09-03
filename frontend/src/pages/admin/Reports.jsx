import { useState } from 'react';
import { HiOutlineDocumentArrowDown, HiOutlinePrinter, HiOutlineTableCells } from 'react-icons/hi2';
import { getSalesReport, exportExcel, exportPDF } from '../../api/admin';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function AdminReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await getSalesReport(params);
      setData(res.data);
    } catch { toast.error('Gagal memuat laporan.'); }
    finally { setLoading(false); }
  };

  const handleExportExcel = async () => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await exportExcel(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'laporan-penjualan.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File Excel berhasil diunduh.');
    } catch { toast.error('Gagal mengunduh Excel.'); }
  };

  const handleExportPDF = async () => {
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const res = await exportPDF(params);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'laporan-penjualan.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('File PDF berhasil diunduh.');
    } catch { toast.error('Gagal mengunduh PDF.'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Laporan Penjualan</h1>

      {/* Filters */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="input-field" />
          </div>
          <button onClick={fetchReport} disabled={loading} className="btn-primary whitespace-nowrap">
            {loading ? 'Memuat...' : 'Tampilkan'}
          </button>
        </div>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Transaksi</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.total_transactions}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(data.summary.total_revenue)}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-sm text-gray-500 mb-1">Rata-rata Pesanan</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.summary.avg_order_value)}</p>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={handleExportExcel} className="btn-success inline-flex items-center space-x-2 text-sm">
              <HiOutlineTableCells className="w-4 h-4" /><span>Export Excel</span>
            </button>
            <button onClick={handleExportPDF} className="btn-danger inline-flex items-center space-x-2 text-sm">
              <HiOutlineDocumentArrowDown className="w-4 h-4" /><span>Export PDF</span>
            </button>
            <button onClick={() => window.print()} className="btn-secondary inline-flex items-center space-x-2 text-sm">
              <HiOutlinePrinter className="w-4 h-4" /><span>Print</span>
            </button>
          </div>

          {/* Top Products */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Produk Terlaris</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">#</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Produk</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Brand</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">Terjual</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topProducts.map((p, i) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{p.name}</td>
                      <td className="px-4 py-2 text-gray-600">{p.brand_name}</td>
                      <td className="px-4 py-2 text-right text-gray-700">{p.total_sold}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(p.total_revenue)}</td>
                    </tr>
                  ))}
                  {data.topProducts.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">Tidak ada data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Brands */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Brand Terlaris</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">#</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-500">Brand</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">Terjual</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-500">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.topBrands.map((b, i) => (
                    <tr key={b.name} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-2 font-medium text-gray-900">{b.name}</td>
                      <td className="px-4 py-2 text-right text-gray-700">{b.total_sold}</td>
                      <td className="px-4 py-2 text-right font-medium text-gray-900">{formatCurrency(b.total_revenue)}</td>
                    </tr>
                  ))}
                  {data.topBrands.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-gray-500">Tidak ada data.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!data && !loading && (
        <div className="card p-12 text-center text-gray-500">
          <p className="text-lg font-medium mb-1">Pilih rentang tanggal</p>
          <p className="text-sm">Klik "Tampilkan" untuk melihat laporan penjualan.</p>
        </div>
      )}
    </div>
  );
}
