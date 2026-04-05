import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield, Calendar, Users } from 'lucide-react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Shadows, InputStyle } from '../theme';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const { isDark, colors } = useTheme();
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
  });

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Non-binary', value: 'non_binary' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ];

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      if (isSignUp) {
        if (!formData.firstName || !formData.lastName || !formData.age || !formData.gender || !formData.confirmPassword) {
          Alert.alert('Error', 'All fields are required for sign up');
          setSubmitting(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          setSubmitting(false);
          return;
        }
        await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
        });
      } else {
        await login({ email: formData.email, password: formData.password });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.page, { backgroundColor: colors.bgPrimary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
          {/* Brand Panel */}
          <LinearGradient
            colors={isDark ? ['#1A1A2E', '#2A2063', '#7B5EA7'] : [Colors.gray900, '#2A2063', Colors.primary700]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandPanel}
          >
            <View>
              <View style={styles.brandLogo}>
                <Sparkles size={28} color="#fff" />
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
            <Text style={[styles.formTitle, { color: colors.gray800 }]}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={[styles.formSubtitle, { color: colors.gray500 }]}>
              {isSignUp ? 'Start your journey to smarter finances' : 'Sign in to your PolicyLens account'}
            </Text>

            {/* Toggle */}
            <View style={[styles.toggle, { backgroundColor: colors.gray100 }]}>
              <TouchableOpacity
                style={[styles.toggleBtn, !isSignUp && [styles.toggleBtnActive, { backgroundColor: colors.cardBg }]]}
                onPress={() => setIsSignUp(false)}
              >
                <Text style={[styles.toggleText, { color: colors.gray500 }, !isSignUp && { color: colors.primary600 }]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, isSignUp && [styles.toggleBtnActive, { backgroundColor: colors.cardBg }]]}
                onPress={() => setIsSignUp(true)}
              >
                <Text style={[styles.toggleText, { color: colors.gray500 }, isSignUp && { color: colors.primary600 }]}>Create Account</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.gray600 }]}>First Name</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]}>
                  <User size={18} color={colors.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputPadded, { color: colors.gray800 }]}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.gray400}
                    value={formData.firstName}
                    onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                  />
                </View>
              </View>
            )}

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Last Name</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]}>
                  <User size={18} color={colors.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputPadded, { color: colors.gray800 }]}
                    placeholder="Enter your last name"
                    placeholderTextColor={colors.gray400}
                    value={formData.lastName}
                    onChangeText={(t) => setFormData({ ...formData, lastName: t })}
                  />
                </View>
              </View>
            )}

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Age</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]}>
                  <Calendar size={18} color={colors.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputPadded, { color: colors.gray800 }]}
                    placeholder="Enter your age"
                    placeholderTextColor={colors.gray400}
                    value={formData.age}
                    onChangeText={(t) => setFormData({ ...formData, age: t.replace(/[^0-9]/g, '') })}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
              </View>
            )}

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Gender</Text>
                <View style={styles.genderRow}>
                  {genderOptions.map((g) => (
                    <TouchableOpacity
                      key={g.value}
                      style={[styles.genderChip, { backgroundColor: formData.gender === g.value ? (isDark ? colors.accent : colors.primary500) : colors.gray50, borderColor: formData.gender === g.value ? 'transparent' : colors.gray200 }]}
                      onPress={() => setFormData({ ...formData, gender: g.value })}
                    >
                      <Text style={[styles.genderChipText, { color: formData.gender === g.value ? '#fff' : colors.gray600 }]}>{g.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Email Address</Text>
              <View style={[styles.inputWithIcon, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]}>
                <Mail size={18} color={colors.gray400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPadded, { color: colors.gray800 }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.gray400}
                  value={formData.email}
                  onChangeText={(t) => setFormData({ ...formData, email: t })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Password</Text>
              <View style={[styles.inputWithIcon, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]}>
                <Lock size={18} color={colors.gray400} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputPadded, { flex: 1, color: colors.gray800 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.gray400}
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
                    <EyeOff size={18} color={colors.gray400} />
                  ) : (
                    <Eye size={18} color={colors.gray400} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Confirm Password</Text>
                <View style={[styles.inputWithIcon, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]}>
                  <Lock size={18} color={colors.gray400} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.inputPadded, { flex: 1, color: colors.gray800 }]}
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.gray400}
                    value={formData.confirmPassword}
                    onChangeText={(t) => setFormData({ ...formData, confirmPassword: t })}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary500 }]} onPress={handleSubmit} activeOpacity={0.8} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
                  <ArrowRight size={18} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={[styles.switchText, { color: colors.gray500 }]}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={[styles.switchLink, { color: colors.primary500 }]}>{isSignUp ? 'Sign in' : 'Create one'}</Text>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  card: {
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
    color: '#fff',
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
    marginBottom: Spacing.xs,
  },
  formSubtitle: {
    fontSize: FontSizes.md,
    marginBottom: Spacing.xxl,
  },
  // Toggle
  toggle: {
    flexDirection: 'row',
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
    ...Shadows.sm,
  },
  toggleText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  // Inputs
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    marginBottom: 6,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
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
  },
  inputPadded: {},
  eyeBtn: {
    padding: Spacing.xs,
  },
  // Submit
  submitBtn: {
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
    color: '#fff',
  },
  // Switch
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  switchText: {
    fontSize: FontSizes.sm,
  },
  switchLink: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  genderChipText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
});
