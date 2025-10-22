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

  // 🆕 Check Auth dengan Token (bukan session)
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      // Jika token dan user data ada, langsung set user
      if (token && userData) {
        // Optional: Validasi token ke backend
        const response = await fetch(
          'https://duatduitbackend-production.up.railway.app/auth.php?action=check',
          {
            headers: {
              'Authorization': `Bearer ${token}` // 🔑 Kirim token di header
            }
          }
        );
        
        const result = await response.json();
        
        if (result.authenticated) {
          setUser(JSON.parse(userData));
        } else {
          // Token tidak valid, hapus dari localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Jika error, tetap coba gunakan data lokal
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

  const handleLogout = async () => {
    try {
      // Hapus token dari localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      // Optional: Panggil endpoint logout (jika ada cleanup di backend)
      const token = localStorage.getItem('auth_token');
      if (token) {
        await fetch(
          'https://duatduitbackend-production.up.railway.app/auth.php?action=logout',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
      }
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Tetap logout meski error
      setUser(null);
    }
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