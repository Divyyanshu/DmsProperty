import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, Image, ScrollView, Platform, TextInput,
  Modal, Alert, ActivityIndicator,
} from 'react-native';
import { insertNewBooking, updateBooking, getSingleBooking } from '../../Api/ApiService';

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const Colors = {
  bg_dark:        '#0F172A',
  primary:        '#F59E0B',
  text_white:     '#F1F5F9',
  text_grey:      '#94A3B8',
  text_dark:      '#1E293B',
  text_label:     '#64748B',
  inputBgColor:   '#F1F5F9',
  inputBorder:    '#E2E8F0',
  inputIcon:      '#94A3B8',
  card_bg:        '#FFFFFF',
  gold_icon_bg:   '#F59E0B',
  dark_icon_bg:   '#1E293B',
  page_bg:        '#EEF0F6',
  divider:        '#E2E8F0',
  chip_bg:        '#F1F5F9',
  chip_active_bg: '#0F172A',
  gender_bg:      '#E8ECF4',
  red_text:       '#EF4444',
  red_bg:         'rgba(239,68,68,0.12)',
  dot_available:  '#22C55E',
  dot_sold:       '#EF4444',
};

const F = {
  f11: 11, f12: 12, f13: 13, f14: 14,
  f15: 15, f16: 16, f18: 18, f20: 20, f22: 22,
};

const CATEGORIES = [
  { key: 'farmhouse', label: 'Farmhouse', emoji: '🌾' },
  { key: 'airbnb',    label: 'Airbnb',    emoji: '🏠' },
];

const PROPERTIES = {
  farmhouse: [
    { key: 'f1', label: 'Grey Stone', badge: 'Farmhouse', emoji: '🌾' },
    { key: 'f2', label: 'SkyStone',   badge: 'Farmhouse', emoji: '🌾' },
  ],
  airbnb: [
    { key: 'a1', label: 'Topaz',    badge: '2 BHK', emoji: '🔷' },
    { key: 'a2', label: 'Ruby',     badge: '1 BHK', emoji: '🔴' },
    { key: 'a3', label: 'Sapphire', badge: '1 BHK', emoji: '💙' },
  ],
};

const HOST_OPTIONS = [
  { key: 'chetan', label: 'Chetan', emoji: '👤' },
  { key: 'nitesh', label: 'Nitesh', emoji: '👤' },
  { key: 'manoj',  label: 'Manoj',  emoji: '👤' },
  { key: 'honey',  label: 'Honey',  emoji: '👤' },
];

const RECEIVED_BY_OPTIONS = [
  { key: 'honey',  label: 'Honey',  emoji: '👤' },
  { key: 'chetan', label: 'Chetan', emoji: '👤' },
  { key: 'nitesh', label: 'Nitesh', emoji: '👤' },
  { key: 'manoj',  label: 'Manoj',  emoji: '👤' },
];

const BOOKING_SOURCE_OPTIONS = [
  { key: 'airbnb',  label: 'Airbnb',      emoji: '🏠' },
  { key: 'booking', label: 'Booking.com', emoji: '🌐' },
  { key: 'agoda',   label: 'Agoda',       emoji: '🟡' },
  { key: 'mmt',     label: 'MMT',         emoji: '✈️' },
  { key: 'other',   label: 'Other',       emoji: '📋' },
];

const CUSTOMER_ICON_BG = { farmhouse: Colors.gold_icon_bg, airbnb: Colors.gold_icon_bg };
const CUSTOMER_EMOJI   = { farmhouse: '🌾', airbnb: '🏠' };

// ─────────────────────────────────────────────────────────────────────────────
// 2. AVAILABILITY
// ─────────────────────────────────────────────────────────────────────────────

const availKey = (year, month, day) => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const buildAvailability = (soldPatterns) => {
  const result = {};
  const now = new Date();
  const currentYear = now.getFullYear();
  [currentYear, currentYear + 1].forEach((yr) => {
    soldPatterns.forEach(({ month, days }) => {
      days.forEach((day) => {
        const mm = String(month).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        result[`${yr}-${mm}-${dd}`] = 'sold';
      });
    });
  });
  return result;
};

const FARMHOUSE_AVAILABILITY = buildAvailability([
  { month: 1,  days: [1,2,3,4,5,10,11,12,17,18,19,24,25,26,31] },
  { month: 2,  days: [1,2,7,8,9,14,15,16,21,22,23,28] },
  { month: 3,  days: [1,2,7,8,9,14,15,16,21,22,23,28,29,30] },
  { month: 4,  days: [4,5,6,11,12,13,18,19,20,25,26,27] },
  { month: 5,  days: [1,2,3,9,10,11,16,17,18,23,24,25,30,31] },
  { month: 6,  days: [1,6,7,8,13,14,15,20,21,22,27,28,29] },
  { month: 7,  days: [4,5,6,11,12,13,18,19,20,25,26,27] },
  { month: 8,  days: [1,2,3,8,9,10,15,16,17,22,23,24,29,30,31] },
  { month: 9,  days: [5,6,7,12,13,14,19,20,21,26,27,28] },
  { month: 10, days: [3,4,5,10,11,12,17,18,19,24,25,26,31] },
  { month: 11, days: [1,2,7,8,9,14,15,16,21,22,23,28,29,30] },
  { month: 12, days: [5,6,7,12,13,14,19,20,21,24,25,26,27,28,31] },
]);

