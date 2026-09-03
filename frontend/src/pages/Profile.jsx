import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineLockClosed } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { updateProfile, changePassword } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, setUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) setProfileErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateProfile = () => {
    const errs = {};
    if (!profileForm.name.trim()) errs.name = 'Nama wajib diisi.';
    if (!profileForm.email.trim()) errs.email = 'Email wajib diisi.';
    else if (!/\S+@\S+\.\S+/.test(profileForm.email)) errs.email = 'Format email tidak valid.';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwordForm.current_password) errs.current_password = 'Password saat ini wajib diisi.';
    if (!passwordForm.new_password) errs.new_password = 'Password baru wajib diisi.';
    else if (passwordForm.new_password.length < 6) errs.new_password = 'Password minimal 6 karakter.';
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      errs.new_password_confirmation = 'Konfirmasi password tidak cocok.';
    }
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setProfileLoading(true);
    try {
      const res = await updateProfile(profileForm);
      const updatedUser = res.data.user || { ...user, ...profileForm };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profil berhasil diperbarui!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    try {
      await changePassword(passwordForm);
      toast.success('Password berhasil diubah!');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil Saya</h1>

      {/* Profile Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <HiOutlineUser className="w-5 h-5 text-blue-600" />
          <span>Informasi Profil</span>
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={handleProfileChange}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                profileErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {profileErrors.name && <p className="text-xs text-red-500 mt-1">{profileErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={handleProfileChange}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                profileErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {profileErrors.email && <p className="text-xs text-red-500 mt-1">{profileErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input
              type="text"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              name="address"
              value={profileForm.address}
              onChange={handleProfileChange}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {profileLoading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <HiOutlineLockClosed className="w-5 h-5 text-blue-600" />
          <span>Ubah Password</span>
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Saat Ini</label>
            <input
              type="password"
              name="current_password"
              value={passwordForm.current_password}
              onChange={handlePasswordChange}
              placeholder="Masukkan password saat ini"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                passwordErrors.current_password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {passwordErrors.current_password && <p className="text-xs text-red-500 mt-1">{passwordErrors.current_password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
            <input
              type="password"
              name="new_password"
              value={passwordForm.new_password}
              onChange={handlePasswordChange}
              placeholder="Minimal 6 karakter"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                passwordErrors.new_password ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {passwordErrors.new_password && <p className="text-xs text-red-500 mt-1">{passwordErrors.new_password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
            <input
              type="password"
              name="new_password_confirmation"
              value={passwordForm.new_password_confirmation}
              onChange={handlePasswordChange}
              placeholder="Ulangi password baru"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                passwordErrors.new_password_confirmation ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {passwordErrors.new_password_confirmation && <p className="text-xs text-red-500 mt-1">{passwordErrors.new_password_confirmation}</p>}
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordLoading ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
