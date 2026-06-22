import React, { useState } from 'react';
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
  Alert,
  useWindowDimensions,
} from 'react-native';
import { insertExpense } from '../../Api/ApiService';


const BASE_WIDTH = 375;
const fs = (size, winW) => {
  const ratio = winW / BASE_WIDTH;
  const scaled = size * ratio;
  return clamp(scaled, size * 0.82, size * 1.18);
};
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
const Colors = {
  bg_dark:      '#0F172A',
  primary:      '#F59E0B',
  text_white:   '#F1F5F9',
  text_grey:    '#94A3B8',
  text_dark:    '#1E293B',
  text_label:   '#64748B',
  inputBgColor: '#F1F5F9',
  inputBorder:  '#E2E8F0',
  inputIcon:    '#94A3B8',
  card_bg:      '#FFFFFF',
  page_bg:      '#EEF0F6',
  divider:      '#E2E8F0',
  red_text:     '#EF4444',
  red_bg:       'rgba(239,68,68,0.12)',
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. DATA
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key:    'farmhouse',
    label:  'Farmhouse',
    sub:    '2 properties',
    iconBg: '#FFF3CD',
    icon:   require('../../Assets/icons/stonestays1.png'),
    properties: [
      {
        key:      'greystone',
        label:    'Grey Stone',
        badge:    'Farmhouse',
        iconBg:   '#FFF3CD',
        iconTint: '#92400E',
        icon:     require('../../Assets/icons/Greystone.png'),
      },
      {
        key:      'skystone',
        label:    'Sky Stone',
        badge:    'Farmhouse',
        iconBg:   '#EFF6FF',
        iconTint: '#1D4ED8',
        icon:     require('../../Assets/icons/stonestays1.png'),
      },
    ],
  },
  {
    key:    'airbnb',
    label:  'Airbnb',
    sub:    '3 properties',
    iconBg: '#EFF6FF',
    icon:   require('../../Assets/icons/stonestays1.png'),
    properties: [
      {
        key:      'topaz',
        label:    'Topaz',
        badge:    '2 BHK',
        iconBg:   '#EFF6FF',
        iconTint: '#1D4ED8',
        icon:     require('../../Assets/icons/home.png'),
      },
      {
        key:      'ruby',
        label:    'Ruby',
        badge:    '1 BHK',
        iconBg:   '#FEF2F2',
        iconTint: '#DC2626',
        icon:     require('../../Assets/icons/home.png'),
      },
      {
        key:      'sapphire',
        label:    'Sapphire',
        badge:    '1 BHK',
        iconBg:   '#EFF6FF',
        iconTint: '#2563EB',
        icon:     require('../../Assets/icons/home.png'),
      },
    ],
  },
];

const DONE_BY = ['Manoj', 'Nitesh', 'Chetan'];

// ─────────────────────────────────────────────────────────────────────────────
// 4. HELPER
// ─────────────────────────────────────────────────────────────────────────────

