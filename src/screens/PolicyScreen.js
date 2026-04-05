import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, Dimensions,
  Alert, ActivityIndicator, Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { BarChart } from 'react-native-gifted-charts';
import {
  Upload, Shield, AlertTriangle, CheckCircle2, Info, Send, Bot, User as UserIcon,
  ChevronDown, ChevronUp, Sparkles, ArrowRight, ArrowLeft, Zap, Sun, Moon,
  Trash2, Edit3, Plus, X,
} from 'lucide-react-native';
import PolicyModal from '../components/PolicyModal';
import EmptyState from '../components/EmptyState';
import { uploadPolicy, listPolicies, deletePolicy, runScenario } from '../api/policy';
import { listAssets, addAsset, updateAsset, deleteAsset } from '../api/finance';
import { FontSizes, FontWeights, Spacing, Radii, Shadows } from '../theme';
import { useTheme } from '../ThemeContext';

const normalizePolicy = (p) => ({
  ...p,
  name: p.originalName || p.name,
  provider: p.parsedData?.provider || 'Unknown',
  premium: p.parsedData?.premium || 0,
  premiumFrequency: p.parsedData?.premiumFrequency || 'monthly',
  covered: p.parsedData?.covered || [],
  excluded: p.parsedData?.excluded || [],
  expiresAt: p.renewalDate ? new Date(p.renewalDate).toLocaleDateString() : 'N/A',
  scoreColor: p.coverageScore === 'Well Covered' ? 'green' : p.coverageScore ? 'orange' : 'gray',
});

const ASSET_TYPES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'jewelry', label: 'Jewelry' },
  { value: 'collectibles', label: 'Collectibles' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'other', label: 'Other' },
];

const assetIcons = {
  real_estate: '🏠', vehicle: '🚗', electronics: '💻', jewelry: '💎',
  collectibles: '🎨', furniture: '🪑', other: '📦',
};

