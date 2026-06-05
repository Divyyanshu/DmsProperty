import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  Platform,
  Modal,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { getEnquiries } from '../../Api/ApiService';

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const Colors = {
  header_dark:    '#0F172A',
  primary:        '#0F766E',
  primary_light:  '#CCFBF1',
  primary_border: '#99F6E4',
  primary_text:   '#134E4A',
  primary_mid:    '#5EADA6',
  page_bg:        '#F0FAF8',
  card_bg:        '#FFFFFF',
  card_header_bg: '#F0FAF8',
  input_bg:       '#F0FAF8',
  text_white:     '#FFFFFF',
  text_dark:      '#134E4A',
  text_grey:      '#5EADA6',
  text_label:     '#94A3B8',
  text_muted:     'rgba(255,255,255,0.55)',
  border:         '#B2DFDB',
  border_light:   '#E0F2F1',
  border_white:   'rgba(255,255,255,0.12)',
  strip_bg:       'rgba(255,255,255,0.08)',
  icon_cyan:      '#CFFAFE',
  warn_bg:        '#FEF9C3',
  warn_text:      '#92400E',
  warn_border:    '#FDE68A',
  success_bg:     '#DCFCE7',
  success_text:   '#166534',
  success_border: '#BBF7D0',
  danger_bg:      '#FFE4E6',
  danger_text:    '#9F1239',
  danger_border:  '#FECDD3',
};

const F = {
  f10: 10, f11: 11, f12: 12, f13: 13,
  f14: 14, f15: 15, f16: 16, f17: 17, f18: 18, f20: 20, f22: 22, f24: 24,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. STATIC CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { key: 'Today', label: 'Today' },
  { key: 'Yesterday', label: 'Yesterday' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'yearly',  label: 'Yearly'  },
];

const PROPERTY_ICON_MAP = {
  'Farmhouse':  require('../../Assets/icons/Greystone.png'),
  'Airbnb':     require('../../Assets/icons/stonestays1.png'),
  'Grey Stone': require('../../Assets/icons/Greystone.png'),
  'SkyStone':   require('../../Assets/icons/stonestays1.png'),
  'Topaz':      require('../../Assets/icons/Greystone.png'),
  'default':    require('../../Assets/icons/Greystone.png'),
};

const getPropertyIcon = (name) =>
  PROPERTY_ICON_MAP[name] ?? PROPERTY_ICON_MAP['default'];

// ─────────────────────────────────────────────────────────────────────────────
// 3. HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const safeStr = (val) => (val != null ? String(val) : '');

// Status ko safely lowercase mein nikalo — Status ya status dono handle karo
const getStatus = (item) =>
  safeStr(item.Status ?? item.status ?? '').toLowerCase().trim();

// PropertyName ko safely nikalo
const getPropName = (item) =>
  safeStr(
    item.PropertyName ??
    item.propertyName ??
    item.property ??
    item.Category ??
    item.category ??
    ''
  ).trim() || 'Unknown';

// API enquiry array se dynamic property-wise breakdown banao
const buildBreakdown = (enquiries) => {
  const map = {};

  enquiries.forEach((item) => {
    const propName = getPropName(item);
    const status   = getStatus(item);

    if (!map[propName]) {
      map[propName] = { count: 0, pending: 0, resolved: 0, new: 0 };
    }

    map[propName].count++;

    if (status === 'pending')                        map[propName].pending++;
    else if (status === 'converted' || status === 'resolved') map[propName].resolved++;
    else if (status === 'new')                       map[propName].new++;
  });

  return Object.entries(map)
    .filter(([, vals]) => vals.count > 0)
    .map(([name, vals]) => ({
      key:      name.toLowerCase().replace(/\s+/g, '_'),
      label:    name,
      count:    vals.count,
      pending:  vals.pending,
      resolved: vals.resolved,
      new:      vals.new,
      progress: vals.count > 0 ? vals.resolved / vals.count : 0,
      icon:     getPropertyIcon(name),
      iconBg:   Colors.primary_light,
    }));
};

