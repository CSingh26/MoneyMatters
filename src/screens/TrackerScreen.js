import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, Alert, Animated, Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ChevronLeft,
  ChevronRight, Car, Landmark, Laptop, Home, Target, ArrowLeft,
  X, Edit3, Trash2, Search, Filter, Sun, Moon, Calendar,
  ShoppingBag, Coffee, CreditCard, DollarSign, Briefcase, Heart,
} from 'lucide-react-native';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import {
  getFinanceSummary, listIncome, addIncome, updateIncome, deleteIncome,
  listVariableExpenses, addVariableExpense, updateVariableExpense, deleteVariableExpense,
  listFixedExpenses, listAssets, addAsset, updateAsset, deleteAsset,
  listSavings, addSavings, updateSavings, deleteSavings,
} from '../api/finance';
import { FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';
import { useTheme } from '../ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const assetIcons = { car: Car, piggyBank: PiggyBank, laptop: Laptop, trendingUp: TrendingUp, home: Home, real_estate: Home, vehicle: Car, electronics: Laptop, jewelry: Heart, collectibles: Briefcase, furniture: ShoppingBag, other: Wallet };
const ASSET_TYPES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'other', label: 'Other' },
];
const categoryIcons = {
  Food: Coffee, Transport: Car, Shopping: ShoppingBag, Mortgage: Home,
  Insurance: Heart, Loan: CreditCard, Salary: DollarSign, Freelance: Briefcase,
};
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Mortgage', 'Insurance', 'Loan', 'Salary', 'Freelance', 'Other'];
const ITEMS_PER_PAGE = 8;

