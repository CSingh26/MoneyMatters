import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView, ActivityIndicator, Image } from 'react-native';
import { BarChart3, ShieldCheck, TrendingUp, FileSearch, ArrowRight, LogOut, Zap, Sun, Moon } from 'lucide-react-native';
import { FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';
import { useTheme } from '../ThemeContext';
import { getFinanceSummary } from '../api/finance';

export default function HubScreen({ user, onLogout, navigation }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const [summary, setSummary] = useState(null);

  const displayName = user?.firstName || 'User';

  useEffect(() => {
    (async () => {
      try {
        const data = await getFinanceSummary();
        setSummary(data);
      } catch {
        // Finance profile may not exist yet
      }
    })();
  }, []);

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgPrimary} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/synaxis-logo-1024.png')} style={styles.logo} />
            <Text style={[styles.logoText, { color: colors.gray800 }]}>Synaxis</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: isDark ? colors.gray50 : colors.gray100 }]}>
              {isDark ? <Sun size={18} color="#FDCB6E" /> : <Moon size={18} color="#6C5CE7" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={[styles.userBadge, { backgroundColor: colors.cardBg, borderColor: colors.gray200 }]}>
              <View style={[styles.avatar, { backgroundColor: isDark ? colors.primary300 : '#6C5CE7' }]}>
                <Text style={styles.avatarText}>{displayName[0]}</Text>
              </View>
              <Text style={[styles.userName, { color: colors.gray700 }]}>{displayName}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <LogOut size={16} color={isDark ? colors.primary500 : '#6C5CE7'} />
              <Text style={[styles.logoutText, { color: isDark ? colors.primary500 : '#6C5CE7' }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={[styles.welcomeTitle, { color: colors.gray900 }]}>
            Welcome back, <Text style={{ color: isDark ? colors.accent : '#FF4081' }}>{displayName}</Text>.
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.gray500 }]}>What would you like to focus on today?</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={[styles.quickStatCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.quickStatValue, { color: colors.gray800 }]}>
              ${summary ? summary.totalSavingsBalance.toLocaleString() : '—'}
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.gray500 }]}>Savings Balance</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.quickStatValue, { color: colors.success }]}>
              {summary ? `${summary.savingsRate}%` : '—'}
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.gray500 }]}>Savings Rate</Text>
          </View>
        </View>

        {/* Section Header */}
        <Text style={[styles.sectionHeader, { color: colors.gray700 }]}>Your Tools</Text>

        {/* Cards */}
        <View style={styles.cards}>
          {/* Financial Tracker */}
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('Tracker')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardGradientStrip, { backgroundColor: isDark ? '#3D5A80' : '#FF4081' }]} />
            <View style={styles.cardBody}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(61,90,128,0.2)' : '#EBF5FF' }]}>
                <BarChart3 size={28} color={isDark ? '#5A8AC0' : '#3B82F6'} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Financial Tracker</Text>
              <Text style={[styles.cardDesc, { color: colors.gray500 }]}>
                Track expenses, manage budgets, and monitor your financial goals.
              </Text>
              <View style={styles.tags}>
                <View style={[styles.tag, { backgroundColor: colors.gray50 }]}>
                  <TrendingUp size={12} color={colors.gray600} />
                  <Text style={[styles.tagText, { color: colors.gray600 }]}>Budget & Goals</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: colors.gray50 }]}>
                  <BarChart3 size={12} color={colors.gray600} />
                  <Text style={[styles.tagText, { color: colors.gray600 }]}>Charts & Reports</Text>
                </View>
              </View>
              <View style={styles.cardAction}>
                <Text style={[styles.actionText, { color: isDark ? colors.accent : '#FF4081' }]}>Open Tracker</Text>
                <ArrowRight size={16} color={isDark ? colors.accent : '#FF4081'} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Synaxis AI */}
          <TouchableOpacity
            style={[styles.featureCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardGradientStrip, { backgroundColor: isDark ? '#7B5EA7' : '#AB47BC' }]} />
            <View style={styles.cardBody}>
              <View style={[styles.cardIcon, { backgroundColor: isDark ? 'rgba(123,94,167,0.2)' : '#F0EDFF' }]}>
                <ShieldCheck size={28} color={isDark ? '#9B7BD4' : '#6C5CE7'} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Synaxis AI</Text>
              <Text style={[styles.cardDesc, { color: colors.gray500 }]}>
                Analyze insurance policies, uncover coverage gaps, and simulate 'what-if' scenarios.
              </Text>
              <View style={styles.tags}>
                <View style={[styles.tag, { backgroundColor: colors.gray50 }]}>
                  <FileSearch size={12} color={colors.gray600} />
                  <Text style={[styles.tagText, { color: colors.gray600 }]}>Gap Analysis</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: colors.gray50 }]}>
                  <Zap size={12} color={colors.gray600} />
                  <Text style={[styles.tagText, { color: colors.gray600 }]}>AI Scenarios</Text>
                </View>
              </View>
              <View style={styles.cardAction}>
                <Text style={[styles.actionText, { color: isDark ? colors.accent : '#AB47BC' }]}>Open Synaxis</Text>
                <ArrowRight size={16} color={isDark ? colors.accent : '#AB47BC'} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
  },
  logoText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radii.full,
    borderWidth: 1,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 12,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.xs,
  },
  userName: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  // Welcome
  welcome: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.lg,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.sm,
  },
  quickStatValue: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: FontSizes.sm,
  },
  // Section header
  sectionHeader: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  // Cards
  cards: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
  },
  featureCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  cardGradientStrip: {
    height: 4,
  },
  cardBody: {
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
  },
  cardDesc: {
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
});