export default function PolicyScreen({ user, navigation }) {
  const { isDark, toggleTheme, colors } = useTheme();
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedGaps, setExpandedGaps] = useState({});
  const scrollRef = useRef(null);

  // Assets state + CRUD
  const [assets, setAssets] = useState([]);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetForm, setAssetForm] = useState({ name: '', type: 'other', estimatedValue: '', description: '' });

  // Gap analysis — populated from policy API when available
  const gapAnalysis = [];

  // Load policies + assets from API on mount
  const loadData = useCallback(async () => {
    try {
      const [apiPolicies, assetItems] = await Promise.all([
        listPolicies().catch(() => []),
        listAssets().catch(() => []),
      ]);
      if (apiPolicies && apiPolicies.length > 0) {
        setPolicies(apiPolicies.map(normalizePolicy));
      }
      setAssets((assetItems || []).map(a => ({
        id: a.id,
        name: a.name,
        type: a.type,
        value: parseFloat(a.estimatedValue || 0),
        description: a.description || '',
      })));
    } catch {
      // API unavailable
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Policy delete
  const handleDeletePolicy = (policy) => {
    Alert.alert('Delete Policy', `Are you sure you want to delete "${policy.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deletePolicy(policy.id);
          await loadData();
        } catch (err) {
          Alert.alert('Error', err.message || 'Failed to delete policy');
        }
      }},
    ]);
  };

  // Asset CRUD
  const resetAssetForm = () => {
    setAssetForm({ name: '', type: 'other', estimatedValue: '', description: '' });
    setEditingAsset(null);
  };

  const handleSaveAsset = async () => {
    if (!assetForm.name || !assetForm.estimatedValue) return;
    try {
      const payload = {
        name: assetForm.name,
        type: assetForm.type,
        estimatedValue: parseFloat(assetForm.estimatedValue),
        description: assetForm.description || undefined,
      };
      if (editingAsset) {
        await updateAsset(editingAsset.id, payload);
      } else {
        await addAsset(payload);
      }
      await loadData();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save asset');
    }
    setShowAssetModal(false);
    resetAssetForm();
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({ name: asset.name, type: asset.type, estimatedValue: String(asset.value), description: asset.description || '' });
    setShowAssetModal(true);
  };

  const handleDeleteAsset = (asset) => {
    Alert.alert('Delete Asset', `Are you sure you want to delete "${asset.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteAsset(asset.id);
          await loadData();
        } catch (err) {
          Alert.alert('Error', err.message || 'Failed to delete asset');
        }
      }},
    ]);
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        setUploadedFile(file.name);
        setUploading(true);
        try {
          await uploadPolicy(file, 'auto', null);
          Alert.alert('Success', 'Policy uploaded! AI parsing will begin shortly.');
          // Refresh policies list
          await loadData();
        } catch (err) {
          Alert.alert('Upload Failed', err.message || 'Could not upload policy');
        } finally {
          setUploading(false);
        }
      }
    } catch (e) {}
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages((prev) => [...prev, userMsg]);
    const query = chatInput;
    setChatInput('');
    setIsTyping(true);

    try {
      const result = await runScenario(query);
      const scenario = {
        pathA: {
          title: result.pathA?.label || 'Status Quo',
          narrative: result.narrative || '',
          metrics: result.pathA?.endState || {},
        },
        pathB: {
          title: result.pathB?.label || 'Scenario',
          narrative: result.narrative || '',
          metrics: result.pathB?.endState || {},
        },
        recommendation: result.delta
          ? `Risk: ${result.delta.riskLevel || 'N/A'} · Recovery: ${result.delta.monthsToRecover || '?'} months · Net worth impact: $${result.delta.netWorthDiff || 0}`
          : null,
      };
      setChatMessages((prev) => [...prev, { role: 'assistant', scenario }]);
    } catch {
      setChatMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Unable to analyze this scenario right now. Please make sure the AI service is running and try again.',
      }]);
    } finally {
      setIsTyping(false);
    }
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
              disabled={uploading}
            >
              {uploading ? (
                <View style={styles.uploadSuccess}>
                  <ActivityIndicator size="large" color={isDark ? colors.accent : '#6C5CE7'} />
                  <Text style={[styles.uploadFilename, { color: colors.gray800 }]}>{uploadedFile}</Text>
                  <Text style={[styles.uploadHint, { color: colors.gray500 }]}>Uploading...</Text>
                </View>
              ) : uploadedFile ? (
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
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.gray800, marginBottom: 0 }]}>Active Policies</Text>
              <TouchableOpacity
                style={[styles.addFab, { backgroundColor: isDark ? colors.accent : '#6C5CE7' }]}
                onPress={handleFilePick}
                disabled={uploading}
              >
                <Plus size={16} color="#FFF" />
                <Text style={styles.addFabText}>Upload</Text>
              </TouchableOpacity>
            </View>
            {policies.length > 0 ? (
              <View style={styles.policiesGrid}>
                {policies.map((policy) => (
                  <View key={policy.id} style={[styles.policyCard, { backgroundColor: isDark ? colors.gray50 : '#FFFFFF', borderColor: colors.cardBorder }]}>
                    <View style={styles.policyCardTop}>
                      <View style={[styles.policyIcon, { backgroundColor: colors.primary50 }]}>
                        <Shield size={18} color={isDark ? colors.accent : '#6C5CE7'} />
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.scoreBadge, { backgroundColor: policy.scoreColor === 'green' ? colors.successLight : colors.warningLight }]}>
                          <Text style={[styles.scoreBadgeText, { color: policy.scoreColor === 'green' ? '#059669' : '#D97706' }]}>
                            {policy.coverageScore}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeletePolicy(policy)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Trash2 size={16} color={colors.danger || '#DC2626'} />
                        </TouchableOpacity>
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
            ) : (
              <EmptyState icon={Shield} title="No policies yet" message="Upload a policy document to get started with coverage analysis" />
            )}
          </View>

          {/* ═══ YOUR ASSETS (FULL CRUD) ═══ */}
          <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.gray800, marginBottom: 0 }]}>Your Assets</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {assets.length > 0 && (
                  <View style={[styles.badgePurple, { backgroundColor: colors.primary50 }]}>
                    <Text style={[styles.badgePurpleText, { color: isDark ? colors.primary600 : '#6C5CE7' }]}>${totalAssetValue.toLocaleString()}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.addFab, { backgroundColor: isDark ? colors.accent : '#6C5CE7' }]}
                  onPress={() => { resetAssetForm(); setShowAssetModal(true); }}
                >
                  <Plus size={16} color="#FFF" />
                  <Text style={styles.addFabText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
            {assets.length > 0 ? (
              assets.map(asset => (
                <View key={asset.id} style={[styles.assetRow, { borderBottomColor: colors.gray100 }]}>
                  <View style={[styles.assetIconBox, { backgroundColor: colors.primary50 }]}>
                    <Text style={{ fontSize: 18 }}>{assetIcons[asset.type] || '📦'}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[styles.assetName, { color: colors.gray800 }]}>{asset.name}</Text>
                    <Text style={[styles.assetType, { color: colors.gray500 }]}>{(ASSET_TYPES.find(t => t.value === asset.type) || {}).label || 'Other'}</Text>
                  </View>
                  <Text style={[styles.assetValue, { color: colors.gray800 }]}>${asset.value.toLocaleString()}</Text>
                  <View style={styles.assetActions}>
                    <TouchableOpacity onPress={() => handleEditAsset(asset)} style={styles.actionBtn}>
                      <Edit3 size={14} color={colors.gray400} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteAsset(asset)} style={styles.actionBtn}>
                      <Trash2 size={14} color={colors.danger || '#DC2626'} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState icon={Shield} title="No assets tracked" message="Tap 'Add' to start tracking your assets for gap analysis" />
            )}
          </View>

          {/* Gap Analysis - Properly Spaced */}
          <View style={[styles.cardBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.gray800, marginBottom: 0 }]}>Asset vs. Coverage Gap</Text>
              {assets.length > 0 && (
                <View style={[styles.badgePurple, { backgroundColor: colors.primary50 }]}>
                  <Text style={[styles.badgePurpleText, { color: isDark ? colors.primary600 : '#6C5CE7' }]}>Assets: ${totalAssetValue.toLocaleString()}</Text>
                </View>
              )}
            </View>

            {assets.length > 0 ? (
              <>
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
              </>
            ) : (
              <EmptyState icon={AlertTriangle} title="No asset data" message="Add your assets to see coverage gap analysis" />
            )}

            {/* Gap Items */}
            {gapAnalysis.length > 0 && (
              <>
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
              </>
            )}
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
                    ) : msg.scenario ? (
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
                    ) : (
                      <View style={[styles.userBubble, { backgroundColor: colors.gray100, alignSelf: 'flex-start' }]}>
                        <Text style={[styles.userBubbleText, { color: colors.gray700 }]}>{msg.content}</Text>
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

      {/* ═══ ADD/EDIT ASSET MODAL ═══ */}
      <Modal visible={showAssetModal} animationType="slide" transparent onRequestClose={() => setShowAssetModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.gray800 }]}>{editingAsset ? 'Edit Asset' : 'Add Asset'}</Text>
              <TouchableOpacity onPress={() => { setShowAssetModal(false); resetAssetForm(); }} style={[styles.modalCloseBtn, { backgroundColor: colors.gray100 }]}>
                <X size={18} color={colors.gray500} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Name</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="e.g., Honda Civic 2022"
                placeholderTextColor={colors.gray400}
                value={assetForm.name}
                onChangeText={t => setAssetForm(f => ({ ...f, name: t }))}
              />
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
                {ASSET_TYPES.map(at => (
                  <TouchableOpacity
                    key={at.value}
                    style={[styles.filterChip, {
                      backgroundColor: assetForm.type === at.value ? (isDark ? colors.accent : '#6C5CE7') : colors.gray50,
                      borderColor: assetForm.type === at.value ? (isDark ? colors.accent : '#6C5CE7') : colors.gray200,
                    }]}
                    onPress={() => setAssetForm(f => ({ ...f, type: at.value }))}
                  >
                    <Text style={[styles.filterChipText, { color: assetForm.type === at.value ? '#FFF' : colors.gray600 }]}>{at.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Estimated Value ($)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="0.00"
                placeholderTextColor={colors.gray400}
                value={assetForm.estimatedValue}
                onChangeText={t => setAssetForm(f => ({ ...f, estimatedValue: t }))}
                keyboardType="numeric"
              />
              <Text style={[styles.formLabel, { color: colors.gray600 }]}>Description (optional)</Text>
              <TextInput
                style={[styles.formInput, styles.formInputMultiline, { backgroundColor: colors.gray50, borderColor: colors.gray200, color: colors.gray800 }]}
                placeholder="Add details..."
                placeholderTextColor={colors.gray400}
                value={assetForm.description}
                onChangeText={t => setAssetForm(f => ({ ...f, description: t }))}
                multiline
              />
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: isDark ? colors.accent : '#6C5CE7' }]} onPress={handleSaveAsset}>
                <Text style={styles.saveBtnText}>{editingAsset ? 'Save Changes' : 'Add Asset'}</Text>
              </TouchableOpacity>
              {editingAsset && (
                <TouchableOpacity
                  style={[styles.deleteModalBtn, { borderColor: colors.danger || '#DC2626' }]}
                  onPress={() => { setShowAssetModal(false); handleDeleteAsset(editingAsset); resetAssetForm(); }}
                >
                  <Trash2 size={16} color={colors.danger || '#DC2626'} />
                  <Text style={[styles.deleteModalBtnText, { color: colors.danger || '#DC2626' }]}>Delete Asset</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Assets
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: 1 },
  assetIconBox: { width: 40, height: 40, borderRadius: Radii.sm, alignItems: 'center', justifyContent: 'center' },
  assetName: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  assetType: { fontSize: FontSizes.xs },
  assetValue: { fontSize: FontSizes.md, fontWeight: FontWeights.bold },
  assetActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: 4 },
  addFab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radii.full, ...Shadows.sm },
  addFabText: { color: '#FFF', fontSize: FontSizes.sm, fontWeight: FontWeights.semibold },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: Radii.xl, borderTopRightRadius: Radii.xl, padding: Spacing.xxl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xxl },
  modalTitle: { fontSize: FontSizes.xl, fontWeight: FontWeights.bold },
  modalCloseBtn: { width: 36, height: 36, borderRadius: Radii.full, alignItems: 'center', justifyContent: 'center' },
  formLabel: { fontSize: FontSizes.sm, fontWeight: FontWeights.semibold, marginBottom: 6 },
  formInput: { borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: FontSizes.md, marginBottom: Spacing.lg },
  formInputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  filterChip: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radii.full, borderWidth: 1, marginRight: Spacing.sm },
  filterChipText: { fontSize: FontSizes.xs, fontWeight: FontWeights.semibold },
  saveBtn: { borderRadius: Radii.md, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.md, ...Shadows.md },
  saveBtnText: { color: '#FFF', fontSize: FontSizes.lg, fontWeight: FontWeights.semibold },
  deleteModalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderWidth: 1, borderRadius: Radii.md, paddingVertical: 14, marginTop: Spacing.md },
  deleteModalBtnText: { fontSize: FontSizes.md, fontWeight: FontWeights.semibold },
});
