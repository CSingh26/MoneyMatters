import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Inbox } from 'lucide-react-native';
import { FontSizes, FontWeights, Spacing } from '../theme';
import { useTheme } from '../ThemeContext';

export default function EmptyState({ icon: Icon = Inbox, title, message }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Icon size={36} color={colors.gray300} />
      {title && <Text style={[styles.title, { color: colors.gray500 }]}>{title}</Text>}
      {message && <Text style={[styles.message, { color: colors.gray400 }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.sm },
  title: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, textAlign: 'center' },
  message: { fontSize: FontSizes.sm, textAlign: 'center', maxWidth: 260 },
});