const SAVINGS_TYPES = [
  { value: 'liquid_savings', label: 'Liquid Savings' },
  { value: 'stocks', label: 'Stocks' },
  { value: 'index_funds', label: 'Index Funds' },
  { value: 'retirement_401k', label: '401(k)' },
  { value: 'ira', label: 'IRA' },
  { value: 'locked_cd', label: 'Locked CD' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Other' },
];

// Map frontend categories ↔ backend variable expense categories
const categoryToBackend = {
  Food: 'food_groceries', Transport: 'transport', Shopping: 'shopping',
  Mortgage: 'misc', Insurance: 'misc', Loan: 'misc',
  Salary: 'misc', Freelance: 'misc', Other: 'misc',
};
const backendToCategory = {
  food_groceries: 'Food', dining_out: 'Food', gas: 'Transport', transport: 'Transport',
  shopping: 'Shopping', entertainment: 'Shopping', healthcare: 'Insurance', misc: 'Other',
};

export default function TrackerScreen({ user, navigation }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const [allTransactions, setAllTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [trendView, setTrendView] = useState('monthly');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [tooltipData, setTooltipData] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [savingsGoal, setSavingsGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Historical data — computed from transactions
  const monthlyData = useMemo(() => {
    if (allTransactions.length === 0) return [];
    const months = {};
    allTransactions.forEach(t => {
      const key = t.date.slice(0, 7); // YYYY-MM
      if (!months[key]) months[key] = { income: 0, expenses: 0 };
      if (t.type === 'Income') months[key].income += t.amount;
      else months[key].expenses += t.amount;
    });
    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
    return sorted.map(([key, val]) => {
      const [, m] = key.split('-');
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return { month: monthNames[parseInt(m, 10) - 1], income: val.income, expenses: val.expenses };
    });
  }, [allTransactions]);

  const yearlyData = useMemo(() => {
    if (allTransactions.length === 0) return [];
    const years = {};
    allTransactions.forEach(t => {
      const yr = t.date.slice(0, 4);
      if (!years[yr]) years[yr] = { income: 0, expenses: 0 };
      if (t.type === 'Income') years[yr].income += t.amount;
      else years[yr].expenses += t.amount;
    });
    return Object.entries(years).sort((a, b) => a[0].localeCompare(b[0]))
      .map(([yr, val]) => ({ year: yr, income: val.income, expenses: val.expenses }));
  }, [allTransactions]);

  const spendingByCategory = useMemo(() => {
    const catColors = { Food: '#FF6384', Transport: '#36A2EB', Shopping: '#FFCE56', Insurance: '#4BC0C0', Other: '#9966FF', Mortgage: '#FF9F40', Loan: '#C9CBCF', Freelance: '#7B5EA7', Salary: '#00B894' };
    const cats = {};
    allTransactions.filter(t => t.type === 'Expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value), color: catColors[name] || '#999' }));
  }, [allTransactions]);

  const [assets, setAssets] = useState([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetForm, setAssetForm] = useState({ name: '', type: 'other', estimatedValue: '', description: '' });
  const [savingsItems, setSavingsItems] = useState([]);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [editingSavings, setEditingSavings] = useState(null);
  const [savingsForm, setSavingsForm] = useState({ type: 'liquid_savings', description: '', currentBalance: '', monthlySavings: '' });
  const [formData, setFormData] = useState({
    type: 'Expense', category: 'Food', amount: '', date: new Date().toISOString().split('T')[0],
    description: '', note: '',
  });

  // Load all financial data from backend
  const loadAllData = useCallback(async () => {
    try {
      const [incomeItems, variableItems, fixedItems, summaryData, assetItems, savingsData] = await Promise.all([
        listIncome().catch(() => []),
        listVariableExpenses().catch(() => []),
        listFixedExpenses().catch(() => []),
        getFinanceSummary().catch(() => null),
        listAssets().catch(() => []),
        listSavings().catch(() => []),
      ]);

      // Normalize income items → transactions
      const incomeTxns = (incomeItems || []).map(item => ({
        id: item.id,
        type: 'Income',
        category: 'Salary',
        amount: parseFloat(item.monthlyAmount || item.amount || 0),
        date: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        description: item.name,
        note: `Frequency: ${item.frequency || 'monthly'}`,
        _backendType: 'income',
      }));

      // Normalize variable expenses → transactions
      const expenseTxns = (variableItems || []).map(item => ({
        id: item.id,
        type: 'Expense',
        category: backendToCategory[item.category] || 'Other',
        amount: parseFloat(item.estimatedMonthly || 0),
        date: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        description: item.name,
        note: '',
        _backendType: 'variable',
        _backendCategory: item.category,
      }));

      // Normalize fixed expenses → transactions (read-only display)
      const fixedTxns = (fixedItems || []).map(item => ({
        id: item.id,
        type: 'Expense',
        category: backendToCategory[item.category] || item.category || 'Other',
        amount: parseFloat(item.monthlyAmount || 0),
        date: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        description: item.name,
        note: `Fixed: ${item.frequency || 'monthly'}`,
        _backendType: 'fixed',
      }));

      setAllTransactions([...incomeTxns, ...expenseTxns, ...fixedTxns].sort((a, b) => b.date.localeCompare(a.date)));

      // Load assets
      setAssets((assetItems || []).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        value: parseFloat(a.estimatedValue || 0),
        description: a.description || '',
        purchaseDate: a.purchaseDate,
        icon: a.type,
        category: (ASSET_TYPES.find(t => t.value === a.type) || {}).label || 'Other',
      })));

      // Load savings items
      setSavingsItems((savingsData || []).map(s => ({
        id: s.id,
        type: s.type,
        description: s.description || '',
        currentBalance: parseFloat(s.currentBalance || 0),
        monthlySavings: parseFloat(s.monthlySavings || 0),
        label: (SAVINGS_TYPES.find(t => t.value === s.type) || {}).label || 'Other',
        createdAt: s.createdAt,
      })));

      if (summaryData) {
        setFinancialSummary({
          totalBalance: summaryData.totalSavingsBalance,
          monthlyIncome: summaryData.totalMonthlyIncome,
          monthlyExpenses: summaryData.totalMonthlyExpenses,
          savingsRate: summaryData.savingsRate,
        });
        if (summaryData.goals && summaryData.goals.length > 0) {
          const goal = summaryData.goals[0];
          setSavingsGoal({ name: goal.name, target: goal.target, current: goal.current, deadline: goal.deadline });
        }
      }
    } catch (err) {
      console.warn('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const resetForm = () => {
    setFormData({ type: 'Expense', category: 'Food', amount: '', date: new Date().toISOString().split('T')[0], description: '', note: '' });
    setEditingTxn(null);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let list = allTransactions;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    if (filterCategory !== 'All') {
      list = list.filter(t => t.category === filterCategory);
    }
    return list;
  }, [allTransactions, searchQuery, filterCategory]);

  // Compute dynamic summary
  const dynamicSummary = useMemo(() => {
    const totalIncome = allTransactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = allTransactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
    const net = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, net };
  }, [allTransactions]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups = {};
    paginatedTransactions.forEach(txn => {
      if (!groups[txn.date]) groups[txn.date] = [];
      groups[txn.date].push(txn);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [paginatedTransactions]);

  // CRUD Operations — persisted to backend
  const handleSaveTransaction = async () => {
    if (!formData.amount || !formData.description) return;
    const amount = parseFloat(formData.amount);

    try {
      if (editingTxn) {
        // UPDATE
        if (editingTxn._backendType === 'income' || formData.type === 'Income') {
          await updateIncome(editingTxn.id, { name: formData.description, amount, frequency: 'monthly' });
        } else if (editingTxn._backendType === 'variable' || formData.type === 'Expense') {
          await updateVariableExpense(editingTxn.id, {
            name: formData.description,
            category: categoryToBackend[formData.category] || 'misc',
            estimatedMonthly: amount,
          });
        }
      } else {
        // CREATE
        if (formData.type === 'Income') {
          await addIncome({ name: formData.description, amount, frequency: 'monthly' });
        } else {
          await addVariableExpense({
            name: formData.description,
            category: categoryToBackend[formData.category] || 'misc',
            estimatedMonthly: amount,
          });
        }
      }
      // Reload all data from backend
      await loadAllData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save transaction');
    }

    setShowFormModal(false);
    resetForm();
    setCurrentPage(1);
  };

  const handleEditTransaction = (txn) => {
    setEditingTxn(txn);
    setFormData({ type: txn.type, category: txn.category, amount: String(txn.amount), date: txn.date, description: txn.description, note: txn.note || '' });
    setShowFormModal(true);
  };

  const handleDeleteTransaction = (txn) => {
    Alert.alert('Delete Transaction', `Are you sure you want to delete "${txn.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          if (txn._backendType === 'income') {
            await deleteIncome(txn.id);
          } else if (txn._backendType === 'variable') {
            await deleteVariableExpense(txn.id);
          }
          await loadAllData();
        } catch (err) {
          Alert.alert('Error', err.message || 'Failed to delete');
        }
      }},
    ]);
  };

  const goalProgress = savingsGoal
    ? ((savingsGoal.current / savingsGoal.target) * 100).toFixed(0)
    : 0;

  // ── Asset CRUD ──
  const resetAssetForm = () => {
    setAssetForm({ name: '', type: 'other', estimatedValue: '', description: '' });
    setEditingAsset(null);
  };

  const handleSaveAsset = async () => {
    if (!assetForm.name || !assetForm.estimatedValue) return;
    try {
      const payload = {
        name: assetForm.name,
        type: assetForm.type,
        estimatedValue: parseFloat(assetForm.estimatedValue),
        description: assetForm.description || undefined,
      };
      if (editingAsset) {
        await updateAsset(editingAsset.id, payload);
      } else {
        await addAsset(payload);
      }
      await loadAllData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save asset');
    }
    setShowAssetModal(false);
    resetAssetForm();
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({ name: asset.name, type: asset.type, estimatedValue: String(asset.value), description: asset.description || '' });
    setShowAssetModal(true);
  };

  const handleDeleteAsset = (asset) => {
    Alert.alert('Delete Asset', `Are you sure you want to delete "${asset.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteAsset(asset.id);
          await loadAllData();
        } catch (err) {
          Alert.alert('Error', err.message || 'Failed to delete');
        }
      }},
    ]);
  };

  // ── Savings CRUD ──
  const resetSavingsForm = () => {
    setSavingsForm({ type: 'liquid_savings', description: '', currentBalance: '', monthlySavings: '' });
    setEditingSavings(null);
  };

  const handleSaveSavingsItem = async () => {
    if (!savingsForm.currentBalance) return;
    try {
      const payload = {
        type: savingsForm.type,
        description: savingsForm.description || undefined,
        currentBalance: parseFloat(savingsForm.currentBalance),
        monthlySavings: parseFloat(savingsForm.monthlySavings || '0'),
      };
      if (editingSavings) {
        await updateSavings(editingSavings.id, payload);
      } else {
        await addSavings(payload);
      }
      await loadAllData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save savings item');
    }
    setShowSavingsModal(false);
    resetSavingsForm();
  };

  const handleEditSavingsItem = (item) => {
    setEditingSavings(item);
    setSavingsForm({ type: item.type, description: item.description || '', currentBalance: String(item.currentBalance), monthlySavings: String(item.monthlySavings) });
    setShowSavingsModal(true);
  };

  const handleDeleteSavingsItem = (item) => {
    Alert.alert('Delete Savings', `Are you sure you want to delete this ${item.label} item?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteSavings(item.id);
          await loadAllData();
        } catch (err) {
          Alert.alert('Error', err.message || 'Failed to delete');
        }
      }},
    ]);
  };

  // Trend chart data
  const trendChartData = useMemo(() => {
    if (trendView === 'monthly') {
      const maxVal = Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)), 1000);
      return {
        income: monthlyData.map(m => ({ value: m.income, label: m.month })),
        expenses: monthlyData.map(m => ({ value: m.expenses, label: m.month })),
        maxValue: Math.ceil(maxVal / 1000) * 1000,
      };
    }
    const maxVal = Math.max(...yearlyData.map(y => Math.max(y.income, y.expenses)), 1000);
    return {
      income: yearlyData.map(y => ({ value: y.income, label: y.year })),
      expenses: yearlyData.map(y => ({ value: y.expenses, label: y.year })),
      maxValue: Math.ceil(maxVal / 1000) * 1000,
    };
  }, [trendView, monthlyData, yearlyData]);

  // Bar chart data
  const barData = useMemo(() => {
    const data = [];
    const source = trendView === 'monthly' ? monthlyData : yearlyData;
    source.forEach(m => {
      const inc = m.income || 0;
      const exp = m.expenses || 0;
      data.push({
        value: inc, label: m.month || m.year, labelWidth: 30, spacing: 2,
        frontColor: isDark ? '#7B5EA7' : '#FF4081',
        topLabelComponent: () => <Text style={{ fontSize: 8, color: colors.gray400, marginBottom: 1 }}>{(inc/1000).toFixed(1)}k</Text>,
      });
      data.push({
        value: exp,
        frontColor: isDark ? '#E040FB' : '#AB47BC',
        topLabelComponent: () => <Text style={{ fontSize: 8, color: colors.gray400, marginBottom: 1 }}>{(exp/1000).toFixed(1)}k</Text>,
      });
    });
    return data;
  }, [trendView, isDark, colors, monthlyData, yearlyData]);

  // Pie chart data
  const pieData = spendingByCategory.map(c => ({
    value: c.value, color: c.color, text: c.name, textColor: colors.gray600, textSize: 10,
  }));

  const accentColor = isDark ? colors.accent : '#FF4081';
  const secondaryAccent = isDark ? '#9B7BD4' : '#AB47BC';

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgPrimary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Hub')} style={[styles.backBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <ArrowLeft size={20} color={accentColor} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: colors.gray800 }]}>Financial Tracker</Text>
            <Text style={[styles.pageSubtitle, { color: colors.gray500 }]}>Monitor your finances and track spending</Text>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: colors.gray50 }]}>
            {isDark ? <Sun size={18} color="#FDCB6E" /> : <Moon size={18} color="#6C5CE7" />}
          </TouchableOpacity>
        </View>

        {/* ═══ HERO TREND CHART ═══ */}
        <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Income & Expense Trend</Text>
          </View>
          {trendChartData.income.length > 0 ? (
            <>
              {/* Toggle */}
              <View style={[styles.segmentControl, { backgroundColor: colors.gray50 }]}>
                {['monthly', 'yearly'].map(view => (
                  <TouchableOpacity
                    key={view}
                    style={[styles.segmentBtn, trendView === view && { backgroundColor: colors.cardBg, ...Shadows.sm }]}
                    onPress={() => setTrendView(view)}
                  >
                    <Text style={[styles.segmentText, { color: trendView === view ? colors.gray800 : colors.gray400 }]}>
                      {view === 'monthly'
                        ? `Monthly (${monthlyData.length} mo)`
                        : `Yearly (${yearlyData.length} yr)`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
          {/* Line Chart */}
          <View style={styles.chartContainer}>
            <LineChart
              data={trendChartData.income}
              data2={trendChartData.expenses}
              height={200}
              spacing={Math.max(16, Math.floor((screenWidth - 80) / Math.max(trendChartData.income.length, 1)))}
              color1={accentColor}
              color2={secondaryAccent}
              dataPointsColor1={accentColor}
              dataPointsColor2={secondaryAccent}
              startFillColor1={accentColor}
              startFillColor2={secondaryAccent}
              endFillColor1="transparent"
              endFillColor2="transparent"
              startOpacity={0.2}
              endOpacity={0}
              areaChart
              curved
              thickness={2.5}
              hideDataPoints={false}
              textFontSize={0}
              xAxisColor={colors.gray200}
              yAxisColor="transparent"
              yAxisTextStyle={{ color: colors.gray500, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.gray500, fontSize: 10 }}
              noOfSections={4}
              maxValue={trendChartData.maxValue}
              isAnimated
              animationDuration={800}
              pointerConfig={{
                pointerStripHeight: 200,
                pointerStripColor: colors.gray300,
                pointerStripWidth: 1,
                pointerColor: accentColor,
                radius: 4,
                pointerLabelWidth: 100,
                pointerLabelHeight: 50,
                activatePointersOnLongPress: false,
                autoAdjustPointerLabelPosition: true,
                pointerLabelComponent: (items) => {
                  return (
                    <View style={[styles.tooltipBox, { backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF', borderColor: colors.gray200 }]}>
                      {items.map((item, i) => (
                        <Text key={i} style={[styles.tooltipText, { color: i === 0 ? accentColor : secondaryAccent }]}>
                          {i === 0 ? 'Inc' : 'Exp'}: ${item.value >= 1000 ? `$${(item.value/1000).toFixed(1)}k` : `$${item.value}`}
                        </Text>
                      ))}
                    </View>
                  );
                },
              }}
            />
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: accentColor }]} />
              <Text style={[styles.legendText, { color: colors.gray500 }]}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: secondaryAccent }]} />
              <Text style={[styles.legendText, { color: colors.gray500 }]}>Expenses</Text>
            </View>
          </View>
            </>
          ) : (
            <EmptyState icon={TrendingUp} title="No trend data yet" message="Add income and expenses to see your financial trends" />
          )}
        </View>

        {/* ═══ SUMMARY STAT CARDS ═══ */}
        <View style={styles.statsGrid}>
          <View style={[styles.statMiniCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <TrendingUp size={20} color={colors.success} />
            <Text style={[styles.statMiniValue, { color: colors.gray800 }]}>${dynamicSummary.totalIncome.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Text>
            <Text style={[styles.statMiniLabel, { color: colors.gray500 }]}>Total Income</Text>
            <Text style={[styles.deltaText, { color: colors.success }]}>↑ +3.2%</Text>
          </View>
          <View style={[styles.statMiniCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <TrendingDown size={20} color={colors.danger} />
            <Text style={[styles.statMiniValue, { color: colors.gray800 }]}>${dynamicSummary.totalExpenses.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Text>
            <Text style={[styles.statMiniLabel, { color: colors.gray500 }]}>Total Expenses</Text>
            <Text style={[styles.deltaText, { color: colors.danger }]}>↓ -1.5%</Text>
          </View>
          <View style={[styles.statMiniCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder, borderTopColor: colors.success, borderTopWidth: 3 }]}>
            <PiggyBank size={20} color={colors.success} />
            <Text style={[styles.statMiniValue, { color: colors.success }]}>${dynamicSummary.net.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</Text>
            <Text style={[styles.statMiniLabel, { color: colors.gray500 }]}>Net Savings</Text>
            <Text style={[styles.deltaText, { color: colors.success }]}>↑ {financialSummary?.savingsRate ?? 0}%</Text>
          </View>
        </View>

        {/* ═══ BAR CHART ═══ */}
        <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Income vs Expenses</Text>
            <View style={[styles.badge, { backgroundColor: colors.primary50 }]}>
              <Text style={[styles.badgeText, { color: isDark ? colors.primary600 : '#6C5CE7' }]}>
                {trendView === 'monthly'
                  ? `Last ${Math.min(6, monthlyData.length)} Months`
                  : `Last ${yearlyData.length} Years`}
              </Text>
            </View>
          </View>
          {barData.length > 0 ? (
            <>
              <View style={styles.chartContainer}>
                <BarChart
                  data={barData}
                  barWidth={Math.max(8, Math.floor((screenWidth - 100) / Math.max(barData.length * 2, 1)))}
                  spacing={Math.max(4, Math.floor((screenWidth - 100) / Math.max(barData.length * 3, 1)))}
                  initialSpacing={8}
                  roundedTop
                  roundedBottom={false}
                  xAxisThickness={0}
                  yAxisThickness={0}
                  yAxisTextStyle={{ color: colors.gray500, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: colors.gray500, fontSize: 9 }}
                  noOfSections={4}
                  maxValue={Math.max(...barData.map(d => d.value), 1000)}
                  height={200}
                  isAnimated
                  animationDuration={600}
                  labelsDistanceFromXaxis={0}
                />
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: isDark ? '#7B5EA7' : '#FF4081' }]} />
                  <Text style={[styles.legendText, { color: colors.gray500 }]}>Income</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: isDark ? '#E040FB' : '#AB47BC' }]} />
                  <Text style={[styles.legendText, { color: colors.gray500 }]}>Expenses</Text>
                </View>
              </View>
            </>
          ) : (
            <EmptyState icon={TrendingUp} title="No comparison data" message="Add financial data to compare income vs expenses" />
          )}
        </View>

        {/* ═══ DONUT CHART ═══ */}
        <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Spending Breakdown</Text>
            <View style={[styles.badge, { backgroundColor: colors.blue50 }]}>
              <Text style={[styles.badgeText, { color: isDark ? colors.blue600 : '#2563EB' }]}>By Category</Text>
            </View>
          </View>
          {pieData.length > 0 ? (
            <>
              <View style={styles.donutContainer}>
                <PieChart
                  data={pieData}
                  donut
                  radius={90}
                  innerRadius={55}
                  innerCircleColor={colors.cardBg}
                  centerLabelComponent={() => {
                    const total = spendingByCategory.reduce((s, c) => s + c.value, 0);
                    return (
                      <View style={styles.donutCenter}>
                        <Text style={[styles.donutTotal, { color: colors.gray800 }]}>${total.toLocaleString()}</Text>
                        <Text style={[styles.donutLabel, { color: colors.gray500 }]}>Total</Text>
                      </View>
                    );
                  }}
                  isAnimated
                />
              </View>
              <View style={styles.categoryLegend}>
                {spendingByCategory.map((c, i) => (
                  <View key={i} style={styles.categoryItem}>
                    <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                    <Text style={[styles.categoryName, { color: colors.gray600 }]}>{c.name}</Text>
                    <Text style={[styles.categoryValue, { color: colors.gray800 }]}>${c.value}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <EmptyState icon={PiggyBank} title="No spending data" message="Track your expenses to see a category breakdown" />
          )}
        </View>

        {/* ═══ TRANSACTIONS (FULL CRUD) ═══ */}
        <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Transactions</Text>
            <TouchableOpacity
              style={[styles.addFab, { backgroundColor: accentColor }]}
              onPress={() => { resetForm(); setShowFormModal(true); }}
            >
              <Plus size={16} color="#FFF" />
              <Text style={styles.addFabText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Search & Filter */}
          <View style={styles.searchRow}>
            <View style={[styles.searchBox, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]}>
              <Search size={16} color={colors.gray400} />
              <TextInput
                style={[styles.searchInput, { color: colors.gray800 }]}
                placeholder="Search transactions..."
                placeholderTextColor={colors.gray400}
                value={searchQuery}
                onChangeText={(t) => { setSearchQuery(t); setCurrentPage(1); }}
              />
            </View>
          </View>
          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {['All', ...CATEGORIES].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, {
                  backgroundColor: filterCategory === cat ? accentColor : colors.gray50,
                  borderColor: filterCategory === cat ? accentColor : colors.gray200,
                }]}
                onPress={() => { setFilterCategory(cat); setCurrentPage(1); }}
              >
                <Text style={[styles.filterChipText, { color: filterCategory === cat ? '#FFF' : colors.gray600 }]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Transaction List Grouped by Date */}
          {groupedTransactions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.gray400 }]}>No transactions found</Text>
            </View>
          )}
          {groupedTransactions.map(([date, txns]) => (
            <View key={date} style={styles.txnGroup}>
              <Text style={[styles.txnGroupDate, { color: colors.gray500 }]}>{date}</Text>
              {txns.map(txn => {
                const CatIcon = categoryIcons[txn.category] || DollarSign;
                return (
                  <View key={txn.id} style={[styles.txnRow, { borderBottomColor: colors.gray100 }]}>
                    <View style={[styles.txnIconBox, { backgroundColor: txn.type === 'Income' ? colors.successLight : colors.warningLight }]}>
                      <CatIcon size={16} color={txn.type === 'Income' ? '#059669' : '#D97706'} />
                    </View>
                    <View style={styles.txnInfo}>
                      <Text style={[styles.txnDesc, { color: colors.gray800 }]}>{txn.description}</Text>
                      <Text style={[styles.txnCategory, { color: colors.gray400 }]}>{txn.category}</Text>
                    </View>
                    <Text style={[styles.txnAmount, { color: txn.type === 'Income' ? colors.success : colors.gray700 }]}>
                      {txn.type === 'Income' ? '+' : '-'}${txn.amount.toFixed(2)}
                    </Text>
                    <View style={styles.txnActions}>
                      <TouchableOpacity onPress={() => handleEditTransaction(txn)} style={styles.txnActionBtn}>
                        <Edit3 size={14} color={colors.gray400} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteTransaction(txn)} style={styles.txnActionBtn}>
                        <Trash2 size={14} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {/* Pagination */}
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, { backgroundColor: colors.gray100 }, currentPage === 1 && styles.pageBtnDisabled]}
              onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} color={currentPage === 1 ? colors.gray300 : colors.gray700} />
            </TouchableOpacity>
            <Text style={[styles.pageInfo, { color: colors.gray500 }]}>Page {currentPage} of {totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageBtn, { backgroundColor: colors.gray100 }, currentPage === totalPages && styles.pageBtnDisabled]}
              onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} color={currentPage === totalPages ? colors.gray300 : colors.gray700} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ SAVINGS ITEMS (FULL CRUD) ═══ */}
        <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Savings & Investments</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {savingsItems.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
                  <Text style={[styles.badgeText, { color: '#059669' }]}>
                    ${savingsItems.reduce((s, i) => s + i.currentBalance, 0).toLocaleString()} total
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.addFab, { backgroundColor: accentColor }]}
                onPress={() => { resetSavingsForm(); setShowSavingsModal(true); }}
              >
                <Plus size={16} color="#FFF" />
                <Text style={styles.addFabText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          {savingsItems.length > 0 ? (
            savingsItems.map(item => (
              <View key={item.id} style={styles.assetItem}>
                <View style={[styles.assetIcon, { backgroundColor: colors.successLight }]}>
                  <PiggyBank size={18} color="#059669" />
                </View>
                <View style={styles.assetInfo}>
                  <Text style={[styles.assetName, { color: colors.gray800 }]}>{item.label}</Text>
                  <Text style={[styles.assetCategory, { color: colors.gray500 }]}>
                    {item.description || `+$${item.monthlySavings.toLocaleString()}/mo`}
                  </Text>
                </View>
                <Text style={[styles.assetValue, { color: colors.success }]}>${item.currentBalance.toLocaleString()}</Text>
                <View style={styles.txnActions}>
                  <TouchableOpacity onPress={() => handleEditSavingsItem(item)} style={styles.txnActionBtn}>
                    <Edit3 size={14} color={colors.gray400} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteSavingsItem(item)} style={styles.txnActionBtn}>
                    <Trash2 size={14} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <EmptyState icon={PiggyBank} title="No savings items" message="Tap 'Add' to start tracking your savings" />
          )}
        </View>

        {/* Savings Goal */}
        <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Savings Goal</Text>
            <Target size={20} color={accentColor} />
          </View>
          {savingsGoal ? (
            <>
              <Text style={[styles.goalName, { color: colors.gray800 }]}>{savingsGoal.name}</Text>
              <Text style={[styles.goalMeta, { color: colors.gray500 }]}>Target: ${savingsGoal.target.toLocaleString()} by {savingsGoal.deadline}</Text>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressValue, { color: colors.gray800 }]}>${savingsGoal.current.toLocaleString()}</Text>
                <Text style={[styles.progressTarget, { color: colors.gray500 }]}>${savingsGoal.target.toLocaleString()}</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.gray100 }]}>
                <View style={[styles.progressFill, { width: `${goalProgress}%`, backgroundColor: accentColor }]} />
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primary50, alignSelf: 'flex-start' }]}>
                <Text style={[styles.badgeText, { color: isDark ? colors.primary600 : '#6C5CE7' }]}>{goalProgress}% complete</Text>
              </View>
            </>
          ) : (
            <EmptyState icon={Target} title="No savings goal" message="Set a savings goal to track your progress" />
          )}
        </View>

        {/* Savings Trend Chart */}
        <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Savings Trend</Text>
            <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.badgeText, { color: '#059669' }]}>
                {trendView === 'monthly'
                  ? `${monthlyData.length} Months`
                  : `${yearlyData.length} Years`}
              </Text>
            </View>
          </View>
          {(trendView === 'monthly' ? monthlyData : yearlyData).length > 0 ? (
            <View style={styles.chartContainer}>
              <BarChart
                data={(trendView === 'monthly' ? monthlyData : yearlyData).map(d => {
                  const saved = (d.income || 0) - (d.expenses || 0);
                  return {
                    value: saved / 1000,
                    label: d.month || d.year,
                    labelWidth: 28,
                    frontColor: saved >= 0 ? (isDark ? '#00B894' : '#10B981') : (isDark ? '#E74C3C' : '#EF4444'),
                    topLabelComponent: () => (
                      <Text style={{ fontSize: 8, color: colors.gray400, marginBottom: 1 }}>
                        {(saved / 1000).toFixed(1)}k
                      </Text>
                    ),
                  };
                })}
                barWidth={trendView === 'monthly' ? 16 : 32}
                spacing={trendView === 'monthly' ? 10 : 20}
                initialSpacing={8}
                roundedTop
                roundedBottom={false}
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: colors.gray500, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.gray500, fontSize: 9 }}
                noOfSections={4}
                formatYLabel={(val) => `$${val}k`}
                height={150}
                isAnimated
                animationDuration={600}
              />
            </View>
          ) : (
            <EmptyState icon={PiggyBank} title="No savings trend" message="Add financial data to track your savings over time" />
          )}
        </View>

        {/* Assets */}
        <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Your Assets</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {assets.length > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
                  <Text style={[styles.badgeText, { color: '#059669' }]}>
                    ${assets.reduce((s, a) => s + a.value, 0).toLocaleString()} total
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.addFab, { backgroundColor: accentColor }]}
                onPress={() => { resetAssetForm(); setShowAssetModal(true); }}
              >
                <Plus size={16} color="#FFF" />
                <Text style={styles.addFabText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
          {assets.length > 0 ? (
            assets.map(asset => {
              const IconComp = assetIcons[asset.icon] || Wallet;
              return (
                <View key={asset.id} style={styles.assetItem}>
                  <View style={[styles.assetIcon, { backgroundColor: colors.primary50 }]}>
                    <IconComp size={18} color={accentColor} />
                  </View>
                  <View style={styles.assetInfo}>
                    <Text style={[styles.assetName, { color: colors.gray800 }]}>{asset.name}</Text>
                    <Text style={[styles.assetCategory, { color: colors.gray500 }]}>{asset.category}</Text>
                  </View>
                  <Text style={[styles.assetValue, { color: colors.gray800 }]}>${asset.value.toLocaleString()}</Text>
                  <View style={styles.txnActions}>
                    <TouchableOpacity onPress={() => handleEditAsset(asset)} style={styles.txnActionBtn}>
                      <Edit3 size={14} color={colors.gray400} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteAsset(asset)} style={styles.txnActionBtn}>
                      <Trash2 size={14} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          ) : (
            <EmptyState icon={Wallet} title="No assets tracked" message="Tap 'Add' to start tracking your assets" />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ═══ ADD/EDIT TRANSACTION MODAL ═══ */}
      <Modal visible={showFormModal} animationType="slide" transparent onRequestClose={() => setShowFormModal(false)}>
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.gray800 }]}>{editingTxn ? 'Edit Transaction' : 'Add Transaction'}</Text>
              <TouchableOpacity onPress={() => { setShowFormModal(false); resetForm(); }} style={[styles.modalCloseBtn, { backgroundColor: colors.gray100 }]}>
                <X size={18} color={colors.gray500} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Type Toggle */}
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Type</Text>
              <View style={[styles.segmentControl, { backgroundColor: colors.gray50, marginBottom: Spacing.lg }]}>
                {['Income', 'Expense'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.segmentBtn, formData.type === type && { backgroundColor: type === 'Income' ? colors.success : colors.danger }]}
                    onPress={() => setFormData(f => ({ ...f, type }))}
                  >
                    <Text style={[styles.segmentText, { color: formData.type === type ? '#FFF' : colors.gray500 }]}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Title */}
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Title</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="e.g., Grocery Store"
                placeholderTextColor={colors.gray400}
                value={formData.description}
                onChangeText={t => setFormData(f => ({ ...f, description: t }))}
              />

              {/* Amount */}
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Amount ($)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="0.00"
                placeholderTextColor={colors.gray400}
                value={formData.amount}
                onChangeText={t => setFormData(f => ({ ...f, amount: t }))}
                keyboardType="numeric"
              />

              {/* Category */}
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, {
                      backgroundColor: formData.category === cat ? accentColor : colors.gray50,
                      borderColor: formData.category === cat ? accentColor : colors.gray200,
                    }]}
                    onPress={() => setFormData(f => ({ ...f, category: cat }))}
                  >
                    <Text style={[styles.filterChipText, { color: formData.category === cat ? '#FFF' : colors.gray600 }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Date */}
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Date</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.gray400}
                value={formData.date}
                onChangeText={t => setFormData(f => ({ ...f, date: t }))}
              />

              {/* Note */}
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Note (optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formInputMultiline, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="Add a note..."
                placeholderTextColor={colors.gray400}
                value={formData.note}
                onChangeText={t => setFormData(f => ({ ...f, note: t }))}
                multiline
              />

              {/* Save Button */}
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentColor }]} onPress={handleSaveTransaction}>
                <Text style={styles.saveBtnText}>{editingTxn ? 'Save Changes' : 'Add Transaction'}</Text>
              </TouchableOpacity>

              {editingTxn && (
                <TouchableOpacity
                  style={[styles.deleteModalBtn, { borderColor: colors.danger }]}
                  onPress={() => { setShowFormModal(false); handleDeleteTransaction(editingTxn); resetForm(); }}
                >
                  <Trash2 size={16} color={colors.danger} />
                  <Text style={[styles.deleteModalBtnText, { color: colors.danger }]}>Delete Transaction</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* ═══ ADD/EDIT SAVINGS MODAL ═══ */}
      <Modal visible={showSavingsModal} animationType="slide" transparent onRequestClose={() => setShowSavingsModal(false)}>
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.gray800 }]}>{editingSavings ? 'Edit Savings' : 'Add Savings'}</Text>
              <TouchableOpacity onPress={() => { setShowSavingsModal(false); resetSavingsForm(); }} style={[styles.modalCloseBtn, { backgroundColor: colors.gray100 }]}>
                <X size={18} color={colors.gray500} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
                {SAVINGS_TYPES.map(st => (
                  <TouchableOpacity
                    key={st.value}
                    style={[styles.filterChip, {
                      backgroundColor: savingsForm.type === st.value ? accentColor : colors.gray50,
                      borderColor: savingsForm.type === st.value ? accentColor : colors.gray200,
                    }]}
                    onPress={() => setSavingsForm(f => ({ ...f, type: st.value }))}
                  >
                    <Text style={[styles.filterChipText, { color: savingsForm.type === st.value ? '#FFF' : colors.gray600 }]}>{st.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Current Balance ($)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="0.00"
                placeholderTextColor={colors.gray400}
                value={savingsForm.currentBalance}
                onChangeText={t => setSavingsForm(f => ({ ...f, currentBalance: t }))}
                keyboardType="numeric"
              />
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Monthly Contribution ($)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="0.00"
                placeholderTextColor={colors.gray400}
                value={savingsForm.monthlySavings}
                onChangeText={t => setSavingsForm(f => ({ ...f, monthlySavings: t }))}
                keyboardType="numeric"
              />
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Description (optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formInputMultiline, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="e.g., Emergency fund..."
                placeholderTextColor={colors.gray400}
                value={savingsForm.description}
                onChangeText={t => setSavingsForm(f => ({ ...f, description: t }))}
                multiline
              />
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentColor }]} onPress={handleSaveSavingsItem}>
                <Text style={styles.saveBtnText}>{editingSavings ? 'Save Changes' : 'Add Savings'}</Text>
              </TouchableOpacity>
              {editingSavings && (
                <TouchableOpacity
                  style={[styles.deleteModalBtn, { borderColor: colors.danger }]}
                  onPress={() => { setShowSavingsModal(false); handleDeleteSavingsItem(editingSavings); resetSavingsForm(); }}
                >
                  <Trash2 size={16} color={colors.danger} />
                  <Text style={[styles.deleteModalBtnText, { color: colors.danger }]}>Delete Savings</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══ ADD/EDIT ASSET MODAL ═══ */}
      <Modal visible={showAssetModal} animationType="slide" transparent onRequestClose={() => setShowAssetModal(false)}>
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.gray800 }]}>{editingAsset ? 'Edit Asset' : 'Add Asset'}</Text>
              <TouchableOpacity onPress={() => { setShowAssetModal(false); resetAssetForm(); }} style={[styles.modalCloseBtn, { backgroundColor: colors.gray100 }]}>
                <X size={18} color={colors.gray500} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Name</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="e.g., Honda Civic 2022"
                placeholderTextColor={colors.gray400}
                value={assetForm.name}
                onChangeText={t => setAssetForm(f => ({ ...f, name: t }))}
              />
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
                {ASSET_TYPES.map(at => (
                  <TouchableOpacity
                    key={at.value}
                    style={[styles.filterChip, {
                      backgroundColor: assetForm.type === at.value ? accentColor : colors.gray50,
                      borderColor: assetForm.type === at.value ? accentColor : colors.gray200,
                    }]}
                    onPress={() => setAssetForm(f => ({ ...f, type: at.value }))}
                  >
                    <Text style={[styles.filterChipText, { color: assetForm.type === at.value ? '#FFF' : colors.gray600 }]}>{at.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Estimated Value ($)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="0.00"
                placeholderTextColor={colors.gray400}
                value={assetForm.estimatedValue}
                onChangeText={t => setAssetForm(f => ({ ...f, estimatedValue: t }))}
                keyboardType="numeric"
              />
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Description (optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formInputMultiline, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="Add details..."
                placeholderTextColor={colors.gray400}
                value={assetForm.description}
                onChangeText={t => setAssetForm(f => ({ ...f, description: t }))}
                multiline
              />
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: accentColor }]} onPress={handleSaveAsset}>
                <Text style={styles.saveBtnText}>{editingAsset ? 'Save Changes' : 'Add Asset'}</Text>
              </TouchableOpacity>
              {editingAsset && (
                <TouchableOpacity
                  style={[styles.deleteModalBtn, { borderColor: colors.danger }]}
                  onPress={() => { setShowAssetModal(false); handleDeleteAsset(editingAsset); resetAssetForm(); }}
                >
                  <Trash2 size={16} color={colors.danger} />
                  <Text style={[styles.deleteModalBtnText, { color: colors.danger }]}>Delete Asset</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xxl },
  backBtn: { width: 40, height: 40, borderRadius: Radii.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  themeBtn: { width: 36, height: 36, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold },
  pageSubtitle: { fontSize: FontSizes.sm },
  // Cards
  cardBox: { borderRadius: Radii.lg, borderWidth: 1, padding: Spacing.xxl, marginBottom: Spacing.xl, ...Shadows.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  badge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full },
  badgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  // Segment Control
  segmentControl: { flexDirection: 'row', borderRadius: Radii.md, padding: 4, marginBottom: Spacing.lg },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radii.sm },
  segmentText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  // Charts
  chartContainer: { alignItems: 'center', paddingTop: Spacing.sm },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xxl, marginTop: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSizes.sm },
  donutContainer: { alignItems: 'center', paddingVertical: Spacing.lg },
  donutCenter: { alignItems: 'center' },
  donutTotal: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  donutLabel: { fontSize: FontSizes.xs },
  categoryLegend: { gap: Spacing.sm },
  categoryItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  categoryName: { flex: 1, fontSize: FontSizes.sm },
  categoryValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  // Stats Grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
  statMiniCard: { flex: 1, minWidth: 100, borderRadius: Radii.lg, borderWidth: 1, padding: Spacing.lg, alignItems: 'center', gap: 4, ...Shadows.sm },
  statMiniValue: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold },
  statMiniLabel: { fontSize: FontSizes.xs, textAlign: 'center' },
  deltaText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  // Tooltip
  tooltipBox: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radii.sm, borderWidth: 1, ...Shadows.sm },
  tooltipText: { fontSize: 10, fontWeight: FontWeights.semibold, lineHeight: 14 },
  // Search & Filter
  searchRow: { marginBottom: Spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  searchInput: { flex: 1, fontSize: FontSizes.sm, paddingVertical: 2 },
  filterRow: { marginBottom: Spacing.lg },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radii.full, borderWidth: 1, marginRight: Spacing.sm },
  filterChipText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  // Transactions
  addFab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radii.full, ...Shadows.sm },
  addFabText: { color: '#FFF', fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  emptyState: { paddingVertical: Spacing.xxxl, alignItems: 'center' },
  emptyText: { fontSize: FontSizes.md },
  txnGroup: { marginBottom: Spacing.lg },
  txnGroupDate: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  txnRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  txnIconBox: { width: 36, height: 36, borderRadius: Radii.sm, alignItems: 'center', justifyContent: 'center' },
  txnInfo: { flex: 1, gap: 2 },
  txnDesc: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium },
  txnCategory: { fontSize: FontSizes.xs },
  txnAmount: { fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  txnActions: { flexDirection: 'row', gap: Spacing.sm },
  txnActionBtn: { padding: 4 },
  // Pagination
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, paddingTop: Spacing.lg },
  pageBtn: { width: 36, height: 36, borderRadius: Radii.sm, alignItems: 'center', justifyContent: 'center' },
  pageBtnDisabled: { opacity: 0.4 },
  pageInfo: { fontSize: FontSizes.sm },
  // Goal
  goalName: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, marginBottom: 4 },
  goalMeta: { fontSize: FontSizes.sm, marginBottom: Spacing.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  progressTarget: { fontSize: FontSizes.sm },
  progressTrack: { height: 10, borderRadius: Radii.full, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', borderRadius: Radii.full },
  // Assets
  assetItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  assetIcon: { width: 40, height: 40, borderRadius: Radii.sm, alignItems: 'center', justifyContent: 'center' },
  assetInfo: { flex: 1 },
  assetName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  assetCategory: { fontSize: FontSizes.xs },
  assetValue: { fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, padding: Spacing.xxl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  modalCloseBtn: { width: 36, height: 36, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  formLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, marginBottom: 6 },
  formInput: { borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: FontSizes.md, marginBottom: Spacing.lg },
  formInputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { borderRadius: Radii.md, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.md, ...Shadows.md },
  saveBtnText: { color: '#FFF', fontSize: FontSizes.lg, fontWeight: FontWeights.semibold },
  deleteModalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: Radii.md, paddingVertical: 14, marginTop: Spacing.md },
  deleteModalBtnText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
});
