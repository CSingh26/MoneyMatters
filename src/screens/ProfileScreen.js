import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Mail, Calendar, Users, User, Sun, Moon } from 'lucide-react-native';
import { FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';
import { useTheme } from '../ThemeContext';
import { getFinanceSummary } from '../api/finance';

const genderLabels = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  prefer_not_to_say: 'Prefer not to say',
};

export default function ProfileScreen({ user, navigation }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const accentColor = isDark ? colors.accent : '#6C5CE7';
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFinanceSummary();
        setSummary(data);
      } catch {
        // Finance data unavailable — show dashes
      } finally {
        setLoadingSummary(false);
      }
    })();
  }, []);

  const displayName = user ? `${user.firstName} ${user.lastName}` : '—';

  const infoRows = [
    { icon: User, label: 'Name', value: displayName },
    { icon: Mail, label: 'Email', value: user?.email || '—' },
    { icon: Calendar, label: 'Age', value: user?.age ? `${user.age} years` : '—' },
    { icon: Users, label: 'Gender', value: genderLabels[user?.gender] || user?.gender || '—' },
  ];

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgPrimary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <ArrowLeft size={20} color={accentColor} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.gray800 }]}>Profile</Text>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: colors.gray50 }]}>
            {isDark ? <Sun size={18} color="#FDCB6E" /> : <Moon size={18} color="#6C5CE7" />}
          </TouchableOpacity>
        </View>

        {/* Avatar Card */}
        <View style={[styles.avatarCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.avatarCircle, { backgroundColor: accentColor }]}>
            <Text style={styles.avatarLetter}>{user?.firstName?.[0] || '?'}</Text>
          </View>
          <Text style={[styles.avatarName, { color: colors.gray800 }]}>{displayName}</Text>
          <Text style={[styles.avatarEmail, { color: colors.gray500 }]}>{user?.email}</Text>
        </View>

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.gray800 }]}>Personal Information</Text>
          {infoRows.map((row, i) => {
            const Icon = row.icon;
            return (
              <View key={i} style={[styles.infoRow, i < infoRows.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.gray100 }]}>
                <View style={[styles.infoIconBox, { backgroundColor: colors.primary50 }]}>
                  <Icon size={16} color={accentColor} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.gray400 }]}>{row.label}</Text>
                  <Text style={[styles.infoValue, { color: colors.gray800 }]}>{row.value}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Quick Stats */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.sectionTitle, { color: colors.gray800 }]}>Financial Snapshot</Text>
          {loadingSummary ? (
            <ActivityIndicator style={{ padding: Spacing.lg }} />
          ) : summary ? (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: accentColor }]}>${summary.totalSavingsBalance.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: colors.gray500 }]}>Savings Balance</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.gray100 }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.success }]}>{summary.savingsRate}%</Text>
                <Text style={[styles.statLabel, { color: colors.gray500 }]}>Savings Rate</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.gray100 }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.gray800 }]}>${summary.totalMonthlyIncome.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: colors.gray500 }]}>Monthly Income</Text>
              </View>
            </View>
          ) : (
            <Text style={[styles.statLabel, { color: colors.gray500, textAlign: 'center', padding: Spacing.lg }]}>
              Add financial data to see your snapshot
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scrollContent: { padding: Spacing.xxl, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xxl,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radii.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  pageTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  themeBtn: {
    width: 40, height: 40, borderRadius: Radii.full,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarCard: {
    alignItems: 'center',
    padding: Spacing.xxl,
    borderRadius: Radii.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarLetter: {
    fontSize: 32, fontWeight: FontWeights.bold, color: '#fff',
  },
  avatarName: {
    fontSize: FontSizes.xl, fontWeight: FontWeights.bold, marginBottom: 4,
  },
  avatarEmail: {
    fontSize: FontSizes.sm,
  },
  card: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  infoIconBox: {
    width: 36, height: 36, borderRadius: Radii.sm,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: FontSizes.xs, marginBottom: 2 },
  infoValue: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, marginBottom: 4 },
  statLabel: { fontSize: FontSizes.xs },
  statDivider: { width: 1, height: 40 },
});
