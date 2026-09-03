import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineExclamationTriangle } from 'react-icons/hi2';

export default function ForgotPassword() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <HiOutlineExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fitur Belum Tersedia</h1>
            <p className="text-sm text-gray-500 mb-6">
              Fitur reset password saat ini belum tersedia. Silakan hubungi admin jika Anda lupa password akun Anda.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
