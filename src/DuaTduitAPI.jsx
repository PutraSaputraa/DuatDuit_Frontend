import React, { useCallback, useState, useEffect } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { Wallet, PiggyBank, Umbrella, Coffee, TrendingUp, Plus, X, ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Calendar, Tag, FileText, BarChart3, Filter, Moon, Sun, LogOut, Target, Repeat, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight, Pencil, Trash2 } from 'lucide-react';
import { db } from "./firebase";

const demoTransactions = [
  { id: 'demo-024', type: 'expense', amount: 185000, category: 'uang_jajan', source: 'Belanja', description: 'Kemeja untuk presentasi portofolio', date: '2026-06-06' },
  { id: 'demo-023', type: 'expense', amount: 76000, category: 'uang_jajan', source: 'Makan & Minum', description: 'Kopi dan makan siang', date: '2026-06-04' },
  { id: 'demo-022', type: 'income', amount: 450000, category: 'investasi', source: 'Freelance', description: 'Landing page sederhana', date: '2026-06-02' },
  { id: 'demo-021', type: 'income', amount: 2500000, category: 'tabungan', source: 'Gaji', description: 'Alokasi tabungan awal bulan', date: '2026-06-01' },
  { id: 'demo-020', type: 'expense', amount: 320000, category: 'tabungan', source: 'Pendidikan', description: 'Kelas UI/UX online', date: '2026-05-27' },
  { id: 'demo-019', type: 'expense', amount: 210000, category: 'uang_jajan', source: 'Transportasi', description: 'Bensin dan parkir', date: '2026-05-22' },
  { id: 'demo-018', type: 'transfer', amount: 500000, category: 'tabungan', source: 'dana_darurat', description: 'Top up dana darurat', date: '2026-05-18' },
  { id: 'demo-017', type: 'income', amount: 1200000, category: 'uang_jajan', source: 'Bonus', description: 'Bonus proyek kecil', date: '2026-05-15' },
  { id: 'demo-016', type: 'expense', amount: 275000, category: 'uang_jajan', source: 'Hiburan', description: 'Nonton dan makan malam', date: '2026-05-11' },
  { id: 'demo-015', type: 'income', amount: 3000000, category: 'tabungan', source: 'Gaji', description: 'Gaji bulanan', date: '2026-05-01' },
  { id: 'demo-014', type: 'expense', amount: 425000, category: 'tabungan', source: 'Tagihan', description: 'Internet dan listrik', date: '2026-04-26' },
  { id: 'demo-013', type: 'expense', amount: 145000, category: 'uang_jajan', source: 'Kesehatan', description: 'Vitamin dan obat ringan', date: '2026-04-18' },
  { id: 'demo-012', type: 'income', amount: 650000, category: 'investasi', source: 'Freelance', description: 'Perbaikan halaman web', date: '2026-04-12' },
  { id: 'demo-011', type: 'income', amount: 2800000, category: 'tabungan', source: 'Gaji', description: 'Gaji bulanan', date: '2026-04-01' },
  { id: 'demo-010', type: 'expense', amount: 350000, category: 'uang_jajan', source: 'Makan & Minum', description: 'Makan keluarga', date: '2026-03-24' },
  { id: 'demo-009', type: 'expense', amount: 180000, category: 'uang_jajan', source: 'Transportasi', description: 'Transport mingguan', date: '2026-03-16' },
  { id: 'demo-008', type: 'income', amount: 500000, category: 'dana_darurat', source: 'Hadiah', description: 'Hadiah keluarga', date: '2026-03-09' },
  { id: 'demo-007', type: 'income', amount: 2600000, category: 'tabungan', source: 'Gaji', description: 'Gaji bulanan', date: '2026-03-01' },
  { id: 'demo-006', type: 'expense', amount: 390000, category: 'tabungan', source: 'Tagihan', description: 'Tagihan bulanan', date: '2026-02-25' },
  { id: 'demo-005', type: 'expense', amount: 240000, category: 'uang_jajan', source: 'Belanja', description: 'Kebutuhan pribadi', date: '2026-02-14' },
  { id: 'demo-004', type: 'income', amount: 750000, category: 'investasi', source: 'Bisnis', description: 'Profit jualan digital', date: '2026-02-08' },
  { id: 'demo-003', type: 'income', amount: 2500000, category: 'tabungan', source: 'Gaji', description: 'Gaji bulanan', date: '2026-02-01' },
  { id: 'demo-002', type: 'expense', amount: 315000, category: 'uang_jajan', source: 'Makan & Minum', description: 'Makan dan kopi bulan Januari', date: '2026-01-19' },
  { id: 'demo-001', type: 'income', amount: 2400000, category: 'tabungan', source: 'Gaji', description: 'Saldo awal demo portofolio', date: '2026-01-02' }
];

const demoBudgets = [
  {
    id: 'demo-budget-1',
    namaBudget: 'Makan & Minum',
    kategori: 'Makan & Minum',
    danaSumber: 'uang_jajan',
    totalBudget: 1500000,
    spentAmount: 0,
    remainingBudget: 1500000,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    totalDays: 30,
    remainingDays: 30,
    dailyBudget: 50000,
    status: 'aman'
  },
  {
    id: 'demo-budget-2',
    namaBudget: 'Transportasi',
    kategori: 'Transportasi',
    danaSumber: 'uang_jajan',
    totalBudget: 500000,
    spentAmount: 0,
    remainingBudget: 500000,
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    totalDays: 30,
    remainingDays: 30,
    dailyBudget: 16667,
    status: 'aman'
  }
];

const demoRecurringExpenses = [
  {
    id: 'demo-recurring-1',
    nama: 'Galon',
    kategori: 'Tagihan',
    danaSumber: 'uang_jajan',
    nominal: 20000,
    intervalHari: 15,
    tanggalMulai: '2026-06-01',
    tanggalBerikutnya: '2026-06-16',
    aktif: true
  }
];

const isPermissionError = (error) => (
  error?.code === 'permission-denied' ||
  error?.message?.toLowerCase().includes('permission')
);

