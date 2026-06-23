import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  Platform,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FarmhouseExpenses from './Modals/FarmhousExpenses';
import AirbnbExpenses   from './Modals/AirbnbExpenses';
import { getExpenses }  from '../../Api/ApiService';

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
  icon_yellow:    '#FEF9C3',
};

const F = {
  f10: 10, f11: 11, f12: 12, f13: 13,
  f14: 14, f15: 15, f16: 16, f17: 17, f18: 18, f20: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PERIOD OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { key: 'today',  label: 'Today',         filterType: 'Today'  },
  { key: 'month1', label: 'Last Month',    filterType: 'Month1' },
  { key: 'month3', label: 'Last 3 Months', filterType: 'Month3' },
  { key: 'month6', label: 'Last 6 Months', filterType: 'Month6' },
  { key: 'custom', label: 'Custom Range',  filterType: 'Custom' },
];

const getFilterType = (key) =>
  PERIOD_OPTIONS.find(o => o.key === key)?.filterType ?? 'Today';

// ─────────────────────────────────────────────────────────────────────────────
// 3. HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const formatINR = (num) => {
  const n = Number(num) || 0;
  return '₹' + n.toLocaleString('en-IN');
};

const getPropertyIconConfig = (propertyName = '') => {
  const name = propertyName.toLowerCase();
  if (name.includes('grey'))     return { icon: require('../../Assets/icons/Greystone.png'),  iconBg: Colors.primary_light, iconTint: Colors.primary_text };
  if (name.includes('sky'))      return { icon: require('../../Assets/icons/stonestays1.png'), iconBg: Colors.icon_cyan,    iconTint: Colors.primary      };
  if (name.includes('topaz'))    return { icon: require('../../Assets/icons/stonestays1.png'), iconBg: Colors.primary_light, iconTint: Colors.primary      };
  if (name.includes('ruby'))     return { icon: require('../../Assets/icons/stonestays1.png'), iconBg: Colors.icon_yellow,  iconTint: '#92400E'            };
  if (name.includes('sapphire')) return { icon: require('../../Assets/icons/stonestays1.png'), iconBg: Colors.icon_cyan,    iconTint: Colors.primary       };
  return { icon: require('../../Assets/icons/stonestays1.png'), iconBg: Colors.primary_light, iconTint: Colors.primary };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PERIOD DROPDOWN — same as Revenue screen
// ─────────────────────────────────────────────────────────────────────────────

const PeriodDropdown = ({ selected, onSelect }) => {
  const [open, setOpen] = useState(false);

  const selectedLabel = PERIOD_OPTIONS.find(o => o.key === selected)?.label ?? 'Today';

  const shortLabel = (lbl) => {
    if (lbl === 'Today')         return 'Today';
    if (lbl === 'Last Month')    return '1 Mo';
    if (lbl === 'Last 3 Months') return '3 Mo';
    if (lbl === 'Last 6 Months') return '6 Mo';
    if (lbl === 'Custom Range')  return 'Custom';
    return lbl;
  };

  const handleSelect = (key) => {
    setOpen(false);
    Keyboard.dismiss();
    onSelect(key);
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
                <FlatList
                  data={PERIOD_OPTIONS}
                  keyExtractor={item => item.key}
                  keyboardShouldPersistTaps="handled"
                  ItemSeparatorComponent={() => <View style={styles.ddSep} />}
                  renderItem={({ item }) => {
                    const isActive = item.key === selected;
                    const isCustom = item.key === 'custom';
                    return (
                      <TouchableOpacity
                        style={[styles.ddOptRow, isActive && styles.ddOptRowActive]}
                        onPress={() => handleSelect(item.key)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.ddOptAccent, isActive && styles.ddOptAccentActive, isCustom && !isActive && styles.ddOptAccentCustom]} />
                        <Text style={[styles.ddOptTxt, isActive && styles.ddOptTxtActive, isCustom && !isActive && styles.ddOptTxtCustom]}>
                          {item.label}
                        </Text>
                        {isCustom && (
                          <View style={styles.ddNewBadge}>
                            <Text style={styles.ddNewBadgeTxt}>NEW</Text>
                          </View>
                        )}
                        {isActive && <Text style={styles.ddCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  }}
                />
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
    {[0, 1].map(i => (
      <View key={i} style={[styles.expCard, { padding: 14, gap: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <SkeletonBox w={36} h={36} radius={10} />
          <View style={{ gap: 6 }}>
            <SkeletonBox w={120} h={14} />
            <SkeletonBox w={80}  h={11} />
          </View>
          <View style={{ flex: 1 }} />
          <SkeletonBox w={70} h={28} radius={8} />
        </View>
        <View style={styles.cardDivider} />
        {[0, 1].map(j => (
          <View key={j} style={styles.propRow}>
            <SkeletonBox w={30} h={30} radius={8} />
            <View style={{ flex: 1, gap: 5 }}>
              <SkeletonBox w={90}  h={13} />
              <SkeletonBox w={50}  h={10} />
              <SkeletonBox w={'100%'} h={4} radius={4} />
            </View>
            <View style={{ alignItems: 'flex-end', gap: 5 }}>
              <SkeletonBox w={60} h={14} />
              <SkeletonBox w={70} h={10} />
            </View>
          </View>
        ))}
      </View>
    ))}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. PROPERTY ROW — same as Revenue screen
// ─────────────────────────────────────────────────────────────────────────────

const PropertyRow = ({ prop, onViewExpenses }) => (
  <TouchableOpacity style={styles.propRow} activeOpacity={0.8} onPress={() => onViewExpenses(prop)}>
    <View style={styles.propRowIcon}>
      <Image source={prop.icon} style={styles.propRowIconImg} resizeMode="contain" />
    </View>
    <View style={styles.propRowMid}>
      <Text style={styles.propRowName}>{prop.label}</Text>
      <View style={styles.propBadge}>
        <Text style={styles.propBadgeText}>{prop.badge}</Text>
      </View>
      <ProgressBar progress={prop.progress} />
    </View>
    <View style={styles.propRowRight}>
      <Text style={styles.propRowAmt}>{prop.totalExp}</Text>
      <View style={styles.dotRow}>
        <View style={styles.dot} />
        <Text style={styles.dotText}>{prop.count} expenses</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. EXPENSE SECTION CARD — same structure as RevenueSectionCard
// ─────────────────────────────────────────────────────────────────────────────

const ExpenseSectionCard = ({
  title,
  categoryIcon,
  categoryIconBg,
  categoryIconTint,
  data,
  onViewExpenses,
}) => (
  <View style={styles.expCard}>
    <View style={styles.expCardHdr}>
      <View style={[styles.expCardIconBox, { backgroundColor: categoryIconBg }]}>
        <Image
          source={categoryIcon}
          style={[styles.expCardIcon, { tintColor: categoryIconTint }]}
          resizeMode="contain"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.expCardTitle}>{title}</Text>
        <Text style={styles.expCardSub}>
          {data.properties.length} properties · {data.totalCount} expenses
        </Text>
      </View>
      <View style={styles.totalBadge}>
        <Text style={styles.totalBadgeText}>{data.totalAmount}</Text>
      </View>
    </View>
    <View style={styles.cardDivider} />
    <View style={styles.expCardBody}>
      {data.properties.map(prop => (
        <PropertyRow key={prop.key} prop={prop} onViewExpenses={onViewExpenses} />
      ))}
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 9. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const TotalExpensesScreen = ({ navigation }) => {
  const [period,         setPeriod]         = useState('today');
  const [search,         setSearch]         = useState('');
  const [expensesData,   setExpensesData]   = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  // Modal state
  const [farmhouseModal, setFarmhouseModal] = useState(false);
  const [selectedFarm,   setSelectedFarm]   = useState(null);
  const [airbnbModal,    setAirbnbModal]    = useState(false);
  const [selectedAirbnb, setSelectedAirbnb] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchExpenses = useCallback(async (periodKey) => {
    try {
      setLoading(true);
      setError(null);

      const filterType = getFilterType(periodKey ?? period);
      console.log('🚀 FETCHING EXPENSES filterType =>', filterType);

      const result = await getExpenses(filterType, '', '');
      console.log('✅ EXPENSES RESPONSE =>', JSON.stringify(result, null, 2));

      if (result.success) {
        setExpensesData(result.data || []);
      } else {
        setError(result.message || 'Unable to load data. Please try again.');
      }
    } catch (err) {
      console.log('❌ EXPENSE FETCH ERROR =>', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Period change hone par refetch
  useEffect(() => {
    fetchExpenses(period);
  }, [period]);

  // Screen focus par refresh
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchExpenses(period));
    return unsubscribe;
  }, [navigation, period]);

  // ── Build category data ────────────────────────────────────────────────────

  const buildCategoryData = (categoryName) => {
    const filtered = expensesData.filter(
      item => item.Category?.toLowerCase() === categoryName.toLowerCase()
    );

    // Search filter
    const searched = !search.trim() ? filtered : filtered.filter(
      item => item.PropertyName?.toLowerCase().includes(search.toLowerCase())
    );

    // Group by property
    const propMap = {};
    searched.forEach(item => {
      const key = item.PropertyName || 'Unknown';
      if (!propMap[key]) {
        propMap[key] = {
          key,
          label:       key,
          badge:       item.Category || categoryName,
          totalAmount: 0,
          count:       0,
          expenses:    [],
          ...getPropertyIconConfig(key),
        };
      }
      propMap[key].totalAmount += Number(item.ExpenseAmount || 0);
      propMap[key].count       += 1;
      propMap[key].expenses.push(item);
    });

    const properties = Object.values(propMap);
    const maxAmt     = Math.max(...properties.map(p => p.totalAmount), 1);

    const propsWithProgress = properties.map(p => ({
      ...p,
      totalExp: formatINR(p.totalAmount),
      progress: parseFloat((p.totalAmount / maxAmt).toFixed(2)),
    }));

    const total = properties.reduce((sum, p) => sum + p.totalAmount, 0);
    const count = searched.length;

    return {
      totalAmount: formatINR(total),
      totalCount:  count,
      properties:  propsWithProgress,
    };
  };

  const farmData   = buildCategoryData('Farmhouse');
  const airbnbData = buildCategoryData('Airbnb');

  const showFarm   = farmData.properties.length   > 0;
  const showAirbnb = airbnbData.properties.length > 0;

  // Overall totals for header strip
  const allFarmExp   = expensesData.filter(i => i.Category?.toLowerCase() === 'farmhouse');
  const allAirbnbExp = expensesData.filter(i => i.Category?.toLowerCase() === 'airbnb');
  const farmTotal    = allFarmExp.reduce((s, i)   => s + Number(i.ExpenseAmount || 0), 0);
  const airbnbTotal  = allAirbnbExp.reduce((s, i) => s + Number(i.ExpenseAmount || 0), 0);
  const overallTotal = farmTotal + airbnbTotal;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFarmView = (prop) => {
    setSelectedFarm(prop);
    setFarmhouseModal(true);
  };

  const handleAirbnbView = (prop) => {
    setSelectedAirbnb(prop);
    setAirbnbModal(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
               <StatusBar
                 backgroundColor={Colors.bg_dark}
                 barStyle="light-content"
                 translucent={false}
               />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Image source={require('../../Assets/icons/ak.png')} style={styles.backIcon} resizeMode="contain" />
          </TouchableOpacity>
          <View style={styles.headerTitleBlock}>
            <Text style={styles.headerTitle}>Total Expenses</Text>
            <Text style={styles.headerSubtitle}>All properties overview</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchExpenses(period)} activeOpacity={0.8} disabled={loading}>
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
            <Text style={styles.stripVal}>{loading ? '...' : formatINR(overallTotal)}</Text>
            <Text style={styles.stripSub}>{allFarmExp.length + allAirbnbExp.length} expenses</Text>
          </View>
          <View style={[styles.stripItem, styles.stripItemBorder]}>
            <Text style={styles.stripLabel}>FARMHOUSE</Text>
            <Text style={styles.stripVal}>{loading ? '...' : formatINR(farmTotal)}</Text>
            <Text style={styles.stripSub}>{allFarmExp.length} expenses</Text>
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>AIRBNB</Text>
            <Text style={styles.stripVal}>{loading ? '...' : formatINR(airbnbTotal)}</Text>
            <Text style={styles.stripSub}>{allAirbnbExp.length} expenses</Text>
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
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search properties..."
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
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchExpenses(period)} activeOpacity={0.8}>
              <Text style={styles.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!loading && !error && !showFarm && !showAirbnb && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTxt}>
              {search ? `No properties found for "${search}"` : 'No expense data available.'}
            </Text>
          </View>
        )}

        {/* Farmhouse card */}
        {!loading && !error && showFarm && (
          <ExpenseSectionCard
            title="Farmhouse"
            categoryIcon={require('../../Assets/icons/Greystone.png')}
            categoryIconBg="#CCFBF1"
            categoryIconTint={Colors.primary_text}
            data={farmData}
            onViewExpenses={handleFarmView}
          />
        )}

        {/* Airbnb card */}
        {!loading && !error && showAirbnb && (
          <ExpenseSectionCard
            title="Airbnb"
            categoryIcon={require('../../Assets/icons/stonestays1.png')}
            categoryIconBg="#CFFAFE"
            categoryIconTint={Colors.primary}
            data={airbnbData}
            onViewExpenses={handleAirbnbView}
          />
        )}

        {/* View All Bookings button */}
      

      </ScrollView>

      {/* ── MODALS ─────────────────────────────────────────────────────────── */}
      <FarmhouseExpenses
        visible={farmhouseModal}
        property={selectedFarm}
        period={period}
        onClose={() => setFarmhouseModal(false)}
      />
      <AirbnbExpenses
        visible={airbnbModal}
        property={selectedAirbnb}
        period={period}
        onClose={() => setAirbnbModal(false)}
      />

    </SafeAreaView>
  );
};

export default TotalExpensesScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 10. STYLES
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
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     14,
  },
  backIcon:         { width: 18, height: 18, tintColor: Colors.text_white },
  headerTitleBlock: { flex: 1 },
  headerTitle: {
    color:        Colors.text_white,
    fontSize:     F.f17,
    fontWeight:   '600',
    marginBottom: 3,
  },
  headerSubtitle: { color: Colors.text_muted, fontSize: F.f12 },
  refreshBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  refreshIcon: { fontSize: 20, color: Colors.text_white, fontWeight: '700' },
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

  // ── Summary Strip ─────────────────────────────────────────────────────────
  summaryStrip: {
    flexDirection:   'row',
    backgroundColor: Colors.strip_bg,
    borderTopWidth:  0.5,
    borderTopColor:  Colors.border_white,
  },
  stripItem:       { flex: 1, padding: 11 },
  stripItemBorder: { borderRightWidth: 0.5, borderRightColor: Colors.border_white },
  stripLabel: {
    fontSize: F.f10, color: 'rgba(255,255,255,0.50)',
    letterSpacing: 0.4, marginBottom: 3, marginLeft: 10,
  },
  stripVal: { fontSize: F.f15, fontWeight: '600', color: Colors.text_white, marginLeft: 10 },
  stripSub: { fontSize: F.f10, color: 'rgba(255,255,255,0.40)', marginTop: 1, marginLeft: 10 },

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
  searchIcon:     { fontSize: 14 },
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

  // ── Dropdown Sheet ────────────────────────────────────────────────────────
  ddOverlay:     { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  ddSheet:       { backgroundColor: Colors.card_bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
  ddHandle:      { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginTop: 12, marginBottom: 4 },
  ddSheetHdr:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  ddSheetTitle:  { fontSize: F.f16, fontWeight: '700', color: Colors.text_dark },
  ddCloseBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.input_bg, alignItems: 'center', justifyContent: 'center' },
  ddCloseTxt:    { fontSize: F.f12, color: Colors.text_grey },
  ddSep:         { height: 0.5, backgroundColor: Colors.border_light, marginHorizontal: 20 },
  ddOptRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 17, gap: 14 },
  ddOptRowActive: { backgroundColor: Colors.primary_light },
  ddOptAccent:       { width: 4, height: 20, borderRadius: 2, backgroundColor: Colors.border },
  ddOptAccentActive: { backgroundColor: Colors.primary },
  ddOptAccentCustom: { backgroundColor: Colors.primary_mid },
  ddOptTxt:          { flex: 1, fontSize: F.f15, color: Colors.text_dark },
  ddOptTxtActive:    { fontWeight: '700', color: Colors.primary },
  ddOptTxtCustom:    { color: Colors.primary_mid, fontWeight: '500' },
  ddNewBadge:    { backgroundColor: Colors.primary, borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  ddNewBadgeTxt: { fontSize: F.f10, fontWeight: '700', color: Colors.text_white },
  ddCheck:       { fontSize: F.f16, color: Colors.primary, fontWeight: '700' },

  // ── Expense Card ──────────────────────────────────────────────────────────
  expCard: {
    backgroundColor: Colors.card_bg,
    borderRadius:    16,
    borderWidth:     0.5,
    borderColor:     Colors.border,
    overflow:        'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  expCardHdr: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: Colors.card_header_bg,
  },
  expCardIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#b8b8b8' },
  expCardIcon:    { width: 30, height: 30 },
  expCardTitle:   { color: Colors.text_dark, fontSize: F.f14, fontWeight: '600' },
  expCardSub:     { color: Colors.text_grey, fontSize: F.f11, marginTop: 1 },
  expCardBody:    { padding: 14, gap: 10 },
  cardDivider:    { height: 0.5, backgroundColor: Colors.border },

  totalBadge: {
    backgroundColor: Colors.primary_light, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 0.5, borderColor: Colors.primary_border,
  },
  totalBadgeText: { color: Colors.primary, fontSize: F.f13, fontWeight: '600' },

  // ── Property Row ──────────────────────────────────────────────────────────
  propRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.input_bg, borderRadius: 10,
    padding: 10, paddingHorizontal: 12,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  propRowIcon:    { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1, borderColor: '#b8b8b8' },
  propRowIconImg: { width: 30, height: 30 },
  propRowMid:     { flex: 1, gap: 3 },
  propRowName:    { fontSize: F.f13, fontWeight: '500', color: Colors.text_dark },
  propBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primary_light,
    borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1,
    borderWidth: 0.5, borderColor: Colors.primary_border,
  },
  propBadgeText: { fontSize: F.f10, fontWeight: '600', color: Colors.primary },
  progTrack:     { height: 4, backgroundColor: Colors.border_light, borderRadius: 4, overflow: 'hidden', marginTop: 4 },
  progFill:      { height: 4, backgroundColor: Colors.header_dark, borderRadius: 4 },
  propRowRight:  { alignItems: 'flex-end', gap: 3 },
  propRowAmt:    { fontSize: F.f14, fontWeight: '600', color: Colors.text_dark },
  dotRow:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:           { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.header_dark },
  dotText:       { fontSize: F.f10, color: Colors.header_dark },

  // ── Bottom Button ─────────────────────────────────────────────────────────
  viewBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.header_dark,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14,
  },
  viewBtnText: { color: Colors.text_white, fontSize: F.f14, fontWeight: '600', textAlign: 'center' },

  // ── States ────────────────────────────────────────────────────────────────
  errorState:  { alignItems: 'center', paddingVertical: 40, gap: 10 },
  errorEmoji:  { fontSize: 34 },
  errorTxt:    { fontSize: F.f13, color: Colors.text_label, textAlign: 'center' },
  retryBtn:    { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  retryTxt:    { color: Colors.text_white, fontSize: F.f13, fontWeight: '600' },
  emptyState:  { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji:  { fontSize: 34, marginBottom: 10 },
  emptyTxt:    { fontSize: F.f13, color: Colors.text_label },
});