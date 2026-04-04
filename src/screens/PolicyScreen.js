import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { BarChart } from 'react-native-gifted-charts';
import {
  Upload, Shield, AlertTriangle, CheckCircle2, Info, Send, Bot, User as UserIcon,
  ChevronDown, ChevronUp, Sparkles, ArrowRight, ArrowLeft, Zap, Sun, Moon,
} from 'lucide-react-native';
import PolicyModal from '../components/PolicyModal';
import { policies, gapAnalysis, assets, getScenarioResponse } from '../data/mockData';
import { FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';
import { useTheme } from '../ThemeContext';

export default function PolicyScreen({ user, navigation }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedGaps, setExpandedGaps] = useState({});
  const scrollRef = useRef(null);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled && result.assets?.[0]) {
        setUploadedFile(result.assets[0].name);
      }
    } catch (e) {}
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const query = chatInput;
    setChatInput('');
    setIsTyping(true);
    setTimeout(() => {
      const scenario = getScenarioResponse(query);
      setChatMessages((prev) => [...prev, { role: 'assistant', scenario }]);
      setIsTyping(false);
    }, 1500);
  };

  const toggleGap = (idx) => setExpandedGaps((p) => ({ ...p, [idx]: !p[idx] }));
  const totalAssetValue = assets.reduce((s, a) => s + a.value, 0);

  // Build bar chart data for asset vs coverage
  const assetCoverageData = [
    { value: totalAssetValue / 1000, label: 'Assets', frontColor: isDark ? '#7B5EA7' : '#FF4081', topLabelComponent: () => <Text style={{ fontSize: 9, color: colors.gray400, marginBottom: 2 }}>${(totalAssetValue/1000).toFixed(0)}k</Text> },
    { value: 10, label: 'Renter', frontColor: isDark ? '#E040FB' : '#AB47BC', spacing: 8, topLabelComponent: () => <Text style={{ fontSize: 9, color: colors.gray400, marginBottom: 2 }}>$10k</Text> },
    { value: 50, label: 'Auto', frontColor: isDark ? '#3D5A80' : '#FFD600', spacing: 8, topLabelComponent: () => <Text style={{ fontSize: 9, color: colors.gray400, marginBottom: 2 }}>$50k</Text> },
    { value: 500, label: 'Health', frontColor: isDark ? '#00B894' : '#FF6D00', spacing: 8, topLabelComponent: () => <Text style={{ fontSize: 9, color: colors.gray400, marginBottom: 2 }}>$500k</Text> },
  ];

  return (
    <SafeAreaView style={[styles.page, { backgroundColor: colors.bgPrimary }]}>  
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bgPrimary} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Hub')} style={[styles.backBtn, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <ArrowLeft size={20} color={isDark ? colors.accent : '#6C5CE7'} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pageTitle, { color: colors.gray800 }]}>Policy & Insurance AI</Text>
              <Text style={[styles.pageSubtitle, { color: colors.gray500 }]}>Upload policies, analyze gaps, and run AI scenarios</Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: colors.gray50 }]}>
              {isDark ? <Sun size={18} color="#FDCB6E" /> : <Moon size={18} color="#6C5CE7" />}
            </TouchableOpacity>
          </View>

          {/* Upload Zone */}
          <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Upload Policy Document</Text>
            <TouchableOpacity
              style={[styles.uploadZone, { borderColor: uploadedFile ? colors.success : colors.gray300, backgroundColor: uploadedFile ? colors.successLight : colors.gray50 }]}
              onPress={handleFilePick}
              activeOpacity={0.7}
            >
              {uploadedFile ? (
                <View style={styles.uploadSuccess}>
                  <CheckCircle2 size={36} color={colors.success} />
                  <Text style={[styles.uploadFilename, { color: colors.gray800 }]}>{uploadedFile}</Text>
                  <Text style={[styles.uploadHint, { color: colors.gray500 }]}>Uploaded successfully</Text>
                </View>
              ) : (
                <>
                  <View style={[styles.uploadIconBox, { backgroundColor: colors.primary50 }]}>
                    <Upload size={24} color={isDark ? colors.accent : '#6C5CE7'} />
                  </View>
                  <Text style={[styles.uploadText, { color: colors.gray700 }]}>Tap to upload PDF</Text>
                  <Text style={[styles.uploadHint, { color: colors.gray500 }]}>Select a policy document from your device</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Active Policies */}
          <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.gray800 }]}>Active Policies</Text>
            <View style={styles.policiesGrid}>
              {policies.map((policy) => (
                <View key={policy.id} style={[styles.policyCard, { backgroundColor: isDark ? colors.gray50 : '#FFFFFF', borderColor: colors.cardBorder }]}>
                  <View style={styles.policyCardTop}>
                    <View style={[styles.policyIcon, { backgroundColor: colors.primary50 }]}>
                      <Shield size={18} color={isDark ? colors.accent : '#6C5CE7'} />
                    </View>
                    <View style={[styles.scoreBadge, { backgroundColor: policy.scoreColor === 'green' ? colors.successLight : colors.warningLight }]}>
                      <Text style={[styles.scoreBadgeText, { color: policy.scoreColor === 'green' ? '#059669' : '#D97706' }]}>
                        {policy.coverageScore}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.policyName, { color: colors.gray800 }]}>{policy.name}</Text>
                  <Text style={[styles.policyMeta, { color: colors.gray500 }]}>{policy.provider} · ${policy.premium}/mo</Text>
                  <TouchableOpacity style={styles.viewSummaryBtn} onPress={() => setSelectedPolicy(policy)}>
                    <Text style={[styles.viewSummaryText, { color: isDark ? colors.accent : '#6C5CE7' }]}>View Summary</Text>
                    <ArrowRight size={14} color={isDark ? colors.accent : '#6C5CE7'} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Gap Analysis - Properly Spaced */}
          <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.gray800, marginBottom: 0 }]}>Asset vs. Coverage Gap</Text>
              <View style={[styles.badgePurple, { backgroundColor: colors.primary50 }]}>
                <Text style={[styles.badgePurpleText, { color: isDark ? colors.primary600 : '#6C5CE7' }]}>Assets: ${totalAssetValue.toLocaleString()}</Text>
              </View>
            </View>

            {/* Bar Chart for Assets vs Coverage */}
            <View style={styles.chartSection}>
              <BarChart
                data={assetCoverageData}
                barWidth={40}
                spacing={24}
                roundedTop
                roundedBottom={false}
                xAxisThickness={1}
                yAxisThickness={0}
                xAxisColor={colors.gray200}
                yAxisTextStyle={{ color: colors.gray500, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.gray500, fontSize: 11, marginTop: 4 }}
                noOfSections={4}
                maxValue={600}
                formatYLabel={(val) => `$${val}k`}
                height={160}
                isAnimated
                animationDuration={600}
              />
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: isDark ? '#7B5EA7' : '#FF4081' }]} />
                  <Text style={[styles.legendText, { color: colors.gray500 }]}>Total Assets</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: isDark ? '#E040FB' : '#AB47BC' }]} />
                  <Text style={[styles.legendText, { color: colors.gray500 }]}>Renter</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: isDark ? '#3D5A80' : '#FFD600' }]} />
                  <Text style={[styles.legendText, { color: colors.gray500 }]}>Auto</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: isDark ? '#00B894' : '#FF6D00' }]} />
                  <Text style={[styles.legendText, { color: colors.gray500 }]}>Health</Text>
                </View>
              </View>
            </View>

            {/* Gap Items */}
            <Text style={[styles.subSectionTitle, { color: colors.gray700 }]}>Coverage Gaps</Text>
            {gapAnalysis.map((gap, idx) => (
              <View
                key={idx}
                style={[
                  styles.gapItem,
                  {
                    borderColor: colors.cardBorder,
                    borderLeftColor: gap.severity === 'high' ? colors.danger : gap.severity === 'medium' ? colors.warning : colors.success,
                    backgroundColor: isDark ? colors.gray50 : '#FFFFFF',
                  },
                ]}
              >
                <TouchableOpacity style={styles.gapHeader} onPress={() => toggleGap(idx)} activeOpacity={0.7}>
                  <View style={styles.gapLeft}>
                    {gap.type === 'warning' ? (
                      <AlertTriangle size={18} color={colors.warning} />
                    ) : (
                      <Info size={18} color={colors.info} />
                    )}
                    <Text style={[styles.gapTitle, { color: colors.gray800 }]}>{gap.title}</Text>
                  </View>
                  <View style={styles.gapRight}>
                    <View style={[styles.severityBadge, {
                      backgroundColor: gap.severity === 'high' ? colors.dangerLight : gap.severity === 'medium' ? colors.warningLight : colors.successLight,
                    }]}>
                      <Text style={[styles.severityText, {
                        color: gap.severity === 'high' ? '#DC2626' : gap.severity === 'medium' ? '#D97706' : '#059669',
                      }]}>
                        {gap.severity === 'high' ? 'High Risk' : gap.severity === 'medium' ? 'Medium' : 'Low Risk'}
                      </Text>
                    </View>
                    {expandedGaps[idx] ? <ChevronUp size={16} color={colors.gray400} /> : <ChevronDown size={16} color={colors.gray400} />}
                  </View>
                </TouchableOpacity>
                {expandedGaps[idx] && (
                  <View style={styles.gapBody}>
                    <Text style={[styles.gapMessage, { color: colors.gray600 }]}>{gap.message}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Scenario Simulator */}
          <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <View style={styles.chatHeaderLeft}>
                <Sparkles size={20} color={isDark ? colors.accent : '#6C5CE7'} />
                <Text style={[styles.cardTitle, { color: colors.gray800, marginBottom: 0 }]}>Scenario Simulator</Text>
              </View>
              <View style={[styles.badgePurple, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.badgePurpleText, { color: isDark ? colors.accent : '#AB47BC' }]}>AI Powered</Text>
              </View>
            </View>

            <View style={styles.chatArea}>
              {chatMessages.length === 0 && (
                <View style={styles.chatEmpty}>
                  <Bot size={36} color={colors.gray300} />
                  <Text style={[styles.chatEmptyTitle, { color: colors.gray700 }]}>Ask a "What If" Question</Text>
                  <Text style={[styles.chatEmptyHint, { color: colors.gray500 }]}>Try: "What happens if I lose my job for 3 months?"</Text>
                  <View style={styles.suggestions}>
                    {[
                      'What happens if I lose my job for 3 months?',
                      'What if my car is totaled?',
                      'What if I have a medical emergency?',
                    ].map((q, i) => (
                      <TouchableOpacity key={i} style={[styles.suggestionBtn, { backgroundColor: colors.gray50, borderColor: colors.gray200 }]} onPress={() => setChatInput(q)}>
                        <Zap size={14} color={isDark ? colors.accent : '#6C5CE7'} />
                        <Text style={[styles.suggestionText, { color: colors.gray700 }]}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {chatMessages.map((msg, idx) => (
                <View key={idx} style={[styles.chatMsg, msg.role === 'user' && styles.chatMsgUser]}>
                  <View style={[styles.chatAvatar, msg.role === 'user' ? { backgroundColor: isDark ? colors.primary300 : '#6C5CE7' } : { backgroundColor: colors.gray100 }]}>
                    {msg.role === 'user' ? <UserIcon size={14} color="#FFFFFF" /> : <Bot size={14} color={colors.gray600} />}
                  </View>
                  <View style={styles.chatBubble}>
                    {msg.role === 'user' ? (
                      <View style={[styles.userBubble, { backgroundColor: isDark ? colors.primary300 : '#6C5CE7' }]}>
                        <Text style={styles.userBubbleText}>{msg.content}</Text>
                      </View>
                    ) : (
                      <View style={[styles.scenarioCard, { borderColor: colors.cardBorder, backgroundColor: colors.gray50 }]}>
                        <View style={[styles.pathA, { backgroundColor: colors.cardBg }]}>
                          <Text style={[styles.pathTitle, { color: colors.gray800 }]}>{msg.scenario.pathA.title}</Text>
                          <Text style={[styles.pathNarr, { color: colors.gray600 }]}>{msg.scenario.pathA.narrative}</Text>
                          {Object.entries(msg.scenario.pathA.metrics).map(([k, v]) => (
                            <View key={k} style={[styles.metricRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                              <Text style={[styles.metricLabel, { color: colors.gray500 }]}>{k.replace(/([A-Z])/g, ' $1').trim()}</Text>
                              <Text style={[styles.metricValue, { color: colors.gray800 }]}>{v}</Text>
                            </View>
                          ))}
                        </View>
                        <View style={[styles.vsRow, { backgroundColor: colors.gray100 }]}>
                          <Text style={[styles.vsText, { color: colors.gray400 }]}>VS</Text>
                        </View>
                        <View style={[styles.pathB, { backgroundColor: colors.primary50 }]}>
                          <Text style={[styles.pathTitle, { color: colors.gray800 }]}>{msg.scenario.pathB.title}</Text>
                          <Text style={[styles.pathNarr, { color: colors.gray600 }]}>{msg.scenario.pathB.narrative}</Text>
                          {Object.entries(msg.scenario.pathB.metrics).map(([k, v]) => (
                            <View key={k} style={[styles.metricRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                              <Text style={[styles.metricLabel, { color: colors.gray500 }]}>{k.replace(/([A-Z])/g, ' $1').trim()}</Text>
                              <Text style={[styles.metricValue, { color: colors.gray800 }]}>{v}</Text>
                            </View>
                          ))}
                        </View>
                        {msg.scenario.recommendation ? (
                          <View style={[styles.recommendation, { backgroundColor: colors.infoLight, borderTopColor: isDark ? colors.gray200 : '#BFDBFE' }]}>
                            <Text style={[styles.recText, { color: colors.gray700 }]}>{msg.scenario.recommendation}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {isTyping && (
                <View style={styles.chatMsg}>
                  <View style={[styles.chatAvatar, { backgroundColor: colors.gray100 }]}>
                    <Bot size={14} color={colors.gray600} />
                  </View>
                  <View style={[styles.typingIndicator, { backgroundColor: colors.gray100 }]}>
                    <View style={[styles.typingDot, { backgroundColor: colors.gray400 }]} />
                    <View style={[styles.typingDot, { backgroundColor: colors.gray400, opacity: 0.6 }]} />
                    <View style={[styles.typingDot, { backgroundColor: colors.gray400, opacity: 0.3 }]} />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.chatInputRow}>
              <TextInput
                style={[styles.chatInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder='Ask a "what-if" scenario...'
                placeholderTextColor={colors.gray400}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleChatSubmit}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: isDark ? colors.accent : '#6C5CE7' }, !chatInput.trim() && styles.sendBtnDisabled]}
                onPress={handleChatSubmit}
                disabled={!chatInput.trim()}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <PolicyModal visible={!!selectedPolicy} policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xxl,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radii.sm, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', ...Shadows.sm,
  },
  themeBtn: {
    width: 36, height: 36, borderRadius: Radii.full,
    alignItems: 'center', justifyContent: 'center',
  },
  pageTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold },
  pageSubtitle: { fontSize: FontSizes.sm },
  cardBox: {
    borderRadius: Radii.lg, borderWidth: 1, padding: Spacing.xxl, marginBottom: Spacing.xl, ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, marginBottom: Spacing.md },
  badgePurple: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full },
  badgePurpleText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  // Upload
  uploadZone: {
    borderWidth: 2, borderStyle: 'dashed', borderRadius: Radii.lg, padding: Spacing.xxxl, alignItems: 'center', gap: Spacing.md,
  },
  uploadIconBox: { width: 56, height: 56, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  uploadHint: { fontSize: FontSizes.sm },
  uploadSuccess: { alignItems: 'center', gap: Spacing.sm },
  uploadFilename: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  // Policies
  policiesGrid: { gap: Spacing.md },
  policyCard: { borderRadius: Radii.lg, borderWidth: 1, padding: Spacing.xl, gap: Spacing.sm, ...Shadows.sm },
  policyCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  policyIcon: { width: 38, height: 38, borderRadius: Radii.sm, alignItems: 'center', justifyContent: 'center' },
  scoreBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full },
  scoreBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  policyName: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
  policyMeta: { fontSize: FontSizes.sm },
  viewSummaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  viewSummaryText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  // Chart Section
  chartSection: { marginBottom: Spacing.xl, alignItems: 'center', paddingTop: Spacing.md },
  chartLegend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.lg, marginTop: Spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: FontSizes.xs },
  subSectionTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, marginBottom: Spacing.md },
  // Gap
  gapItem: { borderWidth: 1, borderLeftWidth: 3, borderRadius: Radii.md, marginBottom: Spacing.md, overflow: 'hidden' },
  gapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  gapLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  gapTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, flex: 1 },
  gapRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  severityBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radii.full },
  severityText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  gapBody: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, paddingLeft: 48 },
  gapMessage: { fontSize: FontSizes.sm, lineHeight: 22 },
  // Chat
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chatArea: { minHeight: 200, marginBottom: Spacing.lg },
  chatEmpty: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.sm },
  chatEmptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold },
  chatEmptyHint: { fontSize: FontSizes.sm, textAlign: 'center' },
  suggestions: { gap: Spacing.sm, marginTop: Spacing.lg, width: '100%' },
  suggestionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderWidth: 1, borderRadius: Radii.md,
  },
  suggestionText: { fontSize: FontSizes.sm, flex: 1 },
  chatMsg: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  chatMsgUser: { flexDirection: 'row-reverse' },
  chatAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  chatBubble: { flex: 1 },
  userBubble: { borderRadius: Radii.lg, padding: Spacing.lg, alignSelf: 'flex-end', maxWidth: '85%' },
  userBubbleText: { color: '#FFFFFF', fontSize: FontSizes.md },
  scenarioCard: { borderWidth: 1, borderRadius: Radii.lg, overflow: 'hidden' },
  pathA: { padding: Spacing.lg },
  pathB: { padding: Spacing.lg },
  pathTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, marginBottom: Spacing.sm },
  pathNarr: { fontSize: FontSizes.sm, lineHeight: 20, marginBottom: Spacing.md },
  vsRow: { paddingVertical: Spacing.xs, alignItems: 'center' },
  vsText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, letterSpacing: 1 },
  metricRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: Radii.sm, padding: Spacing.sm, marginBottom: 4,
  },
  metricLabel: { fontSize: FontSizes.xs, textTransform: 'capitalize' },
  metricValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold },
  recommendation: { padding: Spacing.lg, borderTopWidth: 1 },
  recText: { fontSize: FontSizes.sm, lineHeight: 22 },
  typingIndicator: { flexDirection: 'row', gap: 5, borderRadius: Radii.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  typingDot: { width: 8, height: 8, borderRadius: 4 },
  chatInputRow: { flexDirection: 'row', gap: Spacing.sm },
  chatInput: {
    flex: 1, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: FontSizes.md,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: Radii.md, alignItems: 'center', justifyContent: 'center', ...Shadows.sm,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
