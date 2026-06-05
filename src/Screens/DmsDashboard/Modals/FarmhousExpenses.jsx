import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const Colors = {
  header_dark:    '#0D4F4A',
  primary:        '#0F766E',
  primary_light:  '#CCFBF1',
  primary_border: '#99F6E4',
  primary_text:   '#134E4A',
  primary_mid:    '#5EADA6',

  page_bg:        '#F0FAF8',
  card_bg:        '#FFFFFF',
  card_header_bg: '#F0FAF8',

  text_white:     '#FFFFFF',
  text_dark:      '#134E4A',
  text_grey:      '#5EADA6',
  text_label:     '#94A3B8',
  text_muted:     'rgba(255,255,255,0.55)',

  border:         '#B2DFDB',
  border_light:   '#E0F2F1',
  border_white:   'rgba(255,255,255,0.12)',
  strip_bg:       'rgba(255,255,255,0.10)',
};

const F = {
  f10: 10, f11: 11, f12: 12, f13: 13,
  f14: 14, f15: 15, f16: 16, f17: 17, f18: 18, f20: 20,
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. HELPER — total amount from expenses array
// ─────────────────────────────────────────────────────────────────────────────

const calcTotal = (expenses = []) =>
  expenses.reduce((sum, item) => sum + Number(item.ExpenseAmount || 0), 0);

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const formatExpenseDate = (dateString) => {

  if (!dateString) return 'No Date';

  const date = new Date(dateString);

  if (isNaN(date)) return 'Invalid Date';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. EXPENSE ROW  (dynamic — API fields)
// ─────────────────────────────────────────────────────────────────────────────

const ExpenseRow = ({ item, isLast }) => (
  <View style={[styles.expRow, !isLast && styles.expRowBorder]}>

    {/* LEFT SIDE */}
    <View style={{ flex: 1 }}>
      <Text style={styles.expNote}>{item.ExpenseDetails}</Text>
      <Text style={styles.expDate}>{formatExpenseDate(item.ExpenseDtTm)}</Text>
      <Text style={styles.expDoneBy}>Done By: {item.ExpenseDoneBy}</Text>
    </View>

    {/* RIGHT SIDE */}
    <Text style={styles.expAmount}>{fmt(item.ExpenseAmount)}</Text>

  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. MAIN MODAL
// ─────────────────────────────────────────────────────────────────────────────

const FarmhouseExpenses = ({ visible, property, period, onClose }) => {
  if (!property) return null;

  // ── Dynamic data from property.expenses (passed from parent) ──────────────
  const expenses    = property?.expenses || [];
  const totalAmount = fmt(calcTotal(expenses));

  const periodLabel = {
    today:  'Today',
    month1: 'Last Month',
    month3: 'Last 3 Months',
    month6: 'Last 6 Months',
  }[period] || 'Today';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleBlock}>
              <Text style={styles.headerTitle}>{property.label}</Text>
              <Text style={styles.headerSubtitle}>Expense Details · {periodLabel}</Text>
            </View>
          </View>

          {/* Summary strip — live from API data */}
          <View style={styles.summaryStrip}>
            <View style={[styles.stripItem, styles.stripItemBorder]}>
              <Text style={styles.stripLabel}>TOTAL SPENT</Text>
              <Text style={styles.stripVal}>{totalAmount}</Text>
              <Text style={styles.stripSub}>{periodLabel}</Text>
            </View>
            <View style={[styles.stripItem, styles.stripItemBorder]}>
              <Text style={styles.stripLabel}>TRANSACTIONS</Text>
              <Text style={styles.stripVal}>{expenses.length}</Text>
              <Text style={styles.stripSub}>entries</Text>
            </View>
            <View style={styles.stripItem}>
              <Text style={styles.stripLabel}>CATEGORY</Text>
              <Text style={styles.stripVal}>{property.badge}</Text>
              <Text style={styles.stripSub}>property type</Text>
            </View>
          </View>
        </View>

        {/* ── BODY ────────────────────────────────────────────────────────── */}
        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Expense list card */}
          <View style={styles.listCard}>
            <View style={styles.listCardHdr}>
              <Text style={styles.listCardTitle}>All Expenses</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{expenses.length} items</Text>
              </View>
            </View>
            <View style={styles.listCardDivider} />

            {expenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No expenses found for this period.</Text>
              </View>
            ) : (
              expenses.map((item, idx) => (
                <ExpenseRow
                  key={item.Id ?? idx}
                  item={item}
                  isLast={idx === expenses.length - 1}
                />
              ))
            )}
          </View>

          {/* Total summary card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalCardLabel}>TOTAL EXPENSES</Text>
            <Text style={styles.totalCardAmount}>{totalAmount}</Text>
            <Text style={styles.totalCardSub}>{property.label} · {periodLabel}</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export default FarmhouseExpenses;

// ─────────────────────────────────────────────────────────────────────────────
// 5. STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex:            1,
    backgroundColor: Colors.page_bg,
  },

  // ── Header ────────────────────────────────────────────────────────────────

  header: {
    backgroundColor: '#0F172A',
    paddingTop:      8,
    overflow:        'hidden',
  },
  headerTop: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingBottom:     18,
    zIndex:            2,
  },
  closeBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     14,
  },
  closeBtnText: {
    color:      Colors.text_white,
    fontSize:   F.f16,
    fontWeight: '500',
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
    position:     'absolute',
    width:        130,
    height:       130,
    borderRadius: 65,
    borderWidth:  22,
    borderColor:  'rgba(255,255,255,0.07)',
    top:          -35,
    right:        -30,
    zIndex:       1,
  },
  circle2: {
    position:     'absolute',
    width:        70,
    height:       70,
    borderRadius: 35,
    borderWidth:  14,
    borderColor:  'rgba(255,255,255,0.05)',
    bottom:       30,
    right:        60,
    zIndex:       1,
  },

  // Summary strip
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
    borderRightWidth: 0.5,
    borderRightColor: Colors.border_white,
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

  // ── Expense List Card ─────────────────────────────────────────────────────

  listCard: {
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
  listCardHdr: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 14,
    paddingVertical:   13,
    backgroundColor:   Colors.card_header_bg,
  },
  listCardTitle: {
    fontSize:   F.f14,
    fontWeight: '600',
    color:      Colors.text_dark,
  },
  countBadge: {
    backgroundColor:   Colors.primary_light,
    borderRadius:      8,
    paddingHorizontal: 9,
    paddingVertical:   3,
    borderWidth:       0.5,
    borderColor:       Colors.primary_border,
  },
  countBadgeText: {
    fontSize:   F.f11,
    fontWeight: '600',
    color:      Colors.primary,
  },
  listCardDivider: {
    height:          0.5,
    backgroundColor: Colors.border,
  },

  // ── Expense Row ───────────────────────────────────────────────────────────

  expRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 14,
    paddingVertical:   12,
    gap:               10,
  },
  expRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border_light,
  },
  expNote: {
    fontSize:   F.f13,
    fontWeight: '500',
    color:      Colors.text_dark,
  },
  expDate: {
    fontSize:  F.f11,
    color:     Colors.text_grey,
    marginTop: 2,
  },
  expDoneBy: {
    fontSize:  F.f12,
    color:     Colors.text_label,
    marginTop: 4,
  },
  expAmount: {
    fontSize:   F.f14,
    fontWeight: '700',
    color:      Colors.text_dark,
  },

  emptyState: {
    paddingVertical: 30,
    alignItems:      'center',
  },
  emptyText: {
    color:    Colors.text_grey,
    fontSize: F.f13,
  },

  // ── Total Card ────────────────────────────────────────────────────────────

  totalCard: {
    backgroundColor: '#0F172A',
    borderRadius:    16,
    padding:         16,
    alignItems:      'center',
    ...Platform.select({
      ios:     { shadowColor: '#0F766E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  totalCardLabel: {
    fontSize:      F.f11,
    color:         'rgba(255,255,255,0.65)',
    letterSpacing: 0.6,
    marginBottom:  6,
  },
  totalCardAmount: {
    fontSize:     F.f20,
    fontWeight:   '700',
    color:        Colors.text_white,
    marginBottom: 4,
  },
  totalCardSub: {
    fontSize: F.f12,
    color:    'rgba(255,255,255,0.55)',
  },
});