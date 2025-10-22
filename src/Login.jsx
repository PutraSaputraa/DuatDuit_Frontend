import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isRegister 
      ? 'https://duatduitbackend-production.up.railway.app/auth.php?action=register'
      : 'https://duatduitbackend-production.up.railway.app/auth.php?action=login';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        if (isRegister) {
          alert('Registrasi berhasil! Silakan login.');
          setIsRegister(false);
          setFormData({ username: '', email: '', password: '', full_name: '' });
        } else {
          // ✅ Simpan token ke localStorage
          localStorage.setItem('auth_token', result.token);
          localStorage.setItem('user_data', JSON.stringify(result.user));
          onLoginSuccess(result.user);
        }
      } else {
        setError(result.error || 'Terjadi kesalahan');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          {isRegister ? 'Daftar Akun' : 'Login'}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {isRegister ? 'Buat akun baru' : 'Masuk ke akun Anda'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="username"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Nama lengkap"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-400 to-green-400 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Loading...' : (
              <>
                {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {isRegister ? 'Daftar' : 'Login'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;