const formatExpenseDateTime = (dateStr) => {
  if (!dateStr) return '';
  const cleanedDate = dateStr.replace(/\./g, '/').replace(/-/g, '/');
  const parts = cleanedDate.split('/');
  if (parts.length !== 3) {
    console.log('❌ INVALID DATE FORMAT =>', dateStr);
    return '';
  }
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd} 10:30:00`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. CALENDAR
// ─────────────────────────────────────────────────────────────────────────────

const DAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CalendarPicker = ({ visible, selectedDate, onSelect, onClear, onClose }) => {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const parseDate = (str) => {
    const [dd, mm, yyyy] = str.split('/');
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  };

  const goMonth = (delta) => {
    let m = viewMonth + delta, y = viewYear;
    if (m > 11) { m = 0;  y++; }
    if (m <  0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const buildGrid = () => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev   = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];
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
    return (
      s.getDate()     === cell.day &&
      s.getMonth()    === viewMonth &&
      s.getFullYear() === viewYear
    );
  };

  const isToday = (cell) => {
    if (!cell.cur) return false;
    return (
      cell.day  === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear  === today.getFullYear()
    );
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
      <TouchableOpacity style={calStyles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={calStyles.card}>

        {/* Month/Year header */}
        <View style={calStyles.headerRow}>
          <TouchableOpacity style={calStyles.monthBtn} activeOpacity={0.7}>
            <Text style={calStyles.monthText}>{MONTHS_LONG[viewMonth]} {viewYear}</Text>
            <Text style={calStyles.monthArrow}>▾</Text>
          </TouchableOpacity>
          <View style={calStyles.navBtns}>
            <TouchableOpacity style={calStyles.navBtn} onPress={() => goMonth(-1)} activeOpacity={0.7}>
              <Text style={calStyles.navArrow}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={calStyles.navBtn} onPress={() => goMonth(1)} activeOpacity={0.7}>
              <Text style={calStyles.navArrow}>↓</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Day labels */}
        <View style={calStyles.dayLabelRow}>
          {DAYS_SHORT.map((d, i) => (
            <Text key={i} style={calStyles.dayLabel}>{d}</Text>
          ))}
        </View>

        {/* Grid */}
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
                <Text style={[
                  calStyles.cellText,
                  !cell.cur && calStyles.cellTextOther,
                  tod        && calStyles.cellTextToday,
                  sel        && calStyles.cellTextSel,
                ]}>
                  {cell.day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={calStyles.footer}>
          <TouchableOpacity onPress={() => { onClear(); onClose(); }} activeOpacity={0.7}>
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
// 6. REUSABLE SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const FieldLabel = ({ text, winW }) => (
  <View style={styles.fieldLabelRow}>
    <View style={styles.fieldDot} />
    <Text style={[styles.fieldLabelText, { fontSize: fs(11, winW) }]}>{text}</Text>
  </View>
);

const FormInput = ({ placeholder, value, onChangeText, keyboardType, winW }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <TextInput
        style={[styles.input, { fontSize: fs(13, winW) }]}
        placeholder={placeholder}
        placeholderTextColor={Colors.text_grey}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

const TextAreaInput = ({ placeholder, value, onChangeText, winW }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputWrap, styles.inputWrapMulti, focused && styles.inputWrapFocused]}>
      <TextInput
        style={[styles.input, styles.inputMulti, { fontSize: fs(13, winW) }]}
        placeholder={placeholder}
        placeholderTextColor={Colors.text_grey}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={3}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

const AmountInput = ({ value, onChangeText, winW }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.amtWrap, focused && styles.inputWrapFocused]}>
      <View style={styles.amtPrefix}>
        <Text style={[styles.amtSymbol, { fontSize: fs(16, winW) }]}>₹</Text>
      </View>
      <TextInput
        style={[styles.input, { paddingHorizontal: 12, fontSize: fs(13, winW) }]}
        placeholder="Enter amount"
        placeholderTextColor={Colors.text_grey}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. DONE-BY DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const DoneByDropdown = ({ value, onSelect, winW }) => {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.inputWrap,
          open && styles.inputWrapFocused,
          { justifyContent: 'space-between' },
        ]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.8}
      >
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.input,
            { fontSize: fs(13, winW), flex: 1, minWidth: 0 },
            !value && { color: Colors.text_grey },
          ]}
        >
          {value || 'Select person'}
        </Text>
        <Text style={{ color: Colors.text_grey, fontSize: fs(12, winW), flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.ddList}>
          {DONE_BY.map((name, i) => (
            <TouchableOpacity
              key={name}
              style={[
                styles.ddItem,
                i < DONE_BY.length - 1 && styles.ddItemBorder,
                value === name && styles.ddItemActive,
              ]}
              onPress={() => { onSelect(name); setOpen(false); }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.ddItemText,
                  { fontSize: fs(13, winW), flex: 1, minWidth: 0 },
                  value === name && styles.ddItemTextActive,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {name}
              </Text>
              {value === name && (
                <Text style={[styles.ddCheck, { fontSize: fs(13, winW), flexShrink: 0 }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. EXPENSE MODAL (bottom sheet)
// ─────────────────────────────────────────────────────────────────────────────

const ExpenseModal = ({ visible, property, onClose }) => {
  const { width: winW } = useWindowDimensions();
  const hPad = clamp(winW * 0.042, 14, 20);

  const [date,     setDate]     = useState('');
  const [calOpen,  setCalOpen]  = useState(false); // ✅ Calendar state
  const [details,  setDetails]  = useState('');
  const [amount,   setAmount]   = useState('');
  const [doneBy,   setDoneBy]   = useState('');
  const [loading,  setLoading]  = useState(false);

  const reset = () => {
    setDate(''); setDetails(''); setAmount(''); setDoneBy('');
  };

  const handleSubmit = async () => {
    if (!date || !details || !amount || !doneBy) {
      Alert.alert('Missing Fields', 'Please fill all fields before submitting.');
      return;
    }

    try {
      setLoading(true);

      const expenseData = {
        Category:
          property?.badge === 'Farmhouse' ? 'Farmhouse' : 'Airbnb',
        PropertyName:   property?.label || '',
        ExpenseDtTm:    formatExpenseDateTime(date),
        ExpenseDetails: details,
        ExpenseAmount:  amount,
        ExpenseDoneBy:  doneBy,
      };

      console.log('📦 EXPENSE DATA =>', JSON.stringify(expenseData, null, 2));

      const result = await insertExpense(expenseData);

      if (result.success) {
        Alert.alert(
          '✅ Success',
          `${property?.label} expense added successfully.`,
          [{ text: 'OK', onPress: () => { reset(); onClose(); } }],
        );
      } else {
        Alert.alert('❌ Error', result.message);
      }
    } catch (error) {
      console.log('❌ HANDLE SUBMIT ERROR =>', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!property) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => { reset(); onClose(); }}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={() => { reset(); onClose(); }}
      />

      {/* Sheet */}
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />

        {/* Header */}
        <View style={[styles.modalHdr, { paddingHorizontal: hPad }]}>
          <View style={[styles.modalIconBox, { backgroundColor: property.iconBg, flexShrink: 0 }]}>
            <Image
              source={property.icon}
              style={[styles.modalIconImg, { tintColor: property.iconTint }]}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.modalTitle, { fontSize: fs(15, winW) }]}
            >
              {property.label}
            </Text>
            <Text style={[styles.modalSub, { fontSize: fs(11, winW) }]}>Add Expense</Text>
          </View>
          <TouchableOpacity
            style={[styles.modalCloseBtn, { flexShrink: 0 }]}
            onPress={() => { reset(); onClose(); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.modalCloseX, { fontSize: fs(13, winW) }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalDivider} />

        {/* Form */}
        <ScrollView
          style={styles.modalBody}
          contentContainerStyle={[
            styles.modalBodyContent,
            {
              paddingHorizontal: hPad,
              paddingBottom: Platform.OS === 'ios' ? 34 + 16 : 80,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ✅ DATE FIELD — Calendar ke saath */}
          <View>
            <FieldLabel text="EXPENSE DATE" winW={winW} />
            <TouchableOpacity
              style={[
                styles.inputWrap,
                { justifyContent: 'space-between' },
                date && styles.inputWrapFocused,
              ]}
              activeOpacity={0.8}
              onPress={() => setCalOpen(true)}
            >
              <Text style={[
                styles.input,
                { fontSize: fs(13, winW) },
                !date && { color: Colors.text_grey },
              ]}>
                {date || 'dd/mm/yyyy'}
              </Text>
              <Image
                source={require('../../Assets/icons/calendar.png')}
                style={{ width: 18, height: 18, tintColor: Colors.text_grey, flexShrink: 0 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View>
            <FieldLabel text="EXPENSE DETAILS" winW={winW} />
            <TextAreaInput
              placeholder="Describe the expense..."
              value={details}
              onChangeText={setDetails}
              winW={winW}
            />
          </View>

          <View>
            <FieldLabel text="EXPENSE AMOUNT" winW={winW} />
            <AmountInput value={amount} onChangeText={setAmount} winW={winW} />
          </View>

          <View>
            <FieldLabel text="EXPENSE DONE BY" winW={winW} />
            <DoneByDropdown value={doneBy} onSelect={setDoneBy} winW={winW} />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled, { width: '100%' }]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Image
              source={require('../../Assets/icons/check.png')}
              style={[styles.submitCheckIcon, { flexShrink: 0 }]}
              resizeMode="contain"
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.submitText, { fontSize: fs(15, winW) }]}
            >
              {loading ? 'Submitting...' : `Submit ${property.label} Expense`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ✅ CALENDAR PICKER */}
      <CalendarPicker
        visible={calOpen}
        selectedDate={date}
        onSelect={(val) => setDate(val)}
        onClear={() => setDate('')}
        onClose={() => setCalOpen(false)}
      />
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. CATEGORY CARD
// ─────────────────────────────────────────────────────────────────────────────

const CategoryCard = ({ category, onSelectProperty, winW }) => {
  const [expanded, setExpanded] = useState(false);
  const hPad = clamp(winW * 0.037, 12, 18);

  return (
    <View style={[styles.catCard, { overflow: 'hidden' }]}>

      {/* Header */}
      <TouchableOpacity
        style={[styles.catHdr, { paddingHorizontal: hPad }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={[styles.catIconBox, { backgroundColor: '#fff', borderWidth: 1, flexShrink: 0 }]}>
          <Image
            source={category.icon}
            style={[styles.catIconImg, { tintColor: category.iconTint }]}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.catName, { fontSize: fs(15, winW) }]}
          >
            {category.label}
          </Text>
          <Text style={[styles.catSub, { fontSize: fs(11, winW) }]}>{category.sub}</Text>
        </View>
        <Text style={[styles.catArrow, { fontSize: fs(12, winW), flexShrink: 0 }, expanded && styles.catArrowUp]}>
          ▼
        </Text>
      </TouchableOpacity>

      {/* Property list */}
      {expanded && (
        <View style={styles.propList}>
          {category.properties.map((prop, i) => (
            <TouchableOpacity
              key={prop.key}
              style={[
                styles.propRow,
                { paddingHorizontal: hPad },
                i < category.properties.length - 1 && styles.propRowBorder,
              ]}
              onPress={() => {
                setExpanded(false);
                onSelectProperty(prop);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.propIconBox, { backgroundColor: prop.iconBg, borderWidth: 1, flexShrink: 0 }]}>
                <Image
                  source={prop.icon}
                  style={styles.propIconImg}
                  resizeMode="contain"
                />
              </View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.propName, { flex: 1, minWidth: 0, fontSize: fs(13, winW) }]}
              >
                {prop.label}
              </Text>
              <View style={[styles.propBadge, { flexShrink: 0 }]}>
                <Text style={[styles.propBadgeText, { fontSize: fs(10, winW) }]}>{prop.badge}</Text>
              </View>
              <Text style={[styles.propChevron, { fontSize: fs(20, winW), flexShrink: 0 }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const ExpensesScreen = ({ navigation }) => {
  const { width: winW } = useWindowDimensions();
  const hPad = clamp(winW * 0.037, 12, 18);

  const [selectedProp,  setSelectedProp]  = useState(null);
  const [modalVisible,  setModalVisible]  = useState(false);

  const handleSelectProperty = (prop) => {
    setSelectedProp(prop);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* HEADER */}
      <View style={[styles.header, { paddingHorizontal: hPad }]}>
        <TouchableOpacity
          style={[styles.backBtn, { flexShrink: 0 }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Image
            source={require('../../Assets/icons/ak.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={{ flex: 1, minWidth: 0, zIndex: 2 }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.headerTitle, { fontSize: fs(18, winW) }]}
          >
            Expenses
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.headerSubtitle, { fontSize: fs(13, winW) }]}
          >
            Select property to record expense
          </Text>
        </View>
        <View style={styles.circle1} />
        <View style={styles.goldLine} />
      </View>

      {/* BODY */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={[
          styles.bodyContent,
          { paddingHorizontal: hPad, paddingBottom: 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.key}
            category={cat}
            onSelectProperty={handleSelectProperty}
            winW={winW}
          />
        ))}
      </ScrollView>

      {/* EXPENSE MODAL */}
      <ExpenseModal
        visible={modalVisible}
        property={selectedProp}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ExpensesScreen;

// ─────────────────────────────────────────────────────────────────────────────
// 11. STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex:            1,
    backgroundColor: Colors.bg_dark,
  },

  // ── Header ────────────────────────────────────────────────────────────────

  header: {
    backgroundColor: Colors.bg_dark,
    paddingTop:      8,
    paddingBottom:   24,
    flexDirection:   'row',
    alignItems:      'center',
    overflow:        'hidden',
    marginTop:       27,
    gap:             14,
  },
  backBtn: {
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems:      'center',
    justifyContent:  'center',
    zIndex:          2,
  },
  backIcon: {
    width:     18,
    height:    18,
    tintColor: Colors.text_white,
  },
  headerTitle: {
    color:        Colors.text_white,
    fontWeight:   'bold',
    marginBottom: 3,
  },
  headerSubtitle: {
    color: Colors.text_grey,
  },
  circle1: {
    position:        'absolute',
    width:           140,
    height:          140,
    borderRadius:    110,
    backgroundColor: Colors.bg_dark,
    top:             -30,
    right:           -40,
    borderColor:     'rgba(202,156,41,0.12)',
    borderWidth:     25,
  },
  goldLine: {
    position:        'absolute',
    bottom:          0,
    left:            0,
    right:           0,
    height:          3,
    backgroundColor: Colors.primary,
  },

  // ── Body ──────────────────────────────────────────────────────────────────

  body:        { flex: 1, backgroundColor: Colors.page_bg },
  bodyContent: {
    paddingTop: 18,
    gap:        12,
  },

  // ── Category Card ─────────────────────────────────────────────────────────

  catCard: {
    backgroundColor: Colors.card_bg,
    borderRadius:    14,
    overflow:        'hidden',
    borderWidth:     0.5,
    borderColor:     Colors.inputBorder,
    ...Platform.select({
      ios:     { shadowColor: '#B0B8C8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  catHdr: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    paddingVertical: 14,
  },
  catIconBox: {
    width:          38,
    height:         38,
    borderRadius:   8,
    alignItems:     'center',
    justifyContent: 'center',
    borderColor:    '#f8deb3',
  },
  catIconImg: {
    width:  40,
    height: 40,
  },
  catName: {
    color:      Colors.text_dark,
    fontWeight: '700',
  },
  catSub: {
    color:     Colors.text_grey,
    marginTop: 1,
  },
  catArrow: {
    color: Colors.text_grey,
  },
  catArrowUp: {
    transform: [{ rotate: '180deg' }],
  },

  // ── Property List ─────────────────────────────────────────────────────────

  propList: {
    borderTopWidth: 0.5,
    borderColor:    Colors.divider,
  },
  propRow: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    paddingVertical: 12,
  },
  propRowBorder: {
    borderBottomWidth: 0.5,
    borderColor:       Colors.divider,
  },
  propIconBox: {
    width:          32,
    height:         32,
    borderRadius:   8,
    alignItems:     'center',
    justifyContent: 'center',
    borderColor:    '#f8deb3',
  },
  propIconImg: {
    width:        20,
    height:       20,
    borderRadius: 8,
  },
  propName: {
    color:      Colors.text_dark,
    fontWeight: '600',
  },
  propBadge: {
    backgroundColor:   Colors.inputBgColor,
    borderRadius:      6,
    paddingHorizontal: 8,
    paddingVertical:   2,
  },
  propBadgeText: {
    color:         Colors.text_label,
    fontWeight:    '700',
    letterSpacing: 0.4,
  },
  propChevron: {
    color:      Colors.text_grey,
    marginLeft: 4,
  },

  // ── Modal ─────────────────────────────────────────────────────────────────

  modalBackdrop: {
    flex:            1,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  modalSheet: {
    backgroundColor:      Colors.card_bg,
    borderTopLeftRadius:  18,
    borderTopRightRadius: 18,
    maxHeight:            '85%',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.10, shadowRadius: 12 },
      android: { elevation: 16 },
    }),
  },
  modalHandle: {
    width:           36,
    height:          4,
    borderRadius:    2,
    backgroundColor: Colors.inputBorder,
    alignSelf:       'center',
    marginTop:       10,
    marginBottom:    6,
  },
  modalHdr: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
    paddingVertical: 12,
  },
  modalIconBox: {
    width:          38,
    height:         38,
    borderRadius:   11,
    alignItems:     'center',
    justifyContent: 'center',
  },
  modalIconImg: {
    width:  20,
    height: 20,
  },
  modalTitle: {
    color:      Colors.text_dark,
    fontWeight: '700',
  },
  modalSub: {
    color:     Colors.text_grey,
    marginTop: 1,
  },
  modalCloseBtn: {
    width:           32,
    height:          32,
    borderRadius:    8,
    backgroundColor: Colors.inputBgColor,
    alignItems:      'center',
    justifyContent:  'center',
  },
  modalCloseX: {
    color:      Colors.text_grey,
    fontWeight: '700',
  },
  modalDivider: {
    height:          0.5,
    backgroundColor: Colors.divider,
  },
  modalBody:        { flex: 0 },
  modalBodyContent: {
    paddingTop: 14,
    gap:        14,
  },

  // ── Field Label ───────────────────────────────────────────────────────────

  fieldLabelRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           5,
    marginBottom:  6,
  },
  fieldDot: {
    width:           4,
    height:          4,
    borderRadius:    2,
    backgroundColor: Colors.primary,
    flexShrink:      0,
  },
  fieldLabelText: {
    color:         Colors.text_label,
    fontWeight:    '700',
    letterSpacing: 0.8,
  },

  // ── Inputs ────────────────────────────────────────────────────────────────

  inputWrap: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   Colors.inputBgColor,
    borderRadius:      10,
    borderWidth:       1.5,
    borderColor:       Colors.inputBorder,
    paddingHorizontal: 12,
    minHeight:         48,
  },
  inputWrapFocused: {
    borderColor:     Colors.primary,
    backgroundColor: '#FFFDF5',
  },
  inputWrapMulti: {
    alignItems:      'flex-start',
    paddingVertical: 10,
    minHeight:       90,
  },
  input: {
    flex:     1,
    minWidth: 0,
    color:    Colors.text_dark,
    padding:  0,
  },
  inputMulti: {
    textAlignVertical: 'top',
    lineHeight:        20,
  },

  // ── Amount Input ──────────────────────────────────────────────────────────

  amtWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.inputBgColor,
    borderRadius:    10,
    borderWidth:     1.5,
    borderColor:     Colors.inputBorder,
    height:          48,
    overflow:        'hidden',
  },
  amtPrefix: {
    width:                  44,
    alignSelf:              'stretch',
    backgroundColor:        '#FFF8E6',
    borderTopLeftRadius:    8,
    borderBottomLeftRadius: 8,
    alignItems:             'center',
    justifyContent:         'center',
    borderRightWidth:       1,
    borderRightColor:       Colors.inputBorder,
    flexShrink:             0,
  },
  amtSymbol: {
    color:      Colors.primary,
    fontWeight: '700',
  },

  // ── Done-By Dropdown ──────────────────────────────────────────────────────

  ddList: {
    backgroundColor: Colors.card_bg,
    borderRadius:    10,
    borderWidth:     1.5,
    borderColor:     Colors.primary,
    marginTop:       4,
    overflow:        'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  ddItem: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               10,
    paddingHorizontal: 14,
    paddingVertical:   11,
  },
  ddItemBorder: {
    borderBottomWidth: 0.5,
    borderColor:       Colors.divider,
  },
  ddItemActive: {
    backgroundColor: 'rgba(245,158,11,0.07)',
  },
  ddItemText: {
    color:      Colors.text_dark,
    fontWeight: '500',
  },
  ddItemTextActive: {
    color:      Colors.primary,
    fontWeight: '700',
  },
  ddCheck: {
    color:      Colors.primary,
    fontWeight: '700',
  },

  // ── Submit Button ─────────────────────────────────────────────────────────

  submitBtn: {
    backgroundColor: Colors.bg_dark,
    borderRadius:    14,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 16,
    marginTop:       4,
    gap:             8,
    width:           '100%',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitCheckIcon: {
    width:      20,
    height:     20,
    tintColor:  Colors.primary,
    flexShrink: 0,
  },
  submitText: {
    color:         Colors.text_white,
    fontWeight:    '700',
    letterSpacing: 0.3,
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. CALENDAR STYLES
// ─────────────────────────────────────────────────────────────────────────────

const calStyles = StyleSheet.create({
  backdrop: {
    position:        'absolute',
    top:             0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  card: {
    position:        'absolute',
    top:             '20%',
    alignSelf:       'center',
    width:           300,
    backgroundColor: Colors.card_bg,
    borderRadius:    18,
    padding:         20,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20 },
      android: { elevation: 14 },
    }),
  },
  headerRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   18,
  },
  monthBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthText:  { color: Colors.text_dark, fontSize: 16, fontWeight: '700' },
  monthArrow: { color: Colors.text_grey, fontSize: 12 },
  navBtns:    { flexDirection: 'row', gap: 16 },
  navBtn:     { padding: 4 },
  navArrow:   { color: Colors.text_dark, fontSize: 18, fontWeight: '300' },
  dayLabelRow: {
    flexDirection:  'row',
    justifyContent: 'space-around',
    marginBottom:   8,
  },
  dayLabel: {
    width:      32,
    textAlign:  'center',
    color:      Colors.text_grey,
    fontSize:   13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    justifyContent: 'space-around',
    rowGap:        4,
  },
  cell: {
    width:          32,
    height:         36,
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   8,
  },
  cellSelected:    { backgroundColor: '#1D6AFF', borderRadius: 10 },
  cellText:        { color: Colors.text_dark, fontSize: 14 },
  cellTextOther:   { color: Colors.text_grey },
  cellTextToday:   { color: '#1D6AFF', fontWeight: '700' },
  cellTextSel:     { color: '#FFFFFF', fontWeight: '700' },
  footer: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      18,
    paddingTop:     14,
    borderTopWidth: 1,
    borderColor:    Colors.inputBorder,
  },
  footerClear: { color: '#1D6AFF', fontSize: 14, fontWeight: '600' },
  footerToday: { color: '#1D6AFF', fontSize: 14, fontWeight: '600' },
});