const DuaTduit = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editingRecurringId, setEditingRecurringId] = useState(null);
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

  const [budgetForm, setBudgetForm] = useState({
    namaBudget: '',
    kategori: '',
    danaSumber: '',
    totalBudget: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  const [recurringForm, setRecurringForm] = useState({
    nama: '',
    kategori: '',
    danaSumber: '',
    nominal: '',
    intervalHari: '',
    tanggalMulai: new Date().toISOString().split('T')[0]
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

  const resetBudgetForm = () => {
    setBudgetForm({
      namaBudget: '',
      kategori: '',
      danaSumber: '',
      totalBudget: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    });
  };

  const resetRecurringForm = () => {
    setRecurringForm({
      nama: '',
      kategori: '',
      danaSumber: '',
      nominal: '',
      intervalHari: '',
      tanggalMulai: new Date().toISOString().split('T')[0]
    });
  };

  const getLocalStorageKey = useCallback((collectionName) => `duatduit_${user?.uid}_${collectionName}`, [user?.uid]);

  const readLocalCollection = useCallback((collectionName) => {
    try {
      const saved = localStorage.getItem(getLocalStorageKey(collectionName));
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error(`Error reading local ${collectionName}:`, error);
      return [];
    }
  }, [getLocalStorageKey]);

  const writeLocalCollection = useCallback((collectionName, data) => {
    localStorage.setItem(getLocalStorageKey(collectionName), JSON.stringify(data));
  }, [getLocalStorageKey]);

  const saveLocalBudget = (budgetData) => {
    const localBudget = {
      ...budgetData,
      id: `local-budget-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const nextBudgets = [localBudget, ...readLocalCollection('budgets')];
    writeLocalCollection('budgets', nextBudgets);
    setBudgets(nextBudgets);
  };

  const updateLocalBudget = (budgetId, updates) => {
    const localBudgets = readLocalCollection('budgets');
    const nextBudgets = localBudgets.map((item) => (
      item.id === budgetId ? { ...item, ...updates } : item
    ));
    writeLocalCollection('budgets', nextBudgets);
    setBudgets(nextBudgets);
  };

  const deleteLocalBudget = (budgetId) => {
    const nextBudgets = readLocalCollection('budgets').filter((item) => item.id !== budgetId);
    writeLocalCollection('budgets', nextBudgets);
    setBudgets(nextBudgets);
  };

  const saveLocalRecurringExpense = (expenseData) => {
    const localExpense = {
      ...expenseData,
      id: `local-recurring-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const nextExpenses = [localExpense, ...readLocalCollection('recurringExpenses')];
    writeLocalCollection('recurringExpenses', nextExpenses);
    setRecurringExpenses(nextExpenses);
  };

  const updateLocalRecurringExpense = (expenseId, updates) => {
    const localExpenses = readLocalCollection('recurringExpenses');
    const nextExpenses = localExpenses.map((item) => (
      item.id === expenseId ? { ...item, ...updates } : item
    ));
    writeLocalCollection('recurringExpenses', nextExpenses);
    setRecurringExpenses(nextExpenses);
  };

  const deleteLocalRecurringExpense = (expenseId) => {
    const nextExpenses = readLocalCollection('recurringExpenses').filter((item) => item.id !== expenseId);
    writeLocalCollection('recurringExpenses', nextExpenses);
    setRecurringExpenses(nextExpenses);
  };

  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      setBudgets([]);
      setRecurringExpenses([]);
      return undefined;
    }

    if (user.isDemo) {
      setTransactions(demoTransactions);
      setBudgets(demoBudgets);
      setRecurringExpenses(demoRecurringExpenses);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const transactionsRef = collection(db, "users", user.uid, "transactions");
    const transactionsQuery = query(transactionsRef, orderBy("createdAt", "desc"));
    const budgetsRef = collection(db, "users", user.uid, "budgets");
    const budgetsQuery = query(budgetsRef, orderBy("createdAt", "desc"));
    const recurringRef = collection(db, "users", user.uid, "recurringExpenses");
    const recurringQuery = query(recurringRef, orderBy("createdAt", "desc"));

    const unsubscribeTransactions = onSnapshot(
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

    const unsubscribeBudgets = onSnapshot(
      budgetsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setBudgets(data);
      },
      (error) => {
        if (isPermissionError(error)) {
          console.warn('Budget Firebase permission denied. Using local storage fallback.');
          setBudgets(readLocalCollection('budgets'));
          return;
        }
        console.error('Error fetching budgets:', error);
        alert('Gagal memuat data budget dari Firebase.');
      }
    );

    const unsubscribeRecurring = onSnapshot(
      recurringQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setRecurringExpenses(data);
      },
      (error) => {
        if (isPermissionError(error)) {
          console.warn('Recurring expense Firebase permission denied. Using local storage fallback.');
          setRecurringExpenses(readLocalCollection('recurringExpenses'));
          return;
        }
        console.error('Error fetching recurring expenses:', error);
        alert('Gagal memuat data pengeluaran berulang dari Firebase.');
      }
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeBudgets();
      unsubscribeRecurring();
    };
  }, [user, readLocalCollection]);

  const parseDate = (dateString) => new Date(`${dateString}T00:00:00`);

  const getInclusiveDays = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    return Math.max(Math.floor((end - start) / 86400000) + 1, 0);
  };

  const addDays = (dateString, days) => {
    const date = parseDate(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  const calculateBudgetDetails = (budget) => {
    const totalBudget = Number(budget.totalBudget) || 0;
    const budgetOptionValue = `budget:${budget.id}`;
    const totalDays = getInclusiveDays(budget.startDate, budget.endDate);
    const today = parseDate(new Date().toISOString().split('T')[0]);
    const start = parseDate(budget.startDate);
    const end = parseDate(budget.endDate);
    const remainingDays = today < start
      ? totalDays
      : today > end
      ? 0
      : Math.max(Math.floor((end - today) / 86400000) + 1, 0);

    const spentAmount = transactions
      .filter((transaction) => {
        if (transaction.type !== 'expense' || !transaction.date) {
          return false;
        }

        const transactionDate = parseDate(transaction.date);
        const isBudgetTransaction = transaction.budgetId === budget.id || transaction.category === budgetOptionValue;
        const isLegacyCategoryMatch = !transaction.budgetId && transaction.source === budget.kategori;
        return transactionDate >= start && transactionDate <= end && (isBudgetTransaction || isLegacyCategoryMatch);
      })
      .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

    const remainingBudget = totalBudget - spentAmount;
    const progress = totalBudget > 0 ? Math.min((spentAmount / totalBudget) * 100, 100) : 0;
    const dailyBudget = remainingBudget > 0 && remainingDays > 0 ? remainingBudget / remainingDays : 0;

    let status = 'aman';
    if (remainingBudget < 0) {
      status = 'melebihi budget';
    } else if (today > end) {
      status = 'selesai';
    } else if (remainingBudget === 0 && totalBudget > 0) {
      status = 'budget habis';
    } else if (progress >= 80) {
      status = 'hampir habis';
    }

    return {
      ...budget,
      totalBudget,
      spentAmount,
      remainingBudget,
      totalDays,
      remainingDays,
      dailyBudget,
      progress,
      status
    };
  };

  const budgetsWithDetails = budgets.map(calculateBudgetDetails);
  const activeBudgetOptions = budgetsWithDetails.filter((budget) => (
    budget.status !== 'selesai' && budget.remainingBudget > 0
  ));

  const getStatusStyle = (status) => {
    if (status === 'melebihi budget') {
      return 'bg-[#320707] text-white';
    }

    if (status === 'selesai') {
      return 'bg-[#e8ebe6] text-[#454745]';
    }

    if (status === 'budget habis' || status === 'hampir habis') {
      return 'bg-[#ffd11a] text-[#4a3b1c]';
    }

    return 'bg-[#e2f6d5] text-[#054d28]';
  };

  const handleBudgetSubmit = async () => {
    if (!user?.uid) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    const totalBudget = Number(budgetForm.totalBudget);
    if (!budgetForm.namaBudget || !budgetForm.kategori || !budgetForm.danaSumber || !budgetForm.totalBudget || !budgetForm.startDate || !budgetForm.endDate) {
      alert('Budget tidak boleh kosong');
      return;
    }

    if (totalBudget <= 0) {
      alert('Nominal budget harus lebih dari 0');
      return;
    }

    if (parseDate(budgetForm.endDate) <= parseDate(budgetForm.startDate)) {
      alert('Tanggal selesai harus setelah tanggal mulai');
      return;
    }

    const totalDays = getInclusiveDays(budgetForm.startDate, budgetForm.endDate);
    const newBudget = {
      namaBudget: budgetForm.namaBudget,
      kategori: budgetForm.kategori,
      danaSumber: budgetForm.danaSumber,
      totalBudget,
      spentAmount: 0,
      remainingBudget: totalBudget,
      startDate: budgetForm.startDate,
      endDate: budgetForm.endDate,
      totalDays,
      remainingDays: totalDays,
      dailyBudget: totalBudget / totalDays,
      status: 'aman'
    };

    if (editingBudgetId) {
      if (user.isDemo) {
        setBudgets(budgets.map((budget) => (
          budget.id === editingBudgetId ? { ...budget, ...newBudget } : budget
        )));
        setShowBudgetModal(false);
        setEditingBudgetId(null);
        resetBudgetForm();
        return;
      }

      setLoading(true);
      try {
        await updateDoc(doc(db, "users", user.uid, "budgets", editingBudgetId), newBudget);
        setShowBudgetModal(false);
        setEditingBudgetId(null);
        resetBudgetForm();
      } catch (error) {
        if (isPermissionError(error)) {
          updateLocalBudget(editingBudgetId, newBudget);
          setShowBudgetModal(false);
          setEditingBudgetId(null);
          resetBudgetForm();
          return;
        }
        console.error('Error updating budget:', error);
        alert('Terjadi kesalahan saat mengubah budget');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (user.isDemo) {
      setBudgets([{ ...newBudget, id: `demo-budget-${Date.now()}` }, ...budgets]);
      setShowBudgetModal(false);
      resetBudgetForm();
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "budgets"), {
        ...newBudget,
        createdAt: serverTimestamp()
      });
      setShowBudgetModal(false);
      resetBudgetForm();
    } catch (error) {
      if (isPermissionError(error)) {
        console.warn('Budget Firebase save denied. Saving budget locally.');
        saveLocalBudget(newBudget);
        setShowBudgetModal(false);
        resetBudgetForm();
        return;
      }
      console.error('Error saving budget:', error);
      alert('Terjadi kesalahan saat menyimpan budget');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBudget = (budget) => {
    setBudgetForm({
      namaBudget: budget.namaBudget || '',
      kategori: budget.kategori || '',
      danaSumber: budget.danaSumber || 'uang_jajan',
      totalBudget: String(budget.totalBudget || ''),
      startDate: budget.startDate || new Date().toISOString().split('T')[0],
      endDate: budget.endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    });
    setEditingBudgetId(budget.id);
    setShowBudgetModal(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Hapus budget ini? Riwayat transaksi yang sudah tercatat tidak akan ikut terhapus.')) {
      return;
    }

    if (user.isDemo) {
      setBudgets(budgets.filter((budget) => budget.id !== budgetId));
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "budgets", budgetId));
    } catch (error) {
      if (isPermissionError(error)) {
        deleteLocalBudget(budgetId);
        return;
      }
      console.error('Error deleting budget:', error);
      alert('Gagal menghapus budget');
    }
  };

  const handleRecurringSubmit = async () => {
    if (!user?.uid) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    const nominal = Number(recurringForm.nominal);
    const intervalHari = Number(recurringForm.intervalHari);
    if (!recurringForm.nama || !recurringForm.kategori || !recurringForm.danaSumber || !recurringForm.nominal || !recurringForm.intervalHari || !recurringForm.tanggalMulai) {
      alert('Pengeluaran berulang tidak boleh kosong');
      return;
    }

    if (nominal <= 0 || intervalHari <= 0) {
      alert('Nominal dan interval hari harus lebih dari 0');
      return;
    }

    const existingRecurringExpense = recurringExpenses.find((expense) => expense.id === editingRecurringId);
    const newRecurringExpense = {
      nama: recurringForm.nama,
      kategori: recurringForm.kategori,
      danaSumber: recurringForm.danaSumber,
      nominal,
      intervalHari,
      tanggalMulai: recurringForm.tanggalMulai,
      tanggalBerikutnya: addDays(recurringForm.tanggalMulai, intervalHari),
      aktif: editingRecurringId ? existingRecurringExpense?.aktif ?? true : true
    };

    if (editingRecurringId) {
      if (user.isDemo) {
        setRecurringExpenses(recurringExpenses.map((expense) => (
          expense.id === editingRecurringId ? { ...expense, ...newRecurringExpense } : expense
        )));
        setShowRecurringModal(false);
        setEditingRecurringId(null);
        resetRecurringForm();
        return;
      }

      setLoading(true);
      try {
        await updateDoc(doc(db, "users", user.uid, "recurringExpenses", editingRecurringId), newRecurringExpense);
        setShowRecurringModal(false);
        setEditingRecurringId(null);
        resetRecurringForm();
      } catch (error) {
        if (isPermissionError(error)) {
          updateLocalRecurringExpense(editingRecurringId, newRecurringExpense);
          setShowRecurringModal(false);
          setEditingRecurringId(null);
          resetRecurringForm();
          return;
        }
        console.error('Error updating recurring expense:', error);
        alert('Terjadi kesalahan saat mengubah pengeluaran berulang');
      } finally {
        setLoading(false);
      }
      return;
    }

    const initialRecurringTransaction = {
      type: 'expense',
      amount: nominal,
      category: recurringForm.danaSumber,
      source: recurringForm.kategori,
      description: `${recurringForm.nama} (pengeluaran berulang)`,
      date: recurringForm.tanggalMulai,
      recurringName: recurringForm.nama,
      createdAt: serverTimestamp()
    };

    if (user.isDemo) {
      const recurringId = `demo-recurring-${Date.now()}`;
      setRecurringExpenses([{ ...newRecurringExpense, id: recurringId }, ...recurringExpenses]);
      setTransactions([
        {
          ...initialRecurringTransaction,
          id: `demo-recurring-transaction-${Date.now()}`,
          recurringId,
          createdAt: new Date().toISOString()
        },
        ...transactions
      ]);
      setShowRecurringModal(false);
      resetRecurringForm();
      return;
    }

    setLoading(true);
    try {
      const recurringDoc = await addDoc(collection(db, "users", user.uid, "recurringExpenses"), {
        ...newRecurringExpense,
        createdAt: serverTimestamp()
      });
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        ...initialRecurringTransaction,
        recurringId: recurringDoc.id
      });
      setShowRecurringModal(false);
      resetRecurringForm();
    } catch (error) {
      if (isPermissionError(error)) {
        console.warn('Recurring expense Firebase save denied. Saving recurring expense locally.');
        saveLocalRecurringExpense(newRecurringExpense);
        try {
          await addDoc(collection(db, "users", user.uid, "transactions"), initialRecurringTransaction);
        } catch (transactionError) {
          console.error('Error saving initial recurring transaction:', transactionError);
        }
        setShowRecurringModal(false);
        resetRecurringForm();
        return;
      }
      console.error('Error saving recurring expense:', error);
      alert('Terjadi kesalahan saat menyimpan pengeluaran berulang');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecurring = (expense) => {
    setRecurringForm({
      nama: expense.nama || '',
      kategori: expense.kategori || '',
      danaSumber: expense.danaSumber || 'uang_jajan',
      nominal: String(expense.nominal || ''),
      intervalHari: String(expense.intervalHari || ''),
      tanggalMulai: expense.tanggalMulai || new Date().toISOString().split('T')[0]
    });
    setEditingRecurringId(expense.id);
    setShowRecurringModal(true);
  };

  const handleDeleteRecurring = async (expenseId) => {
    if (!window.confirm('Hapus pengeluaran berulang ini? Riwayat transaksi yang sudah tercatat tidak akan ikut terhapus.')) {
      return;
    }

    if (user.isDemo) {
      setRecurringExpenses(recurringExpenses.filter((expense) => expense.id !== expenseId));
      return;
    }

    try {
      await deleteDoc(doc(db, "users", user.uid, "recurringExpenses", expenseId));
    } catch (error) {
      if (isPermissionError(error)) {
        deleteLocalRecurringExpense(expenseId);
        return;
      }
      console.error('Error deleting recurring expense:', error);
      alert('Gagal menghapus pengeluaran berulang');
    }
  };

  const handleToggleRecurring = async (expense) => {
    if (user.isDemo) {
      setRecurringExpenses(recurringExpenses.map((item) => (
        item.id === expense.id ? { ...item, aktif: !item.aktif } : item
      )));
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid, "recurringExpenses", expense.id), {
        aktif: !expense.aktif
      });
    } catch (error) {
      if (isPermissionError(error)) {
        console.warn('Recurring expense Firebase update denied. Updating local storage fallback.');
        updateLocalRecurringExpense(expense.id, { aktif: !expense.aktif });
        return;
      }
      console.error('Error updating recurring expense:', error);
      alert('Gagal mengubah status pengeluaran berulang');
    }
  };

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

    const selectedBudgetId = isBudgetSource(formData.category) ? getBudgetIdFromSource(formData.category) : null;
    const selectedBudget = selectedBudgetId ? budgets.find((budget) => budget.id === selectedBudgetId) : null;
    
    const newTransaction = {
      type: modalType,
      amount: Number(formData.amount),
      category: formData.category,
      source: formData.source,
      description: formData.description,
      date: formData.date,
      ...(selectedBudgetId ? {
        budgetId: selectedBudgetId,
        budgetName: getBudgetLabel(selectedBudgetId),
        budgetDanaSumber: selectedBudget?.danaSumber || 'uang_jajan'
      } : {}),
      createdAt: serverTimestamp()
    };

    if (user.isDemo) {
      setTransactions([
        {
          ...newTransaction,
          id: `demo-custom-${Date.now()}`,
          createdAt: new Date().toISOString()
        },
        ...transactions
      ]);
      alert('Transaksi demo berhasil ditambahkan!');
      setShowModal(false);
      setModalType('');
      resetForm();
      return;
    }

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
    'Makan & Minum', 'Galon', 'Transportasi', 'Hiburan', 'Belanja', 'Tagihan', 'Kesehatan', 'Pendidikan', 'Lainnya'
  ];

  const getFundLabel = (value) => incomeCategories.find(cat => cat.value === value)?.label || value;
  const isBudgetSource = (value) => String(value || '').startsWith('budget:');
  const getBudgetIdFromSource = (value) => String(value || '').replace('budget:', '');
  const getBudgetLabel = (budgetId) => budgets.find((budget) => budget.id === budgetId)?.namaBudget || 'Budget';
  const getMoneySourceLabel = (value) => {
    if (isBudgetSource(value)) {
      return getBudgetLabel(getBudgetIdFromSource(value));
    }

    return getFundLabel(value);
  };

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
        if (isBudgetSource(t.category)) {
          const relatedBudget = budgets.find((budget) => budget.id === (t.budgetId || getBudgetIdFromSource(t.category)));
          if (!relatedBudget && Object.prototype.hasOwnProperty.call(totals, t.budgetDanaSumber)) {
            totals[t.budgetDanaSumber] -= amount;
            totals.total -= amount;
          }
          return;
        }
        if (Object.prototype.hasOwnProperty.call(totals, t.category)) {
          totals[t.category] -= amount;
        }
        totals.total -= amount;
      }
    });

    budgets.forEach((budget) => {
      const amount = Number(budget.totalBudget) || 0;
      const sourceFund = budget.danaSumber || 'uang_jajan';
      const budgetDetails = calculateBudgetDetails(budget);
      const spentAmount = Number(budgetDetails.spentAmount) || 0;
      const overSpentAmount = Math.max(spentAmount - amount, 0);
      const reservedAmount = budgetDetails.status === 'selesai'
        ? spentAmount
        : amount + overSpentAmount;
      if (Object.prototype.hasOwnProperty.call(totals, sourceFund)) {
        totals[sourceFund] -= reservedAmount;
        totals.total -= reservedAmount;
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
  const hasMonthlyChartData = monthlyChartData.some((item) => item.income > 0 || item.expense > 0);
  const highestIncomeMonth = monthlyChartData.reduce((highest, item) => (
    item.income > highest.income ? item : highest
  ), monthlyChartData[0]);
  const highestExpenseMonth = monthlyChartData.reduce((highest, item) => (
    item.expense > highest.expense ? item : highest
  ), monthlyChartData[0]);
  const averageMonthlyExpense = monthlyChartData.reduce((sum, item) => sum + item.expense, 0) / monthlyChartData.length;
  const currentMonthData = monthlyChartData[monthlyChartData.length - 1];
  const currentMonthNet = (currentMonthData?.income || 0) - (currentMonthData?.expense || 0);
  const chartGridLines = [1, 0.75, 0.5, 0.25, 0];

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
    <div className={`min-h-screen ${darkMode ? 'bg-[#0e0f0c]' : 'bg-[#e8ebe6]'} text-[#0e0f0c] transition-colors duration-300`}>
      {/* Loading Indicator */}
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-[#9fe870] text-[#0e0f0c] px-6 py-3 rounded-full shadow-lg z-50 font-semibold">
          Loading...
        </div>
      )}

      {/* Navbar */}
      <nav className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white/90 border-black/5'} backdrop-blur-xl border-b sticky top-0 z-40`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-16 py-3 gap-3">
            <div className="flex items-center space-x-3">
              <div className="bg-[#9fe870] p-2 rounded-2xl shrink-0">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#0e0f0c]" />
              </div>
              <h1 className={`text-xl sm:text-3xl font-black tracking-normal ${darkMode ? 'text-[#9fe870]' : 'text-[#0e0f0c]'}`}>DuatDuit</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage('dashboard')}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === 'dashboard'
                    ? 'bg-[#9fe870] text-[#0e0f0c] shadow-sm'
                    : darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-[#e8ebe6] text-[#0e0f0c] hover:bg-[#dfe3dc]'
                }`}
              >
                <Wallet className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setActivePage('charts')}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === 'charts'
                    ? 'bg-[#9fe870] text-[#0e0f0c] shadow-sm'
                    : darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-[#e8ebe6] text-[#0e0f0c] hover:bg-[#dfe3dc]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Chart
              </button>
              <button
                onClick={() => setActivePage('budget')}
                className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activePage === 'budget'
                    ? 'bg-[#9fe870] text-[#0e0f0c] shadow-sm'
                    : darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-[#e8ebe6] text-[#0e0f0c] hover:bg-[#dfe3dc]'
                }`}
              >
                <Target className="w-4 h-4" />
                Budget
              </button>
              <span className={`hidden sm:block text-sm ${darkMode ? 'text-gray-300' : 'text-[#454745]'}`}>
                {user?.displayName || user?.email}
              </span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? 'bg-[#24261f] text-[#ffd11a]' : 'bg-[#e8ebe6] text-[#0e0f0c]'} hover:scale-110 transition-transform`}
                title="Ganti tema"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={onLogout}
                className={`p-2 rounded-full ${darkMode ? 'bg-[#24261f] text-gray-200' : 'bg-[#e8ebe6] text-[#0e0f0c]'} hover:scale-110 transition-transform`}
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className={`sm:hidden grid grid-cols-3 gap-2 mb-6 ${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} p-2 rounded-[24px] border wise-card-soft`}>
          <button
            onClick={() => setActivePage('dashboard')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
              activePage === 'dashboard'
                ? 'bg-[#9fe870] text-[#0e0f0c] shadow-sm'
                : darkMode
                ? 'text-gray-300'
                : 'text-[#454745]'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActivePage('charts')}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
              activePage === 'charts'
                ? 'bg-[#9fe870] text-[#0e0f0c] shadow-sm'
                : darkMode
                ? 'text-gray-300'
                : 'text-[#454745]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Chart
          </button>
          <button
            onClick={() => setActivePage('budget')}
            className={`flex items-center justify-center gap-2 px-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              activePage === 'budget'
                ? 'bg-[#9fe870] text-[#0e0f0c] shadow-sm'
                : darkMode
                ? 'text-gray-300'
                : 'text-[#454745]'
            }`}
          >
            <Target className="w-4 h-4" />
            Budget
          </button>
        </div>

        {activePage === 'dashboard' ? (
        <>
        <div className={`${darkMode ? 'bg-[#161712] text-[#9fe870] border-[#2a2d24]' : 'bg-[#e2f6d5] text-[#0e0f0c] border-black/5'} rounded-[24px] p-5 sm:p-8 mb-6 sm:mb-8 border wise-card transition-all duration-300`}>
        <div className="flex items-center justify-center mb-3">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
            <p className="text-base sm:text-lg font-semibold">Total Uang</p>
        </div>
        <h2 className="money-number money-hero font-black text-center">
            {formatCurrency(totals.total)}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-6 pt-6 border-t border-black/10">
            <div className="text-center">
            <p className="text-[#454745] text-sm mb-1">Pemasukan</p>
            <p className="money-number text-[#054d28] text-lg sm:text-xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="text-center">
            <p className="text-[#454745] text-sm mb-1">Pengeluaran</p>
            <p className="money-number text-[#d03238] text-lg sm:text-xl font-bold">{formatCurrency(totalExpense)}</p>
            </div>
        </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {incomeCategories.map((cat) => {
            const Icon = cat.icon;
            const amount = totals[cat.value];
            const percentage = totals.total > 0 ? (amount / totals.total) * 100 : 0;
            
            return (
            <div
                key={cat.value}
                className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-5 sm:p-6 wise-card hover:-translate-y-0.5 transition-all duration-300 border`}
            >
                <div className="flex items-center mb-4">
                <div className="bg-[#9fe870] p-3 rounded-2xl">
                    <Icon className="w-6 h-6 text-[#0e0f0c]" />
                </div>
                <h3 className={`ml-3 font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{cat.label}</h3>
                </div>
                <p className={`money-number money-card font-extrabold mb-4 ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>
                {formatCurrency(amount)}
                </p>
                <div className="w-full bg-[#e8ebe6] rounded-full h-2.5 mb-2">
                <div
                    className="bg-[#9fe870] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
                </div>
                <p className="text-sm text-[#454745]">{percentage.toFixed(1)}% dari total</p>
            </div>
            );
        })}
        </div>

        <div className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] wise-card p-4 sm:p-6 border`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Riwayat Transaksi</h2>
            <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold ${darkMode ? 'bg-[#24261f] text-white' : 'bg-[#e8ebe6] text-[#0e0f0c]'} hover:bg-[#dfe3dc] transition-all`}
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
                    ? 'bg-[#9fe870] text-[#0e0f0c] shadow-sm'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-[#e8ebe6] text-[#0e0f0c] hover:bg-[#dfe3dc]'
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
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Belum ada transaksi</p>
                <p className={`mt-2 mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Catat pemasukan atau pengeluaran pertama agar ringkasan keuanganmu mulai terbentuk.</p>
                <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-[#9fe870] text-[#0e0f0c] px-5 py-3 rounded-[24px] font-bold hover:bg-[#cdffad] transition-all"
                >
                <Plus className="w-4 h-4" />
                Tambah Transaksi
                </button>
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
                    className={`${darkMode ? 'bg-[#24261f] border-[#2a2d24]' : 'bg-[#f8faf6] border-black/5'} rounded-[20px] p-4 hover:shadow-sm transition-all border`}
                >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className={`p-2 rounded-2xl ${isIncome ? 'bg-[#e2f6d5]' : isTransfer ? 'bg-[#e8ebe6]' : 'bg-red-50'}`}>
                        {isIncome ? (
                            <ArrowUpCircle className="w-5 h-5 text-[#2ead4b]" />
                        ) : isTransfer ? (
                            <ArrowRightLeft className="w-5 h-5 text-[#454745]" />
                        ) : (
                            <ArrowDownCircle className="w-5 h-5 text-[#d03238]" />
                        )}
                        </div>
                        <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>
                            {isTransfer
                                ? `${getFundLabel(t.category)} ke ${getFundLabel(t.source)}`
                                : isIncome
                                ? categoryData?.label || t.category
                                : t.source}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${isIncome ? 'bg-[#e2f6d5] text-[#054d28]' : isTransfer ? 'bg-[#e8ebe6] text-[#454745]' : 'bg-red-50 text-[#a72027]'}`}>
                            {isIncome ? 'Pemasukan' : isTransfer ? 'Transfer' : 'Pengeluaran'}
                            </span>
                        </div>
                        {t.source && !isTransfer && (
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center gap-1`}>
                            <Tag className="w-3 h-3" />
                            {isIncome ? t.source : getMoneySourceLabel(t.category)}
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
                    <div className="text-left sm:text-right pl-12 sm:pl-0">
                        <p className={`money-number text-lg sm:text-xl font-black ${isIncome ? 'text-[#2ead4b]' : isTransfer ? 'text-[#454745]' : 'text-[#d03238]'}`}>
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
        ) : activePage === 'charts' ? (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 className={`text-2xl sm:text-4xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Chart Keuangan</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pemasukan dan pengeluaran 6 bulan terakhir</p>
            </div>
            <button
                onClick={() => setActivePage('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold transition-all ${darkMode ? 'bg-[#161712] text-gray-200 hover:bg-[#24261f]' : 'bg-white text-[#0e0f0c] hover:bg-[#f8faf6]'} border ${darkMode ? 'border-[#2a2d24]' : 'border-black/5'} wise-card-soft`}
            >
                <Wallet className="w-4 h-4" />
                Dashboard
            </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-5 sm:p-6 wise-card border`}>
                <div className="flex items-center justify-between mb-4">
                <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Pemasukan</p>
                <ArrowUpCircle className="w-6 h-6 text-[#2ead4b]" />
                </div>
                <p className={`money-number money-panel font-extrabold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{formatCurrency(totalIncome)}</p>
                <p className="text-sm text-[#2ead4b] mt-2">{incomePercentage.toFixed(1)}% dari arus uang</p>
            </div>
            <div className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-5 sm:p-6 wise-card border`}>
                <div className="flex items-center justify-between mb-4">
                <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Pengeluaran</p>
                <ArrowDownCircle className="w-6 h-6 text-[#d03238]" />
                </div>
                <p className={`money-number money-panel font-extrabold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{formatCurrency(totalExpense)}</p>
                <p className="text-sm text-[#d03238] mt-2">{expensePercentage.toFixed(1)}% dari arus uang</p>
            </div>
            <div className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-5 sm:p-6 wise-card border`}>
                <div className="flex items-center justify-between mb-4">
                <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Selisih Bersih</p>
                <TrendingUp className="w-6 h-6 text-[#0e0f0c]" />
                </div>
                <p className={`money-number money-panel font-extrabold ${totalIncome - totalExpense >= 0 ? 'text-[#2ead4b]' : 'text-[#d03238]'}`}>{formatCurrency(totalIncome - totalExpense)}</p>
                <div className="flex h-3 rounded-full overflow-hidden mt-4 bg-[#e8ebe6]">
                <div className="bg-[#9fe870]" style={{ width: `${incomePercentage}%` }} />
                <div className="bg-[#d03238]" style={{ width: `${expensePercentage}%` }} />
                </div>
            </div>
            </div>

            <div className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-4 sm:p-6 wise-card border overflow-hidden`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Tren Bulanan</h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
                    <span className="flex items-center gap-2 text-[#2ead4b]"><span className="w-3 h-3 rounded-full bg-[#9fe870]" /> Pemasukan</span>
                    <span className="flex items-center gap-2 text-[#d03238]"><span className="w-3 h-3 rounded-full bg-[#d03238]" /> Pengeluaran</span>
                    </div>
                </div>

                {hasMonthlyChartData ? (
                    <div className="relative h-64 sm:h-72 pl-0 sm:pl-14">
                    <div className="absolute inset-x-0 sm:left-14 top-0 bottom-10">
                        {chartGridLines.map((line) => (
                        <div
                            key={line}
                            className="absolute left-0 right-0 border-t border-black/5"
                            style={{ top: `${(1 - line) * 100}%` }}
                        >
                            <span className={`hidden sm:block -translate-y-1/2 -translate-x-14 text-[11px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            {line === 0 ? 'Rp 0' : formatCurrency(maxMonthlyAmount * line)}
                            </span>
                        </div>
                        ))}
                    </div>
                    <div className="relative z-10 grid grid-cols-6 gap-2 sm:gap-5 h-full pb-10">
                        {monthlyChartData.map((item) => (
                        <div key={item.label} className="flex flex-col justify-end min-w-0 h-full">
                            <div className="flex items-end justify-center gap-1 sm:gap-2 flex-1 min-h-0">
                            <div className="flex flex-col items-center justify-end h-full min-w-0">
                                {item.income > 0 && (
                                <span className={`hidden md:block money-number text-[11px] mb-1 whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-[#454745]'}`}>
                                    {formatCurrency(item.income)}
                                </span>
                                )}
                                <div
                                className="w-3 sm:w-7 rounded-t-xl bg-[#9fe870] transition-all"
                                title={`Pemasukan ${item.label}: ${formatCurrency(item.income)}`}
                                style={{ height: `${Math.max((item.income / maxMonthlyAmount) * 100, item.income > 0 ? 4 : 0)}%` }}
                                />
                            </div>
                            <div className="flex flex-col items-center justify-end h-full min-w-0">
                                {item.expense > 0 && (
                                <span className={`hidden md:block money-number text-[11px] mb-1 whitespace-nowrap ${darkMode ? 'text-gray-400' : 'text-[#454745]'}`}>
                                    {formatCurrency(item.expense)}
                                </span>
                                )}
                                <div
                                className="w-3 sm:w-7 rounded-t-xl bg-[#d03238] transition-all"
                                title={`Pengeluaran ${item.label}: ${formatCurrency(item.expense)}`}
                                style={{ height: `${Math.max((item.expense / maxMonthlyAmount) * 100, item.expense > 0 ? 4 : 0)}%` }}
                                />
                            </div>
                            </div>
                            <p className={`text-center text-xs sm:text-sm mt-3 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</p>
                        </div>
                        ))}
                    </div>
                    </div>
                ) : (
                    <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-[#f8faf6]'} rounded-[20px] p-8 text-center`}>
                    <BarChart3 className={`w-14 h-14 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Belum ada data chart</p>
                    <p className={`mt-2 mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tambah transaksi agar tren pemasukan dan pengeluaran bisa terbaca.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-[#9fe870] text-[#0e0f0c] px-5 py-3 rounded-[24px] font-bold hover:bg-[#cdffad] transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Transaksi
                    </button>
                    </div>
                )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:w-64">
                <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-[#f8faf6]'} rounded-[20px] p-4`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pemasukan tertinggi</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{highestIncomeMonth?.label || '-'}</p>
                    <p className="money-number text-sm text-[#2ead4b]">{formatCurrency(highestIncomeMonth?.income || 0)}</p>
                </div>
                <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-red-50'} rounded-[20px] p-4`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pengeluaran tertinggi</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{highestExpenseMonth?.label || '-'}</p>
                    <p className="money-number text-sm text-[#d03238]">{formatCurrency(highestExpenseMonth?.expense || 0)}</p>
                </div>
                <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-[#e8ebe6]'} rounded-[20px] p-4`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Rata-rata pengeluaran</p>
                    <p className={`money-number font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{formatCurrency(averageMonthlyExpense)}</p>
                </div>
                <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-[#e2f6d5]'} rounded-[20px] p-4`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Selisih bulan ini</p>
                    <p className={`money-number font-bold ${currentMonthNet >= 0 ? 'text-[#054d28]' : 'text-[#d03238]'}`}>{formatCurrency(currentMonthNet)}</p>
                </div>
                </div>
            </div>
            </div>

            <div className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-4 sm:p-6 wise-card border`}>
            <h3 className={`text-xl font-black mb-6 ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Kategori Pengeluaran</h3>
            {expenseBreakdown.length === 0 ? (
                <div className="text-center py-12">
                <BarChart3 className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Belum ada data pengeluaran</p>
                <p className={`mt-2 mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Catat pengeluaran pertama untuk melihat kategori terbesar.</p>
                <button
                    onClick={() => {
                    setShowModal(true);
                    setModalType('expense');
                    }}
                    className="inline-flex items-center gap-2 bg-[#9fe870] text-[#0e0f0c] px-5 py-3 rounded-[24px] font-bold hover:bg-[#cdffad] transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Pengeluaran
                </button>
                </div>
            ) : (
                <div className="space-y-4">
                {expenseBreakdown.map((item) => (
                    <div key={item.category}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 mb-2">
                        <p className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.category}</p>
                        <p className={`money-number font-bold whitespace-nowrap ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{formatCurrency(item.amount)}</p>
                    </div>
                    <div className="h-3 rounded-full bg-[#e8ebe6] overflow-hidden">
                        <div
                        className="h-full rounded-full bg-[#d03238]"
                        style={{ width: `${(item.amount / maxExpenseCategory) * 100}%` }}
                        />
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        ) : (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 className={`text-2xl sm:text-4xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Budget Bulanan</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pantau jatah harian berdasarkan sisa budget dan sisa hari</p>
            </div>
            <button
                onClick={() => {
                setEditingBudgetId(null);
                resetBudgetForm();
                setShowBudgetModal(true);
                }}
                className="bg-[#9fe870] text-[#0e0f0c] px-5 py-3 rounded-[24px] font-bold shadow-sm hover:bg-[#cdffad] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Tambah Budget
            </button>
            </div>

            {budgetsWithDetails.length === 0 ? (
            <div className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-8 sm:p-10 wise-card border text-center`}>
                <Target className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Belum ada budget bulanan</p>
                <p className={`mt-2 mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tambahkan budget bulanan agar DuatDuit bisa menghitung jatah harianmu secara otomatis.</p>
                <button
                onClick={() => {
                    setEditingBudgetId(null);
                    resetBudgetForm();
                    setShowBudgetModal(true);
                }}
                className="inline-flex items-center gap-2 bg-[#9fe870] text-[#0e0f0c] px-5 py-3 rounded-[24px] font-bold hover:bg-[#cdffad] transition-all"
                >
                <Plus className="w-4 h-4" />
                Tambah Budget
                </button>
            </div>
            ) : (
            <div className={`grid grid-cols-1 gap-5 sm:gap-6 ${budgetsWithDetails.length === 1 ? 'max-w-3xl' : 'lg:grid-cols-2'}`}>
                {budgetsWithDetails.map((budget) => (
                <div
                    key={budget.id}
                    className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-5 sm:p-6 wise-card border`}
                >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#9fe870] p-2 rounded-2xl shrink-0">
                            <Target className="w-5 h-5 text-[#0e0f0c]" />
                        </div>
                        <h3 className={`text-xl font-black break-words ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{budget.namaBudget}</h3>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{budget.kategori}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold w-fit ${getStatusStyle(budget.status)}`}>
                        {budget.status}
                        </span>
                        <button
                        onClick={() => handleEditBudget(budget)}
                        className={`${darkMode ? 'bg-[#24261f] text-gray-200' : 'bg-[#e8ebe6] text-[#0e0f0c]'} p-2 rounded-full hover:scale-105 transition-all`}
                        title="Edit budget"
                        >
                        <Pencil className="w-4 h-4" />
                        </button>
                        <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="bg-red-50 text-[#d03238] p-2 rounded-full hover:scale-105 transition-all"
                        title="Hapus budget"
                        >
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-[#f8faf6]'} rounded-[20px] p-3`}>
                        <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Sumber dana</p>
                        <p className={`text-lg font-black break-words ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{getFundLabel(budget.danaSumber || 'uang_jajan')}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-[#f8faf6]'} rounded-[20px] p-3`}>
                        <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Total budget</p>
                        <p className={`money-number text-lg font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{formatCurrency(budget.totalBudget)}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-red-50'} rounded-[20px] p-3`}>
                        <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Sudah terpakai</p>
                        <p className="money-number text-lg font-black text-[#d03238]">{formatCurrency(budget.spentAmount)}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-[#e2f6d5]'} rounded-[20px] p-3`}>
                        <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Sisa budget</p>
                        <p className={`money-number text-lg font-black ${budget.remainingBudget < 0 ? 'text-[#d03238]' : 'text-[#054d28]'}`}>{formatCurrency(budget.remainingBudget)}</p>
                    </div>
                    <div className={`${darkMode ? 'bg-[#24261f]' : 'bg-[#e2f6d5]'} rounded-[20px] p-4 sm:col-span-2`}>
                        <p className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Jatah ideal hari ini</p>
                        <p className={`money-number text-2xl font-black ${darkMode ? 'text-[#9fe870]' : 'text-[#054d28]'}`}>{formatCurrency(Math.round(budget.dailyBudget))} / hari</p>
                    </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-2">
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Progress</p>
                    <p className={`money-number text-sm font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{budget.progress.toFixed(0)}%</p>
                    </div>
                    <div className="h-3 rounded-full bg-[#e8ebe6] overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${
                        budget.status === 'melebihi budget'
                            ? 'bg-[#d03238]'
                            : budget.status === 'hampir habis' || budget.status === 'budget habis'
                            ? 'bg-[#ffd11a]'
                            : 'bg-[#9fe870]'
                        }`}
                        style={{ width: `${Math.min(budget.progress, 100)}%` }}
                    />
                    </div>
                    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-3 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Sisa hari: {budget.remainingDays} hari</span>
                    <span>{new Date(budget.startDate).toLocaleDateString('id-ID')} - {new Date(budget.endDate).toLocaleDateString('id-ID')}</span>
                    </div>
                </div>
                ))}
            </div>
            )}

            <div className={`${darkMode ? 'bg-[#161712] border-[#2a2d24]' : 'bg-white border-black/5'} rounded-[24px] p-5 sm:p-6 wise-card border`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Pengeluaran Berulang</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Atur kebutuhan rutin seperti galon atau langganan.</p>
                </div>
                <button
                onClick={() => {
                setEditingRecurringId(null);
                resetRecurringForm();
                setShowRecurringModal(true);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-[24px] font-bold transition-all ${darkMode ? 'bg-[#24261f] text-white hover:bg-[#2a2d24]' : 'bg-[#e8ebe6] text-[#0e0f0c] hover:bg-[#dfe3dc]'}`}
                >
                <Repeat className="w-4 h-4" />
                Tambah Berulang
                </button>
            </div>

            {recurringExpenses.length === 0 ? (
                <div className="text-center py-10">
                <Repeat className={`w-14 h-14 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Belum ada pengeluaran berulang</p>
                <p className={`mt-2 mb-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Atur kebutuhan rutin seperti galon agar jadwal pengeluaranmu lebih mudah dipantau.</p>
                <button
                onClick={() => {
                    setEditingRecurringId(null);
                    resetRecurringForm();
                    setShowRecurringModal(true);
                }}
                className="inline-flex items-center gap-2 bg-[#e8ebe6] text-[#0e0f0c] px-5 py-3 rounded-[24px] font-bold hover:bg-[#dfe3dc] transition-all"
                >
                <Plus className="w-4 h-4" />
                Tambah Berulang
                </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recurringExpenses.map((expense) => (
                    <div key={expense.id} className={`${darkMode ? 'bg-[#24261f] border-[#2a2d24]' : 'bg-[#f8faf6] border-black/5'} rounded-[20px] p-4 border`}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {expense.aktif ? <CheckCircle2 className="w-4 h-4 text-[#2ead4b] shrink-0" /> : <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0" />}
                            <h4 className={`font-bold break-words ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{expense.nama}</h4>
                        </div>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{expense.kategori} setiap {expense.intervalHari} hari</p>
                        </div>
                        <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleToggleRecurring(expense)}
                            className={`p-2 rounded-full transition-all ${darkMode ? 'bg-[#161712] text-gray-200' : 'bg-white text-[#454745]'} hover:scale-105`}
                            title={expense.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                            {expense.aktif ? <ToggleRight className="w-6 h-6 text-[#2ead4b]" /> : <ToggleLeft className="w-6 h-6" />}
                        </button>
                        <button
                            onClick={() => handleEditRecurring(expense)}
                            className={`p-2 rounded-full transition-all ${darkMode ? 'bg-[#161712] text-gray-200' : 'bg-white text-[#454745]'} hover:scale-105`}
                            title="Edit pengeluaran berulang"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteRecurring(expense.id)}
                            className="p-2 rounded-full bg-red-50 text-[#d03238] hover:scale-105 transition-all"
                            title="Hapus pengeluaran berulang"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Nominal</p>
                        <p className={`money-number font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{formatCurrency(expense.nominal)}</p>
                        </div>
                        <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sumber dana</p>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{getFundLabel(expense.danaSumber || 'uang_jajan')}</p>
                        </div>
                        <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal berikutnya</p>
                        <p className={`font-bold ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{new Date(expense.tanggalBerikutnya).toLocaleDateString('id-ID')}</p>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        )}
    </div>

    {activePage !== 'budget' && (
    <div className="group fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex items-center gap-3">
        <span className="hidden sm:block rounded-full bg-[#0e0f0c] px-3 py-2 text-xs font-semibold text-[#9fe870] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        Tambah transaksi
        </span>
        <button
        onClick={() => setShowModal(true)}
        className="bg-[#9fe870] text-[#0e0f0c] p-3 sm:p-4 rounded-full shadow-xl hover:bg-[#cdffad] hover:scale-110 transition-all duration-300"
        title="Tambah transaksi"
        >
        <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
    </div>
    )}

    {showModal && !modalType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${darkMode ? 'bg-[#161712]' : 'bg-white'} rounded-[24px] p-5 sm:p-8 max-w-md w-full wise-card transform transition-all`}>
            <div className="flex justify-between items-center gap-3 mb-6">
            <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>Tambah Transaksi</h2>
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
                className="w-full bg-[#9fe870] text-[#0e0f0c] py-4 rounded-[24px] font-bold hover:bg-[#cdffad] hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
            >
                <ArrowUpCircle className="w-6 h-6" />
                Tambah Pemasukan
            </button>
            <button
                onClick={() => setModalType('expense')}
                className="w-full bg-[#d03238] text-white py-4 rounded-[24px] font-bold hover:bg-[#a72027] hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
            >
                <ArrowDownCircle className="w-6 h-6" />
                Tambah Pengeluaran
            </button>
            <button
                onClick={() => setModalType('transfer')}
                className="w-full bg-[#e8ebe6] text-[#0e0f0c] py-4 rounded-[24px] font-bold hover:bg-[#dfe3dc] hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
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
        <div className={`${darkMode ? 'bg-[#161712]' : 'bg-white'} rounded-[24px] p-5 sm:p-8 max-w-md w-full wise-card transform transition-all my-4 sm:my-8`}>
            <div className="flex justify-between items-center gap-3 mb-6">
            <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>
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
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
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
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                >
                <option value="">Pilih kategori</option>
                {incomeCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
                {modalType === 'expense' && activeBudgetOptions.length > 0 && (
                    <optgroup label="Budget">
                    {activeBudgetOptions.map((budget) => (
                        <option key={budget.id} value={`budget:${budget.id}`}>
                        {budget.namaBudget} - sisa {formatCurrency(budget.remainingBudget)}
                        </option>
                    ))}
                    </optgroup>
                )}
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
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
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
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
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
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
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
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                />
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Deskripsi (opsional)
                </label>
                <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                rows="3"
                placeholder="Catatan tambahan..."
                />
            </div>

            <button
                onClick={handleSubmit}
                className="w-full py-4 rounded-[24px] font-bold text-[#0e0f0c] hover:bg-[#cdffad] hover:scale-[1.01] transition-all bg-[#9fe870]"
            >
                {modalType === 'transfer' ? 'Simpan Transfer' : 'Simpan Transaksi'}
            </button>
            </div>
        </div>
        </div>
    )}

    {showBudgetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className={`${darkMode ? 'bg-[#161712]' : 'bg-white'} rounded-[24px] p-5 sm:p-8 max-w-md w-full wise-card my-4 sm:my-8`}>
            <div className="flex justify-between items-center gap-3 mb-6">
            <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{editingBudgetId ? 'Edit Budget' : 'Tambah Budget'}</h2>
            <button
                onClick={() => {
                setShowBudgetModal(false);
                setEditingBudgetId(null);
                resetBudgetForm();
                }}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
                <X className="w-6 h-6" />
            </button>
            </div>

            <div className="space-y-5">
            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nama budget *
                </label>
                <input
                type="text"
                value={budgetForm.namaBudget}
                onChange={(e) => setBudgetForm({ ...budgetForm, namaBudget: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                placeholder="Makan & Minum"
                />
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Kategori *
                </label>
                <select
                value={budgetForm.kategori}
                onChange={(e) => setBudgetForm({ ...budgetForm, kategori: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                >
                <option value="">Pilih kategori</option>
                {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nominal budget (Rp) *
                </label>
                <input
                type="number"
                min="1"
                value={budgetForm.totalBudget}
                onChange={(e) => setBudgetForm({ ...budgetForm, totalBudget: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                placeholder="1500000"
                />
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ambil dari dana *
                </label>
                <select
                value={budgetForm.danaSumber}
                onChange={(e) => setBudgetForm({ ...budgetForm, danaSumber: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                >
                <option value="">Pilih dana</option>
                {incomeCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tanggal mulai *
                </label>
                <input
                    type="date"
                    value={budgetForm.startDate}
                    onChange={(e) => setBudgetForm({ ...budgetForm, startDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                />
                </div>
                <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tanggal selesai *
                </label>
                <input
                    type="date"
                    value={budgetForm.endDate}
                    onChange={(e) => setBudgetForm({ ...budgetForm, endDate: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                />
                </div>
            </div>

            <button
                onClick={handleBudgetSubmit}
                className="w-full py-4 rounded-[24px] font-bold text-[#0e0f0c] hover:bg-[#cdffad] hover:scale-[1.01] transition-all bg-[#9fe870]"
            >
                {editingBudgetId ? 'Update Budget' : 'Simpan Budget'}
            </button>
            </div>
        </div>
        </div>
    )}

    {showRecurringModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className={`${darkMode ? 'bg-[#161712]' : 'bg-white'} rounded-[24px] p-5 sm:p-8 max-w-md w-full wise-card my-4 sm:my-8`}>
            <div className="flex justify-between items-center gap-3 mb-6">
            <h2 className={`text-xl sm:text-2xl font-black ${darkMode ? 'text-white' : 'text-[#0e0f0c]'}`}>{editingRecurringId ? 'Edit Pengeluaran Berulang' : 'Tambah Pengeluaran Berulang'}</h2>
            <button
                onClick={() => {
                setShowRecurringModal(false);
                setEditingRecurringId(null);
                resetRecurringForm();
                }}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            >
                <X className="w-6 h-6" />
            </button>
            </div>

            <div className="space-y-5">
            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nama pengeluaran *
                </label>
                <input
                type="text"
                value={recurringForm.nama}
                onChange={(e) => setRecurringForm({ ...recurringForm, nama: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                placeholder="Galon"
                />
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Kategori *
                </label>
                <select
                value={recurringForm.kategori}
                onChange={(e) => setRecurringForm({ ...recurringForm, kategori: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                >
                <option value="">Pilih kategori</option>
                {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Nominal (Rp) *
                </label>
                <input
                type="number"
                min="1"
                value={recurringForm.nominal}
                onChange={(e) => setRecurringForm({ ...recurringForm, nominal: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                placeholder="20000"
                />
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ambil dari dana *
                </label>
                <select
                value={recurringForm.danaSumber}
                onChange={(e) => setRecurringForm({ ...recurringForm, danaSumber: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                >
                <option value="">Pilih dana</option>
                {incomeCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
                </select>
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Interval hari *
                </label>
                <input
                type="number"
                min="1"
                value={recurringForm.intervalHari}
                onChange={(e) => setRecurringForm({ ...recurringForm, intervalHari: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                placeholder="15"
                />
            </div>

            <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tanggal mulai *
                </label>
                <input
                type="date"
                value={recurringForm.tanggalMulai}
                onChange={(e) => setRecurringForm({ ...recurringForm, tanggalMulai: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-[#24261f] border-[#3a3d33] text-white' : 'bg-white border-[#0e0f0c]/25 text-[#0e0f0c]'} focus:ring-2 focus:ring-[#9fe870] focus:border-[#0e0f0c] transition-all`}
                />
            </div>

            <button
                onClick={handleRecurringSubmit}
                className="w-full py-4 rounded-[24px] font-bold text-[#0e0f0c] hover:bg-[#cdffad] hover:scale-[1.01] transition-all bg-[#9fe870]"
            >
                {editingRecurringId ? 'Update Pengeluaran Berulang' : 'Simpan Pengeluaran Berulang'}
            </button>
            </div>
        </div>
        </div>
    )}
    </div>
  );
};

export default DuaTduit;



