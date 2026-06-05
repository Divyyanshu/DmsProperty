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
} from 'react-native';
import { insertExpense } from '../../Api/ApiService';

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

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

const F = {
  f10: 10, f11: 11, f12: 12, f13: 13,
  f14: 14, f15: 15, f16: 16, f18: 18, f20: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. DATA
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
// 3. HELPER
// ─────────────────────────────────────────────────────────────────────────────

const formatExpenseDateTime = (dateStr) => {

  if (!dateStr) return '';

  // Support:
  // 27/05/2026
  // 27-05-2026
  // 27.05.2026

  const cleanedDate = dateStr
    .replace(/\./g, '/')
    .replace(/-/g, '/');

  const parts = cleanedDate.split('/');

  if (parts.length !== 3) {

    console.log(
      '❌ INVALID DATE FORMAT =>',
      dateStr
    );

    return '';
  }

  const [dd, mm, yyyy] = parts;

  return `${yyyy}-${mm}-${dd} 10:30:00`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. REUSABLE SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const FieldLabel = ({ text }) => (
  <View style={styles.fieldLabelRow}>
    <View style={styles.fieldDot} />
    <Text style={styles.fieldLabelText}>{text}</Text>
  </View>
);

const FormInput = ({ placeholder, value, onChangeText, keyboardType }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
      <TextInput
        style={styles.input}
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

const TextAreaInput = ({ placeholder, value, onChangeText }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.inputWrap, styles.inputWrapMulti, focused && styles.inputWrapFocused]}>
      <TextInput
        style={[styles.input, styles.inputMulti]}
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

const AmountInput = ({ value, onChangeText }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.amtWrap, focused && styles.inputWrapFocused]}>
      <View style={styles.amtPrefix}>
        <Text style={styles.amtSymbol}>₹</Text>
      </View>
      <TextInput
        style={[styles.input, { paddingHorizontal: 12 }]}
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
// 5. DONE-BY DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

const DoneByDropdown = ({ value, onSelect }) => {
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
        <Text style={[styles.input, !value && { color: Colors.text_grey }]}>
          {value || 'Select person'}
        </Text>
        <Text style={{ color: Colors.text_grey, fontSize: F.f12 }}>
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
              <Text style={[styles.ddItemText, value === name && styles.ddItemTextActive]}>
                {name}
              </Text>
              {value === name && <Text style={styles.ddCheck}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. EXPENSE MODAL (bottom sheet)
// ─────────────────────────────────────────────────────────────────────────────

const ExpenseModal = ({ visible, property, onClose }) => {
  const [date,    setDate]    = useState('');
  const [details, setDetails] = useState('');
  const [amount,  setAmount]  = useState('');
  const [doneBy,  setDoneBy]  = useState('');
  const [loading, setLoading] = useState(false);

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
  property?.badge === 'Farmhouse'
    ? 'Farmhouse'
    : 'Airbnb',
        PropertyName: property?.label || '',
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
        <View style={styles.modalHdr}>
          <View style={[styles.modalIconBox, { backgroundColor: property.iconBg }]}>
            <Image
              source={property.icon}
              style={[styles.modalIconImg, { tintColor: property.iconTint }]}
              resizeMode="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalTitle}>{property.label}</Text>
            <Text style={styles.modalSub}>Add Expense</Text>
          </View>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => { reset(); onClose(); }}
            activeOpacity={0.7}
          >
            <Text style={styles.modalCloseX}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalDivider} />

        {/* Form */}
        <ScrollView
          style={styles.modalBody}
          contentContainerStyle={styles.modalBodyContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View>
            <FieldLabel text="EXPENSE DATE" />
            <FormInput
              placeholder="dd/mm/yyyy"
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
            />
          </View>

          <View>
            <FieldLabel text="EXPENSE DETAILS" />
            <TextAreaInput
              placeholder="Describe the expense..."
              value={details}
              onChangeText={setDetails}
            />
          </View>

          <View>
            <FieldLabel text="EXPENSE AMOUNT" />
            <AmountInput value={amount} onChangeText={setAmount} />
          </View>

          <View>
            <FieldLabel text="EXPENSE DONE BY" />
            <DoneByDropdown value={doneBy} onSelect={setDoneBy} />
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            <Image
              source={require('../../Assets/icons/check.png')}
              style={styles.submitCheckIcon}
              resizeMode="contain"
            />
            <Text style={styles.submitText}>
              {loading ? 'Submitting...' : `Submit ${property.label} Expense`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. CATEGORY CARD
// ─────────────────────────────────────────────────────────────────────────────

const CategoryCard = ({ category, onSelectProperty }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.catCard}>

      {/* Header — tap karo to toggle list */}
      <TouchableOpacity
        style={styles.catHdr}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={[styles.catIconBox, { backgroundColor: '#fff', borderWidth: 1 }]}>
          <Image
            source={category.icon}
            style={[styles.catIconImg, { tintColor: category.iconTint }]}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.catName}>{category.label}</Text>
          <Text style={styles.catSub}>{category.sub}</Text>
        </View>
        <Text style={[styles.catArrow, expanded && styles.catArrowUp]}>▼</Text>
      </TouchableOpacity>

      {/* Property list */}
      {expanded && (
        <View style={styles.propList}>
          {category.properties.map((prop, i) => (
            <TouchableOpacity
              key={prop.key}
              style={[
                styles.propRow,
                i < category.properties.length - 1 && styles.propRowBorder,
              ]}
              onPress={() => {
                setExpanded(false);
                onSelectProperty(prop);
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.propIconBox, { backgroundColor: prop.iconBg, borderWidth: 1 }]}>
                <Image
                  source={prop.icon}
                  style={styles.propIconImg}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.propName}>{prop.label}</Text>
              <View style={styles.propBadge}>
                <Text style={styles.propBadgeText}>{prop.badge}</Text>
              </View>
              <Text style={styles.propChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const ExpensesScreen = ({ navigation }) => {
  const [selectedProp, setSelectedProp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectProperty = (prop) => {
    setSelectedProp(prop);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
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
          <Text style={styles.headerTitle}>Expenses</Text>
          <Text style={styles.headerSubtitle}>Select property to record expense</Text>
        </View>
        <View style={styles.circle1} />
        <View style={styles.goldLine} />
      </View>

      {/* BODY */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.key}
            category={cat}
            onSelectProperty={handleSelectProperty}
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
// 9. STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex:            1,
    backgroundColor: Colors.bg_dark,
  },

  // ── Header ────────────────────────────────────────────────────────────────

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
    width:           40,
    height:          40,
    borderRadius:    12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     14,
    zIndex:          2,
  },
  backIcon: {
    width:     18,
    height:    18,
    tintColor: Colors.text_white,
  },
  headerTitleBlock: { flex: 1, zIndex: 2 },
  headerTitle: {
    color:        Colors.text_white,
    fontSize:     F.f18,
    fontWeight:   'bold',
    marginBottom: 3,
  },
  headerSubtitle: {
    color:    Colors.text_grey,
    fontSize: F.f13,
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
    paddingHorizontal: 14,
    paddingTop:        18,
    paddingBottom:     30,
    gap:               12,
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
    flexDirection:     'row',
    alignItems:        'center',
    gap:               12,
    paddingHorizontal: 14,
    paddingVertical:   14,
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
    fontSize:   F.f15,
    fontWeight: '700',
  },
  catSub: {
    color:     Colors.text_grey,
    fontSize:  F.f11,
    marginTop: 1,
  },
  catArrow: {
    color:    Colors.text_grey,
    fontSize: F.f12,
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
    flexDirection:     'row',
    alignItems:        'center',
    gap:               12,
    paddingHorizontal: 14,
    paddingVertical:   12,
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
    flex:       1,
    color:      Colors.text_dark,
    fontSize:   F.f13,
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
    fontSize:      F.f10,
    fontWeight:    '700',
    letterSpacing: 0.4,
  },
  propChevron: {
    color:      Colors.text_grey,
    fontSize:   F.f20,
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
    flexDirection:     'row',
    alignItems:        'center',
    gap:               12,
    paddingHorizontal: 16,
    paddingVertical:   12,
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
    fontSize:   F.f15,
    fontWeight: '700',
  },
  modalSub: {
    color:     Colors.text_grey,
    fontSize:  F.f11,
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
    fontSize:   F.f13,
    fontWeight: '700',
  },
  modalDivider: {
    height:          0.5,
    backgroundColor: Colors.divider,
  },
  modalBody:        { flex: 0 },
  modalBodyContent: {
    paddingHorizontal: 16,
    paddingTop:        14,
    paddingBottom:     30,
    gap:               14,
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
  },
  fieldLabelText: {
    color:         Colors.text_label,
    fontSize:      F.f11,
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
    color:    Colors.text_dark,
    fontSize: F.f13,
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
  },
  amtSymbol: {
    color:      Colors.primary,
    fontSize:   F.f16,
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
    fontSize:   F.f13,
    fontWeight: '500',
  },
  ddItemTextActive: {
    color:      Colors.primary,
    fontWeight: '700',
  },
  ddCheck: {
    color:      Colors.primary,
    fontSize:   F.f13,
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
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitCheckIcon: {
    width:     20,
    height:    20,
    tintColor: Colors.primary,
  },
  submitText: {
    color:         Colors.text_white,
    fontSize:      F.f15,
    fontWeight:    '700',
    letterSpacing: 0.3,
  },
});