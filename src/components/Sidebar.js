import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { LayoutDashboard, BarChart3, ShieldCheck, LogOut } from 'lucide-react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii } from '../theme';

export default function Sidebar({ user, onLogout, navigation, activePage }) {
  const links = [
    { key: 'Hub', label: 'Hub', icon: LayoutDashboard, screen: 'Hub' },
    { key: 'Tracker', label: 'Finance Tracker', icon: BarChart3, screen: 'Tracker' },
    { key: 'Policy', label: 'Policy AI', icon: ShieldCheck, screen: 'Policy' },
  ];

  return (
    <SafeAreaView style={styles.sidebar}>
      {/* Brand */}
      <View style={styles.brand}>
        <Image source={require('../../assets/synaxis-logo-1024.png')} style={styles.logo} />
        <Text style={styles.brandTitle}>Synaxis</Text>
      </View>

      {/* Nav Links */}
      <View style={styles.nav}>
        {links.map((link) => {
          const isActive = activePage === link.key;
          const Icon = link.icon;
          return (
            <TouchableOpacity
              key={link.key}
              style={[styles.navLink, isActive && styles.navLinkActive]}
              onPress={() => navigation.navigate(link.screen)}
              accessibilityLabel={`Navigate to ${link.label}`}
            >
              <Icon size={20} color={isActive ? Colors.white : 'rgba(255,255,255,0.6)'} />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{link.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} accessibilityLabel="Log out">
          <LogOut size={18} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    backgroundColor: Colors.gray900,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
  },
  brandTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.white,
  },
  nav: {
    flex: 1,
    gap: Spacing.xs,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.md,
  },
  navLinkActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  navText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: 'rgba(255,255,255,0.6)',
  },
  navTextActive: {
    color: Colors.white,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primary500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  userEmail: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.45)',
  },
  logoutBtn: {
    width: 34,
    height: 34,
    borderRadius: Radii.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
