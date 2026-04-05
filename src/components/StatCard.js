import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';
import { useTheme } from '../ThemeContext';

export default function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'purple' }) {
  const { isDark, colors } = useTheme();

  const colorMap = {
    purple: { bg: colors.primary50, fg: isDark ? colors.accent : '#6C5CE7' },
    blue: { bg: colors.blue50, fg: isDark ? colors.blue600 : '#3B82F6' },
    green: { bg: colors.successLight, fg: colors.success },
    orange: { bg: colors.warningLight, fg: '#D97706' },
  };

  const scheme = colorMap[color] || colorMap.purple;
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <View style={[styles.iconBox, { backgroundColor: scheme.bg }]}>  
        <Icon size={22} color={scheme.fg} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.gray500 }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.gray800 }]}>{value}</Text>
        {trend ? (
          <Text style={[styles.trend, { color: trendUp ? colors.success : colors.danger }]}>
            {trendUp ? '↑' : '↓'} {trend}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xxl,
    borderRadius: Radii.lg,
    borderWidth: 1,
    ...Shadows.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
  value: {
    fontSize: 22,
    fontWeight: FontWeights.bold,
  },
  trend: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
});
