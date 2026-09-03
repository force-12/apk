import { useState, useEffect } from 'react';
import { HiOutlineFunnel, HiXMark } from 'react-icons/hi2';
import { getBrands } from '../../api/products';

const ramOptions = ['4GB', '6GB', '8GB', '12GB', '16GB'];
const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];

function FilterContent({ brands, filters, onFilterChange, onReset }) {
  return (
    <div className="space-y-6">
      {/* Brand */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Brand</h4>
        <div className="space-y-2">
          {brands.map(brand => (
            <label key={brand.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(filters.brand_id || '').split(',').includes(String(brand.id))}
                onChange={(e) => {
                  const current = filters.brand_id ? filters.brand_id.split(',').filter(Boolean) : [];
                  const updated = e.target.checked
                    ? [...current, String(brand.id)]
                    : current.filter(id => id !== String(brand.id));
                  onFilterChange({ brand_id: updated.join(',') || undefined });
                }}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Harga</h4>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Minimum"
            value={filters.min_price || ''}
            onChange={(e) => onFilterChange({ min_price: e.target.value || undefined })}
            className="input-field text-sm"
          />
          <input
            type="number"
            placeholder="Maximum"
            value={filters.max_price || ''}
            onChange={(e) => onFilterChange({ max_price: e.target.value || undefined })}
            className="input-field text-sm"
          />
        </div>
      </div>

      {/* RAM */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">RAM</h4>
        <div className="flex flex-wrap gap-2">
          {ramOptions.map(ram => (
            <button
              key={ram}
              onClick={() => onFilterChange({ ram: filters.ram === ram ? undefined : ram })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filters.ram === ram
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {ram}
            </button>
          ))}
        </div>
      </div>

      {/* Storage */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Storage</h4>
        <div className="flex flex-wrap gap-2">
          {storageOptions.map(storage => (
            <button
              key={storage}
              onClick={() => onFilterChange({ storage: filters.storage === storage ? undefined : storage })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filters.storage === storage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              }`}
            >
              {storage}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button onClick={onReset} className="w-full py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
        Reset Filter
      </button>
    </div>
  );
}

export default function ProductFilter({ filters, onFilterChange, onReset }) {
  const [brands, setBrands] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    getBrands().then(res => setBrands(res.data.brands)).catch(() => {});
  }, []);

  return (
    <>
      {/* Mobile Filter Button */}
      <button onClick={() => setMobileOpen(true)} className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
        <HiOutlineFunnel className="w-4 h-4" />
        <span>Filter</span>
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="card p-5 sticky top-20">
          <h3 className="font-semibold text-gray-900 mb-4">Filter Produk</h3>
          <FilterContent brands={brands} filters={filters} onFilterChange={onFilterChange} onReset={onReset} />
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Filter Produk</h3>
              <button onClick={() => setMobileOpen(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4"><FilterContent brands={brands} filters={filters} onFilterChange={onFilterChange} onReset={onReset} /></div>
          </div>
        </div>
      )}
    </>
  );
}
