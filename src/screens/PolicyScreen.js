import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  Upload, Shield, AlertTriangle, CheckCircle2, Info, Send, Bot, User as UserIcon,
  ChevronDown, ChevronUp, Sparkles, ArrowRight, ArrowLeft, Zap, FileText,
} from 'lucide-react-native';
import PolicyModal from '../components/PolicyModal';
import { policies, gapAnalysis, assets, getScenarioResponse } from '../data/mockData';
import { Colors, FontSizes, FontWeights, Spacing, Radii, Shadows, CardStyle } from '../theme';

export default function PolicyScreen({ user, navigation }) {
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
    } catch (e) {
      // User cancelled
    }
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

  return (
    <SafeAreaView style={styles.page}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bgPrimary} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('Hub')} style={styles.backBtn}>
              <ArrowLeft size={20} color={Colors.primary500} />
            </TouchableOpacity>
            <View>
              <Text style={styles.pageTitle}>Policy & Insurance AI</Text>
              <Text style={styles.pageSubtitle}>Upload policies, analyze gaps, and run AI scenarios</Text>
            </View>
          </View>

          {/* Upload Zone */}
          <View style={styles.cardBox}>
            <Text style={styles.cardTitle}>Upload Policy Document</Text>
            <TouchableOpacity
              style={[styles.uploadZone, uploadedFile && styles.uploadZoneDone]}
              onPress={handleFilePick}
              activeOpacity={0.7}
              accessibilityLabel="Upload policy document"
            >
              {uploadedFile ? (
                <View style={styles.uploadSuccess}>
                  <CheckCircle2 size={36} color={Colors.success} />
                  <Text style={styles.uploadFilename}>{uploadedFile}</Text>
                  <Text style={styles.uploadHint}>Uploaded successfully</Text>
                </View>
              ) : (
                <>
                  <View style={styles.uploadIconBox}>
                    <Upload size={24} color={Colors.primary500} />
                  </View>
                  <Text style={styles.uploadText}>Tap to upload PDF</Text>
                  <Text style={styles.uploadHint}>Select a policy document from your device</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Active Policies */}
          <View style={styles.cardBox}>
            <Text style={styles.cardTitle}>Active Policies</Text>
            <View style={styles.policiesGrid}>
              {policies.map((policy) => (
                <View key={policy.id} style={styles.policyCard}>
                  <View style={styles.policyCardTop}>
                    <View style={styles.policyIcon}>
                      <Shield size={18} color={Colors.primary500} />
                    </View>
                    <View style={[styles.scoreBadge, { backgroundColor: policy.scoreColor === 'green' ? Colors.successLight : Colors.warningLight }]}>
                      <Text style={[styles.scoreBadgeText, { color: policy.scoreColor === 'green' ? '#059669' : '#D97706' }]}>
                        {policy.coverageScore}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.policyName}>{policy.name}</Text>
                  <Text style={styles.policyMeta}>{policy.provider} · ${policy.premium}/mo</Text>
                  <TouchableOpacity style={styles.viewSummaryBtn} onPress={() => setSelectedPolicy(policy)}>
                    <Text style={styles.viewSummaryText}>View Summary</Text>
                    <ArrowRight size={14} color={Colors.primary500} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Gap Analysis */}
          <View style={styles.cardBox}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Asset vs. Coverage Gap Analysis</Text>
              <View style={styles.badgePurple}>
                <Text style={styles.badgePurpleText}>Assets: ${totalAssetValue.toLocaleString()}</Text>
              </View>
            </View>
            {gapAnalysis.map((gap, idx) => (
              <View
                key={idx}
                style={[
                  styles.gapItem,
                  { borderLeftColor: gap.severity === 'high' ? Colors.danger : gap.severity === 'medium' ? Colors.warning : Colors.success },
                ]}
              >
                <TouchableOpacity style={styles.gapHeader} onPress={() => toggleGap(idx)} activeOpacity={0.7}>
                  <View style={styles.gapLeft}>
                    {gap.type === 'warning' ? (
                      <AlertTriangle size={18} color={Colors.warning} />
                    ) : (
                      <Info size={18} color={Colors.info} />
                    )}
                    <Text style={styles.gapTitle}>{gap.title}</Text>
                  </View>
                  <View style={styles.gapRight}>
                    <View style={[styles.severityBadge, {
                      backgroundColor: gap.severity === 'high' ? Colors.dangerLight : gap.severity === 'medium' ? Colors.warningLight : Colors.successLight,
                    }]}>
                      <Text style={[styles.severityText, {
                        color: gap.severity === 'high' ? '#DC2626' : gap.severity === 'medium' ? '#D97706' : '#059669',
                      }]}>
                        {gap.severity === 'high' ? 'High Risk' : gap.severity === 'medium' ? 'Medium' : 'Low Risk'}
                      </Text>
                    </View>
                    {expandedGaps[idx] ? <ChevronUp size={16} color={Colors.gray400} /> : <ChevronDown size={16} color={Colors.gray400} />}
                  </View>
                </TouchableOpacity>
                {expandedGaps[idx] && (
                  <View style={styles.gapBody}>
                    <Text style={styles.gapMessage}>{gap.message}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Scenario Simulator */}
          <View style={styles.cardBox}>
            <View style={styles.cardHeader}>
              <View style={styles.chatHeaderLeft}>
                <Sparkles size={20} color={Colors.primary500} />
                <Text style={styles.cardTitle}>Scenario Simulator</Text>
              </View>
              <View style={styles.badgePurple}>
                <Text style={styles.badgePurpleText}>AI Powered</Text>
              </View>
            </View>

            {/* Messages */}
            <View style={styles.chatArea}>
              {chatMessages.length === 0 && (
                <View style={styles.chatEmpty}>
                  <Bot size={36} color={Colors.gray300} />
                  <Text style={styles.chatEmptyTitle}>Ask a "What If" Question</Text>
                  <Text style={styles.chatEmptyHint}>
                    Try: "What happens if I lose my job for 3 months?"
                  </Text>
                  <View style={styles.suggestions}>
                    {[
                      'What happens if I lose my job for 3 months?',
                      'What if my car is totaled?',
                      'What if I have a medical emergency?',
                    ].map((q, i) => (
                      <TouchableOpacity key={i} style={styles.suggestionBtn} onPress={() => setChatInput(q)}>
                        <Zap size={14} color={Colors.primary400} />
                        <Text style={styles.suggestionText}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {chatMessages.map((msg, idx) => (
                <View key={idx} style={[styles.chatMsg, msg.role === 'user' && styles.chatMsgUser]}>
                  <View style={[styles.chatAvatar, msg.role === 'user' ? styles.chatAvatarUser : styles.chatAvatarBot]}>
                    {msg.role === 'user' ? <UserIcon size={14} color={Colors.white} /> : <Bot size={14} color={Colors.gray600} />}
                  </View>
                  <View style={styles.chatBubble}>
                    {msg.role === 'user' ? (
                      <View style={styles.userBubble}>
                        <Text style={styles.userBubbleText}>{msg.content}</Text>
                      </View>
                    ) : (
                      <View style={styles.scenarioCard}>
                        {/* Path A */}
                        <View style={styles.pathA}>
                          <Text style={styles.pathTitle}>{msg.scenario.pathA.title}</Text>
                          <Text style={styles.pathNarr}>{msg.scenario.pathA.narrative}</Text>
                          {Object.entries(msg.scenario.pathA.metrics).map(([k, v]) => (
                            <View key={k} style={styles.metricRow}>
                              <Text style={styles.metricLabel}>{k.replace(/([A-Z])/g, ' $1').trim()}</Text>
                              <Text style={styles.metricValue}>{v}</Text>
                            </View>
                          ))}
                        </View>
                        <View style={styles.vsRow}>
                          <Text style={styles.vsText}>VS</Text>
                        </View>
                        {/* Path B */}
                        <View style={styles.pathB}>
                          <Text style={styles.pathTitle}>{msg.scenario.pathB.title}</Text>
                          <Text style={styles.pathNarr}>{msg.scenario.pathB.narrative}</Text>
                          {Object.entries(msg.scenario.pathB.metrics).map(([k, v]) => (
                            <View key={k} style={styles.metricRow}>
                              <Text style={styles.metricLabel}>{k.replace(/([A-Z])/g, ' $1').trim()}</Text>
                              <Text style={styles.metricValue}>{v}</Text>
                            </View>
                          ))}
                        </View>
                        {msg.scenario.recommendation ? (
                          <View style={styles.recommendation}>
                            <Text style={styles.recText}>{msg.scenario.recommendation}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {isTyping && (
                <View style={styles.chatMsg}>
                  <View style={styles.chatAvatarBot}>
                    <Bot size={14} color={Colors.gray600} />
                  </View>
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDot} />
                    <View style={[styles.typingDot, { opacity: 0.6 }]} />
                    <View style={[styles.typingDot, { opacity: 0.3 }]} />
                  </View>
                </View>
              )}
            </View>

            {/* Input */}
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder='Ask a "what-if" scenario...'
                placeholderTextColor={Colors.gray400}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleChatSubmit}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[styles.sendBtn, !chatInput.trim() && styles.sendBtnDisabled]}
                onPress={handleChatSubmit}
                disabled={!chatInput.trim()}
              >
                <Send size={18} color={Colors.white} />
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
  page: { flex: 1, backgroundColor: Colors.bgPrimary },
  scrollContent: { padding: Spacing.xl },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xxl,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: Radii.sm,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm,
  },
  pageTitle: { fontSize: FontSizes.xxl, fontWeight: FontWeights.extrabold, color: Colors.gray800 },
  pageSubtitle: { fontSize: FontSizes.sm, color: Colors.gray500 },
  cardBox: { ...CardStyle, padding: Spacing.xxl, marginBottom: Spacing.xl },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  cardTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.bold, color: Colors.gray800, marginBottom: Spacing.md },
  badgePurple: { backgroundColor: Colors.primary50, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full },
  badgePurpleText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold, color: Colors.primary600 },
  // Upload
  uploadZone: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.gray300,
    borderRadius: Radii.lg, padding: Spacing.xxxl, alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.gray50,
  },
  uploadZoneDone: { borderColor: Colors.success, borderStyle: 'solid', backgroundColor: Colors.successLight },
  uploadIconBox: { width: 56, height: 56, borderRadius: Radii.md, backgroundColor: Colors.primary50, alignItems: 'center', justifyContent: 'center' },
  uploadText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.gray700 },
  uploadHint: { fontSize: FontSizes.sm, color: Colors.gray500 },
  uploadSuccess: { alignItems: 'center', gap: Spacing.sm },
  uploadFilename: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.gray800 },
  // Policies
  policiesGrid: { gap: Spacing.md },
  policyCard: { ...CardStyle, padding: Spacing.xl, gap: Spacing.sm },
  policyCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  policyIcon: { width: 38, height: 38, borderRadius: Radii.sm, backgroundColor: Colors.primary50, alignItems: 'center', justifyContent: 'center' },
  scoreBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radii.full },
  scoreBadgeText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  policyName: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.gray800 },
  policyMeta: { fontSize: FontSizes.sm, color: Colors.gray500 },
  viewSummaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.sm },
  viewSummaryText: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, color: Colors.primary500 },
  // Gap
  gapItem: { borderWidth: 1, borderColor: Colors.gray200, borderLeftWidth: 3, borderRadius: Radii.md, marginBottom: Spacing.sm, overflow: 'hidden' },
  gapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  gapLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  gapTitle: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold, color: Colors.gray800, flex: 1 },
  gapRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  severityBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radii.full },
  severityText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  gapBody: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, paddingLeft: 48 },
  gapMessage: { fontSize: FontSizes.sm, color: Colors.gray600, lineHeight: 22 },
  // Chat
  chatHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  chatArea: { minHeight: 200, marginBottom: Spacing.lg },
  chatEmpty: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.sm },
  chatEmptyTitle: { fontSize: FontSizes.lg, fontWeight: FontWeights.semibold, color: Colors.gray700 },
  chatEmptyHint: { fontSize: FontSizes.sm, color: Colors.gray500, textAlign: 'center' },
  suggestions: { gap: Spacing.sm, marginTop: Spacing.lg, width: '100%' },
  suggestionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, backgroundColor: Colors.gray50, borderWidth: 1, borderColor: Colors.gray200,
    borderRadius: Radii.md,
  },
  suggestionText: { fontSize: FontSizes.sm, color: Colors.gray700, flex: 1 },
  // Messages
  chatMsg: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  chatMsgUser: { flexDirection: 'row-reverse' },
  chatAvatar: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  chatAvatarUser: { backgroundColor: Colors.primary500, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  chatAvatarBot: { backgroundColor: Colors.gray100, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  chatBubble: { flex: 1 },
  userBubble: { backgroundColor: Colors.primary500, borderRadius: Radii.lg, padding: Spacing.lg, alignSelf: 'flex-end', maxWidth: '85%' },
  userBubbleText: { color: Colors.white, fontSize: FontSizes.md },
  // Scenario
  scenarioCard: { borderWidth: 1, borderColor: Colors.gray200, borderRadius: Radii.lg, overflow: 'hidden', backgroundColor: Colors.gray50 },
  pathA: { backgroundColor: Colors.white, padding: Spacing.lg },
  pathB: { backgroundColor: Colors.primary50, padding: Spacing.lg },
  pathTitle: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gray800, marginBottom: Spacing.sm },
  pathNarr: { fontSize: FontSizes.sm, color: Colors.gray600, lineHeight: 20, marginBottom: Spacing.md },
  vsRow: { backgroundColor: Colors.gray100, paddingVertical: Spacing.xs, alignItems: 'center' },
  vsText: { fontSize: FontSizes.xs, fontWeight: FontWeights.bold, color: Colors.gray400, letterSpacing: 1 },
  metricRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: Radii.sm, padding: Spacing.sm, marginBottom: 4,
  },
  metricLabel: { fontSize: FontSizes.xs, color: Colors.gray500, textTransform: 'capitalize' },
  metricValue: { fontSize: FontSizes.sm, fontWeight: FontWeights.bold, color: Colors.gray800 },
  recommendation: { padding: Spacing.lg, backgroundColor: Colors.infoLight, borderTopWidth: 1, borderTopColor: Colors.blue200 },
  recText: { fontSize: FontSizes.sm, color: Colors.gray700, lineHeight: 22 },
  // Typing
  typingIndicator: { flexDirection: 'row', gap: 5, backgroundColor: Colors.gray100, borderRadius: Radii.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gray400 },
  // Input
  chatInputRow: { flexDirection: 'row', gap: Spacing.sm },
  chatInput: {
    flex: 1, backgroundColor: Colors.gray50, borderWidth: 1, borderColor: Colors.gray200,
    borderRadius: Radii.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    fontSize: FontSizes.md, color: Colors.gray800,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: Radii.md, backgroundColor: Colors.primary500,
    alignItems: 'center', justifyContent: 'center', ...Shadows.sm,
  },
  sendBtnDisabled: { opacity: 0.4 },
});
