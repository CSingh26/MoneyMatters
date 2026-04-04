import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { BarChart3, ShieldCheck, TrendingUp, FileSearch, ArrowRight, Sparkles, LogOut, Zap } from 'lucide-react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Shadows, CardStyle } from '../theme';

export default function HubScreen({ user, onLogout, navigation }) {
  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <Sparkles size={20} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>PolicyLens AI</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.userBadge}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.[0]}</Text>
            </View>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <LogOut size={16} color={Colors.primary500} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Welcome */}
      <View style={styles.main}>
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>
            Welcome back, <Text style={{ color: Colors.primary500 }}>{user?.name}</Text>.
          </Text>
          <Text style={styles.welcomeSubtitle}>What would you like to focus on today?</Text>
        </View>

        {/* Cards */}
        <View style={styles.cards}>
          {/* Financial Tracker */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Tracker')}
            activeOpacity={0.7}
            accessibilityLabel="Open Financial Tracker"
          >
            <View style={[styles.cardIcon, { backgroundColor: Colors.blue50 }]}>
              <BarChart3 size={30} color={Colors.blue500} />
            </View>
            <Text style={styles.cardTitle}>Financial Tracker</Text>
            <Text style={styles.cardDesc}>
              Track expenses, manage budgets, and monitor your financial goals.
            </Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <TrendingUp size={12} color={Colors.gray600} />
                <Text style={styles.tagText}>Budget & Goals</Text>
              </View>
              <View style={styles.tag}>
                <BarChart3 size={12} color={Colors.gray600} />
                <Text style={styles.tagText}>Charts & Reports</Text>
              </View>
            </View>
            <View style={styles.cardAction}>
              <Text style={styles.actionText}>Open Tracker</Text>
              <ArrowRight size={16} color={Colors.primary500} />
            </View>
          </TouchableOpacity>

          {/* PolicyLens AI */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Policy')}
            activeOpacity={0.7}
            accessibilityLabel="Open PolicyLens AI"
          >
            <View style={[styles.cardIcon, { backgroundColor: Colors.primary50 }]}>
              <ShieldCheck size={30} color={Colors.primary500} />
            </View>
            <Text style={styles.cardTitle}>PolicyLens AI</Text>
            <Text style={styles.cardDesc}>
              Analyze insurance policies, uncover coverage gaps, and simulate 'what-if' financial scenarios.
            </Text>
            <View style={styles.tags}>
              <View style={styles.tag}>
                <FileSearch size={12} color={Colors.gray600} />
                <Text style={styles.tagText}>Gap Analysis</Text>
              </View>
              <View style={styles.tag}>
                <Zap size={12} color={Colors.gray600} />
                <Text style={styles.tagText}>AI Scenarios</Text>
              </View>
            </View>
            <View style={styles.cardAction}>
              <Text style={styles.actionText}>Open PolicyLens</Text>
              <ArrowRight size={16} color={Colors.primary500} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primary500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.gray800,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.gray200,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
  userName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.gray700,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSizes.sm,
    color: Colors.primary500,
    fontWeight: FontWeights.medium,
  },
  // Main
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxxl,
  },
  welcome: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  welcomeTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.gray900,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: FontSizes.lg,
    color: Colors.gray500,
    textAlign: 'center',
  },
  // Cards
  cards: {
    gap: Spacing.xl,
  },
  featureCard: {
    ...CardStyle,
    padding: Spacing.xxl,
    gap: Spacing.lg,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.gray800,
  },
  cardDesc: {
    fontSize: FontSizes.md,
    color: Colors.gray500,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.gray50,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.gray600,
  },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.primary500,
  },
});
