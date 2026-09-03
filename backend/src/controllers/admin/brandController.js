const db = require('../../config/database');

// Brands
const getBrands = async (req, res, next) => {
  try {
    const [brands] = await db.query(
      `SELECT b.*, COUNT(p.id) as product_count
       FROM brands b LEFT JOIN products p ON b.id = p.brand_id
       GROUP BY b.id ORDER BY b.name`
    );
    res.json({ brands });
  } catch (error) {
    next(error);
  }
};

const createBrand = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama brand wajib diisi.' });

    const [result] = await db.query('INSERT INTO brands (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Brand berhasil ditambahkan.', brand_id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama brand wajib diisi.' });

    await db.query('UPDATE brands SET name = ? WHERE id = ?', [name, id]);
    res.json({ message: 'Brand berhasil diperbarui.' });
  } catch (error) {
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [products] = await db.query('SELECT id FROM products WHERE brand_id = ? LIMIT 1', [id]);
    if (products.length > 0) {
      return res.status(400).json({ message: 'Brand tidak dapat dihapus karena masih memiliki produk.' });
    }

    await db.query('DELETE FROM brands WHERE id = ?', [id]);
    res.json({ message: 'Brand berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBrands, createBrand, updateBrand, deleteBrand };