const AIRBNB_AVAILABILITY = buildAvailability([
  { month: 1,  days: [2,3,6,7,8,13,14,15,20,21,22,27,28,29] },
  { month: 2,  days: [3,4,5,10,11,12,17,18,19,24,25,26] },
  { month: 3,  days: [3,4,5,10,11,12,17,18,19,24,25,26,31] },
  { month: 4,  days: [1,2,7,8,9,14,15,16,21,22,23,28,29,30] },
  { month: 5,  days: [1,5,6,7,12,13,14,19,20,21,26,27,28] },
  { month: 6,  days: [2,3,4,9,10,11,16,17,18,23,24,25,30] },
  { month: 7,  days: [1,2,7,8,9,14,15,16,21,22,23,28,29,30] },
  { month: 8,  days: [4,5,6,11,12,13,18,19,20,25,26,27] },
  { month: 9,  days: [1,2,3,8,9,10,15,16,17,22,23,24,29,30] },
  { month: 10, days: [1,6,7,8,13,14,15,20,21,22,27,28,29] },
  { month: 11, days: [3,4,5,10,11,12,17,18,19,24,25,26] },
  { month: 12, days: [1,2,3,8,9,10,15,16,17,22,23,24,25,26,29,30,31] },
]);

// ─────────────────────────────────────────────────────────────────────────────
// 3. CALENDAR PICKER
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_SHORT  = ['S','M','T','W','T','F','S'];
const MONTHS_LONG = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const CalendarPicker = ({ visible, selectedDate, onSelect, onClear, onClose, availability = {} }) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    if (visible) {
      const base = selectedDate ? parseDate(selectedDate) : today;
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
    }
  }, [visible]);

  const parseDate = (str) => {
    const [dd, mm, yyyy] = str.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

  const goMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m > 11) { m = 0;  y++; }
    if (m <  0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const buildGrid = () => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev   = new Date(viewYear, viewMonth, 0).getDate();
    const cells        = [];
    for (let i = firstWeekday - 1; i >= 0; i--)
      cells.push({ day: daysInPrev - i, cur: false });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ day: d, cur: true });
    while (cells.length % 7 !== 0 || cells.length < 35)
      cells.push({ day: cells.length - daysInMonth - firstWeekday + 1, cur: false });
    return cells;
  };

  const cells = buildGrid();

  const isSelected = (cell) => {
    if (!cell.cur || !selectedDate) return false;
    const s = parseDate(selectedDate);
    return s.getDate() === cell.day && s.getMonth() === viewMonth && s.getFullYear() === viewYear;
  };

  const isToday = (cell) => {
    if (!cell.cur) return false;
    return cell.day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  };

  const getAvailStatus = (day) => {
    const key = availKey(viewYear, viewMonth, day);
    return availability[key] || 'available';
  };

  const handleSelect = (cell) => {
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={calSt.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={calSt.card}>
        <View style={calSt.headerRow}>
          <TouchableOpacity style={calSt.monthBtn} activeOpacity={0.7}>
            <Text style={calSt.monthText}>{MONTHS_LONG[viewMonth]} {viewYear}</Text>
            <Text style={calSt.monthArrow}>▾</Text>
          </TouchableOpacity>
          <View style={calSt.navBtns}>
            <TouchableOpacity style={calSt.navBtn} onPress={() => goMonth(-1)} activeOpacity={0.7}>
              <Text style={calSt.navArrow}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={calSt.navBtn} onPress={() => goMonth(1)} activeOpacity={0.7}>
              <Text style={calSt.navArrow}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={calSt.dayLabelRow}>
          {DAYS_SHORT.map((d, i) => <Text key={i} style={calSt.dayLabel}>{d}</Text>)}
        </View>
        <View style={calSt.grid}>
          {cells.map((cell, i) => {
            const sel    = isSelected(cell);
            const tod    = isToday(cell) && !sel;
            const status = cell.cur ? getAvailStatus(cell.day) : null;
            const isSold = status === 'sold';
            return (
              <TouchableOpacity
                key={i}
                style={[calSt.cell, sel && calSt.cellSelected, isSold && calSt.cellSoldOut]}
                onPress={() => { if (!cell.cur || isSold) return; handleSelect(cell); }}
                activeOpacity={cell.cur && !isSold ? 0.7 : 1}
                disabled={isSold}
              >
                <Text style={[
                  calSt.cellText,
                  !cell.cur && calSt.cellTextOther,
                  tod        && calSt.cellTextToday,
                  sel        && calSt.cellTextSel,
                  isSold     && calSt.cellTextSold,
                ]}>
                  {cell.day}
                </Text>
                {cell.cur && (
                  <View style={[calSt.dot, { backgroundColor: isSold ? Colors.dot_sold : Colors.dot_available }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={calSt.legend}>
          <View style={calSt.legendItem}>
            <View style={[calSt.legendDot, { backgroundColor: Colors.dot_available }]} />
            <Text style={calSt.legendText}>Available</Text>
          </View>
          <View style={calSt.legendItem}>
            <View style={[calSt.legendDot, { backgroundColor: Colors.dot_sold }]} />
            <Text style={calSt.legendText}>Sold Out</Text>
          </View>
        </View>
        <View style={calSt.footer}>
          <TouchableOpacity onPress={() => { onClear(); onClose(); }} activeOpacity={0.7}>
            <Text style={calSt.footerClear}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToday} activeOpacity={0.7}>
            <Text style={calSt.footerToday}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. MODAL DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const ModalDropdown = ({ placeholder, value, onChange, items, label }) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {label && <FieldLabel text={label} />}
      <TouchableOpacity style={mdropSt.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={value ? mdropSt.selectedText : mdropSt.placeholder} numberOfLines={1}>
          {value ? `${value.emoji}  ${value.label}` : placeholder}
        </Text>
        <Text style={mdropSt.arrow}>▼</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={mdropSt.backdrop} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={mdropSt.modalCard}>
          <View style={mdropSt.modalHeader}>
            <Text style={mdropSt.modalTitle}>{placeholder}</Text>
            <TouchableOpacity onPress={() => setOpen(false)} activeOpacity={0.7} style={mdropSt.closeBtn}>
              <Text style={mdropSt.closeX}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            {items.map((item, idx) => {
              const isSelected = value?.key === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[mdropSt.item, idx < items.length - 1 && mdropSt.itemBorder, isSelected && mdropSt.itemActive]}
                  onPress={() => { onChange(item); setOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={mdropSt.itemEmoji}>{item.emoji}</Text>
                  <Text style={[mdropSt.itemLabel, isSelected && mdropSt.itemLabelActive]}>{item.label}</Text>
                  {isSelected && <Text style={mdropSt.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const SectionCard = ({ iconEmoji, iconBg = Colors.dark_icon_bg, title, children }) => (
  <View style={sectionCardSt.card}>
    <View style={sectionCardSt.headerRow}>
      <View style={[sectionCardSt.iconBox, { backgroundColor: iconBg }]}>
        <Text style={sectionCardSt.iconEmoji}>{iconEmoji}</Text>
      </View>
      <Text style={sectionCardSt.title}>{title}</Text>
      <View style={sectionCardSt.dividerLine} />
    </View>
    <View style={sectionCardSt.content}>{children}</View>
  </View>
);

const FieldLabel = ({ text, required }) => (
  <View style={fieldLabelSt.row}>
    <View style={fieldLabelSt.dot} />
    <Text style={fieldLabelSt.text}>{text}{required ? ' *' : ''}</Text>
  </View>
);

const FormInput = ({ placeholder, value, onChangeText, icon, keyboardType, multiline, numberOfLines, style }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[inputSt.wrapper, focused && inputSt.wrapperFocused, multiline && inputSt.wrapperMultiline, style]}>
      {icon && <Image source={icon} style={inputSt.icon} resizeMode="contain" />}
      <TextInput
        style={[inputSt.input, multiline && inputSt.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor={Colors.text_grey}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

const HalfDateInput = ({ label, val, onChange, availability }) => {
  const [calOpen, setCalOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <FieldLabel text={label} />
      <TouchableOpacity style={inputSt.wrapper} onPress={() => setCalOpen(true)} activeOpacity={0.8}>
        <Text style={{ flex: 1, color: val ? Colors.text_dark : Colors.text_grey, fontSize: F.f13 }}>
          {val || 'dd/mm/yyyy'}
        </Text>
        <Image source={require('../../Assets/icons/calendar.png')} style={inputSt.calIcon} resizeMode="contain" />
      </TouchableOpacity>
      <CalendarPicker
        visible={calOpen}
        selectedDate={val}
        onSelect={onChange}
        onClear={() => onChange('')}
        onClose={() => setCalOpen(false)}
        availability={availability}
      />
    </View>
  );
};

const DateRow = ({ leftLabel, rightLabel, leftVal, rightVal, onLeftChange, onRightChange, availability }) => (
  <View style={{ flexDirection: 'row', gap: 10 }}>
    <HalfDateInput label={leftLabel}  val={leftVal}  onChange={onLeftChange}  availability={availability} />
    <HalfDateInput label={rightLabel} val={rightVal} onChange={onRightChange} availability={availability} />
  </View>
);

const AmountInput = ({ value, onChangeText, placeholder, readOnly }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[inputSt.wrapper, focused && !readOnly && inputSt.wrapperFocused, amtSt.wrapperOverride, readOnly && amtSt.wrapperReadOnly]}>
      <View style={[amtSt.prefix, readOnly && amtSt.prefixReadOnly]}>
        <Text style={[amtSt.symbol, readOnly && amtSt.symbolReadOnly]}>₹</Text>
      </View>
      <TextInput
        style={[inputSt.input, amtSt.inputOverride, readOnly && amtSt.inputReadOnly]}
        placeholder={placeholder || 'Enter Amount'}
        placeholderTextColor={Colors.text_grey}
        value={value}
        onChangeText={readOnly ? undefined : onChangeText}
        keyboardType="numeric"
        editable={!readOnly}
        onFocus={() => !readOnly && setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {readOnly && (
        <View style={amtSt.readOnlyBadge}>
          <Text style={amtSt.readOnlyText}>AUTO</Text>
        </View>
      )}
    </View>
  );
};

const CustomDropdown = ({ placeholder, selected, items, onSelect, open, onToggle }) => (
  <View>
    <TouchableOpacity style={[dropSt.trigger, open && dropSt.triggerOpen]} onPress={onToggle} activeOpacity={0.8}>
      <Text style={selected ? dropSt.selectedText : dropSt.placeholder}>
        {selected ? `${selected.emoji}  ${selected.label}` : placeholder}
      </Text>
      <Text style={[dropSt.arrow, open && dropSt.arrowUp]}>▼</Text>
    </TouchableOpacity>
    {open && (
      <View style={dropSt.list}>
        {items.map((item, idx) => (
          <TouchableOpacity
            key={item.key}
            style={[dropSt.item, idx < items.length - 1 && dropSt.itemBorder]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={dropSt.itemEmoji}>{item.emoji}</Text>
            <Text style={dropSt.itemLabel}>{item.label}</Text>
            {item.badge && <Text style={dropSt.itemBadge}>{item.badge}</Text>}
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const NewBookingScreen = ({ navigation, route }) => {

  // ── Edit Mode Detection ───────────────────────────────────────────────────
  // ReportsScreen se aayega: navigation.navigate('NewBookingScreen', { bookingId: 'DC6A...' })
  const editBookingId = route?.params?.bookingId || null;
  const isEditMode    = !!editBookingId;

  // ── Loading States ────────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(false);
  const [prefilling,   setPrefilling]   = useState(false); // edit mode fetch loader

  // ── Category & Property ───────────────────────────────────────────────────
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [selectedCat,  setSelectedCat]  = useState(null);
  const [selectedProp, setSelectedProp] = useState(null);

  // ── Customer Info ─────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [mobile,   setMobile]   = useState('');
  const [email,    setEmail]    = useState('');

  // ── Booking Fields ────────────────────────────────────────────────────────
  const [host,          setHost]          = useState(null);
  const [bookingSource, setBookingSource] = useState(null);
  const [checkIn,       setCheckIn]       = useState('');
  const [checkOut,      setCheckOut]      = useState('');
  const [guests,        setGuests]        = useState('');
  const [adults,        setAdults]        = useState('');
  const [children,      setChildren]      = useState('');
  const [specialReq,    setSpecialReq]    = useState('');
  const [dealAmount,    setDealAmount]    = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [receivedBy,    setReceivedBy]    = useState(null);

  // ── Auto Balance ──────────────────────────────────────────────────────────
  useEffect(() => {
    const deal    = parseFloat(dealAmount)    || 0;
    const advance = parseFloat(advanceAmount) || 0;
    if (!dealAmount && !advanceAmount) {
      setBalanceAmount('');
    } else {
      setBalanceAmount(String(Math.max(deal - advance, 0)));
    }
  }, [dealAmount, advanceAmount]);

  // ── Edit Mode: Fetch & Pre-fill ───────────────────────────────────────────
  useEffect(() => {
    if (isEditMode) {
      prefillForm(editBookingId);
    }
  }, [editBookingId]);

  // API se data fetch karke form mein fill karo
  const prefillForm = async (id) => {
    try {
      setPrefilling(true);
      const result = await getSingleBooking(id);

      if (!result.success) {
        Alert.alert('❌ Error', result.message || 'Booking data nahi mila');
        return;
      }

      const d = result.data;

      // ── Category match karo ───────────────────────────────────────────────
      const matchedCat = CATEGORIES.find(
        c => c.label.toLowerCase() === (d.Category || '').toLowerCase()
      ) || null;
      setSelectedCat(matchedCat);

      // ── Property match karo ───────────────────────────────────────────────
      if (matchedCat) {
        const propList = PROPERTIES[matchedCat.key] || [];
        const matchedProp = propList.find(
          p => p.label.toLowerCase() === (d.PropertyName || '').toLowerCase()
        ) || null;
        setSelectedProp(matchedProp);
      }

      // ── Customer fields ───────────────────────────────────────────────────
      setFullName(d.FullName      || '');
      setMobile(d.MobileNumber    || '');
      setEmail(d.EmailId          || '');

      // ── Booking fields ────────────────────────────────────────────────────
      setCheckIn(apiDateToDisplay(d.CheckInDate));
      setCheckOut(apiDateToDisplay(d.CheckOutDate));
      setGuests(String(d.NoOfGuest   || ''));
      setAdults(String(d.Adults      || ''));
      setChildren(String(d.Children  || ''));
      setSpecialReq(d.SpecialRequest || '');
      setDealAmount(String(d.DealAmount    || ''));
      setAdvanceAmount(String(d.AdvanceAmount || ''));
      // balance auto calculate hoga useEffect se

      // ── Dropdown fields — key se match karo ──────────────────────────────
      setHost(
        HOST_OPTIONS.find(h => h.label.toLowerCase() === (d.Host || '').toLowerCase()) || null
      );
      setBookingSource(
        BOOKING_SOURCE_OPTIONS.find(s => s.label.toLowerCase() === (d.BookingSource || '').toLowerCase()) || null
      );
      setReceivedBy(
        RECEIVED_BY_OPTIONS.find(r => r.label.toLowerCase() === (d.ReceivedBy || '').toLowerCase()) || null
      );

    } catch (err) {
      console.log('❌ prefillForm error:', err);
      Alert.alert('Error', 'Form fill karte waqt error aaya');
    } finally {
      setPrefilling(false);
    }
  };

  // ── Date Helpers ──────────────────────────────────────────────────────────

  // API format (2026-05-25) → Display format (25/05/2026)
  const apiDateToDisplay = (apiDate) => {
    if (!apiDate) return '';
    const parts = apiDate.split('T')[0].split('-'); // handle ISO strings too
    if (parts.length !== 3) return '';
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  // Display format (25/05/2026) → API format (2026-05-25)
  const formatDateForApi = (date) => {
    if (!date) return '';
    const parts = date.split('/');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // ── Reset Form ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setSelectedCat(null); setSelectedProp(null);
    setFullName('');      setMobile('');        setEmail('');
    setHost(null);        setBookingSource(null);
    setCheckIn('');       setCheckOut('');
    setGuests('');        setAdults('');         setChildren('');
    setSpecialReq('');
    setDealAmount('');    setAdvanceAmount('');  setBalanceAmount('');
    setReceivedBy(null);
  };

  // ── Category / Property Select ────────────────────────────────────────────
  const handleCategorySelect = (cat) => {
    setSelectedCat(cat);
    setSelectedProp(null);
    setCategoryOpen(false);
    setPropertyOpen(false);
  };

  const handlePropertySelect = (prop) => {
    setSelectedProp(prop);
    setPropertyOpen(false);
  };

  // ── Submit (Insert OR Update) ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!fullName.trim() || !mobile.trim()) {
      Alert.alert('⚠️ Validation Error', 'Full Name aur Mobile Number required hai!');
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        Category:       selectedCat?.label  || '',
        PropertyName:   selectedProp?.label || '',
        FullName:       fullName,
        MobileNumber:   mobile,
        EmailId:        email,
        Host:           host?.label          || '',
        BookingSource:  bookingSource?.label || '',
        CheckInDate:    formatDateForApi(checkIn),
        CheckOutDate:   formatDateForApi(checkOut),
        NoOfGuest:      guests,
        Adults:         adults,
        Children:       children,
        SpecialRequest: specialReq,
        DealAmount:     dealAmount,
        AdvanceAmount:  advanceAmount,
        BalanceAmount:  balanceAmount,
        ReceivedBy:     receivedBy?.label || '',
        BookingStatus:  'Confirmed',
      };

      let result;

      if (isEditMode) {
        // ── UPDATE MODE ───────────────────────────────────────────────────
        result = await updateBooking({
          ...bookingData,
          Id: editBookingId,   // ✅ GUID must for update
        });
      } else {
        // ── INSERT MODE ───────────────────────────────────────────────────
        result = await insertNewBooking(bookingData);
      }

      if (result.success) {
        Alert.alert(
          isEditMode ? '✅ Updated!' : '✅ Booking Successful',
          isEditMode ? 'Booking successfully update ho gayi!' : 'Booking successfully add ho gayi!',
          [{
            text: 'View Records',
            onPress: () => {
              resetForm();
              navigation.navigate('ReportsScreen', { activeTab: 'Subscription' });
            },
          }],
          { cancelable: false }
        );
      } else {
        Alert.alert('❌ Error', result.message || 'Kuch galat hua, dobara try karo.');
      }

    } catch (error) {
      console.log('❌ Submit Error:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const catKey       = selectedCat?.key || '';
  const formUnlocked = selectedCat !== null && selectedProp !== null;

  const submitLabel = isEditMode
    ? 'Update Booking'
    : catKey === 'farmhouse' ? 'Confirm Farmhouse Booking'
    : catKey === 'airbnb'    ? 'Confirm Airbnb Booking'
    : 'Submit Booking';

  const activeAvailability =
    catKey === 'farmhouse' ? FARMHOUSE_AVAILABILITY :
    catKey === 'airbnb'    ? AIRBNB_AVAILABILITY    : {};

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={screenSt.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* HEADER */}
      <View style={screenSt.header}>
        <TouchableOpacity style={screenSt.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Image source={require('../../Assets/icons/ak.png')} style={screenSt.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <View style={screenSt.headerTitleBlock}>
          <Text style={screenSt.headerTitle}>
            {isEditMode ? 'Edit Booking' : 'New Booking'}
          </Text>
          <Text style={screenSt.headerSubtitle}>
            {isEditMode ? 'Update booking details' : 'Fill in booking details'}
          </Text>
        </View>
        {/* Edit mode badge */}
        {isEditMode && (
          <View style={screenSt.editBadge}>
            <Text style={screenSt.editBadgeText}>EDIT</Text>
          </View>
        )}
        <View style={screenSt.circle1} />
        <View style={screenSt.goldLine} />
      </View>

      {/* PRE-FILL LOADER */}
      {prefilling && (
        <View style={screenSt.prefillingBanner}>
          <ActivityIndicator color={Colors.primary} size="small" />
          <Text style={screenSt.prefillingText}>Loading booking data...</Text>
        </View>
      )}

      <ScrollView
        style={screenSt.body}
        contentContainerStyle={[screenSt.bodyContent, { paddingBottom: 70 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* SECTION 1: CATEGORY & PROPERTY */}
        <SectionCard iconEmoji="🏷️" iconBg={Colors.gold_icon_bg} title="SELECT CATEGORY & PROPERTY">
          <View>
            <FieldLabel text="CATEGORY" />
            <CustomDropdown
              placeholder="Choose a category..."
              selected={selectedCat}
              items={CATEGORIES}
              open={categoryOpen}
              onToggle={() => { setCategoryOpen(!categoryOpen); setPropertyOpen(false); }}
              onSelect={handleCategorySelect}
            />
          </View>
          {selectedCat !== null && (
            <View>
              <FieldLabel text={`${selectedCat.label.toUpperCase()} PROPERTY`} />
              <CustomDropdown
                placeholder="Choose a property..."
                selected={selectedProp}
                items={PROPERTIES[selectedCat.key] || []}
                open={propertyOpen}
                onToggle={() => { setPropertyOpen(!propertyOpen); setCategoryOpen(false); }}
                onSelect={handlePropertySelect}
              />
            </View>
          )}
        </SectionCard>

        {formUnlocked && (
          <>
            {/* SECTION 2: CUSTOMER INFO */}
            <SectionCard iconEmoji={CUSTOMER_EMOJI[catKey] || '👤'} iconBg={CUSTOMER_ICON_BG[catKey] || Colors.gold_icon_bg} title="CUSTOMER INFORMATION">
              <View>
                <FieldLabel text="FULL NAME" required />
                <FormInput placeholder="Enter full name" value={fullName} onChangeText={setFullName} icon={require('../../Assets/icons/members.png')} />
              </View>
              <View>
                <FieldLabel text="MOBILE NUMBER" required />
                <FormInput placeholder="Enter mobile number" value={mobile} onChangeText={setMobile} icon={require('../../Assets/icons/mobile.png')} keyboardType="phone-pad" />
              </View>
              <View>
                <FieldLabel text="EMAIL ID (Optional)" />
                <FormInput placeholder="Enter email address" value={email} onChangeText={setEmail} icon={require('../../Assets/icons/mail.png')} keyboardType="email-address" />
              </View>
            </SectionCard>

            {/* FARMHOUSE SECTION */}
            {catKey === 'farmhouse' && (
              <SectionCard iconEmoji="📅" iconBg={Colors.gold_icon_bg} title="BOOKING & PAYMENT">
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <ModalDropdown label="HOST" placeholder="Select Host" items={HOST_OPTIONS} value={host} onChange={setHost} />
                  <ModalDropdown label="BOOKING SOURCE" placeholder="Select Source" items={BOOKING_SOURCE_OPTIONS} value={bookingSource} onChange={setBookingSource} />
                </View>
                <DateRow
                  leftLabel="CHECK-IN" rightLabel="CHECK-OUT"
                  leftVal={checkIn} rightVal={checkOut}
                  onLeftChange={setCheckIn} onRightChange={setCheckOut}
                  availability={activeAvailability}
                />
                <View>
                  <FieldLabel text="NO. OF GUESTS" />
                  <FormInput placeholder="Number of guests" value={guests} onChangeText={setGuests} icon={require('../../Assets/icons/members.png')} keyboardType="numeric" />
                </View>
                <View>
                  <ModalDropdown label="AMOUNT RECEIVED BY" placeholder="Select Person" items={RECEIVED_BY_OPTIONS} value={receivedBy} onChange={setReceivedBy} />
                </View>
                <View>
                  <FieldLabel text="DEAL AMOUNT" />
                  <AmountInput value={dealAmount} onChangeText={setDealAmount} placeholder="Enter Deal Amount" />
                </View>
                <View>
                  <FieldLabel text="ADVANCE AMOUNT" />
                  <AmountInput value={advanceAmount} onChangeText={setAdvanceAmount} placeholder="Enter Advance Amount" />
                </View>
                <View>
                  <FieldLabel text="BALANCE AMOUNT" />
                  <AmountInput value={balanceAmount} placeholder="Auto Calculated" readOnly />
                  {(dealAmount || advanceAmount) && (
                    <View style={balanceSt.hint}>
                      <Text style={balanceSt.hintText}>
                        ₹{parseFloat(dealAmount) || 0} Deal − ₹{parseFloat(advanceAmount) || 0} Advance = ₹{balanceAmount || 0}
                      </Text>
                    </View>
                  )}
                </View>
              </SectionCard>
            )}

            {/* AIRBNB SECTIONS */}
            {catKey === 'airbnb' && (
              <>
                <SectionCard iconEmoji="📅" iconBg={Colors.gold_icon_bg} title="BOOKING & STAY DETAILS">
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <ModalDropdown label="HOST" placeholder="Select Host" items={HOST_OPTIONS} value={host} onChange={setHost} />
                    <ModalDropdown label="BOOKING SOURCE" placeholder="Select Source" items={BOOKING_SOURCE_OPTIONS} value={bookingSource} onChange={setBookingSource} />
                  </View>
                  <DateRow
                    leftLabel="CHECK-IN" rightLabel="CHECK-OUT"
                    leftVal={checkIn} rightVal={checkOut}
                    onLeftChange={setCheckIn} onRightChange={setCheckOut}
                    availability={activeAvailability}
                  />
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <FieldLabel text="ADULTS" />
                      <FormInput placeholder="Adults" value={adults} onChangeText={setAdults} keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FieldLabel text="CHILDREN" />
                      <FormInput placeholder="Children" value={children} onChangeText={setChildren} keyboardType="numeric" />
                    </View>
                  </View>
                  <View>
                    <FieldLabel text="NO. OF GUESTS" />
                    <FormInput placeholder="Number of guests" value={guests} onChangeText={setGuests} icon={require('../../Assets/icons/members.png')} keyboardType="numeric" />
                  </View>
                  <View>
                    <FieldLabel text="SPECIAL REQUESTS" />
                    <FormInput placeholder="Early check-in, extra pillows..." value={specialReq} onChangeText={setSpecialReq} multiline numberOfLines={3} />
                  </View>
                </SectionCard>

                <SectionCard iconEmoji="💰" iconBg={Colors.gold_icon_bg} title="PAYMENT DETAILS">
                  <View>
                    <ModalDropdown label="AMOUNT RECEIVED BY" placeholder="Select Person" items={RECEIVED_BY_OPTIONS} value={receivedBy} onChange={setReceivedBy} />
                  </View>
                  <View>
                    <FieldLabel text="DEAL AMOUNT" />
                    <AmountInput value={dealAmount} onChangeText={setDealAmount} placeholder="Enter Deal Amount" />
                  </View>
                  <View>
                    <FieldLabel text="ADVANCE AMOUNT" />
                    <AmountInput value={advanceAmount} onChangeText={setAdvanceAmount} placeholder="Enter Advance Amount" />
                  </View>
                  <View>
                    <FieldLabel text="BALANCE AMOUNT" />
                    <AmountInput value={balanceAmount} placeholder="Auto Calculated" readOnly />
                    {(dealAmount || advanceAmount) && (
                      <View style={balanceSt.hint}>
                        <Text style={balanceSt.hintText}>
                          ₹{parseFloat(dealAmount) || 0} Deal − ₹{parseFloat(advanceAmount) || 0} Advance = ₹{balanceAmount || 0}
                        </Text>
                      </View>
                    )}
                  </View>
                </SectionCard>
              </>
            )}

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[screenSt.submitBtn, isEditMode && screenSt.submitBtnEdit, loading && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={loading || prefilling}
            >
              {loading
                ? <ActivityIndicator color={Colors.text_white} size="small" />
                : <Image source={require('../../Assets/icons/check.png')} style={screenSt.submitCheckIcon} resizeMode="contain" />
              }
              <Text style={screenSt.submitText}>
                {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : submitLabel}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NewBookingScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 7. STYLESHEETS
// ─────────────────────────────────────────────────────────────────────────────

const screenSt = StyleSheet.create({
  safeArea:    { flex: 1, backgroundColor: Colors.bg_dark },
  header: {
    backgroundColor:   Colors.bg_dark,
    paddingHorizontal: 20,
    paddingTop:        8,
    paddingBottom:     24,
    flexDirection:     'row',
    alignItems:        'center',
    overflow:          'hidden',
    marginTop:         27,
  },
  backBtn: {
    width:           40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems:      'center', justifyContent: 'center',
    marginRight:     14, zIndex: 2,
  },
  backIcon:         { width: 18, height: 18, tintColor: Colors.text_white },
  headerTitleBlock: { flex: 1, zIndex: 2 },
  headerTitle:      { color: Colors.text_white, fontSize: F.f18, fontWeight: 'bold', marginBottom: 3 },
  headerSubtitle:   { color: Colors.text_grey,  fontSize: F.f13 },

  // ── Edit mode badge ──────────────────────────────────────────────────────
  editBadge: {
    backgroundColor:   Colors.primary,
    borderRadius:      8,
    paddingHorizontal: 10,
    paddingVertical:   4,
    zIndex:            2,
  },
  editBadgeText: { color: Colors.bg_dark, fontSize: F.f11, fontWeight: '800', letterSpacing: 1 },

  circle1: {
    position:        'absolute', width: 140, height: 140, borderRadius: 110,
    backgroundColor: Colors.bg_dark, top: -30, right: -40,
    borderColor:     'rgba(202,156,41,0.12)', borderWidth: 25,
  },
  goldLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: Colors.primary },

  // ── Pre-fill loader banner ───────────────────────────────────────────────
  prefillingBanner: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    backgroundColor:   '#FFFDF5',
    paddingVertical:   10,
    gap:               8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3D99A',
  },
  prefillingText: { color: Colors.primary, fontSize: F.f13, fontWeight: '600' },

  body:        { flex: 1, backgroundColor: Colors.page_bg },
  bodyContent: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 30 },

  submitBtn: {
    backgroundColor: Colors.bg_dark,
    borderRadius:    14,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 18,
    marginTop:       6,
    gap:             10,
  },
  // ── Update button — amber color ──────────────────────────────────────────
  submitBtnEdit:    { backgroundColor: '#D97706' },
  submitCheckIcon:  { width: 22, height: 22, tintColor: Colors.primary },
  submitText:       { color: Colors.text_white, fontSize: F.f16, fontWeight: '700', letterSpacing: 0.3 },
});

const sectionCardSt = StyleSheet.create({
  card: {
    backgroundColor: Colors.card_bg, borderRadius: 16, marginBottom: 14,
    ...Platform.select({
      ios:     { shadowColor: '#B0B8C8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.13, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  headerRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 10 },
  iconBox:     { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconEmoji:   { fontSize: 15 },
  title:       { color: Colors.text_dark, fontSize: F.f13, fontWeight: '800', letterSpacing: 1 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.divider, marginLeft: 4 },
  content:     { paddingHorizontal: 14, paddingBottom: 16, gap: 14 },
});

const fieldLabelSt = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  dot:  { width: 4, height: 4, borderRadius: 3, backgroundColor: Colors.primary },
  text: { color: Colors.text_label, fontSize: F.f11, fontWeight: '700', letterSpacing: 0.8 },
});

const inputSt = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.inputBgColor, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.inputBorder,
    paddingHorizontal: 12, minHeight: 52,
  },
  wrapperFocused:   { borderColor: Colors.primary, backgroundColor: '#FFFDF5' },
  wrapperMultiline: { alignItems: 'flex-start', paddingVertical: 12, minHeight: 100 },
  icon:             { width: 18, height: 18, tintColor: Colors.inputIcon, marginRight: 10 },
  calIcon:          { width: 18, height: 18, tintColor: Colors.bg_dark },
  input:            { flex: 1, color: Colors.text_dark, fontSize: F.f14, padding: 0 },
  inputMultiline:   { textAlignVertical: 'top', lineHeight: 20 },
});

const amtSt = StyleSheet.create({
  wrapperOverride:  { paddingHorizontal: 0 },
  wrapperReadOnly:  { backgroundColor: '#F8FFF4', borderColor: '#86EFAC', borderStyle: 'dashed' },
  prefixReadOnly:   { backgroundColor: '#DCFCE7' },
  symbolReadOnly:   { color: '#16A34A' },
  inputReadOnly:    { color: '#15803D', fontWeight: '700' },
  readOnlyBadge:    { marginRight: 10, backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  readOnlyText:     { color: '#16A34A', fontSize: F.f11, fontWeight: '700', letterSpacing: 0.5 },
  prefix: {
    width: 44, alignSelf: 'stretch',
    backgroundColor: '#FFF8E6',
    borderTopLeftRadius: 10, borderBottomLeftRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderRightWidth: 1, borderRightColor: Colors.inputBorder,
  },
  symbol:        { color: Colors.primary, fontSize: F.f18, fontWeight: '700' },
  inputOverride: { paddingHorizontal: 12 },
});

const balanceSt = StyleSheet.create({
  hint:     { marginTop: 5, paddingHorizontal: 4 },
  hintText: { color: Colors.text_grey, fontSize: F.f11, fontWeight: '500', letterSpacing: 0.2 },
});

const dropSt = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.inputBgColor, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.inputBorder,
    paddingHorizontal: 14, height: 52,
  },
  triggerOpen:  { borderColor: Colors.primary, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  placeholder:  { color: Colors.text_grey, fontSize: F.f14 },
  selectedText: { color: Colors.text_dark, fontSize: F.f15, fontWeight: '700' },
  arrow:        { color: Colors.text_grey, fontSize: F.f12 },
  arrowUp:      { transform: [{ rotate: '180deg' }] },
  list: {
    backgroundColor: Colors.card_bg,
    borderTopLeftRadius: 0, borderTopRightRadius: 0,
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    borderWidth: 1.5, borderColor: Colors.primary, borderTopWidth: 0,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  item:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  itemBorder:{ borderBottomWidth: 1, borderBottomColor: Colors.divider },
  itemEmoji: { fontSize: 22 },
  itemLabel: { flex: 1, color: Colors.text_dark, fontSize: F.f15, fontWeight: '700' },
  itemBadge: { color: Colors.text_label, fontSize: F.f13, fontWeight: '500' },
});

const mdropSt = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.inputBgColor, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.inputBorder,
    paddingHorizontal: 12, height: 52,
  },
  placeholder:     { flex: 1, color: Colors.text_grey, fontSize: F.f13 },
  selectedText:    { flex: 1, color: Colors.text_dark, fontSize: F.f13, fontWeight: '700' },
  arrow:           { color: Colors.text_grey, fontSize: F.f11 },
  backdrop:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.40)' },
  modalCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.card_bg,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
    maxHeight: '55%', paddingBottom: 24,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 16 },
      android: { elevation: 16 },
    }),
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  modalTitle:      { color: Colors.text_dark, fontSize: F.f15, fontWeight: '700', letterSpacing: 0.3 },
  closeBtn:        { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.inputBgColor, alignItems: 'center', justifyContent: 'center' },
  closeX:          { color: Colors.text_grey, fontSize: F.f14, fontWeight: '700' },
  item:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, gap: 14 },
  itemBorder:      { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  itemActive:      { backgroundColor: '#FFFDF5' },
  itemEmoji:       { fontSize: 20 },
  itemLabel:       { flex: 1, color: Colors.text_dark, fontSize: F.f15, fontWeight: '500' },
  itemLabelActive: { fontWeight: '700', color: Colors.bg_dark },
  checkmark:       { color: Colors.primary, fontSize: F.f16, fontWeight: '700' },
});

const calSt = StyleSheet.create({
  backdrop:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  card: {
    position: 'absolute', top: '20%', alignSelf: 'center',
    width: 300, backgroundColor: Colors.card_bg, borderRadius: 18, padding: 20,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 14 },
    }),
  },
  headerRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  monthBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthText:    { color: Colors.text_dark, fontSize: F.f16, fontWeight: '700' },
  monthArrow:   { color: Colors.text_grey, fontSize: F.f12 },
  navBtns:      { flexDirection: 'row', gap: 16 },
  navBtn:       { padding: 4 },
  navArrow:     { color: Colors.text_dark, fontSize: F.f18, fontWeight: '300' },
  dayLabelRow:  { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  dayLabel:     { width: 32, textAlign: 'center', color: Colors.text_grey, fontSize: F.f13, fontWeight: '600' },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', rowGap: 4 },
  cell:         { width: 32, height: 42, alignItems: 'center', justifyContent: 'flex-start', borderRadius: 8, paddingTop: 5, gap: 3 },
  cellSelected: { backgroundColor: '#1D6AFF', borderRadius: 10 },
  cellText:     { color: Colors.text_dark, fontSize: F.f14 },
  cellTextOther:{ color: Colors.text_grey },
  cellTextToday:{ color: '#1D6AFF', fontWeight: '700' },
  cellTextSel:  { color: '#FFFFFF', fontWeight: '700' },
  cellTextSold: { color: '#EF4444', opacity: 0.7 },
  cellSoldOut:  { backgroundColor: 'rgba(239,68,68,0.07)', borderRadius: 8 },
  dot:          { width: 6, height: 6, borderRadius: 3 },
  legend:       { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderColor: Colors.inputBorder },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:    { width: 8, height: 8, borderRadius: 4 },
  legendText:   { color: Colors.text_label, fontSize: F.f11, fontWeight: '600' },
  footer:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderColor: Colors.inputBorder },
  footerClear:  { color: '#1D6AFF', fontSize: F.f14, fontWeight: '600' },
  footerToday:  { color: '#1D6AFF', fontSize: F.f14, fontWeight: '600' },
});