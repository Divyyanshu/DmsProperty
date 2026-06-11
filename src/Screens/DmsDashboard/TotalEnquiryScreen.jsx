import React, { useState, useEffect, useCallback } from 'react';
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
  TextInput,
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
  f14: 14, f15: 15, f16: 16, f17: 17, f18: 18, f20: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PERIOD OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { key: 'Today',     label: 'Today'     },
  { key: 'Yesterday', label: 'Yesterday' },
  { key: 'monthly',   label: 'Monthly'   },
  { key: 'yearly',    label: 'Yearly'    },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const safeStr = (val) => (val != null ? String(val) : '');

const getStatus = (item) =>
  safeStr(item.Status ?? item.status ?? item.EnquiryStatus ?? '').toLowerCase().trim();

const getPropName = (item) =>
  safeStr(
    item.PropertyName ?? item.propertyName ??
    item.property ?? item.Category ?? item.category ?? ''
  ).trim() || 'Unknown';

const getPropertyIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('grey'))     return require('../../Assets/icons/Greystone.png');
  if (n.includes('sky'))      return require('../../Assets/icons/stonestays1.png');
  if (n.includes('topaz'))    return require('../../Assets/icons/stonestays1.png');
  if (n.includes('ruby'))     return require('../../Assets/icons/stonestays1.png');
  if (n.includes('sapphire')) return require('../../Assets/icons/stonestays1.png');
  return require('../../Assets/icons/Greystone.png');
};

