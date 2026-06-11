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
  TextInput,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { getTotalRevenue, getRevenueDetails } from '../../Api/ApiService';

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
};

const F = {
  f10: 10, f11: 11, f12: 12, f13: 13,
  f14: 14, f15: 15, f16: 16, f17: 17, f18: 18, f20: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. PERIOD OPTIONS
// ─────────────────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { key: 'today',  label: 'Today',          filterType: 'Today'  },
  { key: 'month1', label: 'Last Month',     filterType: 'Month1' },
  { key: 'month3', label: 'Last 3 Months',  filterType: 'Month3' },
  { key: 'month6', label: 'Last 6 Months',  filterType: 'Month6' },
  { key: 'custom', label: 'Custom Range',   filterType: 'Custom' },
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

const parseINR = (str) =>
  Number(String(str || '').replace('₹', '').replace(/,/g, '')) || 0;

// Format date object to DD/MM/YYYY for display
const formatDisplayDate = (date) => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// Format date object to YYYY-MM-DD for API
const formatApiDate = (date) => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
};

const robustParse = (responseData) => {
  if (!responseData) return [];
  if (responseData.data && typeof responseData.data === 'string') {
    try { return JSON.parse(responseData.data); } catch { /* fall through */ }
  }
  if (responseData.data && Array.isArray(responseData.data)) return responseData.data;
  if (responseData.data && typeof responseData.data === 'object') return [responseData.data];
  if (Array.isArray(responseData)) return responseData;
  if (typeof responseData === 'object') return [responseData];
  return [];
};

