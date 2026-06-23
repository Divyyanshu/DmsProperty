import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDashboardTotals, getEnquiries } from '../../Api/ApiService';

// ─── Colors ───────────────────────────────────────────────────────────────────

const Colors = {
  bg_dark: '#0F172A',
  bg_light: '#F8FAFC',
  primary: '#F59E0B',
  btn_primary: '#F59E0B',
  btn_text: '#0F172A',
  btn_icon: '#0F172A',
  text_white: '#F1F5F9',
  text_grey: '#94A3B8',
  text_dark: '#1E293B',
  text_label: '#64748B',
  inputBgColor: '#F1F5F9',
  inputBorder: '#E2E8F0',
  inputIcon: '#94A3B8',
  error: '#EF4444',
  error_bg: '#FEE2E2',
  error_border: '#FECACA',
  divider: '#CBD5E1',
  badge_text: '#94A3B8',
  overlay_circle: 'rgba(245,158,11,0.12)',
  card_bg: '#FFFFFF',
  card_shadow: '#E2E8F0',
  green_bg: 'rgba(34,197,94,0.12)',
  green_text: '#16A34A',
  green_icon_bg: 'rgba(34,197,94,0.18)',
  blue_icon_bg: 'rgba(59,130,246,0.12)',
  gold_icon_bg: '#F59E0B',
  nav_bg: '#FFFFFF',
  nav_inactive: '#94A3B8',
  nav_active: '#0F172A',
  page_bg: '#EEF0F6',
};

// ─── Fonts ────────────────────────────────────────────────────────────────────

const CommonFonts = {
  font10: 10,
  font11: 11,
  font12: 12,
  font13: 13,
  font14: 14,
  font15: 15,
  font16: 16,
  font18: 18,
  font20: 20,
  font22: 22,
  font28: 28,
  font32: 32,
};

// ─── Heights ──────────────────────────────────────────────────────────────────

const CommonHeights = {
  height: 3,
  height6: 6,
  height8: 8,
  height10: 10,
  height12: 12,
  height14: 14,
  height16: 16,
  height18: 18,
  height20: 20,
  height22: 22,
  height24: 24,
  height26: 26,
  height28: 28,
  height30: 30,
  height40: 40,
  height48: 48,
  height52: 52,
  height56: 56,
  height60: 60,
  height64: 64,
};

// ─── Widths ───────────────────────────────────────────────────────────────────

const CommonWidths = {
  width8: 8,
  width10: 10,
  width12: 12,
  width16: 16,
  width20: 20,
  width24: 24,
  width30: 30,
  width40: 40,
  width44: 44,
  width48: 48,
};

// ─── Nav Tab Config ───────────────────────────────────────────────────────────

const NAV_TABS = [
  { key: 'Home', label: 'Home', icon: require('../../Assets/icons/home.png') },
  {
    key: 'Enquiry',
    label: 'Enquiry',
    icon: require('../../Assets/icons/plus2.png'),
  },
  {
    key: 'Reports',
    label: 'Reports',
    icon: require('../../Assets/icons/reports2.png'),
  },
  {
    key: 'Logout',
    label: 'Logout',
    icon: require('../../Assets/icons/logout2.png'),
  },
];

// ─── Quick Action Data ────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    key: 'New Booking',
    label: 'New Booking',
    icon: require('../../Assets/icons/sub.png'),
    iconBg: 'rgba(34,197,94,0.18)',
    iconTint: '#16A34A',
    isPlus: false,
  },
  {
    key: 'new_enquiry',
    label: 'New Enquiry',
    icon: require('../../Assets/icons/plus2.png'),
    iconBg: Colors.bg_dark,
    iconTint: Colors.text_white,
    isPlus: true,
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: require('../../Assets/icons/reports2.png'),
    iconBg: 'rgba(59,130,246,0.12)',
    iconTint: '#3B82F6',
    isPlus: false,
  },
  {
    key: 'Expenses',
    label: 'Expenses',
    icon: require('../../Assets/icons/expenses.png'),
    iconBg: 'rgba(59,130,246,0.12)',
    iconTint: '#3B82F6',
    isPlus: false,
  },
  {
    key: 'Check-In Details',
    label: 'Check-In Details',
    icon: require('../../Assets/icons/checkin.png'),
    iconBg: 'rgba(59,130,246,0.12)',
    iconTint: '#3B82F6',
    isPlus: false,
  },
];

