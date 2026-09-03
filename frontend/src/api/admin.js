import api from './axios';

// Dashboard
export const getDashboard = () => api.get('/admin/dashboard');

// Products
export const getAdminProducts = (params) => api.get('/admin/products', { params });
export const createProduct = (data) => api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (id, data) => api.put(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const addVariant = (productId, data) => api.post(`/admin/products/${productId}/variants`, data);
export const updateVariant = (id, data) => api.put(`/admin/products/variants/${id}`, data);
export const deleteVariant = (id) => api.delete(`/admin/products/variants/${id}`);

// Orders
export const getAdminOrders = (params) => api.get('/admin/orders', { params });
export const getAdminOrder = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, data) => api.put(`/admin/orders/${id}/status`, data);

// Customers
export const getCustomers = (params) => api.get('/admin/customers', { params });
export const getCustomer = (id) => api.get(`/admin/customers/${id}`);
export const toggleCustomerStatus = (id) => api.put(`/admin/customers/${id}/toggle`);

// Brands
export const getAdminBrands = () => api.get('/admin/brands');
export const createBrand = (data) => api.post('/admin/brands', data);
export const updateBrand = (id, data) => api.put(`/admin/brands/${id}`, data);
export const deleteBrand = (id) => api.delete(`/admin/brands/${id}`);

// Categories
export const getAdminCategories = () => api.get('/admin/categories');
export const createCategory = (data) => api.post('/admin/categories', data);
export const updateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// Reports
export const getSalesReport = (params) => api.get('/admin/reports/sales', { params });
export const exportExcel = (params) => api.get('/admin/reports/export/excel', { params, responseType: 'blob' });
export const exportPDF = (params) => api.get('/admin/reports/export/pdf', { params, responseType: 'blob' });
