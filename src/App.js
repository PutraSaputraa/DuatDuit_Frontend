import React, { useState, useEffect } from 'react';
import { BrowserRouter } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import DuaTduit from "./DuaTduitAPI";
import Login from "./Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleDemoLogin = () => {
    setUser({
      uid: 'demo-portfolio',
      email: 'demo@duatduit.app',
      displayName: 'Anugraha',
      isDemo: true
    });
  };

  const handleLogout = async () => {
    try {
      if (!user?.isDemo) {
        await signOut(auth);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8ebe6] flex items-center justify-center">
        <div className="text-[#0e0f0c] text-2xl font-bold flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9fe870]"></div>
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
        <Login onLoginSuccess={handleLoginSuccess} onDemoLogin={handleDemoLogin} />
      )}
    </BrowserRouter>
  );
}

export default App;