// ─── Period Options ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  'Today',
  'Yesterday',
  'This Month',
  'This Year',
  'Custom',
];

// ─── Period → API FilterType mapping ─────────────────────────────────────────

const PERIOD_MAP = {
  Today: 'Today',
  Yesterday: 'Yesterday',
  'This Month': 'ThisMonth',
  'This Year': 'ThisYear',
  Custom: 'Custom',
};

// ─── Helper: Format INR ────────────────────────────────────────────────────

const formatINR = val => {
  if (!val && val !== 0) return '₹0';
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

// ─── Calendar Constants ───────────────────────────────────────────────────────

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// ─── CalendarPicker Component ─────────────────────────────────────────────────

const CalendarPicker = ({
  visible,
  selectedDate,
  onSelect,
  onClear,
  onClose,
}) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const parseDate = str => {
    if (!str) return null;
    const [dd, mm, yyyy] = str.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

  const goMonth = delta => {
    let m = viewMonth + delta,
      y = viewYear;
    if (m > 11) {
      m = 0;
      y++;
    }
    if (m < 0) {
      m = 11;
      y--;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const buildGrid = () => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];
    for (let i = firstWeekday - 1; i >= 0; i--)
      cells.push({ day: daysInPrev - i, cur: false });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, cur: true });
    while (cells.length % 7 !== 0 || cells.length < 35)
      cells.push({
        day: cells.length - daysInMonth - firstWeekday + 1,
        cur: false,
      });
    return cells;
  };

  const cells = buildGrid();

  const isSelected = cell => {
    if (!cell.cur || !selectedDate) return false;
    const s = parseDate(selectedDate);
    if (!s) return false;
    return (
      s.getDate() === cell.day &&
      s.getMonth() === viewMonth &&
      s.getFullYear() === viewYear
    );
  };

  const isToday = cell => {
    if (!cell.cur) return false;
    return (
      cell.day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const handleSelect = cell => {
    if (!cell.cur) return;
    const picked = new Date(viewYear, viewMonth, cell.day);
    const dd = String(picked.getDate()).padStart(2, '0');
    const mm = String(picked.getMonth() + 1).padStart(2, '0');
    onSelect(`${dd}/${mm}/${picked.getFullYear()}`);
  };

  const handleToday = () => {
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    onSelect(`${dd}/${mm}/${today.getFullYear()}`);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={calStyles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={calStyles.card}>
        {/* Month / Year Header */}
        <View style={calStyles.headerRow}>
          <View style={calStyles.monthBtn}>
            <Text style={calStyles.monthText}>
              {MONTHS_LONG[viewMonth]} {viewYear}
            </Text>
          </View>
          <View style={calStyles.navBtns}>
            <TouchableOpacity
              style={calStyles.navBtn}
              onPress={() => goMonth(-1)}
              activeOpacity={0.7}
            >
              <Text style={calStyles.navArrow}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={calStyles.navBtn}
              onPress={() => goMonth(1)}
              activeOpacity={0.7}
            >
              <Text style={calStyles.navArrow}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Day Labels */}
        <View style={calStyles.dayLabelRow}>
          {DAYS_SHORT.map((d, i) => (
            <Text key={i} style={calStyles.dayLabel}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={calStyles.grid}>
          {cells.map((cell, i) => {
            const sel = isSelected(cell);
            const tod = isToday(cell) && !sel;
            return (
              <TouchableOpacity
                key={i}
                style={[calStyles.cell, sel && calStyles.cellSelected]}
                onPress={() => handleSelect(cell)}
                activeOpacity={cell.cur ? 0.7 : 1}
              >
                <Text
                  style={[
                    calStyles.cellText,
                    !cell.cur && calStyles.cellTextOther,
                    tod && calStyles.cellTextToday,
                    sel && calStyles.cellTextSel,
                  ]}
                >
                  {cell.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={calStyles.footer}>
          <TouchableOpacity
            onPress={() => {
              onClear();
              onClose();
            }}
            activeOpacity={0.7}
          >
            <Text style={calStyles.footerClear}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToday} activeOpacity={0.7}>
            <Text style={calStyles.footerToday}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Dashboard Screen ────────────────────────────────────────────────────

const DashboardScreen = ({ navigation }) => {
  // ── UI State ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('Home');
  const [ddOpen, setDdOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [dropdownLayout, setDropdownLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // ── Custom Date State ─────────────────────────────────────────────────────
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [calFromOpen, setCalFromOpen] = useState(false);
  const [calToOpen, setCalToOpen] = useState(false);

  // ── API State ─────────────────────────────────────────────────────────────
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [error, setError] = useState('');

  // ── Fetch Dashboard Data ──────────────────────────────────────────────────
  const fetchDashboardData = useCallback(
    async (periodKey, fromDate = '', toDate = '') => {
      try {
        setLoading(true);
        setError('');

        const activePeriod = periodKey ?? selectedPeriod;
        const filterType = PERIOD_MAP[activePeriod] ?? 'ThisMonth';

        console.log('📊 Fetching dashboard for period:', activePeriod);

        const result = await getDashboardTotals(filterType, fromDate, toDate);

        if (!result?.success) {
          setError('Failed to load dashboard data');
          setDashboardData({});
          return;
        }

        let rawData = result?.data?.data ?? result?.data ?? null;
        let parsedArray = [];

        if (typeof rawData === 'string') {
          try {
            parsedArray = JSON.parse(rawData);
          } catch (e) {
            console.error('JSON parse error:', e);
            parsedArray = [];
          }
        } else if (Array.isArray(rawData)) {
          parsedArray = rawData;
        } else if (rawData && typeof rawData === 'object') {
          parsedArray = [rawData];
        }

        const firstItem = parsedArray[0] || {};
        console.log('✅ Dashboard data loaded');
        setDashboardData(firstItem);
        setError('');
      } catch (error) {
        console.error('❌ Dashboard fetch error:', error);
        setError('Error loading dashboard data');
        setDashboardData({});
      } finally {
        setLoading(false);
      }
    },
    [selectedPeriod],
  );

  // ── Fetch Enquiries Count ─────────────────────────────────────────────────
  const fetchEnquiriesCount = useCallback(async () => {
    try {
      const result = await getEnquiries();
      if (result?.success && Array.isArray(result.data)) {
        setTotalEnquiries(result.data.length);
      } else {
        setTotalEnquiries(0);
      }
    } catch (error) {
      console.error('❌ Enquiries fetch error:', error);
      setTotalEnquiries(0);
    }
  }, []);

  // ── Pull to Refresh ───────────────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardData(selectedPeriod),
        fetchEnquiriesCount(),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [selectedPeriod, fetchDashboardData, fetchEnquiriesCount]);

  // ── Initial Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchDashboardData(selectedPeriod);
    fetchEnquiriesCount();
  }, [selectedPeriod, fetchDashboardData, fetchEnquiriesCount]);

  // ── Overview Cards ────────────────────────────────────────────────────────
  const OVERVIEW_CARDS = useMemo(
    () => [
      {
        key: 'revenue',
        value: formatINR(dashboardData?.TotalNewBookingAmount),
        label: 'REVENUE',
        growth: '↑ 21%',
        icon: require('../../Assets/icons/reports2.png'),
        iconBg: 'rgba(59,130,246,0.12)',
        iconTint: '#3B82F6',
        navigateTo: 'TotalRevnueScreen',
      },
      {
        key: 'expenses',
        value: formatINR(dashboardData?.TotalExpenseAmount),
        label: 'TOTAL EXP.',
        growth: '↑ 8%',
        icon: require('../../Assets/icons/expenses.png'),
        iconBg: 'rgba(59,130,246,0.12)',
        iconTint: '#3B82F6',
        navigateTo: 'TotalExpensesScreen',
      },
      {
        key: 'enquiry',
        value: String(totalEnquiries || 0),
        label: 'NEW ENQ.',
        growth: '↑ 8%',
        icon: require('../../Assets/icons/sub.png'),
        iconBg: 'rgba(34,197,94,0.18)',
        iconTint: '#16A34A',
        navigateTo: 'TotalEnquiryScreen',
      },
    ],
    [dashboardData, totalEnquiries],
  );

  // ── Event Handlers ────────────────────────────────────────────────────────

  const handlePeriodSelect = item => {
    setSelectedPeriod(item);
    setDdOpen(false);

    if (item === 'Custom') {
      setCustomFrom('');
      setCustomTo('');
      setCustomModalVisible(true);
    } else {
      fetchDashboardData(item);
      fetchEnquiriesCount();
    }
  };

  const handleApplyCustom = () => {
    if (!customFrom || !customTo) {
      Alert.alert('Error', 'Please select both From and To dates');
      return;
    }

    setCustomModalVisible(false);
    const toApi = str => {
      const [dd, mm, yyyy] = str.split('/');
      return `${yyyy}-${mm}-${dd}`;
    };

    fetchDashboardData('Custom', toApi(customFrom), toApi(customTo));
    fetchEnquiriesCount();
  };

  const handleTabPress = tab => {
    if (tab.key === 'Logout') {
      Alert.alert('Confirm Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => navigation.replace('DmsLoginScreen'),
          style: 'destructive',
        },
      ]);
      return;
    }
    if (tab.key === 'Reports') {
      navigation.navigate('ReportsScreen');
      return;
    }
    if (tab.key === 'Enquiry') {
      navigation.navigate('NewEnquiryScreen');
      return;
    }
    setActiveTab(tab.key);
  };

  const handleQuickAction = action => {
    switch (action.key) {
      case 'new_enquiry':
        navigation.navigate('NewEnquiryScreen');
        break;
      case 'reports':
        navigation.navigate('ReportsScreen');
        break;
      case 'Expenses':
        navigation.navigate('ExpensesScreen');
        break;
      case 'New Booking':
        navigation.navigate('NewBookingScreen');
        break;
      case 'Check-In Details':
        navigation.navigate('CheckinDetailsScreen');
        break;
      default:
        break;
    }
  };

  const handleOverviewCardPress = card => {
    if (card.navigateTo) {
      navigation.navigate(card.navigateTo);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        backgroundColor={Colors.bg_dark}
        barStyle="light-content"
        translucent={false}
      />

      {/* ── TOP HEADER ────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>Arjun Saini</Text>
          <Text style={styles.dayText}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
          </Text>
          <Text style={styles.currentDate}>
            {new Date().toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.8}>
            <Image
              source={require('../../Assets/icons/notification.png')}
              style={styles.bellIcon}
              resizeMode="contain"
            />
            <View style={styles.bellDot} />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>T</Text>
          </View>
        </View>
      </View>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>⚠️ {error}</Text>
        </View>
      ) : null}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: 70 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Overview</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.ddTrigger}
            onPress={() => setDdOpen(!ddOpen)}
          >
            <Text style={styles.ddTriggerText}>{selectedPeriod}</Text>
            <Image
              source={require('../../Assets/icons/dropdown.png')}
              style={[
                styles.dropdownIcon,
                { transform: [{ rotate: ddOpen ? '180deg' : '0deg' }] },
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* ── Period Dropdown Modal ─────────────────────────────────── */}
        <Modal
          visible={ddOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDdOpen(false)}
        >
          <TouchableOpacity
            style={styles.ddBackdrop}
            activeOpacity={1}
            onPress={() => setDdOpen(false)}
          >
            <View style={[styles.ddList, { marginTop: 135, right: 16 }]}>
              {PERIOD_OPTIONS.map((item, idx) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.ddItem,
                    idx !== PERIOD_OPTIONS.length - 1 && styles.ddItemBorder,
                    selectedPeriod === item && styles.ddItemActive,
                  ]}
                  onPress={() => handlePeriodSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.ddItemText,
                      selectedPeriod === item && styles.ddItemTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {selectedPeriod === item && (
                    <Text style={styles.ddCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ── OVERVIEW CARDS ────────────────────────────────────────── */}
        <View style={styles.overviewRow}>
          {OVERVIEW_CARDS.map(card => (
            <TouchableOpacity
              key={card.key}
              style={styles.overviewCard}
              activeOpacity={0.75}
              onPress={() => handleOverviewCardPress(card)}
            >
              <View
                style={[
                  styles.overviewIconBox,
                  { backgroundColor: card.iconBg },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Image
                    source={card.icon}
                    style={[styles.overviewIcon, { tintColor: card.iconTint }]}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text style={styles.overviewValue}>
                {loading ? '—' : card.value}
              </Text>
              <Text style={styles.overviewLabel}>{card.label}</Text>
              {card.growth ? (
                <Text style={styles.overviewGrowth}>{card.growth}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── QUICK ACTIONS ─────────────────────────────────────────── */}
        <Text
          style={[styles.sectionTitle, { marginTop: CommonHeights.height26 }]}
        >
          Quick Actions
        </Text>

        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.key}
              style={styles.quickActionCard}
              activeOpacity={0.8}
              onPress={() => handleQuickAction(action)}
            >
              <View
                style={[
                  styles.quickActionIconBox,
                  { backgroundColor: action.iconBg },
                ]}
              >
                {action.isPlus ? (
                  <Text style={styles.plusSign}>＋</Text>
                ) : (
                  <Image
                    source={action.icon}
                    style={[
                      styles.quickActionIcon,
                      { tintColor: action.iconTint },
                    ]}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* ── CUSTOM DATE BOTTOM SHEET ──────────────────────────────── */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <TouchableOpacity
          style={customStyles.overlay}
          activeOpacity={1}
          onPress={() => setCustomModalVisible(false)}
        />
        <View style={customStyles.sheet}>
          <View style={customStyles.handle} />
          <Text style={customStyles.title}>Custom Date Range</Text>

          {/* FROM DATE */}
          <Text style={customStyles.label}>FROM DATE</Text>
          <TouchableOpacity
            style={customStyles.dateInput}
            activeOpacity={0.8}
            onPress={() => setCalFromOpen(true)}
          >
            <Text
              style={
                customFrom
                  ? customStyles.dateValue
                  : customStyles.datePlaceholder
              }
            >
              {customFrom || 'dd/mm/yyyy'}
            </Text>
            <Text style={customStyles.calIcon}>📅</Text>
          </TouchableOpacity>

          {/* TO DATE */}
          <Text style={[customStyles.label, { marginTop: 14 }]}>TO DATE</Text>
          <TouchableOpacity
            style={customStyles.dateInput}
            activeOpacity={0.8}
            onPress={() => setCalToOpen(true)}
          >
            <Text
              style={
                customTo ? customStyles.dateValue : customStyles.datePlaceholder
              }
            >
              {customTo || 'dd/mm/yyyy'}
            </Text>
            <Text style={customStyles.calIcon}>📅</Text>
          </TouchableOpacity>

          {/* APPLY BUTTON */}
          <TouchableOpacity
            style={[
              customStyles.applyBtn,
              (!customFrom || !customTo) && customStyles.applyBtnDisabled,
            ]}
            activeOpacity={0.85}
            disabled={!customFrom || !customTo}
            onPress={handleApplyCustom}
          >
            <Text style={customStyles.applyBtnText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ── FROM Calendar ────────────────────────────────────────────── */}
      <CalendarPicker
        visible={calFromOpen}
        selectedDate={customFrom}
        onSelect={date => {
          setCustomFrom(date);
          setCalFromOpen(false);
        }}
        onClear={() => setCustomFrom('')}
        onClose={() => setCalFromOpen(false)}
      />

      {/* ── TO Calendar ───────────────────────────────────────────────── */}
      <CalendarPicker
        visible={calToOpen}
        selectedDate={customTo}
        onSelect={date => {
          setCustomTo(date);
          setCalToOpen(false);
        }}
        onClear={() => setCustomTo('')}
        onClose={() => setCalToOpen(false)}
      />

      {/* ── BOTTOM NAV BAR ────────────────────────────────────────────── */}
      <View style={styles.navBar}>
        {NAV_TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navTab}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
            >
              <Image
                source={tab.icon}
                style={[
                  styles.navIcon,
                  {
                    tintColor: isActive
                      ? Colors.nav_active
                      : Colors.nav_inactive,
                  },
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.navLabel,
                  isActive ? styles.navLabelActive : styles.navLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg_dark,
  },

  header: {
    backgroundColor: Colors.bg_dark,
    paddingHorizontal: CommonWidths.width20,
    paddingTop: CommonHeights.height8,
    paddingBottom: CommonHeights.height28,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  username: {
    color: Colors.text_white,
    fontSize: CommonFonts.font20,
    fontWeight: '600',
    top: 10,
  },
  dayText: {
    color: Colors.primary,
    fontSize: CommonFonts.font12,
    fontWeight: '600',
    marginTop: 2,
    top: 10,
  },
  currentDate: {
    color: Colors.text_grey,
    fontSize: CommonFonts.font11,
    marginTop: 2,
    top: 10,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CommonWidths.width12,
  },
  bellBtn: {
    width: CommonWidths.width40,
    height: CommonHeights.height40,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    width: CommonWidths.width20,
    height: CommonHeights.height20,
    tintColor: Colors.text_white,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 1.5,
    borderColor: Colors.bg_dark,
  },
  dropdownIcon: {
    width: 14,
    height: 14,
    tintColor: Colors.primary,
  },
  avatar: {
    width: CommonWidths.width40,
    height: CommonHeights.height40,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.bg_dark,
    fontSize: CommonFonts.font18,
    fontWeight: 'bold',
  },

  errorBanner: {
    backgroundColor: Colors.error_bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.error_border,
    paddingHorizontal: CommonWidths.width16,
    paddingVertical: CommonHeights.height10,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: CommonFonts.font12,
    fontWeight: '500',
  },

  body: { flex: 1, backgroundColor: Colors.page_bg },
  bodyContent: {
    paddingHorizontal: CommonWidths.width16,
    paddingTop: CommonHeights.height22,
    paddingBottom: CommonHeights.height30,
  },

  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: CommonHeights.height16,
  },
  sectionTitle: {
    color: Colors.text_dark,
    fontSize: CommonFonts.font16,
    fontWeight: 'bold',
  },

  ddTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBgColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  ddTriggerText: {
    color: Colors.primary,
    fontSize: CommonFonts.font13,
    fontWeight: '600',
  },

  ddBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  ddList: {
    position: 'absolute',
    width: 130,
    backgroundColor: Colors.card_bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  ddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  ddItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
  },
  ddItemActive: {
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  ddItemText: {
    color: Colors.text_dark,
    fontSize: CommonFonts.font11,
    fontWeight: '500',
  },
  ddItemTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  ddCheckmark: {
    color: Colors.primary,
    fontSize: CommonFonts.font11,
    fontWeight: '700',
  },

  overviewRow: {
    flexDirection: 'row',
    gap: CommonWidths.width12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: Colors.card_bg,
    borderRadius: 10,
    paddingHorizontal: CommonWidths.width10,
    paddingVertical: CommonHeights.height12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#B0B8C8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  overviewIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CommonHeights.height8,
  },
  overviewIcon: {
    width: 16,
    height: 16,
  },
  overviewValue: {
    color: Colors.text_dark,
    fontSize: CommonFonts.font14,
    fontWeight: 'bold',
  },
  overviewLabel: {
    color: Colors.text_grey,
    fontSize: CommonFonts.font10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  overviewGrowth: {
    color: Colors.green_text,
    fontSize: CommonFonts.font11,
    fontWeight: '600',
    marginTop: 4,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CommonWidths.width12,
    marginTop: CommonHeights.height18,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: Colors.card_bg,
    borderRadius: 10,
    paddingHorizontal: CommonWidths.width16,
    paddingVertical: CommonHeights.height12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#B0B8C8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.13,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  quickActionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CommonHeights.height12,
  },
  plusSign: {
    color: Colors.text_white,
    fontSize: CommonFonts.font20,
    fontWeight: '300',
    lineHeight: 26,
  },
  quickActionIcon: {
    width: CommonWidths.width20,
    height: CommonHeights.height20,
  },
  quickActionLabel: {
    color: Colors.text_dark,
    fontSize: CommonFonts.font14,
    fontWeight: '600',
  },

  navBar: {
    flexDirection: 'row',
    backgroundColor: Colors.nav_bg,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
    paddingBottom: Platform.OS === 'android' ? 15 : 36,
    paddingTop: 12,
    paddingHorizontal: 4,
    height: Platform.OS === 'android' ? 65 : 84,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  navLabelActive: {
    color: Colors.nav_active,
    fontWeight: '700',
  },
  navLabelInactive: {
    color: Colors.nav_inactive,
  },
});

// ─── Custom Date Sheet Styles ─────────────────────────────────────────────────

const customStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card_bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 20 },
    }),
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.inputBorder,
    marginBottom: 16,
  },
  title: {
    color: Colors.text_dark,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  label: {
    color: Colors.text_label,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBgColor,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  dateValue: { color: Colors.text_dark, fontSize: 14 },
  datePlaceholder: { color: Colors.text_grey, fontSize: 14 },
  calIcon: { fontSize: 18 },
  applyBtn: {
    backgroundColor: Colors.bg_dark,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 20,
  },
  applyBtnDisabled: {
    opacity: 0.4,
  },
  applyBtnText: {
    color: Colors.text_white,
    fontSize: 15,
    fontWeight: '700',
  },
});

// ─── Calendar Styles ──────────────────────────────────────────────────────────

const calStyles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  card: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: 300,
    backgroundColor: Colors.card_bg,
    borderRadius: 18,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
      },
      android: { elevation: 14 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  monthBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthText: { color: Colors.text_dark, fontSize: 16, fontWeight: '700' },
  monthArrow: { color: Colors.text_grey, fontSize: 12 },
  navBtns: { flexDirection: 'row', gap: 16 },
  navBtn: { padding: 4 },
  navArrow: { color: Colors.text_dark, fontSize: 18, fontWeight: '300' },
  dayLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayLabel: {
    width: 32,
    textAlign: 'center',
    color: Colors.text_grey,
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    rowGap: 4,
  },
  cell: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  cellSelected: { backgroundColor: '#1D6AFF', borderRadius: 10 },
  cellText: { color: Colors.text_dark, fontSize: 14 },
  cellTextOther: { color: Colors.text_grey },
  cellTextToday: { color: '#1D6AFF', fontWeight: '700' },
  cellTextSel: { color: '#FFFFFF', fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: Colors.inputBorder,
  },
  footerClear: { color: '#1D6AFF', fontSize: 14, fontWeight: '600' },
  footerToday: { color: '#1D6AFF', fontSize: 14, fontWeight: '600' },
});
