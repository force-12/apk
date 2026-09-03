import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { getProducts } from '../api/products';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilter from '../components/product/ProductFilter';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { ProductCardSkeleton } from '../components/ui/LoadingSkeleton';

const sortOptions = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Termurah' },
  { value: 'price_desc', label: 'Termahal' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'best_seller', label: 'Terlaris' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const filters = {
    search: searchParams.get('search') || '',
    brand_id: searchParams.get('brand_id') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    ram: searchParams.get('ram') || '',
    storage: searchParams.get('storage') || '',
    sort: searchParams.get('sort') || 'latest',
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  const updateParams = useCallback((updates) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '' || value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      if (!('page' in updates)) {
        params.set('page', '1');
      }
      return params;
    });
  }, [setSearchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.brand_id) params.brand_id = filters.brand_id;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.ram) params.ram = filters.ram;
      if (filters.storage) params.storage = filters.storage;
      if (filters.sort) params.sort = filters.sort;
      params.page = filters.page;

      const res = await getProducts(params);
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || res.data.total_pages || 1);
      setTotalProducts(res.data.total || res.data.totalProducts || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.brand_id, filters.min_price, filters.max_price, filters.ram, filters.storage, filters.sort, filters.page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (updates) => {
    updateParams(updates);
  };

  const handleReset = () => {
    setSearchParams({});
  };

  const handleSortChange = (e) => {
    updateParams({ sort: e.target.value });
  };

  const handlePageChange = (page) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search: searchInput || undefined });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative max-w-xl">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari smartphone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </form>

      <div className="flex gap-8">
        {/* Sidebar Filter */}
        <ProductFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {loading ? 'Memuat...' : `Menampilkan ${totalProducts} produk`}
            </p>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <ProductGrid products={products} />
              <Pagination
                page={filters.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <EmptyState
              title="Produk tidak ditemukan"
              description="Coba ubah filter atau kata kunci pencarian Anda."
            />
          )}
        </div>
      </div>
    </div>
  );
}
