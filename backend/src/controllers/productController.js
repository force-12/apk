const db = require('../config/database');

const getProducts = async (req, res, next) => {
  try {
    const {
      search, brand_id, category_id, min_price, max_price,
      ram, storage, sort, page = 1, limit = 12
    } = req.query;

    let query = `
      SELECT p.*, b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    let countQuery = `SELECT COUNT(*) as total FROM products p WHERE p.is_active = 1`;
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (p.name LIKE ? OR b.name LIKE ?)';
      countQuery += ' AND (p.name LIKE ? OR EXISTS (SELECT 1 FROM brands b2 WHERE b2.id = p.brand_id AND b2.name LIKE ?))';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (brand_id) {
      const brandIds = brand_id.split(',');
      query += ` AND p.brand_id IN (${brandIds.map(() => '?').join(',')})`;
      countQuery += ` AND p.brand_id IN (${brandIds.map(() => '?').join(',')})`;
      params.push(...brandIds);
      countParams.push(...brandIds);
    }

    if (category_id) {
      query += ' AND p.category_id = ?';
      countQuery += ' AND p.category_id = ?';
      params.push(category_id);
      countParams.push(category_id);
    }

    if (min_price) {
      query += ' AND p.price >= ?';
      countQuery += ' AND p.price >= ?';
      params.push(min_price);
      countParams.push(min_price);
    }

    if (max_price) {
      query += ' AND p.price <= ?';
      countQuery += ' AND p.price <= ?';
      params.push(max_price);
      countParams.push(max_price);
    }

    if (ram) {
      query += ' AND p.id IN (SELECT product_id FROM product_variants WHERE ram = ?)';
      countQuery += ' AND p.id IN (SELECT product_id FROM product_variants WHERE ram = ?)';
      params.push(ram);
      countParams.push(ram);
    }

    if (storage) {
      query += ' AND p.id IN (SELECT product_id FROM product_variants WHERE storage = ?)';
      countQuery += ' AND p.id IN (SELECT product_id FROM product_variants WHERE storage = ?)';
      params.push(storage);
      countParams.push(storage);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      case 'rating':
        query += ' ORDER BY p.rating DESC';
        break;
      case 'popular':
        query += ' ORDER BY p.sold DESC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
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

const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [products] = await db.query(
      `SELECT p.*, b.name as brand_name, c.name as category_name
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    const [variants] = await db.query(
      'SELECT * FROM product_variants WHERE product_id = ?',
      [id]
    );

    const [reviews] = await db.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({
      product: { ...products[0], variants, reviews }
    });
  } catch (error) {
    next(error);
  }
};

const getFeaturedProducts = async (req, res, next) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, b.name as brand_name
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = 1 AND p.is_featured = 1
       ORDER BY p.created_at DESC
       LIMIT 8`
    );
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

const getLatestProducts = async (req, res, next) => {
  try {
    const [products] = await db.query(
      `SELECT p.*, b.name as brand_name
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = 1
       ORDER BY p.created_at DESC
       LIMIT 8`
    );
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const [brands] = await db.query('SELECT * FROM brands ORDER BY name');
    res.json({ brands });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, getProduct, getFeaturedProducts, getLatestProducts, getBrands, getCategories };