const buildBreakdown = (enquiries) => {
  const map = {};
  enquiries.forEach((item) => {
    const propName = getPropName(item);
    const status   = getStatus(item);
    if (!map[propName]) map[propName] = { count: 0, pending: 0, converted: 0, new: 0 };
    map[propName].count++;
    if (status === 'pending')                              map[propName].pending++;
    else if (status === 'converted' || status === 'resolved') map[propName].converted++;
    else if (status === 'new')                             map[propName].new++;
  });

  const entries = Object.entries(map).filter(([, v]) => v.count > 0);
  const maxCount = Math.max(...entries.map(([, v]) => v.count), 1);

  return entries.map(([name, vals]) => ({
    key:       name.toLowerCase().replace(/\s+/g, '_'),
    label:     name,
    count:     vals.count,
    pending:   vals.pending,
    converted: vals.converted,
    new:       vals.new,
    progress:  parseFloat((vals.count / maxCount).toFixed(2)),
    icon:      getPropertyIcon(name),
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PERIOD DROPDOWN — same as Revenue/Expenses screen
// ─────────────────────────────────────────────────────────────────────────────

const PeriodDropdown = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selectedLabel = PERIOD_OPTIONS.find(o => o.key === selected)?.label ?? 'Monthly';

  const shortLabel = (lbl) => {
    if (lbl === 'Today')     return 'Today';
    if (lbl === 'Yesterday') return 'Yest.';
    if (lbl === 'Monthly')   return 'Month';
    if (lbl === 'Yearly')    return 'Year';
    return lbl;
  };

  return (
    <>
      <TouchableOpacity style={styles.periodChip} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <View style={styles.chipCalIcon}>
          <View style={styles.chipCalBar} />
          <View style={styles.chipCalDots}>
            {[0,1,2,3,4,5].map(i => <View key={i} style={styles.chipCalDot} />)}
          </View>
        </View>
        <Text style={styles.chipLabel} numberOfLines={1}>{shortLabel(selectedLabel)}</Text>
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
// 5. PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

const ProgressBar = ({ progress }) => (
  <View style={styles.progTrack}>
    <View style={[styles.progFill, { width: `${Math.round((progress || 0) * 100)}%` }]} />
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonBox = ({ w, h, radius = 6 }) => (
  <View style={{ width: w, height: h, borderRadius: radius, backgroundColor: '#E2E8F0' }} />
);

const LoadingSkeleton = () => (
  <View style={{ gap: 12 }}>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[0,1,2].map(i => (
        <View key={i} style={[styles.statCard, { flex: 1, padding: 14, gap: 6 }]}>
          <SkeletonBox w={32} h={32} radius={8} />
          <SkeletonBox w={40} h={18} />
          <SkeletonBox w={60} h={10} />
        </View>
      ))}
    </View>
    {[0,1].map(i => (
      <View key={i} style={[styles.enqCard, { padding: 14, gap: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <SkeletonBox w={36} h={36} radius={10} />
          <View style={{ gap: 6 }}>
            <SkeletonBox w={120} h={14} />
            <SkeletonBox w={80}  h={11} />
          </View>
          <View style={{ flex: 1 }} />
          <SkeletonBox w={60} h={26} radius={8} />
        </View>
        <SkeletonBox w={'100%'} h={4} radius={4} />
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <SkeletonBox w={70} h={22} radius={5} />
          <SkeletonBox w={80} h={22} radius={5} />
          <SkeletonBox w={65} h={22} radius={5} />
        </View>
      </View>
    ))}
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
// 8. PROPERTY ENQUIRY ROW — same structure as Revenue PropertyRow
// ─────────────────────────────────────────────────────────────────────────────

const PropertyEnquiryRow = ({ prop }) => (
  <View style={styles.propRow}>
    <View style={styles.propRowIcon}>
      <Image source={prop.icon} style={styles.propRowIconImg} resizeMode="contain" />
    </View>
    <View style={styles.propRowMid}>
      <View style={styles.propRowTopLine}>
        <Text style={styles.propRowName}>{prop.label}</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{prop.count} enquiries</Text>
        </View>
      </View>
      <ProgressBar progress={prop.progress} />
      <View style={styles.propStatusRow}>
        <StatusBadge label={`🆕 ${prop.new} New`}           bg={Colors.warn_bg}    border={Colors.warn_border}    color={Colors.warn_text}    />
        <StatusBadge label={`⏳ ${prop.pending} Pending`}    bg={Colors.danger_bg}  border={Colors.danger_border}  color={Colors.danger_text}  />
        <StatusBadge label={`✅ ${prop.converted} Converted`} bg={Colors.success_bg} border={Colors.success_border} color={Colors.success_text} />
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 9. ENQUIRY SECTION CARD — same as Revenue/Expenses ExpenseSectionCard
// ─────────────────────────────────────────────────────────────────────────────

const EnquirySectionCard = ({ title, categoryIcon, categoryIconBg, categoryIconTint, properties, totalCount }) => (
  <View style={styles.enqCard}>
    <View style={styles.enqCardHdr}>
      <View style={[styles.enqCardIconBox, { backgroundColor: categoryIconBg }]}>
        <Image source={categoryIcon} style={[styles.enqCardIcon, { tintColor: categoryIconTint }]} resizeMode="contain" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.enqCardTitle}>{title}</Text>
        <Text style={styles.enqCardSub}>{properties.length} properties · {totalCount} enquiries</Text>
      </View>
      <View style={styles.totalBadge}>
        <Text style={styles.totalBadgeText}>{totalCount}</Text>
      </View>
    </View>
    <View style={styles.cardDivider} />
    <View style={styles.enqCardBody}>
      {properties.map(prop => (
        <PropertyEnquiryRow key={prop.key} prop={prop} />
      ))}
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 10. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const TotalEnquiryScreen = ({ navigation }) => {
  const [period,    setPeriod]    = useState('monthly');
  const [search,    setSearch]    = useState('');
  const [enquiries, setEnquiries] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getEnquiries();
      if (result.success) {
        let raw = result?.data?.data ?? result?.data ?? [];
        if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = []; } }
        if (!Array.isArray(raw)) raw = raw ? [raw] : [];
        setEnquiries(raw);
      } else {
        setError(result.message ||'Failed to load data. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', fetchEnquiries);
    return unsub;
  }, [navigation, fetchEnquiries]);

  // ── Filter by period ───────────────────────────────────────────────────────

  const filteredEnquiries = enquiries.filter((item) => {
    const dateStr = item.EnquiryDate ?? item.enquiryDate ?? item.CreatedDate ?? item.date ?? '';
    if (!dateStr || period === 'monthly' || period === 'yearly') {
      if (period === 'monthly' || period === 'yearly') {
        if (!dateStr) return true;
        let date = null;
        if (dateStr.includes('/')) {
          const [dd, mm, yyyy] = dateStr.split('/');
          date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        } else if (dateStr.includes('-')) {
          date = new Date(dateStr);
        }
        if (!date || isNaN(date)) return true;
        const now = new Date();
        if (period === 'monthly') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
        return date.getFullYear() === now.getFullYear();
      }
    }
    return true;
  });

  // ── Search filter ──────────────────────────────────────────────────────────

  const searchedEnquiries = !search.trim()
    ? filteredEnquiries
    : filteredEnquiries.filter(i =>
        getPropName(i).toLowerCase().includes(search.toLowerCase()) ||
        safeStr(i.FullName ?? i.fullName ?? i.name ?? '').toLowerCase().includes(search.toLowerCase())
      );

  // ── Stats ──────────────────────────────────────────────────────────────────

  const total     = enquiries.length;
  const pending   = enquiries.filter(i => getStatus(i) === 'pending').length;
  const converted = enquiries.filter(i => getStatus(i) === 'converted').length;
  const convRate  = total > 0 ? `${Math.round((converted / total) * 100)}%` : '0%';

  // ── Build category breakdowns ──────────────────────────────────────────────

  const buildCategory = (categoryName) => {
    const filtered = searchedEnquiries.filter(
      i => (i.Category ?? i.category ?? '').toLowerCase() === categoryName.toLowerCase()
    );
    return buildBreakdown(filtered);
  };

  // Also build from PropertyName for those without Category
  const farmProps   = buildCategory('farmhouse');
  const airbnbProps = buildCategory('airbnb');

  // Fallback: if no category, group all by property
  const allProps = buildBreakdown(searchedEnquiries);

  const showFarm   = farmProps.length   > 0;
  const showAirbnb = airbnbProps.length > 0;
  const showAll    = !showFarm && !showAirbnb && allProps.length > 0;

  const farmCount   = searchedEnquiries.filter(i => (i.Category ?? i.category ?? '').toLowerCase() === 'farmhouse').length;
  const airbnbCount = searchedEnquiries.filter(i => (i.Category ?? i.category ?? '').toLowerCase() === 'airbnb').length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.header_dark} barStyle="light-content" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Image source={require('../../Assets/icons/ak.png')} style={styles.backIcon} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Total Enquiries</Text>
            <Text style={styles.headerSubtitle}>All properties overview</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchEnquiries} activeOpacity={0.8} disabled={loading}>
            {loading
              ? <ActivityIndicator size="small" color={Colors.text_white} />
              : <Text style={styles.refreshIcon}>↻</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Summary strip */}
        <View style={styles.summaryStrip}>
          <View style={[styles.stripItem, styles.stripItemBorder]}>
            <Text style={styles.stripLabel}>TOTAL</Text>
            <Text style={styles.stripVal}>{loading ? '...' : total}</Text>
            <Text style={styles.stripSub}>{convRate} converted</Text>
          </View>
          <View style={[styles.stripItem, styles.stripItemBorder]}>
            <Text style={styles.stripLabel}>PENDING</Text>
            <Text style={styles.stripVal}>{loading ? '...' : pending}</Text>
            <Text style={styles.stripSub}>awaiting reply</Text>
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>CONVERTED</Text>
            <Text style={styles.stripVal}>{loading ? '...' : converted}</Text>
            <Text style={styles.stripSub}>completed</Text>
          </View>
        </View>
      </View>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: 70 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search + Period row */}
        <View style={styles.filterRow}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIconTxt}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties or names..."
              placeholderTextColor={Colors.text_label}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
                <Text style={styles.searchClearTxt}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <PeriodDropdown selected={period} onSelect={setPeriod} />
        </View>

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Error */}
        {!loading && error && (
          <View style={styles.errorState}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTxt}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchEnquiries} activeOpacity={0.8}>
              <Text style={styles.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!loading && !error && searchedEnquiries.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTxt}>
              {search  ? `No results found for "${search}".`
  : 'No enquiry data available.'}
            </Text>
          </View>
        )}

        {/* Stats row */}
        {!loading && !error && searchedEnquiries.length > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🆕</Text>
              <Text style={styles.statVal}>{enquiries.filter(i => getStatus(i) === 'new').length || total}</Text>
              <Text style={styles.statLbl}>New</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔄</Text>
              <Text style={styles.statVal}>{convRate}</Text>
              <Text style={styles.statLbl}>Conversion</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statVal}>{converted}</Text>
              <Text style={styles.statLbl}>Converted</Text>
            </View>
          </View>
        )}

        {/* Farmhouse card */}
        {!loading && !error && showFarm && (
          <EnquirySectionCard
            title="Farmhouse"
            categoryIcon={require('../../Assets/icons/Greystone.png')}
            categoryIconBg="#CCFBF1"
            categoryIconTint={Colors.primary_text}
            properties={farmProps}
            totalCount={farmCount}
          />
        )}

        {/* Airbnb card */}
        {!loading && !error && showAirbnb && (
          <EnquirySectionCard
            title="Airbnb"
            categoryIcon={require('../../Assets/icons/stonestays1.png')}
            categoryIconBg="#CFFAFE"
            categoryIconTint={Colors.primary}
            properties={airbnbProps}
            totalCount={airbnbCount}
          />
        )}

        {/* Fallback — all properties if no category */}
        {!loading && !error && showAll && (
          <EnquirySectionCard
            title="All Properties"
            categoryIcon={require('../../Assets/icons/Greystone.png')}
            categoryIconBg="#CCFBF1"
            categoryIconTint={Colors.primary_text}
            properties={allProps}
            totalCount={searchedEnquiries.length}
          />
        )}

        {/* View All Button */}
        <TouchableOpacity
          style={styles.viewBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ReportsScreen', { activeTab: 'Enquiry' })}
        >
          <Text style={styles.viewBtnText}>View All Enquiries</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default TotalEnquiryScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 11. STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: { flex: 1, backgroundColor: Colors.header_dark },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.header_dark,
    paddingTop:      8,
    overflow:        'hidden',
    marginTop:       27,
  },
  headerTop: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingBottom:     18,
    zIndex:            2,
  },
  backBtn: {
    width:           36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  backIcon:         { width: 18, height: 18, tintColor: Colors.text_white },
  headerTitleBlock: { flex: 1 },
  headerTitle:      { color: Colors.text_white, fontSize: F.f17, fontWeight: '600', marginBottom: 3 },
  headerSubtitle:   { color: Colors.text_muted, fontSize: F.f12 },
  refreshBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  refreshIcon: { fontSize: 20, color: Colors.text_white, fontWeight: '700' },
  circle1: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 22, borderColor: 'rgba(255,255,255,0.07)', top: -35, right: -30, zIndex: 1 },
  circle2: { position: 'absolute', width: 70,  height: 70,  borderRadius: 35, borderWidth: 14, borderColor: 'rgba(255,255,255,0.05)', bottom: 30, right: 60, zIndex: 1 },

  // ── Summary Strip ─────────────────────────────────────────────────────────
  summaryStrip:    { flexDirection: 'row', backgroundColor: Colors.strip_bg, borderTopWidth: 0.5, borderTopColor: Colors.border_white },
  stripItem:       { flex: 1, padding: 11 },
  stripItemBorder: { borderRightWidth: 0.5, borderRightColor: Colors.border_white },
  stripLabel:      { fontSize: F.f10, color: 'rgba(255,255,255,0.50)', letterSpacing: 0.4, marginBottom: 3, marginLeft: 10 },
  stripVal:        { fontSize: F.f15, fontWeight: '600', color: Colors.text_white, marginLeft: 10 },
  stripSub:        { fontSize: F.f10, color: 'rgba(255,255,255,0.40)', marginTop: 1, marginLeft: 10 },

  // ── Body ──────────────────────────────────────────────────────────────────
  body:        { flex: 1, backgroundColor: Colors.page_bg },
  bodyContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 34, gap: 12 },

  // ── Filter Row ────────────────────────────────────────────────────────────
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card_bg, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 12, height: 46, gap: 8,
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  searchIconTxt:  { fontSize: 14 },
  searchInput:    { flex: 1, fontSize: F.f13, color: Colors.text_dark, padding: 0 },
  searchClear:    { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.input_bg, alignItems: 'center', justifyContent: 'center' },
  searchClearTxt: { fontSize: F.f10, color: Colors.text_label },

  // ── Period Chip ───────────────────────────────────────────────────────────
  periodChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.header_dark, borderRadius: 12,
    paddingHorizontal: 10, height: 46, gap: 5, minWidth: 80, justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.20, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  chipCalIcon: { width: 14, height: 14, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 2, overflow: 'hidden' },
  chipCalBar:  { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  chipCalDots: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 1, gap: 1, justifyContent: 'center', alignContent: 'center' },
  chipCalDot:  { width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.7)' },
  chipLabel:   { fontSize: F.f12, fontWeight: '600', color: Colors.text_white, flexShrink: 1 },
  chipArrow:   { fontSize: F.f10, color: 'rgba(255,255,255,0.8)' },

  // ── Dropdown ──────────────────────────────────────────────────────────────
  ddOverlay:         { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  ddSheet:           { backgroundColor: Colors.card_bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  ddHandle:          { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginTop: 12, marginBottom: 4 },
  ddSheetHdr:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  ddSheetTitle:      { fontSize: F.f16, fontWeight: '700', color: Colors.text_dark },
  ddCloseBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.input_bg, alignItems: 'center', justifyContent: 'center' },
  ddCloseTxt:        { fontSize: F.f12, color: Colors.text_grey },
  ddSep:             { height: 0.5, backgroundColor: Colors.border_light, marginHorizontal: 20 },
  ddOptRow:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, gap: 14 },
  ddOptRowActive:    { backgroundColor: Colors.primary_light },
  ddOptAccent:       { width: 4, height: 20, borderRadius: 2, backgroundColor: Colors.border },
  ddOptAccentActive: { backgroundColor: Colors.primary },
  ddOptTxt:          { flex: 1, fontSize: F.f15, color: Colors.text_dark },
  ddOptTxtActive:    { fontWeight: '700', color: Colors.primary },
  ddCheck:           { fontSize: F.f16, color: Colors.primary, fontWeight: '700' },

  // ── Stats Row ─────────────────────────────────────────────────────────────
  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1, backgroundColor: Colors.card_bg, borderRadius: 12,
    borderWidth: 0.5, borderColor: Colors.border,
    alignItems: 'center', paddingVertical: 14, gap: 4,
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  statEmoji: { fontSize: 22 },
  statVal:   { fontSize: F.f16, fontWeight: '700', color: Colors.text_dark },
  statLbl:   { fontSize: F.f10, color: Colors.text_label },

  // ── Enquiry Section Card ──────────────────────────────────────────────────
  enqCard: {
    backgroundColor: Colors.card_bg, borderRadius: 16,
    borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  enqCardHdr:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: Colors.card_header_bg },
  enqCardIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#b8b8b8' },
  enqCardIcon:    { width: 30, height: 30 },
  enqCardTitle:   { color: Colors.text_dark, fontSize: F.f14, fontWeight: '600' },
  enqCardSub:     { color: Colors.text_grey, fontSize: F.f11, marginTop: 1 },
  enqCardBody:    { padding: 14, gap: 10 },
  cardDivider:    { height: 0.5, backgroundColor: Colors.border },

  totalBadge:     { backgroundColor: Colors.primary_light, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 0.5, borderColor: Colors.primary_border },
  totalBadgeText: { color: Colors.primary, fontSize: F.f12, fontWeight: '600' },

  // ── Property Row ──────────────────────────────────────────────────────────
  propRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.input_bg, borderRadius: 10,
    padding: 12, borderWidth: 0.5, borderColor: Colors.border,
  },
  propRowIcon:    { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1, borderColor: '#b8b8b8', marginTop: 2 },
  propRowIconImg: { width: 28, height: 28 },
  propRowMid:     { flex: 1, gap: 6 },
  propRowTopLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  propRowName:    { fontSize: F.f13, fontWeight: '600', color: Colors.text_dark, flex: 1, marginRight: 8 },
  propStatusRow:  { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },

  statusBadge:    { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 0.5 },
  statusBadgeTxt: { fontSize: F.f10, fontWeight: '600' },

  progTrack: { height: 4, backgroundColor: Colors.border_light, borderRadius: 4, overflow: 'hidden' },
  progFill:  { height: 4, backgroundColor: Colors.primary, borderRadius: 4 },

  // ── Bottom Button ─────────────────────────────────────────────────────────
  viewBtn:     { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.header_dark, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 15 },
  viewBtnText: { color: Colors.text_white, fontSize: F.f14, fontWeight: '600' },

  // ── States ────────────────────────────────────────────────────────────────
  errorState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  errorEmoji: { fontSize: 34 },
  errorTxt:   { fontSize: F.f13, color: Colors.text_label, textAlign: 'center' },
  retryBtn:   { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  retryTxt:   { color: Colors.text_white, fontSize: F.f13, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 34, marginBottom: 10 },
  emptyTxt:   { fontSize: F.f13, color: Colors.text_label },
});