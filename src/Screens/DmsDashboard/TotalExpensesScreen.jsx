import React, { useState, useEffect,  } from 'react';
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import FarmhouseExpenses from './Modals/FarmhousExpenses';
import AirbnbExpenses   from './Modals/AirbnbExpenses';
import { getExpenses }  from '../../Api/ApiService';

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const Colors = {
  header_dark:    '#0D4F4A',
  header_mid:     '#0F766E',
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
  strip_bg:       'rgba(255,255,255,0.10)',
  icon_cyan:      '#CFFAFE',
  icon_yellow:    '#FEF9C3',
};

const F = {
  f10: 10, f11: 11, f12: 12, f13: 13,
  f14: 14, f15: 15, f16: 16, f17: 17, f18: 18, f20: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { key: 'today',  label: 'Today' },
  { key: 'month1', label: 'Last Month' },
  { key: 'month3', label: 'Last 3 Months' },
  { key: 'month6', label: 'Last 6 Months' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. ICON HELPER  (API data mein icon nahi hota, so property name se match karo)
// ─────────────────────────────────────────────────────────────────────────────

const getPropertyIconConfig = (propertyName = '') => {
  const name = propertyName.toLowerCase();
  if (name.includes('grey'))    return { icon: require('../../Assets/icons/Greystone.png'),   iconBg: Colors.primary_light, iconTint: Colors.primary_text };
  if (name.includes('sky'))     return { icon: require('../../Assets/icons/stonestays1.png'),  iconBg: Colors.icon_cyan,    iconTint: Colors.primary };
  if (name.includes('topaz'))   return { icon: require('../../Assets/icons/stonestays1.png'),  iconBg: Colors.primary_light, iconTint: Colors.primary };
  if (name.includes('ruby'))    return { icon: require('../../Assets/icons/stonestays1.png'),  iconBg: Colors.icon_yellow,  iconTint: '#92400E' };
  if (name.includes('sapphire'))return { icon: require('../../Assets/icons/stonestays1.png'),  iconBg: Colors.icon_cyan,    iconTint: Colors.primary };
  // default fallback
  return { icon: require('../../Assets/icons/stonestays1.png'), iconBg: Colors.primary_light, iconTint: Colors.primary };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. PERIOD PILLS
// ─────────────────────────────────────────────────────────────────────────────

const PeriodPills = ({ selected, onSelect }) => (
  <View style={styles.pillRow}>
    {PERIOD_OPTIONS.map(item => {
      const isActive = selected === item.key;
      return (
        <TouchableOpacity
          key={item.key}
          style={[styles.pill, isActive && styles.pillActive]}
          onPress={() => onSelect(item.key)}
          activeOpacity={0.75}
        >
          <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. TAB SWITCH
// ─────────────────────────────────────────────────────────────────────────────

const TabSwitch = ({ properties, activeKey, onSelect }) => (
  <View style={styles.tabsWrap}>
    {properties.map(prop => {
      const isActive = activeKey === prop.key;
      return (
        <TouchableOpacity
          key={prop.key}
          style={[styles.tab, isActive && styles.tabActive]}
          onPress={() => onSelect(prop.key)}
          activeOpacity={0.75}
        >
          <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
            {prop.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. PROPERTY SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────

const PropertySectionCard = ({
  title,
  subtitle,
  categoryIcon,
  totalAmount,
  properties,
  onViewExpenses,
}) => {
  const [activeKey, setActiveKey] = useState(properties[0]?.key);
  const activeProp = properties.find(p => p.key === activeKey) || properties[0];

  // Agar properties change ho (API refetch) toh activeKey reset karo
  useEffect(() => {
    if (properties.length > 0) setActiveKey(properties[0].key);
  }, [properties]);

  if (!activeProp) return null;

  return (
    <View style={styles.sectionCard}>

      {/* Card Header */}
      <View style={styles.sectionCardHdr}>
        <View style={[styles.sectionCardIconBox, { borderWidth: 1, borderColor: '#b8b8b8' }]}>
          <Image
            source={categoryIcon}
            style={styles.sectionCardIcon}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionCardTitle}>{title}</Text>
          <Text style={styles.sectionCardSub}>{subtitle}</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{totalAmount}</Text>
        </View>
      </View>

      <View style={styles.sectionCardDivider} />

      {/* Tab Switch */}
      <View style={styles.sectionCardBody}>
        <TabSwitch
          properties={properties}
          activeKey={activeKey}
          onSelect={setActiveKey}
        />

        {/* Active Property Summary */}
        <View style={styles.propSummary}>
          <View style={styles.propSummaryLeft}>
            <View style={[styles.propSummaryIconBox, { borderWidth: 1, borderColor: '#b8b8b8' }]}>
              <Image
                source={activeProp.icon}
                style={styles.propSummaryIcon}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.propSummaryName}>{activeProp.label}</Text>
              <View style={styles.propBadgeWrap}>
                <View style={styles.propBadge}>
                  <Text style={styles.propBadgeText}>{activeProp.badge}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.propSummaryRight}>
            <Text style={styles.propSummaryLabel}>TOTAL EXPENSES</Text>
            <Text style={styles.propSummaryAmount}>{activeProp.totalExp}</Text>
          </View>
        </View>

        {/* View Expenses Button */}
        <TouchableOpacity
          style={styles.viewExpBtn}
          onPress={() => onViewExpenses(activeProp)}
          activeOpacity={0.85}
        >
          <Text style={styles.viewExpBtnText}>View {activeProp.label} Expenses</Text>
          <Text style={styles.viewExpBtnArrow}>›</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const TotalExpensesScreen = ({ navigation }) => {
  const [period,         setPeriod]         = useState('today');
  const [farmhouseModal, setFarmhouseModal] = useState(false);
  const [selectedFarm,   setSelectedFarm]   = useState(null);
  const [airbnbModal,    setAirbnbModal]    = useState(false);
  const [selectedAirbnb, setSelectedAirbnb] = useState(null);

  // ── API state ──────────────────────────────────────────────────────────────
  const [expensesData, setExpensesData] = useState([]);
  const [loading,      setLoading]      = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const result = await getExpenses();
      if (result.success) {
        console.log('✅ FINAL EXPENSES =>', JSON.stringify(result.data, null, 2));
        setExpensesData(result.data);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.log('❌ FETCH EXPENSE ERROR =>', error);
      Alert.alert('Error', 'Something went wrong while fetching expenses.');
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {

  const unsubscribe = navigation.addListener(
    'focus',
    () => {

      fetchExpenses();
    }
  );

  return unsubscribe;

}, [navigation]);

  // ── Derived / computed data ────────────────────────────────────────────────

 const farmhouseData = expensesData.filter(
  item =>
    item.Category?.toLowerCase() === 'farmhouse'
);

const airbnbData = expensesData.filter(
  item =>
    item.Category?.toLowerCase() === 'airbnb'
);

  const farmhouseTotal = farmhouseData.reduce(
    (sum, item) => sum + Number(item.ExpenseAmount || 0), 0,
  );
  const airbnbTotal = airbnbData.reduce(
    (sum, item) => sum + Number(item.ExpenseAmount || 0), 0,
  );
  const overallTotal = farmhouseTotal + airbnbTotal;

  // ── Build property arrays for PropertySectionCard ─────────────────────────

  const uniqueFarmhouseMap = {};

farmhouseData.forEach(item => {

  if (!uniqueFarmhouseMap[item.PropertyName]) {

    uniqueFarmhouseMap[item.PropertyName] = {
      key: item.PropertyName,
      label: item.PropertyName,
      badge: item.Category,
      totalAmount: 0,
      expenses: [],
      ...getPropertyIconConfig(item.PropertyName),
    };
  }

  uniqueFarmhouseMap[item.PropertyName]
    .totalAmount += Number(item.ExpenseAmount || 0);

  uniqueFarmhouseMap[item.PropertyName]
    .expenses.push(item);
});

const FARMHOUSE_PROPERTIES =
  Object.values(uniqueFarmhouseMap).map(item => ({

    ...item,

    totalExp:
      `₹${item.totalAmount.toLocaleString('en-IN')}`,
}));

  const uniqueAirbnbMap = {};

airbnbData.forEach(item => {

  if (!uniqueAirbnbMap[item.PropertyName]) {

    uniqueAirbnbMap[item.PropertyName] = {
      key: item.PropertyName,
      label: item.PropertyName,
      badge: item.Category,
      totalAmount: 0,
      expenses: [],
      ...getPropertyIconConfig(item.PropertyName),
    };
  }

  uniqueAirbnbMap[item.PropertyName]
    .totalAmount += Number(item.ExpenseAmount || 0);

  uniqueAirbnbMap[item.PropertyName]
    .expenses.push(item);
});

const AIRBNB_PROPERTIES =
  Object.values(uniqueAirbnbMap).map(item => ({

    ...item,

    totalExp:
      `₹${item.totalAmount.toLocaleString('en-IN')}`,
}));
  // Format totals for display
  const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFarmhouseView = (prop) => {
    setSelectedFarm(prop);
    setFarmhouseModal(true);
  };

  const handleAirbnbView = (prop) => {
    setSelectedAirbnb(prop);
    setAirbnbModal(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
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
            <Text style={styles.headerTitle}>Total Expenses</Text>
            <Text style={styles.headerSubtitle}>All properties overview</Text>
          </View>
        </View>

        {/* Summary strip — live totals from API */}
        <View style={styles.summaryStrip}>
          <View style={[styles.stripItem, styles.stripItemBorder]}>
            <Text style={styles.stripLabel}>TOTAL</Text>
            <Text style={styles.stripVal}>{fmt(overallTotal)}</Text>
            <Text style={styles.stripSub}>
              {expensesData.length} properties
            </Text>
          </View>
          <View style={[styles.stripItem, styles.stripItemBorder]}>
            <Text style={styles.stripLabel}>FARMHOUSE</Text>
            <Text style={styles.stripVal}>{fmt(farmhouseTotal)}</Text>
            <Text style={styles.stripSub}>
              {farmhouseData.length} properties
            </Text>
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>AIRBNB</Text>
            <Text style={styles.stripVal}>{fmt(airbnbTotal)}</Text>
            <Text style={styles.stripSub}>
              {airbnbData.length} properties
            </Text>
          </View>
        </View>
      </View>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Loading expenses...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.body}
           contentContainerStyle={[styles.bodyContent, { paddingBottom: 70 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Period Pills */}
          <PeriodPills selected={period} onSelect={setPeriod} />

          {/* Farmhouse Section */}
          {FARMHOUSE_PROPERTIES.length > 0 && (
            <PropertySectionCard
              title="Farmhouse"
              subtitle={`${FARMHOUSE_PROPERTIES.length} properties`}
              categoryIcon={require('../../Assets/icons/stonestays1.png')}
              totalAmount={fmt(farmhouseTotal)}
              properties={FARMHOUSE_PROPERTIES}
              onViewExpenses={handleFarmhouseView}
            />
          )}

          {/* Airbnb Section */}
          {AIRBNB_PROPERTIES.length > 0 && (
            <PropertySectionCard
              title="Airbnb"
              subtitle={`${AIRBNB_PROPERTIES.length} properties`}
              categoryIcon={require('../../Assets/icons/stonestays1.png')}
              totalAmount={fmt(airbnbTotal)}
              properties={AIRBNB_PROPERTIES}
              onViewExpenses={handleAirbnbView}
            />
          )}

          {/* Empty state */}
          {!loading && expensesData.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No expenses found.</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── FARMHOUSE EXPENSES MODAL ────────────────────────────────────────── */}
      <FarmhouseExpenses
        visible={farmhouseModal}
        property={selectedFarm}
        period={period}
        onClose={() => setFarmhouseModal(false)}

      />

      {/* ── AIRBNB EXPENSES MODAL ───────────────────────────────────────────── */}
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
// 8. STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex:            1,
    backgroundColor: '#0F172A',
  },

  // ── Header ────────────────────────────────────────────────────────────────

  header: {
    backgroundColor: '#0F172A',
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
  backIcon: {
    width:     18,
    height:    18,
    tintColor: Colors.text_white,
  },
  headerTitleBlock: { flex: 1 },
  headerTitle: {
    color:        Colors.text_white,
    fontSize:     F.f17,
    fontWeight:   '600',
    marginBottom: 3,
  },
  headerSubtitle: {
    color:    Colors.text_muted,
    fontSize: F.f12,
  },
  circle1: {
    position:        'absolute',
    width:           130,
    height:          130,
    borderRadius:    65,
    borderWidth:     22,
    borderColor:     'rgba(255,255,255,0.07)',
    top:             -35,
    right:           -30,
    zIndex:          1,
  },
  circle2: {
    position:        'absolute',
    width:           70,
    height:          70,
    borderRadius:    35,
    borderWidth:     14,
    borderColor:     'rgba(255,255,255,0.05)',
    bottom:          30,
    right:           60,
    zIndex:          1,
  },
  summaryStrip: {
    flexDirection:   'row',
    backgroundColor: Colors.strip_bg,
    borderTopWidth:  0.5,
    borderTopColor:  Colors.border_white,
  },
  stripItem: {
    flex:    1,
    padding: 11,
  },
  stripItemBorder: {
    borderRightWidth:  0.5,
    borderRightColor:  Colors.border_white,
  },
  stripLabel: {
    fontSize:      F.f10,
    color:         'rgba(255,255,255,0.50)',
    letterSpacing: 0.4,
    marginBottom:  3,
  },
  stripVal: {
    fontSize:   F.f15,
    fontWeight: '600',
    color:      Colors.text_white,
  },
  stripSub: {
    fontSize:  F.f10,
    color:     'rgba(255,255,255,0.40)',
    marginTop: 1,
  },

  // ── Body ──────────────────────────────────────────────────────────────────

  body:        { flex: 1, backgroundColor: Colors.page_bg },
  bodyContent: {
    paddingHorizontal: 14,
    paddingTop:        14,
    paddingBottom:     34,
    gap:               12,
  },

  // ── Loader ────────────────────────────────────────────────────────────────

  loaderWrap: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
  },
  loaderText: {
    color:    Colors.text_grey,
    fontSize: F.f13,
  },

  // ── Empty State ───────────────────────────────────────────────────────────

  emptyWrap: {
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color:    Colors.text_grey,
    fontSize: F.f14,
  },

  // ── Period Pills ──────────────────────────────────────────────────────────

  pillRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
  },
  pill: {
    paddingHorizontal: 13,
    paddingVertical:   7,
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       Colors.border,
    backgroundColor:   Colors.card_bg,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor:     Colors.primary,
  },
  pillText: {
    fontSize:   F.f12,
    fontWeight: '500',
    color:      Colors.primary_mid,
  },
  pillTextActive: {
    color: Colors.text_white,
  },

  // ── Section Card ──────────────────────────────────────────────────────────

  sectionCard: {
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
  sectionCardHdr: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    paddingHorizontal: 14,
    paddingVertical:   13,
    backgroundColor:   Colors.card_header_bg,
  },
  sectionCardIconBox: {
    width:          36,
    height:         36,
    borderRadius:   8,
    alignItems:     'center',
    justifyContent: 'center',
  },
  sectionCardIcon: {
    width:  30,
    height: 30,
  },
  sectionCardTitle: {
    color:      Colors.text_dark,
    fontSize:   F.f14,
    fontWeight: '600',
  },
  sectionCardSub: {
    color:     Colors.text_grey,
    fontSize:  F.f11,
    marginTop: 1,
  },
  sectionCardDivider: {
    height:          0.5,
    backgroundColor: Colors.border,
  },
  sectionCardBody: {
    padding: 14,
    gap:     10,
  },
  totalBadge: {
    backgroundColor:   Colors.primary_light,
    borderRadius:      8,
    paddingHorizontal: 10,
    paddingVertical:   4,
    borderWidth:       0.5,
    borderColor:       Colors.primary_border,
  },
  totalBadgeText: {
    color:      Colors.primary,
    fontSize:   F.f13,
    fontWeight: '600',
  },

  // ── Tab Switch ────────────────────────────────────────────────────────────

  tabsWrap: {
    flexDirection:     'row',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border_light,
    marginHorizontal:  -14,
    paddingHorizontal: 14,
    marginTop:         -4,
  },
  tab: {
    flex:              1,
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               5,
    paddingVertical:   9,
    paddingBottom:     11,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabLabel: {
    fontSize:   F.f12,
    fontWeight: '500',
    color:      Colors.text_label,
  },
  tabLabelActive: {
    color: Colors.primary,
  },

  // ── Property Summary ──────────────────────────────────────────────────────

  propSummary: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   Colors.input_bg,
    borderRadius:      10,
    paddingHorizontal: 12,
    paddingVertical:   11,
    borderWidth:       0.5,
    borderColor:       Colors.border,
    marginTop:         4,
  },
  propSummaryLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  propSummaryIconBox: {
    width:          32,
    height:         32,
    borderRadius:   8,
    alignItems:     'center',
    justifyContent: 'center',
  },
  propSummaryIcon: {
    width:  30,
    height: 30,
  },
  propSummaryName: {
    color:      Colors.text_dark,
    fontSize:   F.f13,
    fontWeight: '600',
  },
  propBadgeWrap: { marginTop: 3 },
  propBadge: {
    backgroundColor:   Colors.primary_light,
    borderRadius:      5,
    paddingHorizontal: 7,
    paddingVertical:   2,
    borderWidth:       0.5,
    borderColor:       Colors.primary_border,
    alignSelf:         'flex-start',
  },
  propBadgeText: {
    color:         Colors.primary,
    fontSize:      F.f10,
    fontWeight:    '600',
    letterSpacing: 0.3,
  },
  propSummaryRight: { alignItems: 'flex-end' },
  propSummaryLabel: {
    color:         Colors.text_grey,
    fontSize:      F.f10,
    fontWeight:    '500',
    letterSpacing: 0.4,
  },
  propSummaryAmount: {
    color:      Colors.text_dark,
    fontSize:   F.f17,
    fontWeight: '700',
    marginTop:  2,
  },

  // ── View Expenses Button ──────────────────────────────────────────────────

  viewExpBtn: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   '#0F172A',
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   11,
  },
  viewExpBtnText: {
    color:      Colors.text_white,
    fontSize:   F.f13,
    fontWeight: '600',
  },
  viewExpBtnArrow: {
    color:      Colors.text_white,
    fontSize:   F.f20,
    fontWeight: '700',
  },
});