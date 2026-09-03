import { Link } from 'react-router-dom';
import { HiOutlineShoppingCart } from 'react-icons/hi2';
import { formatCurrency, getDiscountedPrice } from '../../utils/formatters';
import Rating from '../ui/Rating';
import { useCart } from '../../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discountedPrice = getDiscountedPrice(product.price, product.discount);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, null, 1);
  };

  const imgSrc = product.image?.startsWith('/uploads')
    ? `${import.meta.env.VITE_API_URL?.replace('/api', '')}${product.image}`
    : null;

  return (
    <div className="card group hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col">
      <Link to={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative bg-gray-50 h-48 flex items-center justify-center overflow-hidden">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="text-center p-4">
              <div className="w-20 h-20 bg-gray-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
              <span className="text-xs text-gray-400">{product.brand_name}</span>
            </div>
          )}
          {product.discount > 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col">
          <p className="text-xs text-blue-600 font-medium mb-1">{product.brand_name}</p>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h3>
          <Rating value={product.rating} />

          {/* Price */}
          <div className="mt-3">
            {product.discount > 0 ? (
              <>
                <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(discountedPrice)}</p>
              </>
            ) : (
              <p className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</p>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="px-4 pb-4 flex space-x-2 mt-auto">
        <Link to={`/products/${product.id}`} className="flex-1 text-center py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          Detail
        </Link>
        <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center space-x-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <HiOutlineShoppingCart className="w-4 h-4" />
          <span>Keranjang</span>
        </button>
      </div>
    </div>
  );
}
