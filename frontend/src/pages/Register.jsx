import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlinePhone, HiOutlineLockClosed } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Nama wajib diisi.';
    if (!form.email.trim()) errs.email = 'Email wajib diisi.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Format email tidak valid.';
    if (!form.phone.trim()) errs.phone = 'Nomor telepon wajib diisi.';
    if (!form.password) errs.password = 'Password wajib diisi.';
    else if (form.password.length < 6) errs.password = 'Password minimal 6 karakter.';
    if (form.password !== form.password_confirmation) errs.password_confirmation = 'Password tidak cocok.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      toast.success('Registrasi berhasil!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, name, type = 'text', placeholder, icon: Icon }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
            errors[name] ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
            <p className="text-sm text-gray-500 mt-1">Bergabung dengan SmartPhone Store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Nama Lengkap" name="name" placeholder="Nama lengkap Anda" icon={HiOutlineUser} />
            <InputField label="Email" name="email" type="email" placeholder="nama@email.com" icon={HiOutlineEnvelope} />
            <InputField label="Nomor Telepon" name="phone" placeholder="08xxxxxxxxxx" icon={HiOutlinePhone} />
            <InputField label="Password" name="password" type="password" placeholder="Minimal 6 karakter" icon={HiOutlineLockClosed} />
            <InputField label="Konfirmasi Password" name="password_confirmation" type="password" placeholder="Ulangi password" icon={HiOutlineLockClosed} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-700">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