// Monthly chart ke liye group karo
const buildMonthlyChart = (enquiries) => {
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const counts = Array(12).fill(0);

  enquiries.forEach((item) => {
    const dateStr = item.EnquiryDate ?? item.enquiryDate ?? item.CreatedDate ?? item.date ?? '';
    if (!dateStr) return;

    let monthIndex = -1;
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      monthIndex = parseInt(parts[1], 10) - 1; // DD/MM/YYYY
    } else if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      monthIndex = parseInt(parts[1], 10) - 1; // YYYY-MM-DD
    }

    if (monthIndex >= 0 && monthIndex < 12) {
      counts[monthIndex]++;
    }
  });

  const result = MONTH_NAMES
    .map((month, i) => ({ month, count: counts[i] }))
    .filter(d => d.count > 0);

  return result.length > 0 ? result : [{ month: 'N/A', count: enquiries.length }];
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PERIOD DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const PeriodDropdown = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = PERIOD_OPTIONS.find(o => o.key === selected)?.label ?? 'Monthly';

  return (
    <>
      <TouchableOpacity style={styles.periodChip} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={styles.chipIcon}>📅</Text>
        <Text style={styles.chipLabel}>{selectedLabel}</Text>
        <Text style={styles.chipArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => { setOpen(false); Keyboard.dismiss(); }}>
          <View style={styles.ddOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.ddSheet}>
                <View style={styles.ddHandle} />
                <View style={styles.ddSheetHdr}>
                  <Text style={styles.ddSheetTitle}>Select Period</Text>
                  <TouchableOpacity style={styles.ddCloseBtn} onPress={() => setOpen(false)}>
                    <Text style={styles.ddCloseTxt}>✕</Text>
                  </TouchableOpacity>
                </View>
                {PERIOD_OPTIONS.map((item, idx) => {
                  const isActive = item.key === selected;
                  return (
                    <View key={item.key}>
                      <TouchableOpacity
                        style={[styles.ddOptRow, isActive && styles.ddOptRowActive]}
                        onPress={() => { setOpen(false); onSelect(item.key); }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.ddOptAccent, isActive && styles.ddOptAccentActive]} />
                        <Text style={[styles.ddOptTxt, isActive && styles.ddOptTxtActive]}>{item.label}</Text>
                        {isActive && <Text style={styles.ddCheck}>✓</Text>}
                      </TouchableOpacity>
                      {idx < PERIOD_OPTIONS.length - 1 && <View style={styles.ddSep} />}
                    </View>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. MINI BAR CHART
// ─────────────────────────────────────────────────────────────────────────────

const MiniBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <View style={chartStyles.wrap}>
      {data.map((item, i) => {
        const heightPct = item.count / max;
        return (
          <View key={`${item.month}-${i}`} style={chartStyles.col}>
            <Text style={chartStyles.val}>{item.count}</Text>
            <View style={chartStyles.barTrack}>
              <View style={[chartStyles.barFill, { height: `${Math.round(heightPct * 100)}%` }]} />
            </View>
            <Text style={chartStyles.lbl}>{item.month}</Text>
          </View>
        );
      })}
    </View>
  );
};

const chartStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    gap:           6,
    height:        90,
    paddingTop:    18,
  },
  col: {
    flex:       1,
    alignItems: 'center',
    gap:        3,
  },
  val: {
    fontSize:   F.f10,
    color:      Colors.primary_mid,
    fontWeight: '600',
  },
  barTrack: {
    flex:            1,
    width:           '80%',
    backgroundColor: Colors.border_light,
    borderRadius:    4,
    justifyContent:  'flex-end',
    overflow:        'hidden',
  },
  barFill: {
    width:           '100%',
    backgroundColor: Colors.primary,
    borderRadius:    4,
  },
  lbl: {
    fontSize: F.f10,
    color:    Colors.text_label,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

const ProgressBar = ({ progress }) => (
  <View style={styles.progTrack}>
    <View style={[styles.progFill, { width: `${Math.round(progress * 100)}%` }]} />
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. STATUS BADGE
// ─────────────────────────────────────────────────────────────────────────────

const StatusBadge = ({ label, bg, border, color }) => (
  <View style={[styles.statusBadge, { backgroundColor: bg, borderColor: border }]}>
    <Text style={[styles.statusBadgeTxt, { color }]}>{label}</Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. PROPERTY INQUIRY ROW
// ─────────────────────────────────────────────────────────────────────────────

const PropertyInquiryRow = ({ prop }) => (
  <View style={styles.propRow}>
    <View style={[styles.propRowIcon, { backgroundColor: prop.iconBg }]}>
      <Image source={prop.icon} style={styles.propRowIconImg} resizeMode="contain" />
    </View>

    <View style={styles.propRowMid}>
      <View style={styles.propRowTopLine}>
        <Text style={styles.propRowName}>{prop.label}</Text>
        <Text style={styles.propRowCount}>{prop.count} inquiries</Text>
      </View>

      <View style={styles.propStatusRow}>
        <StatusBadge label={`🆕 ${prop.new} New`}        bg={Colors.warn_bg}    border={Colors.warn_border}    color={Colors.warn_text}    />
        <StatusBadge label={`⏳ ${prop.pending} Pending`} bg={Colors.danger_bg}  border={Colors.danger_border}  color={Colors.danger_text}  />
        <StatusBadge label={`✅ ${prop.resolved} Done`}   bg={Colors.success_bg} border={Colors.success_border} color={Colors.success_text} />
      </View>

      <ProgressBar progress={prop.progress} />
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 9. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const TotalEnquiryScreen = ({ navigation }) => {

  const [period,    setPeriod]    = useState('monthly');
  const [enquiries, setEnquiries] = useState([]);
  const [loading,   setLoading]   = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTotalEnquiries = async () => {
    try {
      setLoading(true);
      const result = await getEnquiries();

      if (result.success) {
        console.log('✅ TOTAL ENQUIRIES =>', JSON.stringify(result.data, null, 2));

        let rawData = result?.data?.data ?? result?.data ?? [];
        let parsed  = [];

        if (typeof rawData === 'string') {
          try { parsed = JSON.parse(rawData); } catch { parsed = []; }
        } else if (Array.isArray(rawData)) {
          parsed = rawData;
        } else if (rawData && typeof rawData === 'object') {
          parsed = [rawData];
        }

        console.log('🔑 ENQUIRY KEYS =>', Object.keys(parsed[0] ?? {}));
        setEnquiries(parsed);
      } else {
        console.warn('⚠️ getEnquiries failed:', result.message);
      }
    } catch (error) {
      console.log('❌ TOTAL ENQUIRIES ERROR =>', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotalEnquiries();
  }, []);

  // ── Computed values ────────────────────────────────────────────────────────
  const totalEnquiries     = enquiries.length;
  const pendingEnquiries   = enquiries.filter(i => getStatus(i) === 'pending').length;
  const convertedEnquiries = enquiries.filter(i => getStatus(i) === 'converted').length;
  const newEnquiries       = enquiries.filter(i => getStatus(i) === 'new').length;
  const conversionRate     = totalEnquiries > 0
    ? `${Math.round((convertedEnquiries / totalEnquiries) * 100)}%`
    : '0%';

  // Monthly vs Yearly filter
  const now          = new Date();
  const currentYear  = now.getFullYear();
  const currentMonth = now.getMonth();

  const filteredEnquiries = enquiries.filter((item) => {
    const dateStr = item.EnquiryDate ?? item.enquiryDate ?? item.CreatedDate ?? item.date ?? '';
    if (!dateStr) return true;

    let date = null;
    if (dateStr.includes('/')) {
      const [dd, mm, yyyy] = dateStr.split('/');
      date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    } else if (dateStr.includes('-')) {
      date = new Date(dateStr);
    }

    if (!date || isNaN(date)) return true;

    if (period === 'monthly') {
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    } else {
      return date.getFullYear() === currentYear;
    }
  });

  // ✅ FIX 1: Dynamic breakdown from filtered enquiries using API's actual PropertyName
  const breakdownData = buildBreakdown(filteredEnquiries);

  // Chart from full data
  const monthlyChart = buildMonthlyChart(enquiries);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.header_dark} barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Image
              source={require('../../Assets/icons/ak.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Total Inquiries</Text>
            <Text style={styles.headerSubtitle}>All properties overview</Text>
          </View>

          <PeriodDropdown selected={period} onSelect={setPeriod} />
        </View>

        {/* Summary strip */}
        <View style={styles.summaryStrip}>
          <View style={[styles.stripItem, styles.stripItemBorder]}>
            <Text style={styles.stripLabel}>TOTAL</Text>
            {loading
              ? <ActivityIndicator size="small" color={Colors.text_white} style={{ marginVertical: 4 }} />
              : <Text style={styles.stripVal}>{totalEnquiries}</Text>
            }
            <Text style={[styles.stripTrend, styles.stripTrendUp]}>
              {convertedEnquiries > 0 ? `${conversionRate} converted` : '—'}
            </Text>
          </View>
          <View style={[styles.stripItem, styles.stripItemBorder]}>
            <Text style={styles.stripLabel}>PENDING</Text>
            {loading
              ? <ActivityIndicator size="small" color={Colors.text_white} style={{ marginVertical: 4 }} />
              : <Text style={styles.stripVal}>{pendingEnquiries}</Text>
            }
            <Text style={styles.stripSub}>awaiting reply</Text>
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>CONVERTED</Text>
            {loading
              ? <ActivityIndicator size="small" color={Colors.text_white} style={{ marginVertical: 4 }} />
              : <Text style={styles.stripVal}>{convertedEnquiries}</Text>
            }
            <Text style={styles.stripSub}>completed</Text>
          </View>
        </View>
      </View>

      {/* ── BODY ── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: 70 }]}
        showsVerticalScrollIndicator={false}
      >

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading enquiries...</Text>
          </View>
        ) : (
          <>
            {/* ── Quick stats row ── */}
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStatBox}>
                <Text style={styles.quickStatEmoji}>🆕</Text>
                <Text style={styles.quickStatVal}>{newEnquiries || totalEnquiries}</Text>
                <Text style={styles.quickStatLbl}>New</Text>
              </View>
              <View style={styles.quickStatBox}>
                <Text style={styles.quickStatEmoji}>🔄</Text>
                <Text style={styles.quickStatVal}>{conversionRate}</Text>
                <Text style={styles.quickStatLbl}>Conversion</Text>
              </View>
              <View style={styles.quickStatBox}>
                <Text style={styles.quickStatEmoji}>✅</Text>
                <Text style={styles.quickStatVal}>{convertedEnquiries}</Text>
                <Text style={styles.quickStatLbl}>Converted</Text>
              </View>
            </View>

            {/* ── Bar chart card ── */}
            <View style={styles.card}>
              {/* ✅ FIX 2: Green badge hataya, clean header text diya */}
              <View style={styles.cardHdrRow}>
                <View>
                  <Text style={styles.cardTitle}>
                    {period === 'monthly' ? 'Monthly Trend' : 'Yearly Trend'}
                  </Text>
                  <Text style={styles.cardSubtitle}>{totalEnquiries} total inquiries</Text>
                </View>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardBody}>
                {monthlyChart.length > 0
                  ? <MiniBarChart data={monthlyChart} />
                  : <Text style={styles.emptyText}>No data available</Text>
                }
              </View>
            </View>

            {/* ── Property breakdown card ── */}
            <View style={styles.card}>
              <View style={styles.cardHdrRow}>
                <View>
                  <Text style={styles.cardTitle}>Property Breakdown</Text>
                  <Text style={styles.cardSubtitle}>{breakdownData.length} properties found</Text>
                </View>
              </View>
              <View style={styles.cardDivider} />
              <View style={[styles.cardBody, { gap: 10 }]}>
                {breakdownData.length > 0 ? (
                  breakdownData.map((prop) => (
                    <PropertyInquiryRow key={prop.key} prop={prop} />
                  ))
                ) : (
                  <Text style={styles.emptyText}>No property data found</Text>
                )}
              </View>
            </View>

            {/* ── View All button ── */}
            <TouchableOpacity
              style={styles.viewBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ReportsScreen', { activeTab: 'Enquiry' })}
            >
              <Text style={styles.viewBtnText}>View All Inquiries</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

export default TotalEnquiryScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 10. STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: { flex: 1, backgroundColor: '#0F172A' },

  // Header
  header: {
    backgroundColor: Colors.header_dark,
    paddingTop:      8,
    overflow:        'hidden',
    marginTop:       27,
  },
  headerTop: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 16,
    paddingBottom:     16,
    zIndex:            2,
    gap:               10,
  },
  backBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  backIcon:         { width: 18, height: 18, tintColor: Colors.text_white },
  headerTitleBlock: { flex: 1 },
  headerTitle: {
    color:        Colors.text_white,
    fontSize:     F.f17,
    fontWeight:   '600',
    marginBottom: 2,
  },
  headerSubtitle: { color: Colors.text_muted, fontSize: F.f12 },

  circle1: {
    position: 'absolute', width: 130, height: 130, borderRadius: 65,
    borderWidth: 22, borderColor: 'rgba(255,255,255,0.07)',
    top: -35, right: -30, zIndex: 1,
  },
  circle2: {
    position: 'absolute', width: 70, height: 70, borderRadius: 35,
    borderWidth: 14, borderColor: 'rgba(255,255,255,0.05)',
    bottom: 30, right: 60, zIndex: 1,
  },

  // Period chip
  periodChip: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   'rgba(255,255,255,0.13)',
    borderRadius:      10,
    paddingHorizontal: 10,
    paddingVertical:   7,
    gap:               5,
    borderWidth:       0.5,
    borderColor:       'rgba(255,255,255,0.20)',
  },
  chipIcon:  { fontSize: 13 },
  chipLabel: { fontSize: F.f12, fontWeight: '600', color: Colors.text_white },
  chipArrow: { fontSize: F.f10, color: 'rgba(255,255,255,0.7)' },

  // Dropdown
  ddOverlay: {
    flex:            1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent:  'flex-end',
  },
  ddSheet: {
    backgroundColor:      Colors.card_bg,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    paddingBottom:        44,
  },
  ddHandle: {
    alignSelf:       'center',
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: Colors.border,
    marginTop:       12,
    marginBottom:    4,
  },
  ddSheetHdr: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 20,
    paddingVertical:   14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  ddSheetTitle:      { fontSize: F.f16, fontWeight: '700', color: Colors.text_dark },
  ddCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.input_bg,
    alignItems: 'center', justifyContent: 'center',
  },
  ddCloseTxt:        { fontSize: F.f12, color: Colors.text_grey },
  ddSep:             { height: 0.5, backgroundColor: Colors.border_light, marginHorizontal: 20 },
  ddOptRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 18, gap: 14,
  },
  ddOptRowActive:    { backgroundColor: Colors.primary_light },
  ddOptAccent:       { width: 4, height: 20, borderRadius: 2, backgroundColor: Colors.border },
  ddOptAccentActive: { backgroundColor: Colors.primary },
  ddOptTxt:          { flex: 1, fontSize: F.f15, color: Colors.text_dark },
  ddOptTxtActive:    { fontWeight: '700', color: Colors.primary },
  ddCheck:           { fontSize: F.f16, color: Colors.primary, fontWeight: '700' },

  // Summary strip
  summaryStrip: {
    flexDirection:  'row',
    backgroundColor: Colors.strip_bg,
    borderTopWidth:  0.5,
    borderTopColor:  Colors.border_white,
  },
  stripItem:       { flex: 1, padding: 12 },
  stripItemBorder: { borderRightWidth: 0.5, borderRightColor: Colors.border_white },
  stripLabel: {
    fontSize: F.f10, color: 'rgba(255,255,255,0.50)',
    letterSpacing: 0.5, marginBottom: 3, marginLeft: 8,
  },
  stripVal:     { fontSize: F.f18, fontWeight: '700', color: Colors.text_white, marginLeft: 8 },
  stripSub:     { fontSize: F.f10, color: 'rgba(255,255,255,0.40)', marginTop: 1, marginLeft: 8 },
  stripTrend:   { fontSize: F.f11, color: 'rgba(255,255,255,0.50)', marginTop: 1, marginLeft: 8 },
  stripTrendUp: { color: '#6EE7B7' },

  // Body
  body:        { flex: 1, backgroundColor: Colors.page_bg },
  bodyContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 34, gap: 12 },

  // Loading
  loadingBox: {
    paddingVertical: 60,
    alignItems:      'center',
    gap:             12,
  },
  loadingText: {
    color:    Colors.text_grey,
    fontSize: F.f14,
  },

  // Empty
  emptyText: {
    color:     Colors.text_label,
    fontSize:  F.f13,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Quick stats
  quickStatsRow: { flexDirection: 'row', gap: 8 },
  quickStatBox: {
    flex:            1,
    backgroundColor: Colors.card_bg,
    borderRadius:    12,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    alignItems:      'center',
    paddingVertical: 14,
    gap:             3,
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  quickStatEmoji: { fontSize: 20 },
  quickStatVal:   { fontSize: F.f16, fontWeight: '700', color: Colors.text_dark },
  quickStatLbl:   { fontSize: F.f10, color: Colors.text_label },

  // Card
  card: {
    backgroundColor: Colors.card_bg,
    borderRadius:    16,
    borderWidth:     1,
    borderColor:     '#FFF',
    overflow:        'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  cardHdrRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 14,
    paddingVertical:   13,
    backgroundColor:   Colors.card_header_bg,
  },
  cardTitle:    { fontSize: F.f14, fontWeight: '600', color: Colors.text_dark },
  cardSubtitle: { fontSize: F.f11, color: Colors.text_label, marginTop: 2 },
  cardDivider:  { height: 0.5, backgroundColor: Colors.border },
  cardBody:     { padding: 14 },

  // Property row
  propRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    borderRadius:  12,
    padding:       12,
    borderWidth:   0.5,
    borderColor:   Colors.border,
  },
  propRowIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#b8b8b8',
    flexShrink: 0,
  },
  propRowIconImg: { width: 30, height: 30 },
  propRowMid:     { flex: 1, gap: 5 },
  propRowTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  propRowName:    { fontSize: F.f13, fontWeight: '600', color: Colors.text_dark },
  propRowCount:   { fontSize: F.f12, fontWeight: '600', color: Colors.primary },
  propStatusRow:  { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },

  statusBadge: {
    borderRadius:      5,
    paddingHorizontal: 6,
    paddingVertical:   2,
    borderWidth:       0.5,
  },
  statusBadgeTxt: { fontSize: F.f10, fontWeight: '600' },

  // Progress bar
  progTrack: {
    height: 4, backgroundColor: Colors.border_light,
    borderRadius: 4, overflow: 'hidden',
  },
  progFill: { height: 4, backgroundColor: Colors.primary, borderRadius: 4 },

  // View all button
  viewBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    backgroundColor:   Colors.header_dark,
    borderRadius:      12,
    paddingHorizontal: 14,
    paddingVertical:   15,
    gap:               8,
  },
  viewBtnText: { color: Colors.text_white, fontSize: F.f14, fontWeight: '600' },

});