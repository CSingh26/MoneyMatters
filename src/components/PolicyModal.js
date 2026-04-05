import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal as RNModal, ScrollView } from 'react-native';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';
import { useTheme } from '../ThemeContext';

export default function PolicyModal({ visible, policy, onClose }) {
  const { isDark, colors } = useTheme();
  if (!policy) return null;

  return (
    <RNModal visible={visible} animationType="fade" transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.cardBg }]}>
          <View style={[styles.header, { borderBottomColor: colors.gray100 }]}>
            <Text style={[styles.title, { color: colors.gray800 }]}>{policy.name}</Text>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.gray100 }]} onPress={onClose}>
              <X size={20} color={colors.gray500} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: colors.primary50 }]}>
                <Text style={[styles.badgeText, { color: isDark ? colors.primary600 : '#6C5CE7' }]}>{policy.provider}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: policy.scoreColor === 'green' ? colors.successLight : colors.warningLight }]}>
                <Text style={[styles.badgeText, { color: policy.scoreColor === 'green' ? '#059669' : '#D97706' }]}>{policy.coverageScore}</Text>
              </View>
            </View>

            <Text style={[styles.metaText, { color: colors.gray500 }]}>
              Premium: ${policy.premium}/{policy.premiumFrequency} · Expires: {policy.expiresAt}
            </Text>

            <View style={styles.section}>
              <View style={[styles.sectionHeader, { borderBottomColor: colors.gray100 }]}>
                <CheckCircle2 size={16} color={colors.success} />
                <Text style={[styles.sectionTitle, { color: colors.success }]}>What's Covered</Text>
              </View>
              {policy.covered.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <CheckCircle2 size={14} color={colors.success} />
                  <Text style={[styles.listText, { color: colors.gray700 }]}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={[styles.sectionHeader, { borderBottomColor: colors.gray100 }]}>
                <AlertTriangle size={16} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.warning }]}>What's Excluded</Text>
              </View>
              {policy.excluded.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <AlertTriangle size={14} color={colors.danger} />
                  <Text style={[styles.listText, { color: colors.gray700 }]}>{item}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  content: {
    borderRadius: Radii.xl,
    width: '100%',
    maxHeight: '80%',
    ...Shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xl,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
  metaText: {
    fontSize: FontSizes.sm,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listText: {
    flex: 1,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
});
