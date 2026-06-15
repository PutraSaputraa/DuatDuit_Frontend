import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { LogIn, UserPlus, Sparkles } from 'lucide-react';
import { auth } from "./firebase";

const Login = ({ onLoginSuccess, onDemoLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (code) => {
    const messages = {
      "auth/email-already-in-use": "Email sudah terdaftar",
      "auth/invalid-email": "Format email tidak valid",
      "auth/invalid-credential": "Email atau password salah",
      "auth/weak-password": "Password minimal 6 karakter"
    };

    return messages[code] || "Terjadi kesalahan";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        if (formData.fullName) {
          await updateProfile(credential.user, {
            displayName: formData.fullName
          });
        }

        onLoginSuccess(credential.user);
      } else {
        const credential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        onLoginSuccess(credential.user);
      }
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ebe6] flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] wise-card p-8 max-w-md w-full">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#9fe870]">
          <LogIn className="h-7 w-7 text-[#0e0f0c]" />
        </div>
        <h1 className="text-3xl font-black text-center mb-2 text-[#0e0f0c]">
          {isRegister ? 'Daftar Akun' : 'Login'}
        </h1>
        <p className="text-center text-[#454745] mb-6">
          {isRegister ? 'Buat akun baru' : 'Masuk ke akun Anda'}
        </p>

        {error && (
          <div className="bg-red-50 border border-[#d03238]/30 text-[#a72027] px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#454745] mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#0e0f0c]/25 text-[#0e0f0c] focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c]"
              placeholder="email@example.com"
            />
          </div>

          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-[#454745] mb-2">
                Nama Lengkap (Opsional)
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#0e0f0c]/25 text-[#0e0f0c] focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c]"
                placeholder="Nama lengkap"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-[#454745] mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-[#0e0f0c]/25 text-[#0e0f0c] focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c]"
              placeholder="Minimal 6 karakter"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9fe870] text-[#0e0f0c] py-4 rounded-[24px] font-bold hover:bg-[#cdffad] hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Loading...' : (
              <>
                {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                {isRegister ? 'Daftar' : 'Login'}
              </>
            )}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-xs font-medium text-gray-400">atau</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
          <button
            type="button"
            onClick={onDemoLogin}
            className="w-full bg-[#0e0f0c] text-[#9fe870] py-4 rounded-[24px] font-bold hover:bg-[#24261f] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Masuk Akun Demo
          </button>
          <p className="text-center text-xs text-[#454745] mt-3">
            Data contoh sudah terisi untuk tampilan portofolio.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-[#054d28] hover:text-[#0e0f0c] font-semibold"
          >
            {isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
