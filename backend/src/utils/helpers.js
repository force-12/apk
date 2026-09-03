const generateOrderNumber = () => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `ORD-${y}${m}${d}-${random}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Sanitize pagination parameters from query string.
 * Ensures page >= 1, limit between 1 and maxLimit, and offset >= 0.
 * Returns safe integer values that can be used directly in SQL queries.
 */
const sanitizePagination = (pageParam, limitParam, defaults = {}) => {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    maxLimit = 100
  } = defaults;

  let page = parseInt(pageParam, 10);
  if (isNaN(page) || page < 1) page = defaultPage;

  let limit = parseInt(limitParam, 10);
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

module.exports = { generateOrderNumber, formatCurrency, sanitizePagination };
