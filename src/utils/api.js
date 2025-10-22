const API_URL = 'https://duatduitbackend-production.up.railway.app/api.php';

// ✅ Fungsi untuk fetch dengan Authorization header
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    throw new Error('No auth token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, // ✅ KIRIM TOKEN
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });
  
  // Cek jika unauthorized
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.reload();
    throw new Error('Unauthorized');
  }

  return await response.json();
};

// ✅ Function untuk logout
export const logout = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  window.location.reload();
};

export { API_URL };