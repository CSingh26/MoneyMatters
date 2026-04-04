import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal as RNModal, ScrollView } from 'react-native';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';

export default function PolicyModal({ visible, policy, onClose }) {
  if (!policy) return null;

  return (
    <RNModal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{policy.name}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close modal">
              <X size={20} color={Colors.gray500} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Meta */}
            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: Colors.primary50 }]}>
                <Text style={[styles.badgeText, { color: Colors.primary600 }]}>{policy.provider}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: policy.scoreColor === 'green' ? Colors.successLight : Colors.warningLight }]}>
                <Text style={[styles.badgeText, { color: policy.scoreColor === 'green' ? '#059669' : '#D97706' }]}>{policy.coverageScore}</Text>
              </View>
            </View>

            <Text style={styles.metaText}>
              Premium: ${policy.premium}/{policy.premiumFrequency} · Expires: {policy.expiresAt}
            </Text>

            {/* Covered */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <CheckCircle2 size={16} color={Colors.success} />
                <Text style={[styles.sectionTitle, { color: Colors.success }]}>What's Covered</Text>
              </View>
              {policy.covered.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <CheckCircle2 size={14} color={Colors.success} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Excluded */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertTriangle size={16} color={Colors.warning} />
                <Text style={[styles.sectionTitle, { color: Colors.warning }]}>What's Excluded</Text>
              </View>
              {policy.excluded.map((item, i) => (
                <View key={i} style={styles.listItem}>
                  <AlertTriangle size={14} color={Colors.danger} />
                  <Text style={styles.listText}>{item}</Text>
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
    backgroundColor: Colors.white,
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
    borderBottomColor: Colors.gray100,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.gray800,
    flex: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: Colors.gray100,
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
    color: Colors.gray500,
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
    borderBottomColor: Colors.gray100,
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
    color: Colors.gray700,
    lineHeight: 20,
  },
});
