import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';

const colorMap = {
  purple: { bg: Colors.primary50, fg: Colors.primary500 },
  blue: { bg: Colors.blue50, fg: Colors.blue500 },
  green: { bg: Colors.successLight, fg: Colors.success },
  orange: { bg: Colors.warningLight, fg: '#D97706' },
};

export default function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'purple' }) {
  const scheme = colorMap[color] || colorMap.purple;
  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: scheme.bg }]}>  
        <Icon size={22} color={scheme.fg} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
        {trend ? (
          <Text style={[styles.trend, { color: trendUp ? Colors.success : Colors.danger }]}>
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
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.06)',
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
    color: Colors.gray500,
  },
  value: {
    fontSize: 22,
    fontWeight: FontWeights.bold,
    color: Colors.gray800,
  },
  trend: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
});
