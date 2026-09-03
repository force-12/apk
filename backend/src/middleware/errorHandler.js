const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Ukuran file terlalu besar. Maksimal 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({ message: 'Data sudah ada.' });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ message: 'Data referensi tidak ditemukan.' });
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'Akses tidak diizinkan.' });
  }

  const statusCode = err.statusCode || 500;

  // In production, don't leak internal error details
  const isProduction = process.env.NODE_ENV === 'production';
  const message = statusCode === 500 && isProduction
    ? 'Terjadi kesalahan pada server.'
    : err.message || 'Terjadi kesalahan pada server.';

  res.status(statusCode).json({ message });
};

module.exports = { errorHandler };
