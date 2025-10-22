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

  // ✅ Check Auth dengan JWT Token
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await fetch(
        'https://duatduitbackend-production.up.railway.app/auth.php?action=check',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const result = await response.json();
      
      if (result.authenticated) {
        setUser(result.user);
      } else {
        // Token tidak valid, hapus
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await fetch(
        'https://duatduitbackend-production.up.railway.app/auth.php?action=logout',
        {
          credentials: 'include' // 🔑 Kirim session cookie
        }
      );
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
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