import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Image,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff, Shield, Calendar, Users, Briefcase, DollarSign, ChevronRight } from 'lucide-react-native';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Shadows, InputStyle } from '../theme';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../context/AuthContext';

const employmentOptions = [
  { label: 'Full-time', value: 'full_time' },
  { label: 'Part-time', value: 'part_time' },
  { label: 'Self-employed', value: 'self_employed' },
  { label: 'Freelancer', value: 'freelancer' },
  { label: 'Student', value: 'student' },
  { label: 'Unemployed', value: 'unemployed' },
  { label: 'Retired', value: 'retired' },
];

const incomeOptions = [
  { label: 'Under $25k', value: 'under_25k' },
  { label: '$25k – $50k', value: 'income_25k_50k' },
  { label: '$50k – $75k', value: 'income_50k_75k' },
  { label: '$75k – $100k', value: 'income_75k_100k' },
  { label: '$100k – $150k', value: 'income_100k_150k' },
  { label: '$150k – $200k', value: 'income_150k_200k' },
  { label: 'Over $200k', value: 'over_200k' },
];

const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Non-binary', value: 'non_binary' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

export default function AuthScreen() {
  const { isDark, colors } = useTheme();
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1 = basic, 2 = personalization
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: '',
    occupation: '',
    employmentStatus: '',
    incomeRange: '',
  });

  const animateStep = (nextStep) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const handleNext = () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert('Missing Info', 'Please enter your first and last name');
      return;
    }
    if (!formData.email) {
      Alert.alert('Missing Info', 'Please enter your email address');
      return;
    }
    const pw = formData.password;
    if (!pw || pw.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(pw)) {
      Alert.alert('Weak Password', 'Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(pw)) {
      Alert.alert('Weak Password', 'Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(pw)) {
      Alert.alert('Weak Password', 'Password must contain at least one digit');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(pw)) {
      Alert.alert('Weak Password', 'Password must contain at least one special character');
      return;
    }
    if (pw !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    animateStep(2);
  };

  const handleBack = () => {
    animateStep(1);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    setSubmitting(true);
    try {
      if (isSignUp) {
        if (step === 1) {
          handleNext();
          setSubmitting(false);
          return;
        }
        if (!formData.age || !formData.gender) {
          Alert.alert('Missing Info', 'Please provide your age and gender');
          setSubmitting(false);
          return;
        }
        const payload = {
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          firstName: formData.firstName,
          lastName: formData.lastName,
          age: parseInt(formData.age, 10),
          gender: formData.gender,
        };
        if (formData.occupation) payload.occupation = formData.occupation;
        if (formData.employmentStatus) payload.employmentStatus = formData.employmentStatus;
        if (formData.incomeRange) payload.incomeRange = formData.incomeRange;
        await register(payload);
      } else {
        await login({ email: formData.email, password: formData.password });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const ChipSelector = ({ options, selected, onSelect, columns = 2 }) => (
    <View style={styles.chipGrid}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.chip,
              columns === 2 && styles.chipHalf,
              {
                backgroundColor: active ? (isDark ? colors.accent : colors.primary500) : colors.gray50,
                borderColor: active ? 'transparent' : colors.gray200,
              },
            ]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, { color: active ? '#fff' : colors.gray600 }]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepRow}>
      <View style={[styles.stepDot, { backgroundColor: isDark ? colors.accent : colors.primary500 }]} />
      <View style={[styles.stepLine, { backgroundColor: step === 2 ? (isDark ? colors.accent : colors.primary500) : colors.gray200 }]} />
      <View style={[styles.stepDot, { backgroundColor: step === 2 ? (isDark ? colors.accent : colors.primary500) : colors.gray200 }]} />
      <Text style={[styles.stepLabel, { color: colors.gray400 }]}>Step {step} of 2</Text>
    </View>
  );

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
              <Image source={require('../../assets/synaxis-logo-1024.png')} style={styles.brandLogo} />
              <Text style={styles.brandTitle}>Synaxis</Text>
              <Text style={styles.brandSubtitle}>
                {isSignUp && step === 2
                  ? 'Tell us about yourself so we can personalize your experience.'
                  : 'Smart financial tracking meets AI-powered insurance intelligence.'}
              </Text>
              <View style={styles.features}>
                {(isSignUp && step === 2
                  ? ['Personalized Policy Recommendations', 'Tailored Budget Insights', 'Risk-Adjusted Suggestions']
                  : ['AI-Powered Gap Analysis', 'Financial Dashboard', 'Scenario Simulation']
                ).map((f, i) => (
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
            <Text style={[styles.formTitle, { color: colors.gray800 }]}>
              {!isSignUp ? 'Welcome Back' : step === 1 ? 'Create Account' : 'Your Background'}
            </Text>
            <Text style={[styles.formSubtitle, { color: colors.gray500 }]}>
              {!isSignUp
                ? 'Sign in to your Synaxis account'
                : step === 1
                ? 'Start your journey to smarter finances'
                : 'Help us personalize your AI experience'}
            </Text>

            {/* Toggle (only on step 1) */}
            {step === 1 && (
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
            )}

            {/* Step indicator for sign-up */}
            {isSignUp && renderStepIndicator()}

            <Animated.View style={{ opacity: fadeAnim }}>
              {/* ── STEP 1: Basic Info ── */}
              {(!isSignUp || step === 1) && (
                <>
                  {isSignUp && (
                    <>
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
                    </>
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
                      <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={18} color={colors.gray400} /> : <Eye size={18} color={colors.gray400} />}
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
                </>
              )}

              {/* ── STEP 2: Personalization ── */}
              {isSignUp && step === 2 && (
                <>
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

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Gender</Text>
                    <ChipSelector
                      options={genderOptions}
                      selected={formData.gender}
                      onSelect={(v) => setFormData({ ...formData, gender: v })}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.gray600 }]}>
                      <Briefcase size={14} color={colors.gray400} /> {'  '}Occupation
                    </Text>
                    <View style={[styles.inputWithIcon, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]}>
                      <Briefcase size={18} color={colors.gray400} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.inputPadded, { color: colors.gray800 }]}
                        placeholder="e.g. Software Engineer, Teacher"
                        placeholderTextColor={colors.gray400}
                        value={formData.occupation}
                        onChangeText={(t) => setFormData({ ...formData, occupation: t })}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Employment Status</Text>
                    <ChipSelector
                      options={employmentOptions}
                      selected={formData.employmentStatus}
                      onSelect={(v) => setFormData({ ...formData, employmentStatus: v })}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.gray600 }]}>Annual Income Range</Text>
                    <ChipSelector
                      options={incomeOptions}
                      selected={formData.incomeRange}
                      onSelect={(v) => setFormData({ ...formData, incomeRange: v })}
                    />
                  </View>
                </>
              )}
            </Animated.View>

            {/* Buttons */}
            {isSignUp && step === 2 && (
              <TouchableOpacity style={[styles.backButton, { borderColor: colors.gray200 }]} onPress={handleBack} activeOpacity={0.7}>
                <ArrowLeft size={16} color={colors.gray500} />
                <Text style={[styles.backButtonText, { color: colors.gray500 }]}>Back</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary500 }]} onPress={isSignUp && step === 1 ? handleNext : handleSubmit} activeOpacity={0.8} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    {!isSignUp ? 'Sign In' : step === 1 ? 'Next: Personalize' : 'Create Account'}
                  </Text>
                  {isSignUp && step === 1 ? <ChevronRight size={18} color="#fff" /> : <ArrowRight size={18} color="#fff" />}
                </>
              )}
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={[styles.switchText, { color: colors.gray500 }]}>
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setStep(1); }}>
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
  // Step indicator
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 6,
  },
  stepLabel: {
    fontSize: FontSizes.xs,
    marginLeft: Spacing.md,
    fontWeight: FontWeights.medium,
  },
  // Chip selector
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  chipHalf: {
    minWidth: '46%',
    alignItems: 'center',
  },
  chipText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    textAlign: 'center',
  },
  // Back button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    gap: 6,
  },
  backButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
  },
});
