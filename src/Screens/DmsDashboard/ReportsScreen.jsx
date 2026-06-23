import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
 
  StatusBar,
  Image,
  ScrollView,
  Platform,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import {
  getNewBookings,
  getEnquiries,
  deleteBooking,
  deleteEnquiry,
  getSingleEnquiry,
  updateEnquiry,
} from '../../Api/ApiService';
import { SafeAreaView } from 'react-native-safe-area-context';
import AxiosClient from '../../Api/AxoisClient';
import { ENDPOINTS } from '../../Api/EndPoints';

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const BOOKING_SOURCES = [
  { key: 'agoda', label: 'Agoda' },
  { key: 'airbnb', label: 'Airbnb' },
  { key: 'mmtp', label: 'MakeMyTrip' },
  { key: 'cleartrip', label: 'Cleartrip' },
  { key: 'booking', label: 'Booking.com' },
  { key: 'direct', label: 'Direct' },
  { key: 'other', label: 'Other' },
];

// ── Booking Source Dropdown (inline, no modal) ──────────────────────────────
function BookingSourceDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = BOOKING_SOURCES.find(s => s.key === value);

  return (
    <View>
      <TouchableOpacity
        style={convertStyles.fieldInput}
        onPress={() => setOpen(o => !o)}
        activeOpacity={0.8}
      >
        <Text style={[
          { flex: 1, fontSize: 14 },
          selected ? { color: Colors.text_primary } : { color: Colors.text_grey }
        ]}>
          {selected ? selected.label : 'Select booking source...'}
        </Text>
        <Text style={{ color: Colors.text_grey, fontSize: 12 }}>
          {open ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={convertStyles.dropdownList}>
          {BOOKING_SOURCES.map(src => (
            <TouchableOpacity
              key={src.key}
              style={[
                convertStyles.dropdownItem,
                value === src.key && convertStyles.dropdownItemActive
              ]}
              onPress={() => { onChange(src.key); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text style={[
                convertStyles.dropdownItemText,
                value === src.key && convertStyles.dropdownItemTextActive
              ]}>
                {src.label}
              </Text>
              {value === src.key && (
                <Text style={{ color: Colors.gold, fontSize: 14 }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
const Colors = {
  bg_dark: '#0F172A',
  primary: '#F59E0B',
  text_white: '#F1F5F9',
  text_grey: '#94A3B8',
  text_dark: '#1E293B',
  text_label: '#64748B',
  inputBorder: '#E2E8F0',
  inputBg: '#F1F5F9',
  card_bg: '#FFFFFF',
  green_bg: 'rgba(34,197,94,0.15)',
  green_text: '#16A34A',
  blue_bg: 'rgba(59,130,246,0.15)',
  blue_text: '#3B82F6',
  gold_bg: 'rgba(245,158,11,0.15)',
  page_bg: '#EEF0F6',
  red_bg: 'rgba(239,68,68,0.15)',
  red_text: '#EF4444',
  overlay_circle: 'rgba(245,158,11,0.10)',
  purple_bg: 'rgba(139,92,246,0.15)',
  purple_text: '#7C3AED',
};

const F = {
  f8: 8,
  f10: 10,
  f11: 11,
  f12: 12,
  f13: 13,
  f14: 14,
  f15: 15,
  f16: 16,
  f18: 18,
  f20: 20,
  f22: 22,
};

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#B0B8C8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = ['All', 'Gym', 'Farmhouse', 'Airbnb'];
const PROPERTY_OPTIONS = [
  'All',
  'Rajapark',
  'Summer Nagar',
  'Grey Stone',
  'SkyStone',
  'Topaz',
];
const ENQ_STATUS_OPTIONS = ['All', 'Converted', 'Pending', 'Closed'];
const SUB_STATUS_OPTIONS = ['All', 'Active', 'Expired', 'Expiring Soon'];
const DURATION_OPTIONS = ['All', '1 Month', '3 Months', '6 Months', '1 Year'];
const PAYMENT_OPTIONS = ['All', 'Cash', 'UPI', 'Card'];
const PERIOD_OPTIONS = [
  'This Month',
  'Last Month',
  'Last 3 Months',
  'This Year',
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. STATUS STYLES
// ─────────────────────────────────────────────────────────────────────────────

const ENQUIRY_STATUS_STYLE = {
  Converted: { bg: Colors.green_bg, text: Colors.green_text },
  Pending: { bg: Colors.gold_bg, text: Colors.primary },
  Closed: { bg: Colors.red_bg, text: Colors.red_text },
  Rejected: { bg: Colors.red_bg, text: Colors.red_text },
  New: { bg: Colors.purple_bg, text: Colors.purple_text },
};

const SUB_STATUS_STYLE = {
  Active: { bg: Colors.green_bg, text: Colors.green_text },
  Expiring: { bg: Colors.gold_bg, text: Colors.primary },
  Expired: { bg: Colors.red_bg, text: Colors.red_text },
  Confirmed: { bg: Colors.green_bg, text: Colors.green_text },
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const formatDate = raw => {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const [yyyy, mm, dd] = raw.split('T')[0].split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
  return raw;
};

const extractDateRange = item => {
  const checkIn = formatDate(
    item.CheckInDate ?? item.checkInDate ?? item.startDate,
  );
  const checkOut = formatDate(
    item.CheckOutDate ?? item.checkOutDate ?? item.endDate,
  );
  if (checkIn && checkOut) return { checkIn, checkOut, hasRange: true };
  if (checkIn) return { checkIn, checkOut: null, hasRange: false };
  const single = formatDate(
    item.EnquiryDate ??
    item.enquiryDate ??
    item.CreatedDate ??
    item.createdDate ??
    item.BookingDate ??
    item.bookingDate ??
    item.Date ??
    item.date,
  );
  return { checkIn: single ?? '—', checkOut: null, hasRange: false };
};

const safeParseArray = result => {
  let rawData = result?.data?.data ?? result?.data ?? [];
  if (typeof rawData === 'string') {
    try {
      return JSON.parse(rawData);
    } catch {
      return [];
    }
  }
  if (Array.isArray(rawData)) return rawData;
  if (rawData && typeof rawData === 'object') return [rawData];
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const CustomDropdown = ({ label, options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ x: 0, y: 0, w: 0 });
  const triggerRef = useRef(null);

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setDropPos({ x, y: y + height + 4, w: width });
      setOpen(true);
    });
  };

  return (
    <View style={ddStyles.wrapper}>
      <Text style={ddStyles.label}>{label}</Text>
      <TouchableOpacity
        ref={triggerRef}
        style={[ddStyles.trigger, open && ddStyles.triggerActive]}
        onPress={openDropdown}
        activeOpacity={0.8}
      >
        <Text style={ddStyles.triggerText} numberOfLines={1}>
          {value}
        </Text>
        <Text style={[ddStyles.arrow, open && ddStyles.arrowUp]}>▾</Text>
      </TouchableOpacity>
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={ddStyles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View
          style={[
            ddStyles.dropdownList,
            { top: dropPos.y, left: dropPos.x, width: dropPos.w },
          ]}
        >
          {options.map(opt => {
            const selected = opt === value;
            return (
              <TouchableOpacity
                key={opt}
                style={ddStyles.optionRow}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    ddStyles.checkbox,
                    selected && ddStyles.checkboxSelected,
                  ]}
                >
                  {selected && <Text style={ddStyles.checkmark}>✓</Text>}
                </View>
                <Text
                  style={[
                    ddStyles.optionText,
                    selected && ddStyles.optionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. CALENDAR
// ─────────────────────────────────────────────────────────────────────────────

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
    onClose();
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
        <View style={calStyles.headerRow}>
          <TouchableOpacity style={calStyles.monthBtn} activeOpacity={0.7}>
            <Text style={calStyles.monthText}>
              {MONTHS_LONG[viewMonth]} {viewYear}
            </Text>
            <Text style={calStyles.monthArrow}>▾</Text>
          </TouchableOpacity>
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
        <View style={calStyles.dayLabelRow}>
          {DAYS_SHORT.map((d, i) => (
            <Text key={i} style={calStyles.dayLabel}>
              {d}
            </Text>
          ))}
        </View>
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

// ─────────────────────────────────────────────────────────────────────────────
// 7. DATE INPUT
// ─────────────────────────────────────────────────────────────────────────────

const DateInput = ({ label, value, onChange }) => {
  const [calOpen, setCalOpen] = useState(false);
  return (
    <View style={dateStyles.wrapper}>
      <Text style={dateStyles.label}>{label}</Text>
      <TouchableOpacity
        style={dateStyles.input}
        activeOpacity={0.8}
        onPress={() => setCalOpen(true)}
      >
        <Text style={value ? dateStyles.valueText : dateStyles.placeholder}>
          {value || 'dd/mm/yyyy'}
        </Text>
        <Image
          source={require('../../Assets/icons/calendar.png')}
          style={dateStyles.calIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <CalendarPicker
        visible={calOpen}
        selectedDate={value}
        onSelect={onChange}
        onClear={() => onChange('')}
        onClose={() => setCalOpen(false)}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. FILTERS PANEL
// ─────────────────────────────────────────────────────────────────────────────

const FiltersPanel = ({
  isEnquiry,
  filters,
  setFilters,
  onApply,
  onClear,
  onCollapse,
}) => {
  const statusOptions = isEnquiry ? ENQ_STATUS_OPTIONS : SUB_STATUS_OPTIONS;
  const set = key => val => setFilters(prev => ({ ...prev, [key]: val }));
  return (
    <View style={fpStyles.card}>
      <View style={fpStyles.headerRow}>
        <View style={fpStyles.headerLeft}>
          <View style={fpStyles.iconBox}>
            <Image
              source={require('../../Assets/icons/ak.png')}
              style={fpStyles.filterIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={fpStyles.headerLabel}>FILTERS</Text>
        </View>
        <TouchableOpacity
          style={fpStyles.collapseBtn}
          onPress={onCollapse}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../Assets/icons/dropdown.png')}
            style={fpStyles.collapseIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={fpStyles.divider} />
      <View style={fpStyles.row}>
        <CustomDropdown
          label="CATEGORY"
          options={CATEGORY_OPTIONS}
          value={filters.category}
          onChange={set('category')}
        />
        <CustomDropdown
          label="PROPERTY"
          options={PROPERTY_OPTIONS}
          value={filters.property}
          onChange={set('property')}
        />
      </View>
      <View style={fpStyles.row}>
        <CustomDropdown
          label="STATUS"
          options={statusOptions}
          value={filters.status}
          onChange={set('status')}
        />
        {isEnquiry ? (
          <CustomDropdown
            label="PERIOD"
            options={PERIOD_OPTIONS}
            value={filters.period}
            onChange={set('period')}
          />
        ) : (
          <CustomDropdown
            label="DURATION"
            options={DURATION_OPTIONS}
            value={filters.duration}
            onChange={set('duration')}
          />
        )}
      </View>
      {!isEnquiry && (
        <View style={fpStyles.row}>
          <CustomDropdown
            label="PAYMENT MODE"
            options={PAYMENT_OPTIONS}
            value={filters.paymentMode}
            onChange={set('paymentMode')}
          />
          <CustomDropdown
            label="PERIOD"
            options={PERIOD_OPTIONS}
            value={filters.period}
            onChange={set('period')}
          />
        </View>
      )}
      <View style={fpStyles.row}>
        <DateInput
          label="FROM DATE"
          value={filters.fromDate}
          onChange={set('fromDate')}
        />
        <DateInput
          label="TO DATE"
          value={filters.toDate}
          onChange={set('toDate')}
        />
      </View>
      <View style={fpStyles.btnRow}>
        <TouchableOpacity
          style={fpStyles.clearBtn}
          onPress={onClear}
          activeOpacity={0.8}
        >
          <Text style={fpStyles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={fpStyles.applyBtn}
          onPress={onApply}
          activeOpacity={0.8}
        >
          <Text style={fpStyles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const defaultFilters = () => ({
  category: 'All',
  property: 'All',
  status: 'All',
  period: 'This Month',
  duration: 'All',
  paymentMode: 'All',
  fromDate: '',
  toDate: '',
});

const toApiDate = str => {
  if (!str) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.split('T')[0]; // already ISO
  const [dd, mm, yyyy] = str.split('/');
  return `${yyyy}-${mm}-${dd}`;
};

const ConvertToBookingModal = ({ visible, item, onClose, onConverted }) => {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [bookingSource, setBookingSource] = useState('');
  const [dealAmount, setDealAmount] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [bookingStatus, setBookingStatus] = useState('Confirmed');
  const [converting, setConverting] = useState(false);

  // ✅ NEW — editable fields
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');
  const [checkInCalOpen, setCheckInCalOpen] = useState(false);
  const [checkOutCalOpen, setCheckOutCalOpen] = useState(false);

  // Auto-calculate balance
  useEffect(() => {
    const deal = parseFloat(dealAmount || '0');
    const advance = parseFloat(advanceAmount || '0');
    setBalanceAmount(String(Math.max(0, deal - advance)));
  }, [dealAmount, advanceAmount]);

  // Pre-fill
  useEffect(() => {
    if (visible && item) {
      const amt = item.EstimatedAmount ?? item.estimatedAmount ?? item.estAmount ?? '';
      setDealAmount(String(amt));
      setBookingSource('');
      setAdvanceAmount('');
      setBookingStatus('Confirmed');
      setSourceOpen(false);
      // ✅ Pre-fill dates & guests
      setCheckIn(formatDate(item?.CheckInDate ?? item?.checkInDate ?? '') ?? '');
      setCheckOut(formatDate(item?.CheckOutDate ?? item?.checkOutDate ?? '') ?? '');
      setGuests(String(item?.NoOfGuest ?? item?.guests ?? ''));
    }
  }, [visible, item]);

  const validateForm = () => {
    const deal = parseFloat(dealAmount);
    if (!dealAmount.trim() || isNaN(deal) || deal <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid deal amount greater than 0.');
      return false;
    }
    const advance = parseFloat(advanceAmount || '0');
    if (isNaN(advance) || advance < 0) {
      Alert.alert('Validation Error', 'Please enter a valid advance amount of 0 or more.');
      return false;
    }
    if (advance > deal) {
      Alert.alert('Validation Error', 'Advance amount cannot exceed the deal amount.');
      return false;
    }
    return true;
  };

  const handleConvert = async () => {
    if (!validateForm()) return;

    const enquiryId = item?.enquiryId ?? item?.Id ?? item?.id ?? '';

    const payload = {
      Id: enquiryId,
      BookingSource: bookingSource,
      CheckInDate: toApiDate(checkIn),
      CheckOutDate: toApiDate(checkOut),
      NoOfGuest: guests,
      BookingAmount: dealAmount,
      ReceivedAmount: advanceAmount || '0',
      DealAmount: dealAmount,
      AdvanceAmount: advanceAmount || '0',
      BalanceAmount: balanceAmount || '0',
      BookingStatus: bookingStatus,
    };

    console.log('📦 CONVERT PAYLOAD =>', JSON.stringify(payload, null, 2));

    try {
      setConverting(true);
      await AxiosClient.post(
        `${ENDPOINTS.BASE_URL ?? 'http://loadcrm.com/datamangement/api'}/NewBooking/EnquiryConverttoBooking`,
        payload,
      );
      Alert.alert('Success', 'Enquiry successfully converted to booking.', [
        { text: 'OK', onPress: () => { onConverted(enquiryId); onClose(); } },
      ]);
    } catch (err) {
      console.log('❌ CONVERT ERROR =>', err.response?.data);
      Alert.alert('❌ Error',
        err.response?.data?.Message ??
        err.response?.data?.message ??
        'Unable to complete conversion. Please try again.'
      );
    } finally {
      setConverting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
        activeOpacity={1}
        onPress={() => { Keyboard.dismiss(); onClose(); }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <View style={{
          backgroundColor: Colors.card_bg,
          borderRadius: 20,
          width: '100%',
          maxHeight: '92%',
          ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20 },
            android: { elevation: 20 },
          }),
        }}>
          <View style={sheetStyles.handle} />

          <ScrollView
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={sheetStyles.header}>
              <View style={{ flex: 1 }}>
                <Text style={sheetStyles.headerTitle}>🔄 Convert to Booking</Text>
                <Text style={sheetStyles.headerSub} numberOfLines={1}>
                  {item?.FullName ?? item?.fullName ?? item?.name ?? 'Enquiry'}
                </Text>
              </View>
              <TouchableOpacity style={sheetStyles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={sheetStyles.closeTxt}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={sheetStyles.divider} />

            {/* Info Strip — property only (dates/guests ab editable hain) */}
            {item && (
              <View style={convertStyles.infoStrip}>
                <Text style={convertStyles.infoStripText}>
                  📍 {item?.PropertyName ?? item?.property ?? '—'}
                </Text>
                <Text style={convertStyles.infoStripText}>
                  🏷️ {item?.Category ?? item?.category ?? '—'}
                </Text>
              </View>
            )}

            <View style={{ paddingHorizontal: 20 }}>

              {/* GUEST — editable */}
              <View style={convertStyles.fieldWrap}>
                <Text style={convertStyles.fieldLabel}>GUEST NAME</Text>
                <View style={[convertStyles.fieldInput, { flexDirection: 'row', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>👤</Text>
                  <Text style={{ flex: 1, fontSize: F.f14, color: Colors.text_dark }}>
                    {item?.FullName ?? item?.fullName ?? item?.name ?? '—'}
                  </Text>
                </View>
              </View>

              {/* NO. OF GUESTS — editable */}
              <View style={convertStyles.fieldWrap}>
                <Text style={convertStyles.fieldLabel}>NO. OF GUESTS</Text>
                <View style={[convertStyles.fieldInput, { flexDirection: 'row', alignItems: 'center' }]}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>👥</Text>
                  <TextInput
                    style={{ flex: 1, fontSize: F.f14, color: Colors.text_dark, padding: 0 }}
                    value={guests}
                    onChangeText={setGuests}
                    placeholder="Enter number of guests"
                    placeholderTextColor={Colors.text_grey}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* CHECK-IN / CHECK-OUT dates — editable */}
              <View style={[convertStyles.fieldWrap, { flexDirection: 'row', gap: 12 }]}>
                {/* CHECK-IN */}
                <View style={{ flex: 1 }}>
                  <Text style={convertStyles.fieldLabel}>CHECK-IN</Text>
                  <TouchableOpacity
                    style={[convertStyles.fieldInput, { flexDirection: 'row', alignItems: 'center' }]}
                    onPress={() => setCheckInCalOpen(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 14, marginRight: 6 }}>📅</Text>
                    <Text style={{ flex: 1, fontSize: F.f13, color: checkIn ? Colors.text_dark : Colors.text_grey }}>
                      {checkIn || 'dd/mm/yyyy'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* CHECK-OUT */}
                <View style={{ flex: 1 }}>
                  <Text style={convertStyles.fieldLabel}>CHECK-OUT</Text>
                  <TouchableOpacity
                    style={[convertStyles.fieldInput, { flexDirection: 'row', alignItems: 'center' }]}
                    onPress={() => setCheckOutCalOpen(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 14, marginRight: 6 }}>📅</Text>
                    <Text style={{ flex: 1, fontSize: F.f13, color: checkOut ? Colors.text_dark : Colors.text_grey }}>
                      {checkOut || 'dd/mm/yyyy'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* BOOKING SOURCE */}
              <View style={convertStyles.fieldWrap}>
                <Text style={convertStyles.fieldLabel}>BOOKING SOURCE</Text>
                <TouchableOpacity
                  style={[convertStyles.fieldInput, { flexDirection: 'row', alignItems: 'center' }]}
                  onPress={() => setSourceOpen(o => !o)}
                  activeOpacity={0.8}
                >
                  <Text style={{ flex: 1, fontSize: F.f14, color: bookingSource ? Colors.text_dark : Colors.text_grey }}>
                    {BOOKING_SOURCES.find(s => s.key === bookingSource)?.label ?? 'Select booking source...'}
                  </Text>
                  <Text style={{ color: Colors.text_grey, fontSize: 11 }}>
                    {sourceOpen ? '▲' : '▼'}
                  </Text>
                </TouchableOpacity>

                {sourceOpen && (
                  <View style={convertStyles.dropdownList}>
                    {BOOKING_SOURCES.map((src, idx) => (
                      <TouchableOpacity
                        key={src.key}
                        style={[
                          convertStyles.dropdownItem,
                          idx === BOOKING_SOURCES.length - 1 && { borderBottomWidth: 0 },
                          bookingSource === src.key && convertStyles.dropdownItemActive,
                        ]}
                        onPress={() => { setBookingSource(src.key); setSourceOpen(false); }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          convertStyles.dropdownItemText,
                          bookingSource === src.key && convertStyles.dropdownItemTextActive,
                        ]}>
                          {src.label}
                        </Text>
                        {bookingSource === src.key && (
                          <Text style={{ color: Colors.gold, fontSize: 14 }}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* AMOUNTS */}
              <View style={convertStyles.amtRow}>
                <View style={{ flex: 1 }}>
                  <Text style={convertStyles.fieldLabel}>DEAL AMOUNT ₹</Text>
                  <TextInput
                    style={convertStyles.fieldInput}
                    value={dealAmount}
                    onChangeText={setDealAmount}
                    placeholder="0"
                    placeholderTextColor={Colors.text_grey}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={convertStyles.fieldLabel}>ADVANCE ₹</Text>
                  <TextInput
                    style={convertStyles.fieldInput}
                    value={advanceAmount}
                    onChangeText={setAdvanceAmount}
                    placeholder="0"
                    placeholderTextColor={Colors.text_grey}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={convertStyles.balanceRow}>
                <Text style={convertStyles.balanceLabel}>BALANCE AMOUNT</Text>
                <Text style={convertStyles.balanceValue}>₹ {balanceAmount || '0'}</Text>
              </View>

            </View>
          </ScrollView>

          {/* Confirm Button */}
          <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
            <TouchableOpacity
              style={[convertStyles.convertBtn, converting && { opacity: 0.6 }]}
              onPress={handleConvert}
              disabled={converting}
              activeOpacity={0.85}
            >
              {converting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={convertStyles.convertBtnText}>✅ Confirm Booking</Text>
              }
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>

      {/* ✅ Calendar Modals — Modal ke BAHAR nahi, par saath */}
      <CalendarPicker
        visible={checkInCalOpen}
        selectedDate={checkIn}
        onSelect={setCheckIn}
        onClear={() => setCheckIn('')}
        onClose={() => setCheckInCalOpen(false)}
      />
      <CalendarPicker
        visible={checkOutCalOpen}
        selectedDate={checkOut}
        onSelect={setCheckOut}
        onClear={() => setCheckOut('')}
        onClose={() => setCheckOutCalOpen(false)}
      />
    </Modal>
  );
};


const EnquiryActionSheet = ({
  visible,
  item,
  onClose,
  onSuccess,
  onEdit,
  onConvert,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={sheetStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.handle} />
        <View style={sheetStyles.header}>
          <View>
            <Text style={sheetStyles.headerTitle}>Enquiry Actions</Text>
            <Text style={sheetStyles.headerSub}>
              {item?.FullName ?? item?.fullName ?? item?.name ?? 'Enquiry'}
            </Text>
          </View>
          <TouchableOpacity
            style={sheetStyles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={sheetStyles.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={sheetStyles.divider} />

        <View style={sheetStyles.optionsWrap}>
          {/* EDIT */}
          <TouchableOpacity
            style={sheetStyles.editBtn}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              onEdit(item);
            }}
          >
            <Text style={sheetStyles.editBtnEmoji}>✏️</Text>
            <View style={{ flex: 1 }}>
              <Text style={sheetStyles.editBtnLabel}>Edit Enquiry</Text>
              <Text style={sheetStyles.editBtnSub}>Details modify karo</Text>
            </View>
            <Text style={sheetStyles.editBtnArrow}>›</Text>
          </TouchableOpacity>

          {/* CONVERT TO BOOKING */}
          <TouchableOpacity
            style={sheetStyles.convertBtn}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              onConvert(item);
            }}
          >
            <Text style={sheetStyles.convertBtnEmoji}>🔄</Text>
            <View style={{ flex: 1 }}>
              <Text style={sheetStyles.convertBtnLabel}>
                Convert to Booking
              </Text>
              <Text style={sheetStyles.convertBtnSub}>
                Booking mein convert karo
              </Text>
            </View>
            <Text style={sheetStyles.convertBtnArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={sheetStyles.cancelBtn}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={sheetStyles.cancelTxt}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. BOOKING ACTION SHEET
// ─────────────────────────────────────────────────────────────────────────────

const BookingActionSheet = ({ visible, item, onClose, onEdit, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    const id = item?.bookingId ?? item?.Id ?? item?.id ?? '';
    const name =
      item?.FullName ?? item?.fullName ?? item?.member ?? 'this booking';
    Alert.alert('Delete Booking',
      `Are you sure you want to permanently delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            const result = await deleteBooking(id);
            if (result.success) {
              Alert.alert('Booking Deleted',
                'The booking has been deleted successfully.');
              onDeleted(id);
              onClose();
            } else {
              Alert.alert('❌ Error', result.message || 'Failed to delete the booking. Please try again.');
            }
          } catch {
            Alert.alert('Error', 'Something went wrong.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={sheetStyles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={sheetStyles.sheet}>
        <View style={sheetStyles.handle} />
        <View style={sheetStyles.header}>
          <View style={{ flex: 1 }}>
            <Text style={sheetStyles.headerTitle}>Booking Actions</Text>
            <Text style={sheetStyles.headerSub} numberOfLines={1}>
              {item?.FullName ?? item?.fullName ?? item?.member ?? 'Booking'}
            </Text>
          </View>
          <TouchableOpacity
            style={sheetStyles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={sheetStyles.closeTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={sheetStyles.divider} />
        {item && (
          <View style={sheetStyles.infoStrip}>
            <View style={sheetStyles.infoChip}>
              <Text style={sheetStyles.infoChipLabel}>Property</Text>
              <Text style={sheetStyles.infoChipValue} numberOfLines={1}>
                {item?.PropertyName ?? item?.property ?? '—'}
              </Text>
            </View>
            <View style={sheetStyles.infoChipDivider} />
            <View style={sheetStyles.infoChip}>
              <Text style={sheetStyles.infoChipLabel}>Amount</Text>
              <Text style={sheetStyles.infoChipValue}>
                ₹{item?.DealAmount ?? item?.dealAmount ?? '—'}
              </Text>
            </View>
            <View style={sheetStyles.infoChipDivider} />
            <View style={sheetStyles.infoChip}>
              <Text style={sheetStyles.infoChipLabel}>Status</Text>
              <Text
                style={[
                  sheetStyles.infoChipValue,
                  { color: Colors.green_text },
                ]}
              >
                {item?.BookingStatus ?? item?.status ?? 'Confirmed'}
              </Text>
            </View>
          </View>
        )}
        <View style={sheetStyles.optionsWrap}>
          <TouchableOpacity
            style={sheetStyles.editBtn}
            activeOpacity={0.8}
            onPress={() => {
              onClose();
              onEdit(item);
            }}
          >
            <Text style={sheetStyles.editBtnEmoji}>✏️</Text>
            <View style={{ flex: 1 }}>
              <Text style={sheetStyles.editBtnLabel}>'Tap to edit, convert, or update the status'</Text>
              <Text style={sheetStyles.editBtnSub}>'Tap to edit or delete'</Text>
            </View>
            <Text style={sheetStyles.editBtnArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[sheetStyles.deleteBtn, deleting && { opacity: 0.6 }]}
            activeOpacity={0.8}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={Colors.red_text} />
            ) : (
              <Text style={sheetStyles.deleteBtnEmoji}>🗑️</Text>
            )}
            <View style={{ flex: 1 }}>
              <Text style={sheetStyles.deleteBtnLabel}>Delete Booking</Text>
              <Text style={sheetStyles.deleteBtnSub}>
                Permanently remove karo
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={sheetStyles.cancelBtn}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={sheetStyles.cancelTxt}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 12. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const ReportsScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState(
    route?.params?.activeTab || 'Enquiry',
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters());

  const [enquiryData, setEnquiryData] = useState([]);
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [enqSheetOpen, setEnqSheetOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookSheetOpen, setBookSheetOpen] = useState(false);

  // Convert modal state
  const [convertItem, setConvertItem] = useState(null);
  const [convertVisible, setConvertVisible] = useState(false);

  const isEnquiry = activeTab === 'Enquiry';
  const tableData = isEnquiry ? enquiryData : subscriptionData;
  const tableTitle = isEnquiry ? 'ENQUIRY RECORDS' : 'SUBSCRIPTION RECORDS';
  const headerSub = isEnquiry ? 'Enquiry Report' : 'Subscription Report';

  const enquiryStats = [
    {
      key: 'total',
      label: 'TOTAL',
      value: String(enquiryData.length),
      sub: 'Records',
      subColor: Colors.green_text,
    },
    {
      key: 'converted',
      label: 'CONVERTED',
      value: String(
        enquiryData.filter(i => (i.Status ?? i.status) === 'Converted').length,
      ),
      sub: 'Success',
      subColor: Colors.blue_text,
    },
    {
      key: 'pending',
      label: 'PENDING',
      value: String(
        enquiryData.filter(i => (i.Status ?? i.status) === 'Pending').length,
      ),
      sub: 'Waiting',
      subColor: Colors.primary,
    },
  ];

  const subscriptionStats = [
    {
      key: 'total',
      label: 'TOTAL',
      value: String(subscriptionData.length),
      sub: 'Records',
      subColor: Colors.blue_text,
    },
    {
      key: 'active',
      label: 'ACTIVE',
      value: String(
        subscriptionData.filter(
          i => (i.BookingStatus ?? i.status) === 'Confirmed',
        ).length,
      ),
      sub: 'Confirmed',
      subColor: Colors.green_text,
    },
    {
      key: 'balance',
      label: 'BALANCE',
      value: '—',
      sub: 'Live',
      subColor: Colors.primary,
    },
  ];

  const stats = isEnquiry ? enquiryStats : subscriptionStats;

  const fetchEnquiries = async () => {
    try {
      setEnquiryLoading(true);
      const result = await getEnquiries();
      if (result.success) setEnquiryData(safeParseArray(result));
      else Alert.alert('Error', result.message || 'Failed to fetch enquiries');
    } catch {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setEnquiryLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setSubLoading(true);
      const result = await getNewBookings();
      if (result.success) setSubscriptionData(safeParseArray(result));
    } catch (e) {
      console.log('ERROR =>', e);
    } finally {
      setSubLoading(false);
    }
  };

  useEffect(() => {
    if (isEnquiry) fetchEnquiries();
    else fetchBookings();
  }, [activeTab]);

  // Existing useEffect ke NEECHE yeh add karo
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isEnquiry) fetchEnquiries();
      else fetchBookings();
    });
    return unsubscribe;
  }, [navigation, isEnquiry]);

  const handleTabSwitch = tab => {
    setActiveTab(tab);
    setFilters(defaultFilters());
    setFiltersOpen(false);
  };

  const handleEnquiryPress = item => {
    setSelectedEnquiry(item);
    setEnqSheetOpen(true);
  };

  const handleStatusUpdated = (id, newStatus) => {
    setEnquiryData(prev =>
      prev.map(item => {
        const itemId =
          item?.enquiryId ?? item?.EnquiryId ?? item?.Id ?? item?.id;
        return String(itemId) === String(id)
          ? {
            ...item,
            Status: newStatus,
            status: newStatus,
            EnquiryStatus: newStatus,
            EnquiryStatus: newStatus,
          }
          : item;
      }),
    );
  };

  const handleEnquiryEdit = item => {
    navigation.navigate('NewEnquiryScreen', {
      enquiryId: item?.enquiryId ?? item?.EnquiryId ?? item?.Id,
    });
  };

  // Convert handlers
  const handleConvertPress = item => {
    setConvertItem(item);
    setConvertVisible(true);
  };

  const handleConverted = enquiryId => {
    // Local status update
    handleStatusUpdated(enquiryId, 'Converted');
    // Subscription tab refresh
    fetchBookings();
    // Switch to Subscription tab to show new booking

  };

  const handleBookingPress = item => {
    setSelectedBooking(item);
    setBookSheetOpen(true);
  };
  const handleBookingEdit = item => {
    navigation.navigate('NewBookingScreen', {
      bookingId: item?.bookingId ?? item?.Id ?? item?.id ?? '',
    });
  };
  const handleBookingDeleted = id => {
    setSubscriptionData(prev =>
      prev.filter(
        item => String(item?.bookingId ?? item?.Id ?? item?.id) !== String(id),
      ),
    );
  };

  const isLoading = isEnquiry ? enquiryLoading : subLoading;

  const renderEnquiryRow = ({ item, index }) => {
    const statusKey = item.EnquiryStatus ?? item.Status ?? item.status ?? 'Pending';
    const s = ENQUIRY_STATUS_STYLE[statusKey] ?? ENQUIRY_STATUS_STYLE.Pending;
    const { checkIn, checkOut, hasRange } = extractDateRange(item);
    return (
      <>
        <TouchableOpacity
          style={styles.tableRow}
          activeOpacity={0.7}
          onPress={() => handleEnquiryPress(item)}
        >
          <Text style={styles.colSerial}>{index + 1}</Text>
          <Text style={styles.colName} numberOfLines={2}>
            {item.FullName ?? item.fullName ?? item.name ?? '—'}
          </Text>
          <Text style={styles.colProperty} numberOfLines={2}>
            {item.PropertyName ??
              item.propertyName ??
              item.property ??
              item.Category ??
              '—'}
          </Text>
          <View style={styles.colDateRange}>
            <Text style={styles.colDateIn}>{checkIn}</Text>
            {hasRange && <Text style={styles.colDateOut}>{checkOut}</Text>}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.text }]}>
              {statusKey}
            </Text>
          </View>
        </TouchableOpacity>
        {index < tableData.length - 1 && <View style={styles.rowDivider} />}
      </>
    );
  };

  const renderSubRow = ({ item, index }) => {
    console.log('ITEM =>', JSON.stringify(item, null, 2));
    const statusKey =
      item.BookingStatus ?? item.Status ?? item.status ?? 'Confirmed';
    const s = SUB_STATUS_STYLE[statusKey] ?? SUB_STATUS_STYLE.Confirmed;
    const { checkIn, checkOut, hasRange } = extractDateRange(item);
    return (
      <>
        <TouchableOpacity
          style={styles.tableRow}
          activeOpacity={0.7}
          onPress={() => handleBookingPress(item)}
        >
          <Text style={styles.colSerial}>{index + 1}</Text>
          <Text style={styles.colSubMember} numberOfLines={2}>
            {item.FullName ?? item.fullName ?? item.member ?? '—'}
          </Text>
          <Text style={styles.colSubProperty} numberOfLines={2}>
            {item.PropertyName ?? item.propertyName ?? item.property ?? '—'}
          </Text>
          <View style={styles.colDateRange}>
            <Text style={styles.colDateIn}>{checkIn}</Text>
            {hasRange && <Text style={styles.colDateOut}>{checkOut}</Text>}
          </View>
          <Text style={styles.colSubAmount}>
            {item.DealAmount ??
              item.dealAmount ??
              item.Amount ??
              item.amount ??
              '—'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.text }]}>
              {statusKey}
            </Text>
          </View>
        </TouchableOpacity>
        {index < tableData.length - 1 && <View style={styles.rowDivider} />}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
         <StatusBar
           backgroundColor={Colors.bg_dark}
           barStyle="light-content"
           translucent={false}
         />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../../Assets/icons/ak.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.headerTextCol}>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSub}>{headerSub}</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshBtn}
          activeOpacity={0.8}
          onPress={() => (isEnquiry ? fetchEnquiries() : fetchBookings())}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.refreshIcon}>↻</Text>
          )}
        </TouchableOpacity>
        <View style={styles.headerCircleLarge} />
        <View style={styles.headerCircleSmall} />
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={[styles.bodyContent, { paddingBottom: 70 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tabSwitcher}>
          {['Enquiry', 'Subscription'].map(tab => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                onPress={() => handleTabSwitch(tab)}
                activeOpacity={0.8}
              >
                <Image
                  source={
                    tab === 'Enquiry'
                      ? require('../../Assets/icons/reports2.png')
                      : require('../../Assets/icons/sub.png')
                  }
                  style={[
                    styles.tabIcon,
                    { tintColor: active ? Colors.primary : Colors.text_grey },
                  ]}
                  resizeMode="contain"
                />
                <Text
                  style={[styles.tabBtnText, active && styles.tabBtnTextActive]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.statsRow}>
          {stats.map(stat => (
            <View key={stat.key} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>
                {isLoading ? '—' : stat.value}
              </Text>
              <Text style={[styles.statSub, { color: stat.subColor }]}>
                {stat.sub}
              </Text>
            </View>
          ))}
        </View>

        {filtersOpen ? (
          <FiltersPanel
            isEnquiry={isEnquiry}
            filters={filters}
            setFilters={setFilters}
            onApply={() => setFiltersOpen(false)}
            onClear={() => setFilters(defaultFilters())}
            onCollapse={() => setFiltersOpen(false)}
          />
        ) : (
          <TouchableOpacity
            style={styles.filtersCollapsedCard}
            onPress={() => setFiltersOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.filtersLeft}>
              <View style={styles.filtersIconBox}>
                <Image
                  source={require('../../Assets/icons/ak.png')}
                  style={styles.filtersIconImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.filtersLabel}>FILTERS</Text>
            </View>
            <TouchableOpacity
              style={styles.expandBtn}
              onPress={() => setFiltersOpen(true)}
              activeOpacity={0.7}
            >
              <Image
                source={require('../../Assets/icons/dropdown.png')}
                style={styles.dropdown}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        <View style={styles.tableCard}>
          <View style={styles.tableTopRow}>
            <Text style={styles.tableTitle}>{tableTitle}</Text>
            <View style={styles.recordsBadge}>
              <Text style={styles.recordsBadgeText}>
                {isLoading ? '...' : `${tableData.length} records`}
              </Text>
            </View>
          </View>
          {!isLoading && tableData.length > 0 && (
            <View style={styles.tipRow}>
              <Text style={styles.tipText}>
                {isEnquiry
                  ? 'Tap to edit, convert, or update the status'
                  : 'Tap to edit or delete'}
              </Text>
            </View>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            bounces={false}
          >
            <View style={{ minWidth: isEnquiry ? 420 : 520 }}>
              {isEnquiry ? (
                <View style={styles.colHeaderRow}>
                  <Text style={[styles.colHeaderText, { width: 24 }]}>#</Text>
                  <Text style={[styles.colHeaderText, { width: 100 }]}>
                    NAME
                  </Text>
                  <Text style={[styles.colHeaderText, { width: 100 }]}>
                    PROPERTY
                  </Text>
                  <Text style={[styles.colHeaderText, { width: 90 }]}>
                    CHECK-IN/OUT
                  </Text>
                  <Text
                    style={[
                      styles.colHeaderText,
                      { width: 80, textAlign: 'center' },
                    ]}
                  >
                    STATUS
                  </Text>
                </View>
              ) : (
                <View style={styles.colHeaderRow}>
                  <Text style={[styles.colHeaderText, { width: 24 }]}>#</Text>
                  <Text style={[styles.colHeaderText, { width: 100 }]}>
                    MEMBER
                  </Text>
                  <Text style={[styles.colHeaderText, { width: 100 }]}>
                    PROPERTY
                  </Text>
                  <Text style={[styles.colHeaderText, { width: 90 }]}>
                    CHECK-IN/OUT
                  </Text>
                  <Text style={[styles.colHeaderText, { width: 60 }]}>
                    AMOUNT
                  </Text>
                  <Text
                    style={[
                      styles.colHeaderText,
                      { width: 80, textAlign: 'center' },
                    ]}
                  >
                    STATUS
                  </Text>
                </View>
              )}
              {isLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingText}>
                    {isEnquiry ? 'Loading enquiries...' : 'Loading bookings...'}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={tableData}
                  keyExtractor={(item, index) =>
                    (
                      item.enquiryId ??
                      item.bookingId ??
                      item.Id ??
                      item.id ??
                      index
                    ).toString()
                  }
                  renderItem={isEnquiry ? renderEnquiryRow : renderSubRow}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyText}>
                        {isEnquiry
                          ? 'No enquiries found'
                          : 'No bookings found'}
                      </Text>
                    </View>
                  }
                />
              )}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <EnquiryActionSheet
        visible={enqSheetOpen}
        item={selectedEnquiry}
        onClose={() => {
          setEnqSheetOpen(false);
          setSelectedEnquiry(null);
        }}
        onEdit={handleEnquiryEdit}
        onConvert={handleConvertPress}
      />

      <BookingActionSheet
        visible={bookSheetOpen}
        item={selectedBooking}
        onClose={() => {
          setBookSheetOpen(false);
          setSelectedBooking(null);
        }}
        onEdit={handleBookingEdit}
        onDeleted={handleBookingDeleted}
      />

      {/* Convert to Booking Modal */}
      <ConvertToBookingModal
        visible={convertVisible}
        item={convertItem}
        onClose={() => {
          setConvertVisible(false);
          setConvertItem(null);
        }}
        onConverted={handleConverted}
      />
    </SafeAreaView>
  );
};

export default ReportsScreen;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg_dark },
  header: {
    backgroundColor: Colors.bg_dark,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 27,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backIcon: { width: 20, height: 20, tintColor: Colors.text_white },
  headerTextCol: { flex: 1 },
  headerTitle: {
    color: Colors.text_white,
    fontSize: F.f18,
    fontWeight: 'bold',
  },
  headerSub: { color: Colors.text_grey, fontSize: F.f13, marginTop: 2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: { color: Colors.primary, fontSize: F.f20, fontWeight: '300' },
  headerCircleLarge: {
    position: 'absolute',
    right: -24,
    top: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.overlay_circle,
  },
  headerCircleSmall: {
    position: 'absolute',
    right: 54,
    bottom: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(245,158,11,0.06)',
  },
  body: { flex: 1, backgroundColor: Colors.page_bg },
  bodyContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 14,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: Colors.card_bg,
    borderRadius: 14,
    padding: 5,
    ...cardShadow,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    gap: 8,
  },
  tabBtnActive: { backgroundColor: Colors.bg_dark },
  tabIcon: { width: 16, height: 16 },
  tabBtnText: { color: Colors.text_grey, fontSize: F.f13, fontWeight: '600' },
  tabBtnTextActive: { color: Colors.text_white, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card_bg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: 'flex-start',
    ...cardShadow,
  },
  statLabel: {
    color: Colors.text_grey,
    fontSize: F.f11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statValue: {
    color: Colors.text_dark,
    fontSize: F.f22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSub: { fontSize: F.f12, fontWeight: '600' },
  filtersCollapsedCard: {
    backgroundColor: Colors.card_bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...cardShadow,
  },
  filtersLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filtersIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.bg_dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersIconImg: { width: 15, height: 15, tintColor: Colors.primary },
  filtersLabel: {
    color: Colors.text_dark,
    fontSize: F.f12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  expandBtn: {
    backgroundColor: Colors.gold_bg,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  dropdown: { width: 18, height: 18, tintColor: Colors.text_dark },
  tableCard: {
    backgroundColor: Colors.card_bg,
    borderRadius: 14,
    overflow: 'hidden',
    ...cardShadow,
  },
  tableTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tableTitle: {
    color: Colors.text_dark,
    fontSize: F.f13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  recordsBadge: {
    backgroundColor: Colors.page_bg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  recordsBadgeText: {
    color: Colors.text_grey,
    fontSize: F.f12,
    fontWeight: '600',
  },
  tipRow: {
    backgroundColor: Colors.gold_bg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 14,
    marginBottom: 8,
    borderRadius: 8,
  },
  tipText: { color: Colors.primary, fontSize: F.f11, fontWeight: '500' },
  colHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.inputBorder,
  },
  colHeaderText: {
    color: Colors.text_grey,
    fontSize: F.f8,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  colSerial: {
    width: 24,
    color: Colors.text_grey,
    fontSize: F.f10,
    fontWeight: '600',
  },
  colName: {
    width: 100,
    color: Colors.text_dark,
    fontSize: F.f10,
    fontWeight: '600',
  },
  colProperty: { width: 100, color: Colors.text_label, fontSize: F.f10 },
  colSubMember: {
    width: 100,
    color: Colors.text_dark,
    fontSize: F.f12,
    fontWeight: '600',
  },
  colSubProperty: { width: 100, color: Colors.text_label, fontSize: F.f12 },
  colSubAmount: {
    width: 60,
    color: Colors.text_dark,
    fontSize: F.f12,
    fontWeight: '600',
  },
  colDateRange: { width: 90, justifyContent: 'center' },
  colDateIn: {
    color: Colors.text_dark,
    fontSize: F.f12,
    fontWeight: '600',
    marginTop: 10,
  },
  colDateOut: { color: Colors.text_grey, fontSize: F.f12, marginBottom: 10 },
  statusBadge: {
    width: 80,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { fontSize: F.f10, fontWeight: '700' },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.inputBorder,
    marginHorizontal: 10,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { marginTop: 10, color: Colors.text_dark, fontSize: F.f13 },
  emptyBox: { paddingVertical: 30, alignItems: 'center' },
  emptyText: { color: Colors.text_grey, fontSize: F.f13 },
});

const ddStyles = StyleSheet.create({
  wrapper: { flex: 1 },
  label: {
    color: Colors.text_label,
    fontSize: F.f11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  triggerActive: { borderColor: Colors.blue_text, backgroundColor: '#EFF6FF' },
  triggerText: {
    color: Colors.text_dark,
    fontSize: F.f14,
    fontWeight: '500',
    flex: 1,
  },
  arrow: { color: Colors.text_grey, fontSize: F.f13, marginLeft: 4 },
  arrowUp: { transform: [{ rotate: '180deg' }] },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  dropdownList: {
    position: 'absolute',
    backgroundColor: Colors.card_bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card_bg,
  },
  checkboxSelected: {
    backgroundColor: Colors.bg_dark,
    borderColor: Colors.bg_dark,
  },
  checkmark: { color: Colors.text_white, fontSize: F.f10, fontWeight: '700' },
  optionText: { color: Colors.text_dark, fontSize: F.f12 },
  optionTextSelected: { fontWeight: '700' },
});

const fpStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card_bg,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    ...cardShadow,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.bg_dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: { width: 15, height: 15, tintColor: Colors.primary },
  headerLabel: {
    color: Colors.text_dark,
    fontSize: F.f14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  collapseBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  collapseIcon: { width: 18, height: 18, tintColor: Colors.text_dark },
  divider: {
    height: 1,
    backgroundColor: Colors.inputBorder,
    marginHorizontal: -16,
  },
  row: { flexDirection: 'row', gap: 12 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  clearBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  clearBtnText: { color: Colors.text_grey, fontSize: F.f14, fontWeight: '600' },
  applyBtn: {
    flex: 2.2,
    borderRadius: 12,
    backgroundColor: Colors.bg_dark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  applyBtnText: {
    color: Colors.text_white,
    fontSize: F.f14,
    fontWeight: '700',
  },
});

const dateStyles = StyleSheet.create({
  wrapper: { flex: 1 },
  label: {
    color: Colors.text_label,
    fontSize: F.f11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  placeholder: { color: Colors.text_grey, fontSize: F.f14 },
  valueText: { color: Colors.text_dark, fontSize: F.f14 },
  calIcon: { width: 18, height: 18, tintColor: Colors.text_grey },
});

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
  monthText: { color: Colors.text_dark, fontSize: F.f16, fontWeight: '700' },
  monthArrow: { color: Colors.text_grey, fontSize: F.f12 },
  navBtns: { flexDirection: 'row', gap: 16 },
  navBtn: { padding: 4 },
  navArrow: { color: Colors.text_dark, fontSize: F.f18, fontWeight: '300' },
  dayLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayLabel: {
    width: 32,
    textAlign: 'center',
    color: Colors.text_grey,
    fontSize: F.f13,
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
  cellText: { color: Colors.text_dark, fontSize: F.f14 },
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
  footerClear: { color: '#1D6AFF', fontSize: F.f14, fontWeight: '600' },
  footerToday: { color: '#1D6AFF', fontSize: F.f14, fontWeight: '600' },
});

const sheetStyles = StyleSheet.create({
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
    paddingBottom: 36,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.14,
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
    marginTop: 12,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { color: Colors.text_dark, fontSize: F.f16, fontWeight: '700' },
  headerSub: { color: Colors.text_grey, fontSize: F.f12, marginTop: 2 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTxt: { color: Colors.text_grey, fontSize: F.f13, fontWeight: '700' },
  divider: {
    height: 1,
    backgroundColor: Colors.inputBorder,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  optionsWrap: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 16,
  },

  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blue_bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  editBtnEmoji: { fontSize: 20 },
  editBtnLabel: { color: Colors.blue_text, fontSize: F.f15, fontWeight: '700' },
  editBtnSub: {
    color: Colors.blue_text,
    fontSize: F.f11,
    opacity: 0.7,
    marginTop: 2,
  },
  editBtnArrow: { color: Colors.blue_text, fontSize: F.f20, fontWeight: '300' },
  // Convert button
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green_bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  convertBtnEmoji: { fontSize: 20 },
  convertBtnLabel: {
    color: Colors.green_text,
    fontSize: F.f15,
    fontWeight: '700',
  },
  convertBtnSub: {
    color: Colors.green_text,
    fontSize: F.f11,
    opacity: 0.7,
    marginTop: 2,
  },
  convertBtnArrow: {
    color: Colors.green_text,
    fontSize: F.f20,
    fontWeight: '300',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.red_bg,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  deleteBtnEmoji: { fontSize: 20 },
  deleteBtnLabel: {
    color: Colors.red_text,
    fontSize: F.f15,
    fontWeight: '700',
  },
  deleteBtnSub: {
    color: Colors.red_text,
    fontSize: F.f11,
    opacity: 0.7,
    marginTop: 2,
  },
  infoStrip: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.page_bg,
    borderRadius: 12,
    paddingVertical: 12,
  },
  infoChip: { flex: 1, alignItems: 'center', gap: 4 },
  infoChipDivider: {
    width: 1,
    backgroundColor: Colors.inputBorder,
    marginVertical: 4,
  },
  infoChipLabel: {
    color: Colors.text_grey,
    fontSize: F.f10,
    fontWeight: '600',
  },
  infoChipValue: {
    color: Colors.text_dark,
    fontSize: F.f12,
    fontWeight: '700',
  },
  cancelBtn: {
    marginHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelTxt: { color: Colors.text_grey, fontSize: F.f14, fontWeight: '600' },
});


const convertStyles = StyleSheet.create({
  infoStrip: {
    backgroundColor: Colors.gold_bg,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 4,
  },
  infoStripText: {
    color: Colors.text_dark,
    fontSize: F.f12,
    fontWeight: '500',
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    color: Colors.text_label,
    fontSize: F.f11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  // ✅ SIRF EK fieldInput — dono kaam kare (TextInput + TouchableOpacity)
  fieldInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: Colors.text_dark,
    fontSize: F.f14,
    minHeight: 46,
  },

  amtRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  balanceRow: {
    backgroundColor: Colors.green_bg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  balanceLabel: {
    color: Colors.green_text,
    fontSize: F.f12,
    fontWeight: '700',
  },
  balanceValue: {
    color: Colors.green_text,
    fontSize: F.f18,
    fontWeight: '800',
  },
  convertBtn: {
    backgroundColor: Colors.green_text,
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 16,
  },
  convertBtnText: {
    color: Colors.text_white,
    fontSize: F.f15,
    fontWeight: '700',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: Colors.card_bg,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.inputBorder,
  },
  dropdownItemActive: {
    backgroundColor: Colors.gold_icon_bg,
  },
  dropdownItemText: {
    fontSize: F.f14,
    color: Colors.text_dark,
  },
  dropdownItemTextActive: {
    color: Colors.gold,
    fontWeight: '600',
  },
  guestBadge: {
    backgroundColor: Colors.gold_icon_bg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  guestBadgeText: {
    fontSize: F.f12,
    color: Colors.gold,
    fontWeight: '600',
  },
});