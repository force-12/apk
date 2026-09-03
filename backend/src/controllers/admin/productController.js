const db = require('../../config/database');

const getProducts = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT p.*, b.name as brand_name, c.name as category_name
                 FROM products p
                 LEFT JOIN brands b ON p.brand_id = b.id
                 LEFT JOIN categories c ON p.category_id = c.id`;
    let countQuery = 'SELECT COUNT(*) as total FROM products p';
    const params = [];
    const countParams = [];

    if (search) {
      query += ' WHERE p.name LIKE ?';
      countQuery += ' WHERE p.name LIKE ?';
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [products] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { name, brand_id, category_id, description, price, discount, stock, warranty,
            specifications, is_featured, variants } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await connection.query(
      `INSERT INTO products (name, brand_id, category_id, description, price, discount, stock, warranty,
       image, specifications, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, brand_id, category_id || null, description || '', parseFloat(price), parseInt(discount) || 0,
       parseInt(stock) || 0, warranty || '', image, specifications ? JSON.stringify(JSON.parse(specifications)) : '{}',
       is_featured === 'true' || is_featured === true ? 1 : 0]
    );

    const productId = result.insertId;

    // Add variants
    if (variants) {
      const variantList = typeof variants === 'string' ? JSON.parse(variants) : variants;
      for (const variant of variantList) {
        await connection.query(
          'INSERT INTO product_variants (product_id, ram, storage, color, price, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [productId, variant.ram, variant.storage, variant.color, parseFloat(variant.price), parseInt(variant.stock) || 0]
        );
      }
    }

    await connection.commit();

    res.status(201).json({ message: 'Produk berhasil ditambahkan.', product_id: productId });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, brand_id, category_id, description, price, discount, stock, warranty,
            specifications, is_featured } = req.body;

    let updateQuery = `UPDATE products SET name = ?, brand_id = ?, category_id = ?, description = ?,
      price = ?, discount = ?, stock = ?, warranty = ?, specifications = ?, is_featured = ?`;
    const params = [name, brand_id, category_id || null, description || '', parseFloat(price),
      parseInt(discount) || 0, parseInt(stock) || 0, warranty || '',
      specifications ? (typeof specifications === 'string' ? specifications : JSON.stringify(specifications)) : '{}',
      is_featured === 'true' || is_featured === true ? 1 : 0];

    if (req.file) {
      updateQuery += ', image = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    updateQuery += ' WHERE id = ?';
    params.push(id);

    await db.query(updateQuery, params);

    res.json({ message: 'Produk berhasil diperbarui.' });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if product has orders
    const [orderItems] = await db.query('SELECT id FROM order_items WHERE product_id = ? LIMIT 1', [id]);
    if (orderItems.length > 0) {
      // Soft delete
      await db.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
      return res.json({ message: 'Produk berhasil dinonaktifkan (memiliki riwayat pesanan).' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

const addVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ram, storage, color, price, stock } = req.body;

    const [result] = await db.query(
      'INSERT INTO product_variants (product_id, ram, storage, color, price, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [id, ram, storage, color, parseFloat(price), parseInt(stock) || 0]
    );

    res.status(201).json({ message: 'Varian berhasil ditambahkan.', variant_id: result.insertId });
  } catch (error) {
    next(error);
  }
};

const updateVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ram, storage, color, price, stock } = req.body;

    await db.query(
      'UPDATE product_variants SET ram = ?, storage = ?, color = ?, price = ?, stock = ? WHERE id = ?',
      [ram, storage, color, parseFloat(price), parseInt(stock) || 0, id]
    );

    res.json({ message: 'Varian berhasil diperbarui.' });
  } catch (error) {
    next(error);
  }
};

const deleteVariant = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM product_variants WHERE id = ?', [id]);
    res.json({ message: 'Varian berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, addVariant, updateVariant, deleteVariant };
