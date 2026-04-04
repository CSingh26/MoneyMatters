import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, FlatList,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, ChevronLeft,
  ChevronRight, Car, Landmark, Laptop, Home, Target, ArrowLeft,
} from 'lucide-react-native';
import StatCard from '../components/StatCard';
import {
  financialSummary, monthlyData, spendingByCategory,
  transactions as mockTransactions, assets, savingsGoal,
} from '../data/mockData';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Shadows, CardStyle } from '../theme';

const ITEMS_PER_PAGE = 5;

const assetIcons = {
  car: Car,
  piggyBank: PiggyBank,
  laptop: Laptop,
  trendingUp: TrendingUp,
  home: Home,
};

export default function TrackerScreen({ user, navigation }) {
  const [allTransactions, setAllTransactions] = useState(mockTransactions);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    type: 'Expense',
    category: 'Food',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const totalPages = Math.ceil(allTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = allTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.description) return;
    const newTxn = {
      id: allTransactions.length + 1,
      ...formData,
      amount: parseFloat(formData.amount),
    };
    setAllTransactions([newTxn, ...allTransactions]);
    setFormData({ type: 'Expense', category: 'Food', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    setCurrentPage(1);
  };

  const goalProgress = ((savingsGoal.current / savingsGoal.target) * 100).toFixed(0);

  // Bar chart data for gifted-charts
  const barData = [];
  monthlyData.forEach((m) => {
    barData.push({
      value: m.income,
      label: m.month,
      spacing: 4,
      frontColor: Colors.primary500,
      topLabelComponent: () => null,
    });
    barData.push({
      value: m.expenses,
      frontColor: Colors.lavender400,
    });
  });

  // Pie chart data for gifted-charts
  const pieData = spendingByCategory.map((c) => ({
    value: c.value,
    color: c.color,
    text: c.name,
    textColor: Colors.gray600,
    textSize: 10,
  }));

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Hub')} style={styles.backBtn}>
            <ArrowLeft size={20} color={Colors.primary500} />
          </TouchableOpacity>
          <View>
            <Text style={styles.pageTitle}>Financial Tracker</Text>
            <Text style={styles.pageSubtitle}>Monitor your finances and track spending</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard icon={Wallet} label="Total Balance" value={`$${financialSummary.totalBalance.toLocaleString()}`} color="purple" />
          <StatCard icon={TrendingUp} label="Monthly Income" value={`$${financialSummary.monthlyIncome.toLocaleString()}`} trend="+3.2%" trendUp color="green" />
          <StatCard icon={TrendingDown} label="Monthly Expenses" value={`$${financialSummary.monthlyExpenses.toLocaleString()}`} trend="-1.5%" trendUp={false} color="orange" />
          <StatCard icon={PiggyBank} label="Savings Rate" value={`${financialSummary.savingsRate}%`} color="blue" />
        </View>

        {/* Bar Chart */}
        <View style={[styles.cardBox]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Income vs Expenses</Text>
            <View style={styles.badgePurple}>
              <Text style={styles.badgePurpleText}>Last 6 Months</Text>
            </View>
          </View>
          <View style={styles.chartContainer}>
            <BarChart
              data={barData}
              barWidth={16}
              spacing={20}
              roundedTop
              roundedBottom={false}
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: Colors.gray500, fontSize: 11 }}
              xAxisLabelTextStyle={{ color: Colors.gray500, fontSize: 11 }}
              noOfSections={4}
              maxValue={6000}
              height={200}
              isAnimated
              animationDuration={600}
            />
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary500 }]} />
              <Text style={styles.legendText}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.lavender400 }]} />
              <Text style={styles.legendText}>Expenses</Text>
            </View>
          </View>
        </View>

        {/* Donut Chart */}
        <View style={[styles.cardBox]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Spending Breakdown</Text>
            <View style={[styles.badgePurple, { backgroundColor: Colors.blue50 }]}>
              <Text style={[styles.badgePurpleText, { color: Colors.blue600 }]}>By Category</Text>
            </View>
          </View>
          <View style={styles.donutContainer}>
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={55}
              innerCircleColor={Colors.white}
              centerLabelComponent={() => (
                <View style={styles.donutCenter}>
                  <Text style={styles.donutTotal}>$3,250</Text>
                  <Text style={styles.donutLabel}>Total</Text>
                </View>
              )}
              isAnimated
            />
          </View>
          <View style={styles.categoryLegend}>
            {spendingByCategory.map((c, i) => (
              <View key={i} style={styles.categoryItem}>
                <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                <Text style={styles.categoryName}>{c.name}</Text>
                <Text style={styles.categoryValue}>${c.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Transaction Manager */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Transaction Manager</Text>

          {/* Add Form */}
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.formLabel}>Amount ($)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="0.00"
                placeholderTextColor={Colors.gray400}
                value={formData.amount}
                onChangeText={(t) => setFormData({ ...formData, amount: t })}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formField, { flex: 2 }]}>
              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g., Grocery run"
                placeholderTextColor={Colors.gray400}
                value={formData.description}
                onChangeText={(t) => setFormData({ ...formData, description: t })}
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddTransaction}>
              <Plus size={16} color={Colors.white} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Table */}
          {paginatedTransactions.map((txn) => (
            <View key={txn.id} style={styles.txnRow}>
              <View style={styles.txnLeft}>
                <Text style={styles.txnDesc}>{txn.description}</Text>
                <Text style={styles.txnDate}>{txn.date}</Text>
              </View>
              <View style={styles.txnRight}>
                <View style={[styles.txnBadge, { backgroundColor: txn.type === 'Income' ? Colors.successLight : Colors.warningLight }]}>
                  <Text style={[styles.txnBadgeText, { color: txn.type === 'Income' ? '#059669' : '#D97706' }]}>{txn.category}</Text>
                </View>
                <Text style={[styles.txnAmount, { color: txn.type === 'Income' ? Colors.success : Colors.gray700 }]}>
                  {txn.type === 'Income' ? '+' : '-'}${txn.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          {/* Pagination */}
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
              onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} color={currentPage === 1 ? Colors.gray300 : Colors.gray700} />
            </TouchableOpacity>
            <Text style={styles.pageInfo}>Page {currentPage} of {totalPages}</Text>
            <TouchableOpacity
              style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
              onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} color={currentPage === totalPages ? Colors.gray300 : Colors.gray700} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Savings Goal */}
        <View style={styles.cardBox}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Savings Goal</Text>
            <Target size={20} color={Colors.primary500} />
          </View>
          <Text style={styles.goalName}>{savingsGoal.name}</Text>
          <Text style={styles.goalMeta}>Target: ${savingsGoal.target.toLocaleString()} by {savingsGoal.deadline}</Text>
          <View style={styles.progressHeader}>
            <Text style={styles.progressValue}>${savingsGoal.current.toLocaleString()}</Text>
            <Text style={styles.progressTarget}>${savingsGoal.target.toLocaleString()}</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${goalProgress}%` }]} />
          </View>
          <View style={styles.badgePurple}>
            <Text style={styles.badgePurpleText}>{goalProgress}% complete</Text>
          </View>
        </View>

        {/* Assets */}
        <View style={styles.cardBox}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Assets</Text>
            <View style={[styles.badgePurple, { backgroundColor: Colors.successLight }]}>
              <Text style={[styles.badgePurpleText, { color: '#059669' }]}>
                ${assets.reduce((s, a) => s + a.value, 0).toLocaleString()} total
              </Text>
            </View>
          </View>
          {assets.map((asset) => {
            const IconComp = assetIcons[asset.icon] || Wallet;
            return (
              <View key={asset.id} style={styles.assetItem}>
                <View style={styles.assetIcon}>
                  <IconComp size={18} color={Colors.primary500} />
                </View>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetCategory}>{asset.category}</Text>
                </View>
                <Text style={styles.assetValue}>${asset.value.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.bgPrimary },
  scrollContent: { padding: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radii.sm,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  pageTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.gray800 },
  pageSubtitle: { fontSize: FontSizes.sm, color: Colors.gray500 },
  // Stats
  statsGrid: { gap: Spacing.md, marginBottom: Spacing.xxl },
  // Cards
  cardBox: {
    ...CardStyle,
    padding: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.gray800 },
  badgePurple: {
    backgroundColor: Colors.primary50,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  badgePurpleText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.primary600 },
  // Charts
  chartContainer: { alignItems: 'center', paddingTop: Spacing.sm },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.xxl, marginTop: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSizes.sm, color: Colors.gray500 },
  donutContainer: { alignItems: 'center', paddingVertical: Spacing.lg },
  donutCenter: { alignItems: 'center' },
  donutTotal: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.gray800 },
  donutLabel: { fontSize: FontSizes.xs, color: Colors.gray500 },
  categoryLegend: { gap: Spacing.sm },
  categoryItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  categoryName: { flex: 1, fontSize: FontSizes.sm, color: Colors.gray600 },
  categoryValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.gray800 },
  // Form
  formRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end', marginVertical: Spacing.lg, flexWrap: 'wrap' },
  formField: { flex: 1, minWidth: 100 },
  formLabel: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.gray600, marginBottom: 4 },
  formInput: {
    backgroundColor: Colors.gray50, borderWidth: 1, borderColor: Colors.gray200,
    borderRadius: Radii.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    fontSize: FontSizes.sm, color: Colors.gray800,
  },
  addBtn: {
    backgroundColor: Colors.primary500, borderRadius: Radii.sm,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  addBtnText: { color: Colors.white, fontWeight: FontWeights.semibold, fontSize: FontSizes.sm },
  // Transactions
  txnRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  txnLeft: { flex: 1, gap: 2 },
  txnDesc: { fontSize: FontSizes.sm, fontWeight: FontWeights.medium, color: Colors.gray800 },
  txnDate: { fontSize: FontSizes.xs, color: Colors.gray400 },
  txnRight: { alignItems: 'flex-end', gap: 4 },
  txnBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radii.full },
  txnBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  txnAmount: { fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  // Pagination
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.lg, paddingTop: Spacing.lg },
  pageBtn: {
    width: 36, height: 36, borderRadius: Radii.sm, backgroundColor: Colors.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageInfo: { fontSize: FontSizes.sm, color: Colors.gray500 },
  // Goal
  goalName: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: Colors.gray800, marginBottom: 4 },
  goalMeta: { fontSize: FontSizes.sm, color: Colors.gray500, marginBottom: Spacing.lg },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.gray800 },
  progressTarget: { fontSize: FontSizes.sm, color: Colors.gray500 },
  progressTrack: { height: 10, backgroundColor: Colors.gray100, borderRadius: Radii.full, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', backgroundColor: Colors.primary500, borderRadius: Radii.full },
  // Assets
  assetItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  assetIcon: { width: 40, height: 40, borderRadius: Radii.sm, backgroundColor: Colors.primary50, alignItems: 'center', justifyContent: 'center' },
  assetInfo: { flex: 1 },
  assetName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.gray800 },
  assetCategory: { fontSize: FontSizes.xs, color: Colors.gray500 },
  assetValue: { fontSize: FontSizes.md, fontWeight: FontWeights.bold, color: Colors.gray800 },
});