const safeNum = (obj, ...keys) => {
  for (const key of keys) {
    const val = obj[key];
    if (val !== undefined && val !== null && val !== '') {
      const n = Number(val);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. MINI CALENDAR COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const MiniCalendar = ({ selectedDate, onSelect, minDate, maxDate }) => {
  const today = new Date();
  const initial = selectedDate || today;
  const [viewYear,  setViewYear]  = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getFullYear() === viewYear
    );
  };

  const isDisabled = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View>
      {/* Month nav */}
      <View style={cal.navRow}>
        <TouchableOpacity style={cal.navBtn} onPress={prevMonth}>
          <Text style={cal.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={cal.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
        <TouchableOpacity style={cal.navBtn} onPress={nextMonth}>
          <Text style={cal.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={cal.weekRow}>
        {DAYS.map(d => (
          <Text key={d} style={cal.dayHeader}>{d}</Text>
        ))}
      </View>

      {/* Day cells */}
      <View style={cal.daysGrid}>
        {cells.map((day, idx) => {
          if (!day) return <View key={`e-${idx}`} style={cal.dayCell} />;
          const sel  = isSelected(day);
          const dis  = isDisabled(day);
          const isToday =
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear  === today.getFullYear();
          return (
            <TouchableOpacity
              key={day}
              style={[
                cal.dayCell,
                sel && cal.dayCellSelected,
                isToday && !sel && cal.dayCellToday,
              ]}
              onPress={() => {
                if (!dis) onSelect(new Date(viewYear, viewMonth, day));
              }}
              disabled={dis}
              activeOpacity={0.7}
            >
              <Text style={[
                cal.dayText,
                sel && cal.dayTextSelected,
                dis && cal.dayTextDis,
                isToday && !sel && cal.dayTextToday,
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const cal = StyleSheet.create({
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: Colors.input_bg,
    alignItems: 'center', justifyContent: 'center',
  },
  navArrow: { fontSize: 20, color: Colors.primary, fontWeight: '700', lineHeight: 24 },
  monthLabel: { fontSize: F.f14, fontWeight: '600', color: Colors.text_dark },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: {
    width: `${100/7}%`,
    textAlign: 'center',
    fontSize: F.f11,
    fontWeight: '600',
    color: Colors.text_grey,
    paddingVertical: 4,
  },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100/7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellSelected: { backgroundColor: Colors.header_dark },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayText: { fontSize: F.f13, color: Colors.text_dark },
  dayTextSelected: { color: Colors.text_white, fontWeight: '700' },
  dayTextDis: { color: Colors.border },
  dayTextToday: { color: Colors.primary, fontWeight: '600' },
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. CUSTOM RANGE PICKER MODAL
// ─────────────────────────────────────────────────────────────────────────────

const CustomRangePicker = ({ visible, fromDate, toDate, onApply, onClose }) => {
  const [step,    setStep]    = useState('from'); // 'from' | 'to'
  const [selFrom, setSelFrom] = useState(fromDate || null);
  const [selTo,   setSelTo]   = useState(toDate   || null);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setStep('from');
      setSelFrom(fromDate || null);
      setSelTo(toDate || null);
    }
  }, [visible]);

  const handleFromSelect = (date) => {
    setSelFrom(date);
    // Clear toDate if it's before new fromDate
    if (selTo && date > selTo) setSelTo(null);
    setStep('to');
  };

  const handleToSelect = (date) => {
    setSelTo(date);
  };

  const canApply = selFrom && selTo;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={crp.overlay}>
          <TouchableWithoutFeedback>
            <View style={crp.sheet}>
              {/* Handle */}
              <View style={crp.handle} />

              {/* Header */}
              <View style={crp.header}>
                <View>
                  <Text style={crp.title}>Custom Range</Text>
                  <Text style={crp.subtitle}>Select start and end date</Text>
                </View>
                <TouchableOpacity style={crp.closeBtn} onPress={onClose}>
                  <Text style={crp.closeTxt}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Step tabs */}
              <View style={crp.tabRow}>
                <TouchableOpacity
                  style={[crp.tab, step === 'from' && crp.tabActive]}
                  onPress={() => setStep('from')}
                >
                  <Text style={crp.tabLabel}>FROM</Text>
                  <Text style={[crp.tabDate, !selFrom && crp.tabDateEmpty]}>
                    {selFrom ? formatDisplayDate(selFrom) : 'Select date'}
                  </Text>
                </TouchableOpacity>

                <View style={crp.tabArrow}>
                  <Text style={crp.tabArrowTxt}>→</Text>
                </View>

                <TouchableOpacity
                  style={[crp.tab, step === 'to' && crp.tabActive]}
                  onPress={() => { if (selFrom) setStep('to'); }}
                >
                  <Text style={crp.tabLabel}>TO</Text>
                  <Text style={[crp.tabDate, !selTo && crp.tabDateEmpty]}>
                    {selTo ? formatDisplayDate(selTo) : 'Select date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={crp.divider} />

              {/* Calendar */}
              <View style={crp.calendarWrap}>
                <Text style={crp.calHint}>
                  {step === 'from'
                    ? '📅  Select start date'
                    : '📅  Select end date'}
                </Text>
                {step === 'from' && (
                  <MiniCalendar
                    selectedDate={selFrom}
                    onSelect={handleFromSelect}
                    maxDate={new Date()}
                  />
                )}
                {step === 'to' && (
                  <MiniCalendar
                    selectedDate={selTo}
                    onSelect={handleToSelect}
                    minDate={selFrom}
                    maxDate={new Date()}
                  />
                )}
              </View>

              <View style={crp.divider} />

              {/* Actions */}
              <View style={crp.actionRow}>
                <TouchableOpacity style={crp.cancelBtn} onPress={onClose}>
                  <Text style={crp.cancelTxt}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[crp.applyBtn, !canApply && crp.applyBtnDis]}
                  onPress={() => {
                    if (canApply) onApply(selFrom, selTo);
                  }}
                  disabled={!canApply}
                >
                  <Text style={crp.applyTxt}>Apply Range</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const crp = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.50)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.card_bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handle: {
    alignSelf: 'center',
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  title:    { fontSize: F.f16, fontWeight: '700', color: Colors.text_dark },
  subtitle: { fontSize: F.f12, color: Colors.text_grey, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.input_bg,
    alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: F.f12, color: Colors.text_grey },

  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: Colors.input_bg,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary_light,
  },
  tabLabel: {
    fontSize: F.f10,
    fontWeight: '700',
    color: Colors.text_grey,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  tabDate:      { fontSize: F.f14, fontWeight: '600', color: Colors.text_dark },
  tabDateEmpty: { fontSize: F.f13, fontWeight: '400', color: Colors.text_label },
  tabArrow:     { alignItems: 'center', justifyContent: 'center', width: 24 },
  tabArrowTxt:  { fontSize: F.f16, color: Colors.text_grey },

  divider: { height: 0.5, backgroundColor: Colors.border },

  calendarWrap: { paddingHorizontal: 16, paddingVertical: 14 },
  calHint: {
    fontSize: F.f12,
    color: Colors.text_grey,
    marginBottom: 10,
    fontWeight: '500',
  },

  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTxt: { fontSize: F.f14, fontWeight: '600', color: Colors.text_grey },
  applyBtn: {
    flex: 2,
    height: 46,
    borderRadius: 10,
    backgroundColor: Colors.header_dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDis: { backgroundColor: Colors.border },
  applyTxt:    { fontSize: F.f14, fontWeight: '600', color: Colors.text_white },
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PERIOD DROPDOWN (updated — custom range triggers date picker)
// ─────────────────────────────────────────────────────────────────────────────

const PeriodDropdown = ({
  selected,
  onSelect,
  customFrom,
  customTo,
  onCustomApply,
}) => {
  const [open,       setOpen]       = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  const selectedLabel = PERIOD_OPTIONS.find(o => o.key === selected)?.label ?? 'Today';

  const shortLabel = (key, lbl) => {
    if (key === 'custom' && customFrom && customTo) {
      return `${formatDisplayDate(customFrom)} – ${formatDisplayDate(customTo)}`;
    }
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
    if (key === 'custom') {
      setCustomOpen(true);
    } else {
      onSelect(key, null, null);
    }
  };

  const handleCustomApply = (from, to) => {
    setCustomOpen(false);
    onCustomApply(from, to);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.periodChip,
          selected === 'custom' && customFrom && customTo && styles.periodChipCustom,
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.chipCalIcon}>
          <View style={styles.chipCalBar} />
          <View style={styles.chipCalDots}>
            {[0, 1, 2, 3, 4, 5].map(i => <View key={i} style={styles.chipCalDot} />)}
          </View>
        </View>
        <Text style={styles.chipLabel} numberOfLines={1}>
          {shortLabel(selected, selectedLabel)}
        </Text>
        <Text style={styles.chipArrow}>▾</Text>
      </TouchableOpacity>

      {/* Period options modal */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
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
                        <View style={[
                          styles.ddOptAccent,
                          isActive && styles.ddOptAccentActive,
                          isCustom && !isActive && styles.ddOptAccentCustom,
                        ]} />
                        <View style={{ flex: 1 }}>
                          <Text style={[
                            styles.ddOptTxt,
                            isActive && styles.ddOptTxtActive,
                            isCustom && !isActive && styles.ddOptTxtCustom,
                          ]}>
                            {item.label}
                          </Text>
                          {/* Show selected dates under Custom option */}
                          {isCustom && isActive && customFrom && customTo && (
                            <Text style={ddCust.subTxt}>
                              {formatDisplayDate(customFrom)} → {formatDisplayDate(customTo)}
                            </Text>
                          )}
                        </View>
                        {isCustom && (
                          <View style={styles.ddNewBadge}>
                            <Text style={styles.ddNewBadgeTxt}>
                              {isActive && customFrom ? 'EDIT' : 'PICK'}
                            </Text>
                          </View>
                        )}
                        {isActive && !isCustom && <Text style={styles.ddCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Custom date range picker */}
      <CustomRangePicker
        visible={customOpen}
        fromDate={customFrom}
        toDate={customTo}
        onApply={handleCustomApply}
        onClose={() => setCustomOpen(false)}
      />
    </>
  );
};

const ddCust = StyleSheet.create({
  subTxt: {
    fontSize: F.f11,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────

const ProgressBar = ({ progress }) => (
  <View style={styles.progTrack}>
    <View style={[styles.progFill, { width: `${Math.round((progress || 0) * 100)}%` }]} />
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. PROPERTY ROW
// ─────────────────────────────────────────────────────────────────────────────

const PropertyRow = ({ prop }) => (
  <View style={styles.propRow}>
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
      <Text style={styles.propRowAmt}>{prop.revenue}</Text>
      <View style={styles.dotRow}>
        <View style={styles.dot} />
        <Text style={styles.dotText}>{prop.bookings} bookings</Text>
      </View>
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 9. REVENUE SECTION CARD
// ─────────────────────────────────────────────────────────────────────────────

const RevenueSectionCard = ({
  title,
  categoryIcon,
  categoryIconBg,
  categoryIconTint,
  data = { totalRevenue: '₹0', totalBookings: 0, properties: [] },
}) => (
  <View style={styles.revCard}>
    <View style={styles.revCardHdr}>
      <View style={[styles.revCardIconBox, { backgroundColor: categoryIconBg }]}>
        <Image
          source={categoryIcon}
          style={[styles.revCardIcon, { tintColor: categoryIconTint }]}
          resizeMode="contain"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.revCardTitle}>{title}</Text>
        <Text style={styles.revCardSub}>
          {data.properties.length} properties · {data.totalBookings} bookings
        </Text>
      </View>
      <View style={styles.totalBadge}>
        <Text style={styles.totalBadgeText}>{data.totalRevenue}</Text>
      </View>
    </View>
    <View style={styles.cardDivider} />
    <View style={styles.revCardBody}>
      {Array.isArray(data?.properties) &&
        data.properties.map(prop => (
          <PropertyRow key={prop.key} prop={prop} />
        ))
      }
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 10. LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const SkeletonBox = ({ w, h, radius = 6 }) => (
  <View style={{ width: w, height: h, borderRadius: radius, backgroundColor: '#E2E8F0' }} />
);

const LoadingSkeleton = () => (
  <View style={{ gap: 12 }}>
    {[0, 1].map(i => (
      <View key={i} style={[styles.revCard, { padding: 14, gap: 10 }]}>
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
          <View key={j} style={[styles.propRow]}>
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
// 11. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const TotalRevnueScreen = ({ navigation }) => {
  const [period,        setPeriod]        = useState('today');
  const [customFrom,    setCustomFrom]    = useState(null);
  const [customTo,      setCustomTo]      = useState(null);
  const [search,        setSearch]        = useState('');
  const [farmhouseData, setFarmhouseData] = useState(null);
  const [airbnbData,    setAirbnbData]    = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchRevenueData = useCallback(async () => {
    // For custom, require both dates
    if (period === 'custom' && (!customFrom || !customTo)) return;

    try {
      setLoading(true);
      setError(null);

      const filterType = getFilterType(period);
      const fromDate   = period === 'custom' ? formatApiDate(customFrom) : '';
      const toDate     = period === 'custom' ? formatApiDate(customTo)   : '';

      console.log('🚀 FETCHING REVENUE =>', { filterType, fromDate, toDate });

      // ✅ FIX: filterType properly passed — not hardcoded 'Today'
      const revenueDetails = await getRevenueDetails(filterType, fromDate, toDate);

      console.log('🔥 RAW REVENUE RESPONSE =>', JSON.stringify(revenueDetails, null, 2));

      if (revenueDetails.success) {
        const parsed  = robustParse(revenueDetails.data);
        const details = parsed[0] ?? {};

        console.log('🔑 ALL KEYS =>', Object.keys(details));

        // ── Farmhouse ──────────────────────────────────────────────────────
        const greyRev = safeNum(details,
          'TotalAmountGreyStone','TotalAmountGreystone','totalAmountGreyStone',
          'GreyStoneAmount','GreystoneAmount','GreyStone'
        );
        const skyRev = safeNum(details,
          'TotalAmountSkyStone','TotalAmountSkystone','totalAmountSkyStone',
          'SkyStoneAmount','SkystoneAmount','SkyStone'
        );
        const farmMax          = Math.max(greyRev, skyRev, 1);
        const farmBookingsTotal = safeNum(details,
          'TotalBookingFramHouse','TotalBookingFarmHouse','TotalBookingFarmhouse','FarmhouseBookings','FarmHouseBookings'
        );

        setFarmhouseData({
          totalRevenue:  formatINR(greyRev + skyRev),
          totalBookings: farmBookingsTotal,
          properties: [
            {
              key: 'greystone', label: 'Grey Stone', badge: 'Farmhouse',
              revenue:  formatINR(greyRev),
              bookings: safeNum(details,'TotalBookingGreyStone','TotalBookingGreystone','GreyStoneBookings'),
              progress: parseFloat((greyRev / farmMax).toFixed(2)),
              icon: require('../../Assets/icons/Greystone.png'),
            },
            {
              key: 'skystone', label: 'Sky Stone', badge: 'Farmhouse',
              revenue:  formatINR(skyRev),
              bookings: safeNum(details,'TotalBookingSkyStone','TotalBookingSkystone','SkyStoneBookings'),
              progress: parseFloat((skyRev / farmMax).toFixed(2)),
              icon: require('../../Assets/icons/stonestays1.png'),
            },
          ],
        });

        // ── Airbnb ─────────────────────────────────────────────────────────
        const topazRev    = safeNum(details,'TotalAmountTopaz','TotalAmountTopaze','totalAmountTopaz','TopazAmount');
        const rubyRev     = safeNum(details,'TotalAmountRuby','totalAmountRuby','RubyAmount');
        const sapphireRev = safeNum(details,'TotalAmountSapphire','totalAmountSapphire','SapphireAmount');
        const airbnbMax   = Math.max(topazRev, rubyRev, sapphireRev, 1);

        const airbnbTotal = safeNum(details,
          'TotalAmountAirbnb','TotalAmountAirBnb','totalAmountAirbnb','AirbnbAmount'
        ) || (topazRev + rubyRev + sapphireRev);

        const airbnbBookings = safeNum(details,
          'TotalBookingAirbnb','TotalBookingAirBnb','totalBookingAirbnb','AirbnbBookings'
        );

        setAirbnbData({
          totalRevenue:  formatINR(airbnbTotal),
          totalBookings: airbnbBookings,
          properties: [
            {
              key: 'topaz', label: 'Topaz', badge: '2 BHK',
              revenue:  formatINR(topazRev),
              bookings: safeNum(details,'TotalBookingTopaze','TotalBookingTopaz','TopazBookings'),
              progress: parseFloat((topazRev / airbnbMax).toFixed(2)),
              icon: require('../../Assets/icons/stonestays1.png'),
            },
            {
              key: 'ruby', label: 'Ruby', badge: '1 BHK',
              revenue:  formatINR(rubyRev),
              bookings: safeNum(details,'TotalBookingRuby','TotalBookingRubye','RubyBookings'),
              progress: parseFloat((rubyRev / airbnbMax).toFixed(2)),
              icon: require('../../Assets/icons/stonestays1.png'),
            },
            {
              key: 'sapphire', label: 'Sapphire', badge: '1 BHK',
              revenue:  formatINR(sapphireRev),
              bookings: safeNum(details,'TotalBookingSapphire','SapphireBookings'),
              progress: parseFloat((sapphireRev / airbnbMax).toFixed(2)),
              icon: require('../../Assets/icons/stonestays1.png'),
            },
          ],
        });

      } else {
        setError(revenueDetails.message || 'Unable to load data. Please try again.');
      }
    } catch (err) {
      console.log('❌ Revenue Fetch Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period, customFrom, customTo]);

  useEffect(() => {
    // Don't auto-fetch for custom until dates are selected
    if (period !== 'custom') {
      fetchRevenueData();
    }
  }, [fetchRevenueData, period]);

  // ── Period handler ─────────────────────────────────────────────────────────
  const handlePeriodSelect = (key, from, to) => {
    setPeriod(key);
    if (key !== 'custom') {
      setCustomFrom(null);
      setCustomTo(null);
    }
  };

  // ── Custom apply handler ───────────────────────────────────────────────────
  const handleCustomApply = (from, to) => {
    setCustomFrom(from);
    setCustomTo(to);
    setPeriod('custom');
    // fetchRevenueData will run via useEffect because customFrom/customTo changed
  };

  // Separate effect to fire fetch when custom dates are set
  useEffect(() => {
    if (period === 'custom' && customFrom && customTo) {
      fetchRevenueData();
    }
  }, [customFrom, customTo]);

  // ── Search filter ──────────────────────────────────────────────────────────
  const filterData = (data) => {
    if (!data) return null;
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return {
      ...data,
      properties: data.properties.filter(
        p => p.label.toLowerCase().includes(q) || p.badge.toLowerCase().includes(q)
      ),
    };
  };

  const filteredFarm   = filterData(farmhouseData);
  const filteredAirbnb = filterData(airbnbData);
  const showFarm       = filteredFarm   && Array.isArray(filteredFarm.properties);
  const showAirbnb     = filteredAirbnb && Array.isArray(filteredAirbnb.properties);

  // ── Header strip values ────────────────────────────────────────────────────
  const totalRevenue = formatINR(
    parseINR(farmhouseData?.totalRevenue) + parseINR(airbnbData?.totalRevenue)
  );
  const farmTotal   = farmhouseData?.totalRevenue || '₹0';
  const airbnbTotal = airbnbData?.totalRevenue    || '₹0';
  const farmProps   = farmhouseData?.properties?.length || 0;
  const airbnbProps = airbnbData?.properties?.length    || 0;

  // Active period display label for strip
  const periodLabel = (() => {
    if (period === 'custom' && customFrom && customTo) {
      return `${formatDisplayDate(customFrom)} – ${formatDisplayDate(customTo)}`;
    }
    return PERIOD_OPTIONS.find(o => o.key === period)?.label || 'Today';
  })();

  // ── Render ─────────────────────────────────────────────────────────────────
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
            <Text style={styles.headerTitle}>Total Revenue</Text>
            <Text style={styles.headerSubtitle}>{periodLabel}</Text>
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={fetchRevenueData}
            activeOpacity={0.8}
            disabled={loading}
          >
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
            <Text style={styles.stripVal}>{loading ? '...' : totalRevenue}</Text>
            <Text style={styles.stripSub}>{farmProps + airbnbProps} properties</Text>
          </View>
          <View style={[styles.stripItem, styles.stripItemBorder]}>
            <Text style={styles.stripLabel}>FARMHOUSE</Text>
            <Text style={styles.stripVal}>{loading ? '...' : farmTotal}</Text>
            <Text style={styles.stripSub}>{farmProps} properties</Text>
          </View>
          <View style={styles.stripItem}>
            <Text style={styles.stripLabel}>AIRBNB</Text>
            <Text style={styles.stripVal}>{loading ? '...' : airbnbTotal}</Text>
            <Text style={styles.stripSub}>{airbnbProps} properties</Text>
          </View>
        </View>
      </View>

      {/* ── BODY ── */}
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

          <PeriodDropdown
            selected={period}
            onSelect={handlePeriodSelect}
            customFrom={customFrom}
            customTo={customTo}
            onCustomApply={handleCustomApply}
          />
        </View>

        {/* Custom range banner — shows selected range */}
        {period === 'custom' && customFrom && customTo && (
          <View style={styles.customBanner}>
            <Text style={styles.customBannerIcon}>📅</Text>
            <Text style={styles.customBannerTxt}>
              {formatDisplayDate(customFrom)} → {formatDisplayDate(customTo)}
            </Text>
          </View>
        )}

        {/* Waiting for custom dates */}
        {period === 'custom' && (!customFrom || !customTo) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyTxt}>Select a custom date range to view data</Text>
          </View>
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Error */}
        {!loading && error && (
          <View style={styles.errorState}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorTxt}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchRevenueData} activeOpacity={0.8}>
              <Text style={styles.retryTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!loading && !error && !showFarm && !showAirbnb && period !== 'custom' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTxt}>
              {search ? `No properties found for "${search}"` : 'No revenue data available.'}
            </Text>
          </View>
        )}

        {/* Farmhouse card */}
        {!loading && !error && showFarm && (
          <RevenueSectionCard
            title="Farmhouse"
            categoryIcon={require('../../Assets/icons/Greystone.png')}
            categoryIconBg="#CCFBF1"
            categoryIconTint={Colors.primary_text}
            data={filteredFarm}
          />
        )}

        {/* Airbnb card */}
        {!loading && !error && showAirbnb && (
          <RevenueSectionCard
            title="Airbnb"
            categoryIcon={require('../../Assets/icons/stonestays1.png')}
            categoryIconBg="#CFFAFE"
            categoryIconTint={Colors.primary}
            data={filteredAirbnb}
          />
        )}

        <TouchableOpacity
          style={styles.viewBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ReportsScreen', { activeTab: 'Subscription' })}
        >
          <Text style={styles.viewBtnText}>View Total Bookings</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default TotalRevnueScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 12. STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: { flex: 1, backgroundColor: Colors.header_dark },

  header: {
    backgroundColor: Colors.header_dark,
    paddingTop: 8,
    overflow: 'hidden',
    marginTop: 27,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 18,
    zIndex: 2,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  backIcon:         { width: 18, height: 18, tintColor: Colors.text_white },
  headerTitleBlock: { flex: 1 },
  headerTitle: {
    color: Colors.text_white, fontSize: F.f17,
    fontWeight: '600', marginBottom: 3,
  },
  headerSubtitle: { color: Colors.text_muted, fontSize: F.f12 },

  refreshBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
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

  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.strip_bg,
    borderTopWidth: 0.5, borderTopColor: Colors.border_white,
  },
  stripItem:       { flex: 1, padding: 11 },
  stripItemBorder: { borderRightWidth: 0.5, borderRightColor: Colors.border_white },
  stripLabel: {
    fontSize: F.f10, color: 'rgba(255,255,255,0.50)',
    letterSpacing: 0.4, marginBottom: 3, marginLeft: 10,
  },
  stripVal: { fontSize: F.f15, fontWeight: '600', color: Colors.text_white, marginLeft: 10 },
  stripSub: { fontSize: F.f10, color: 'rgba(255,255,255,0.40)', marginTop: 1, marginLeft: 10 },

  body:        { flex: 1, backgroundColor: Colors.page_bg },
  bodyContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 34, gap: 12 },

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

  periodChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.header_dark,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 0,
    height: 46, gap: 5, minWidth: 80, justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.20, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  // Custom range active chip — teal tint
  periodChipCustom: {
    backgroundColor: Colors.primary,
  },
  chipCalIcon: {
    width: 14, height: 14,
    borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2, overflow: 'hidden',
  },
  chipCalBar:  { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  chipCalDots: {
    flex: 1, flexDirection: 'row', flexWrap: 'wrap',
    padding: 1, gap: 1, justifyContent: 'center', alignContent: 'center',
  },
  chipCalDot: { width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.7)' },
  chipLabel:  { fontSize: F.f12, fontWeight: '600', color: Colors.text_white, flexShrink: 1 },
  chipArrow:  { fontSize: F.f10, color: 'rgba(255,255,255,0.8)' },

  // Custom range active banner
  customBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary_light,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: Colors.primary_border,
  },
  customBannerIcon: { fontSize: 14 },
  customBannerTxt: {
    fontSize: F.f13,
    fontWeight: '600',
    color: Colors.primary_text,
  },

  ddOverlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end',
  },
  ddSheet: {
    backgroundColor: Colors.card_bg,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  ddHandle: {
    alignSelf: 'center', width: 40, height: 4,
    borderRadius: 2, backgroundColor: Colors.border,
    marginTop: 12, marginBottom: 4,
  },
  ddSheetHdr: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  ddSheetTitle: { fontSize: F.f16, fontWeight: '700', color: Colors.text_dark },
  ddCloseBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.input_bg, alignItems: 'center', justifyContent: 'center',
  },
  ddCloseTxt:        { fontSize: F.f12, color: Colors.text_grey },
  ddSep:             { height: 0.5, backgroundColor: Colors.border_light, marginHorizontal: 20 },
  ddOptRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 17, gap: 14,
  },
  ddOptRowActive:    { backgroundColor: Colors.primary_light },
  ddOptAccent:       { width: 4, height: 20, borderRadius: 2, backgroundColor: Colors.border },
  ddOptAccentActive: { backgroundColor: Colors.primary },
  ddOptAccentCustom: { backgroundColor: Colors.primary_mid },
  ddOptTxt:          { flex: 1, fontSize: F.f15, color: Colors.text_dark },
  ddOptTxtActive:    { fontWeight: '700', color: Colors.primary },
  ddOptTxtCustom:    { color: Colors.primary_mid, fontWeight: '500' },
  ddNewBadge: {
    backgroundColor: Colors.primary, borderRadius: 5,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  ddNewBadgeTxt: { fontSize: F.f10, fontWeight: '700', color: Colors.text_white },
  ddCheck:       { fontSize: F.f16, color: Colors.primary, fontWeight: '700' },

  revCard: {
    backgroundColor: Colors.card_bg, borderRadius: 16,
    borderWidth: 0.5, borderColor: Colors.border, overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  revCardHdr: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: Colors.card_header_bg,
  },
  revCardIconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#b8b8b8',
  },
  revCardIcon:  { width: 30, height: 30 },
  revCardTitle: { color: Colors.text_dark, fontSize: F.f14, fontWeight: '600' },
  revCardSub:   { color: Colors.header_dark, fontSize: F.f11, marginTop: 1 },
  cardDivider:  { height: 0.5, backgroundColor: Colors.border },
  revCardBody:  { padding: 14, gap: 10 },

  totalBadge: {
    backgroundColor: Colors.primary_light, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 0.5, borderColor: Colors.primary_border,
  },
  totalBadgeText: { color: Colors.primary, fontSize: F.f13, fontWeight: '600' },

  propRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.input_bg, borderRadius: 10,
    padding: 10, paddingHorizontal: 12,
    borderWidth: 0.5, borderColor: Colors.border,
  },
  propRowIcon: {
    width: 30, height: 30, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, borderWidth: 1, borderColor: '#b8b8b8',
  },
  propRowIconImg: { width: 30, height: 30 },
  propRowMid:     { flex: 1, gap: 3 },
  propRowName:    { fontSize: F.f13, fontWeight: '500', color: Colors.text_dark },
  propBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary_light, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 1,
    borderWidth: 0.5, borderColor: Colors.primary_border,
  },
  propBadgeText: { fontSize: F.f10, fontWeight: '600', color: Colors.primary },
  progTrack: {
    height: 4, backgroundColor: Colors.border_light,
    borderRadius: 4, overflow: 'hidden', marginTop: 4,
  },
  progFill:     { height: 4, backgroundColor: Colors.header_dark, borderRadius: 4 },
  propRowRight: { alignItems: 'flex-end', gap: 3 },
  propRowAmt:   { fontSize: F.f14, fontWeight: '600', color: Colors.text_dark },
  dotRow:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.header_dark },
  dotText:      { fontSize: F.f10, color: Colors.header_dark },

  viewBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.header_dark,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14,
  },
  viewBtnText: { color: Colors.text_white, fontSize: F.f14, fontWeight: '600', textAlign: 'center' },

  errorState:  { alignItems: 'center', paddingVertical: 40, gap: 10 },
  errorEmoji:  { fontSize: 34 },
  errorTxt:    { fontSize: F.f13, color: Colors.text_label, textAlign: 'center' },
  retryBtn: {
    backgroundColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: 4,
  },
  retryTxt:    { color: Colors.text_white, fontSize: F.f13, fontWeight: '600' },

  emptyState:  { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji:  { fontSize: 34, marginBottom: 10 },
  emptyTxt:    { fontSize: F.f13, color: Colors.text_label, textAlign: 'center' },
});