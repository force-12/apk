import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart as apiGetCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeCartItem as apiRemoveCartItem, clearCart as apiClearCart } from '../api/cart';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setItems([]); return; }
    try {
      setLoading(true);
      const res = await apiGetCart();
      setItems(res.data.items || []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (product_id, variant_id, quantity = 1) => {
    if (!isAuthenticated) { toast.error('Silakan login terlebih dahulu.'); return false; }
    try {
      await apiAddToCart({ product_id, variant_id, quantity });
      await fetchCart();
      toast.success('Produk ditambahkan ke keranjang!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan ke keranjang.');
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await apiUpdateCartItem(itemId, { quantity });
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui quantity.');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiRemoveCartItem(itemId);
      await fetchCart();
      toast.success('Produk dihapus dari keranjang.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus item.');
    }
  };

  const clearCartItems = async () => {
    try {
      await apiClearCart();
      setItems([]);
    } catch {}
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, updateQuantity, removeItem, clearCart: clearCartItems, fetchCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
