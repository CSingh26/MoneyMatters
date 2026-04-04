import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield } from 'lucide-react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Shadows, InputStyle } from '../theme';
import { userData } from '../data/mockData';

export default function AuthScreen({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    password: userData.password,
  });

  const handleSubmit = () => {
    onLogin({ name: formData.name, email: formData.email });
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Brand Panel */}
          <LinearGradient
            colors={[Colors.gray900, '#2A2063', Colors.primary700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandPanel}
          >
            <View>
              <View style={styles.brandLogo}>
                <Sparkles size={28} color={Colors.white} />
              </View>
              <Text style={styles.brandTitle}>PolicyLens AI</Text>
              <Text style={styles.brandSubtitle}>
                Smart financial tracking meets AI-powered insurance intelligence.
              </Text>
              <View style={styles.features}>
                {['AI-Powered Gap Analysis', 'Financial Dashboard', 'Scenario Simulation'].map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Shield size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.brandFooter}>Trusted by 10,000+ users</Text>
          </LinearGradient>

          {/* Form Panel */}
          <View style={styles.formPanel}>
            <Text style={styles.formTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.formSubtitle}>
              {isSignUp ? 'Start your journey to smarter finances' : 'Sign in to your PolicyLens account'}
            </Text>

            {/* Toggle */}
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isSignUp && styles.toggleBtnActive]}
                onPress={() => setIsSignUp(false)}
              >
                <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, isSignUp && styles.toggleBtnActive]}
                onPress={() => setIsSignUp(true)}
              >
                <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWithIcon}>
                  <User size={18} color={Colors.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputPadded]}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.gray400}
                    value={formData.name}
                    onChangeText={(t) => setFormData({ ...formData, name: t })}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputWithIcon}>
                <Mail size={18} color={Colors.gray400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPadded]}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.gray400}
                  value={formData.email}
                  onChangeText={(t) => setFormData({ ...formData, email: t })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWithIcon}>
                <Lock size={18} color={Colors.gray400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPadded, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.gray400}
                  value={formData.password}
                  onChangeText={(t) => setFormData({ ...formData, password: t })}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={Colors.gray400} />
                  ) : (
                    <Eye size={18} color={Colors.gray400} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
              <Text style={styles.submitText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
              <ArrowRight size={18} color={Colors.white} />
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={styles.switchLink}>{isSignUp ? 'Sign in' : 'Create one'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    ...Shadows.lg,
  },
  // Brand Panel
  brandPanel: {
    padding: Spacing.xxxl,
    justifyContent: 'space-between',
    minHeight: 280,
  },
  brandLogo: {
    width: 52,
    height: 52,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(108, 92, 231, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  brandTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  brandSubtitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: FontWeights.medium,
  },
  brandFooter: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.5)',
    marginTop: Spacing.xxl,
  },
  // Form Panel
  formPanel: {
    padding: Spacing.xxxl,
  },
  formTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.gray800,
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.gray500,
    marginBottom: Spacing.xxl,
  },
  // Toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: Colors.gray100,
    borderRadius: Radii.md,
    padding: 4,
    marginBottom: Spacing.xxl,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  toggleBtnActive: {
    backgroundColor: Colors.white,
    ...Shadows.sm,
  },
  toggleText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.gray500,
  },
  toggleTextActive: {
    color: Colors.primary600,
  },
  // Inputs
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.gray600,
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.md,
    color: Colors.gray800,
  },
  inputPadded: {},
  eyeBtn: {
    padding: Spacing.xs,
  },
  // Submit
  submitBtn: {
    backgroundColor: Colors.primary500,
    borderRadius: Radii.md,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    ...Shadows.md,
  },
  submitText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.white,
  },
  // Switch
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  switchText: {
    fontSize: FontSizes.sm,
    color: Colors.gray500,
  },
  switchLink: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary500,
  },
});
