import React, { useState, useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import DuaTduit from "./DuaTduitAPI";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek apakah user sudah login saat app pertama load
  useEffect(() => {
    checkAuth();
  }, []);

  // ✅ Check Auth dengan Token
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        // ✅ Set user langsung tanpa validasi ke backend dulu
        // (untuk performa lebih cepat)
        setUser(JSON.parse(userData));
        
        // ⚠️ HAPUS validasi ke backend jika endpoint check belum dibuat
        // Atau comment dulu sampai backend siap
        /*
        const response = await fetch(
          'https://duatduitbackend-production.up.railway.app/auth.php?action=check',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const result = await response.json();
        
        if (!result.authenticated) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
        */
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Jika error, tetap gunakan data lokal
      const userData = localStorage.getItem('user_data');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    // ✅ Simplified logout - cukup hapus dari localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    
    // ⚠️ Tidak perlu panggil backend untuk logout dengan JWT
    // (Token tinggal dibuang dari client side)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
        <div className="text-white text-2xl font-semibold flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user ? (
        <DuaTduit user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </BrowserRouter>
  );
}

export default App;