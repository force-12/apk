import api from './axios';

export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const getFeaturedProducts = () => api.get('/products/featured');
export const getLatestProducts = () => api.get('/products/latest');
export const getBrands = () => api.get('/products/brands');
export const getCategories = () => api.get('/products/categories');
