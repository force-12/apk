export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatOrderStatus = (status) => {
  const map = {
    pending: 'Menunggu Pembayaran', processing: 'Diproses', packed: 'Dikemas',
    shipped: 'Dikirim', completed: 'Selesai', cancelled: 'Dibatalkan'
  };
  return map[status] || status;
};

export const getStatusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800',
    packed: 'bg-indigo-100 text-indigo-800', shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800'
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const formatPaymentMethod = (method) => {
  const map = { transfer_bank: 'Transfer Bank', e_wallet: 'E-Wallet', cod: 'COD' };
  return map[method] || method;
};

export const getDiscountedPrice = (price, discount) => {
  if (!discount) return price;
  return price - (price * discount / 100);
};
