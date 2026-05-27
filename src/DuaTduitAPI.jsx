import React, { useState, useEffect } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { Wallet, PiggyBank, Umbrella, Coffee, TrendingUp, Plus, X, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Calendar, Tag, FileText, BarChart3, Filter, Moon, Sun, LogOut } from 'lucide-react';
import { db } from "./firebase";

const DuaTduit = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      source: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      return undefined;
    }

    setLoading(true);
    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const transactionsQuery = query(transactionsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        alert('Gagal memuat data dari Firebase. Periksa Firestore Rules.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const handleSubmit = async () => {
    if (!user?.uid) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    if (!formData.amount || !formData.category || !formData.source) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (modalType === 'transfer' && formData.category === formData.source) {
      alert('Pilih dana asal dan tujuan yang berbeda');
      return;
    }
    
    const newTransaction = {
      type: modalType,
      amount: Number(formData.amount),
      category: formData.category,
      source: formData.source,
      description: formData.description,
      date: formData.date,
      createdAt: serverTimestamp()
    };

    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), newTransaction);

      alert('Transaksi berhasil disimpan!');
      setShowModal(false);
      setModalType('');
      resetForm();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Terjadi kesalahan saat menyimpan data ke Firebase');
    } finally {
      setLoading(false);
    }
  };

  const incomeCategories = [
    { value: 'dana_darurat', label: 'Dana Darurat', icon: Umbrella },
    { value: 'tabungan', label: 'Tabungan', icon: PiggyBank },
    { value: 'uang_jajan', label: 'Uang Jajan', icon: Coffee },
    { value: 'investasi', label: 'Investasi', icon: TrendingUp }
  ];

  const incomeSources = [
    'Gaji', 'Bonus', 'Hadiah', 'Freelance', 'Bisnis', 'Lainnya'
  ];

  const expenseCategories = [
    'Makan & Minum', 'Transportasi', 'Hiburan', 'Belanja', 'Tagihan', 'Kesehatan', 'Pendidikan', 'Lainnya'
  ];

  const getFundLabel = (value) => incomeCategories.find(cat => cat.value === value)?.label || value;

  const calculateTotals = () => {
    const totals = {
      dana_darurat: 0,
      tabungan: 0,
      uang_jajan: 0,
      investasi: 0,
      total: 0
    };

    transactions.forEach(t => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        if (Object.prototype.hasOwnProperty.call(totals, t.category)) {
          totals[t.category] += amount;
        }
        totals.total += amount;
      } else if (t.type === 'transfer') {
        if (Object.prototype.hasOwnProperty.call(totals, t.category)) {
          totals[t.category] -= amount;
        }
        if (Object.prototype.hasOwnProperty.call(totals, t.source)) {
          totals[t.source] += amount;
        }
      } else {
        if (Object.prototype.hasOwnProperty.call(totals, t.category)) {
          totals[t.category] -= amount;
        }
        totals.total -= amount;
      }
    });

    return totals;
  };

  const totals = calculateTotals();

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const monthlyChartData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));

    const month = date.getMonth();
    const year = date.getFullYear();
    const label = date.toLocaleDateString('id-ID', { month: 'short' });

    const income = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const expense = transactions
      .filter((t) => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
      })
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return { label, income, expense };
  });

  const maxMonthlyAmount = Math.max(...monthlyChartData.flatMap(item => [item.income, item.expense]), 1);

  const expenseBreakdown = expenseCategories
    .map((category) => ({
      category,
      amount: transactions
        .filter(t => t.type === 'expense' && t.source === category)
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const maxExpenseCategory = Math.max(...expenseBreakdown.map(item => item.amount), 1);

  const incomePercentage = totalIncome + totalExpense > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 0;
  const expensePercentage = totalIncome + totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-green-50'} transition-colors duration-300`}>
      {/* Loading Indicator */}
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg z-50">
          Loading...
        </div>
      )}

      {/* Navbar */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-sm border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-400 to-green-400 p-2 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>DuatDuit</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('dashboard')}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === 'dashboard'
                    ? 'bg-gradient-to-r from-blue-400 to-green-400 text-white shadow-md'
                    : darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActivePage('charts')}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === 'charts'
                    ? 'bg-gradient-to-r from-blue-400 to-green-400 text-white shadow-md'
                    : darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Chart
              </button>
              <span className={`hidden sm:block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} hover:scale-110 transition-transform`}
                title="Ganti tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={onLogout}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-600'} hover:scale-110 transition-transform`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`sm:hidden grid grid-cols-2 gap-2 mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-2 rounded-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-100'} shadow-sm`}>
          <button
            onClick={() => setActivePage('dashboard')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
              activePage === 'dashboard'
                ? 'bg-gradient-to-r from-blue-400 to-green-400 text-white shadow-md'
                : darkMode
                ? 'text-gray-300'
                : 'text-gray-700'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActivePage('charts')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
              activePage === 'charts'
                ? 'bg-gradient-to-r from-blue-400 to-green-400 text-white shadow-md'
                : darkMode
                ? 'text-gray-300'
                : 'text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Chart
          </button>
        </div>

        {activePage === 'dashboard' ? (
        <>
        <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900 to-green-900' : 'bg-gradient-to-r from-blue-400 to-green-400'} rounded-3xl p-8 mb-8 shadow-lg transform hover:scale-[1.02] transition-all duration-300`}>
        <div className="flex items-center justify-center mb-3">
            <Wallet className="w-8 h-8 text-white mr-3" />
            <p className="text-white text-lg font-medium">Total Uang</p>
        </div>
        <h2 className="text-5xl font-bold text-white text-center">
            {formatCurrency(totals.total)}
        </h2>
        <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-white/20">
            <div className="text-center">
            <p className="text-white/80 text-sm mb-1">Pemasukan</p>
            <p className="text-white text-xl font-semibold">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="text-center">
            <p className="text-white/80 text-sm mb-1">Pengeluaran</p>
            <p className="text-white text-xl font-semibold">{formatCurrency(totalExpense)}</p>
            </div>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {incomeCategories.map((cat) => {
            const Icon = cat.icon;
            const amount = totals[cat.value];
            const percentage = totals.total > 0 ? (amount / totals.total) * 100 : 0;
            
            return (
            <div
                key={cat.value}
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border`}
            >
                <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-400 to-green-400 p-3 rounded-xl">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className={`ml-3 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{cat.label}</h3>
                </div>
                <p className={`text-3xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatCurrency(amount)}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                    className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
                </div>
                <p className="text-sm text-gray-500">{percentage.toFixed(1)}% dari total</p>
            </div>
            );
        })}
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl shadow-lg p-6 border`}>
        <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Riwayat Transaksi</h2>
            <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} hover:shadow-md transition-all`}
            >
            <Filter className="w-4 h-4" />
            Filter
            </button>
        </div>

        {showFilter && (
            <div className="flex gap-2 mb-6 flex-wrap">
            {['all', 'income', 'expense', 'transfer'].map((type) => (
                <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filterType === type
                    ? 'bg-gradient-to-r from-blue-400 to-green-400 text-white shadow-md'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                >
                {type === 'all' ? 'Semua' : type === 'income' ? 'Pemasukan' : type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                </button>
            ))}
            </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
                <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Belum ada transaksi</p>
            </div>
            ) : (
            filteredTransactions.map((t) => {
                const isIncome = t.type === 'income';
                const isTransfer = t.type === 'transfer';
                const categoryData = isIncome
                ? incomeCategories.find(c => c.value === t.category)
                : null;

                return (
                <div
                    key={t.id}
                    className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 hover:shadow-md transition-all border ${darkMode ? 'border-gray-600' : 'border-gray-100'}`}
                >
                    <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-100' : isTransfer ? 'bg-blue-100' : 'bg-red-100'}`}>
                        {isIncome ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-600" />
                        ) : isTransfer ? (
                            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                        ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-600" />
                        )}
                        </div>
                        <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {isTransfer
                                ? `${getFundLabel(t.category)} ke ${getFundLabel(t.source)}`
                                : isIncome
                                ? categoryData?.label || t.category
                                : t.source}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${isIncome ? 'bg-green-100 text-green-700' : isTransfer ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {isIncome ? 'Pemasukan' : isTransfer ? 'Transfer' : 'Pengeluaran'}
                            </span>
                        </div>
                        {t.source && !isTransfer && (
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                            <Tag className="w-3 h-3" />
                            {t.source}
                            </p>
                        )}
                        {t.description && (
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1 mt-1`}>
                            <FileText className="w-3 h-3" />
                            {t.description}
                            </p>
                        )}
                        <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} flex items-center gap-1 mt-1`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(t.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                            })}
                        </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className={`text-xl font-bold ${isIncome ? 'text-green-600' : isTransfer ? 'text-blue-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : isTransfer ? '' : '-'}{formatCurrency(t.amount)}
                        </p>
                    </div>
                    </div>
                </div>
                );
            })
            )}
        </div>
        </div>
        </>
        ) : (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Chart Keuangan</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pemasukan dan pengeluaran 6 bulan terakhir</p>
            </div>
            <button
                onClick={() => setActivePage('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-100'} border ${darkMode ? 'border-gray-700' : 'border-gray-100'} shadow-sm`}
            >
                <Wallet className="w-4 h-4" />
                Dashboard
            </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl p-6 shadow-md border`}>
                <div className="flex items-center justify-between mb-4">
                <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Pemasukan</p>
                <ArrowUpCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalIncome)}</p>
                <p className="text-sm text-green-600 mt-2">{incomePercentage.toFixed(1)}% dari arus uang</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl p-6 shadow-md border`}>
                <div className="flex items-center justify-between mb-4">
                <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Pengeluaran</p>
                <ArrowDownCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalExpense)}</p>
                <p className="text-sm text-red-600 mt-2">{expensePercentage.toFixed(1)}% dari arus uang</p>
            </div>
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl p-6 shadow-md border`}>
                <div className="flex items-center justify-between mb-4">
                <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Selisih Bersih</p>
                <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <p className={`text-3xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalIncome - totalExpense)}</p>
                <div className="flex h-3 rounded-full overflow-hidden mt-4 bg-gray-200">
                <div className="bg-green-500" style={{ width: `${incomePercentage}%` }} />
                <div className="bg-red-500" style={{ width: `${expensePercentage}%` }} />
                </div>
            </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl p-6 shadow-lg border`}>
            <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tren Bulanan</h3>
                <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-green-600"><span className="w-3 h-3 rounded-full bg-green-500" /> Pemasukan</span>
                <span className="flex items-center gap-2 text-red-600"><span className="w-3 h-3 rounded-full bg-red-500" /> Pengeluaran</span>
                </div>
            </div>
            <div className="grid grid-cols-6 gap-3 sm:gap-6 h-72">
                {monthlyChartData.map((item) => (
                <div key={item.label} className="flex flex-col justify-end min-w-0">
                    <div className="flex items-end justify-center gap-2 h-52">
                    <div
                        className="w-5 sm:w-8 rounded-t-lg bg-green-500 transition-all"
                        title={`Pemasukan ${item.label}: ${formatCurrency(item.income)}`}
                        style={{ height: `${Math.max((item.income / maxMonthlyAmount) * 100, item.income > 0 ? 4 : 0)}%` }}
                    />
                    <div
                        className="w-5 sm:w-8 rounded-t-lg bg-red-500 transition-all"
                        title={`Pengeluaran ${item.label}: ${formatCurrency(item.expense)}`}
                        style={{ height: `${Math.max((item.expense / maxMonthlyAmount) * 100, item.expense > 0 ? 4 : 0)}%` }}
                    />
                    </div>
                    <p className={`text-center text-xs sm:text-sm mt-3 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
                </div>
                ))}
            </div>
            </div>

            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-2xl p-6 shadow-lg border`}>
            <h3 className={`text-xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Kategori Pengeluaran</h3>
            {expenseBreakdown.length === 0 ? (
                <div className="text-center py-12">
                <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Belum ada data pengeluaran</p>
                </div>
            ) : (
                <div className="space-y-4">
                {expenseBreakdown.map((item) => (
                    <div key={item.category}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <p className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.category}</p>
                        <p className={`font-semibold whitespace-nowrap ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(item.amount)}</p>
                    </div>
                    <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                        <div
                        className="h-full rounded-full bg-gradient-to-r from-red-400 to-orange-400"
                        style={{ width: `${(item.amount / maxExpenseCategory) * 100}%` }}
                        />
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        )}
    </div>

    <div className="fixed bottom-8 right-8 z-50">
        <button
        onClick={() => setShowModal(true)}
        className="bg-gradient-to-r from-blue-400 to-green-400 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300"
        >
        <Plus className="w-8 h-8" />
        </button>
    </div>

    {showModal && !modalType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all`}>
            <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tambah Transaksi</h2>
            <button
                onClick={() => setShowModal(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
                <X className="w-6 h-6" />
            </button>
            </div>
            <div className="space-y-4">
            <button
                onClick={() => setModalType('income')}
                className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
                <ArrowUpCircle className="w-6 h-6" />
                Tambah Pemasukan
            </button>
            <button
                onClick={() => setModalType('expense')}
                className="w-full bg-gradient-to-r from-red-400 to-red-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
                <ArrowDownCircle className="w-6 h-6" />
                Tambah Pengeluaran
            </button>
            <button
                onClick={() => setModalType('transfer')}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
                <ArrowRightLeft className="w-6 h-6" />
                Pindah Dana
            </button>
            </div>
        </div>
        </div>
    )}

    {showModal && modalType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all my-8`}>
            <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {modalType === 'income' ? 'Tambah Pemasukan' : modalType === 'expense' ? 'Tambah Pengeluaran' : 'Pindah Dana'}
            </h2>
            <button
                onClick={() => {
                setShowModal(false);
                setModalType('');
                resetForm();
                }}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
                <X className="w-6 h-6" />
            </button>
            </div>

            <div className="space-y-5">
            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nominal (Rp) *
                </label>
                <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                placeholder="100000"
                />
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {modalType === 'income' ? 'Masuk ke mana? *' : modalType === 'expense' ? 'Dari dana apa? *' : 'Dari dana apa? *'}
                </label>
                <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                >
                <option value="">Pilih kategori</option>
                {incomeCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
                </select>
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {modalType === 'income' ? 'Sumber uang *' : modalType === 'expense' ? 'Untuk apa? *' : 'Pindah ke mana? *'}
                </label>
                {modalType === 'income' ? (
                <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                >
                    <option value="">Pilih sumber</option>
                    {incomeSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                    ))}
                </select>
                ) : modalType === 'expense' ? (
                <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                >
                    <option value="">Pilih kategori</option>
                    {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                ) : (
                <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                >
                    <option value="">Pilih tujuan</option>
                    {incomeCategories
                    .filter(cat => cat.value !== formData.category)
                    .map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
                )}
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tanggal *
                </label>
                <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                />
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Deskripsi (opsional)
                </label>
                <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all`}
                rows="3"
                placeholder="Catatan tambahan..."
                />
            </div>

            <button
                onClick={handleSubmit}
                className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all ${
                modalType === 'income'
                    ? 'bg-gradient-to-r from-blue-400 to-green-400'
                    : modalType === 'expense'
                    ? 'bg-gradient-to-r from-green-400 to-green-500'
                    : 'bg-gradient-to-r from-blue-400 to-blue-500'
                }`}
            >
                {modalType === 'transfer' ? 'Simpan Transfer' : 'Simpan Transaksi'}
            </button>
            </div>
        </div>
        </div>
    )}
    </div>
  );
};

export default DuaTduit;
