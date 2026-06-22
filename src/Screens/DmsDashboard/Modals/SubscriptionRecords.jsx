import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';

// ─── Colors ───────────────────────────────────────────────────────────────────

const Colors = {
  bg_dark:     '#0F172A',
  primary:     '#F59E0B',
  text_white:  '#F1F5F9',
  text_grey:   '#94A3B8',
  text_dark:   '#1E293B',
  text_label:  '#64748B',
  inputBorder: '#E2E8F0',
  inputBg:     '#F1F5F9',
  card_bg:     '#FFFFFF',
  green_bg:    'rgba(34,197,94,0.15)',
  green_text:  '#16A34A',
  gold_bg:     'rgba(245,158,11,0.15)',
  gold_border: 'rgba(245,158,11,0.35)',
  page_bg:     '#EEF0F6',
  red_bg:      'rgba(239,68,68,0.15)',
  red_text:    '#EF4444',
};

// ─── Font Sizes ───────────────────────────────────────────────────────────────

const F = {
  f10: 10,
  f11: 11,
  f12: 12,
  f13: 13,
  f14: 14,
  f15: 15,
  f16: 16,
  f18:18,
  f22: 22,
  f26: 26,
};

// ─── Card Shadow ──────────────────────────────────────────────────────────────

const cardShadow = Platform.select({
  ios: {
    shadowColor:   '#B0B8C8',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius:  8,
  },
  android: {
    elevation: 3,
  },
});

// ─── Status Style Map ─────────────────────────────────────────────────────────

const STATUS_STYLE = {
  Active:   { bg: Colors.green_bg, text: Colors.green_text },
  Expiring: { bg: Colors.gold_bg,  text: Colors.primary    },
  Expired:  { bg: Colors.red_bg,   text: Colors.red_text   },
};

// ─── InfoRow ──────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value, isLast }) => (
  <View style={[rowStyles.row, !isLast && rowStyles.rowBorder]}>
    <Text style={rowStyles.label}>{label}</Text>
    <Text style={rowStyles.value} numberOfLines={2}>{value || '—'}</Text>
  </View>
);

// ─── Section ──────────────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <View style={sectionStyles.wrapper}>
    <View style={sectionStyles.titleRow}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.line} />
    </View>
    <View style={sectionStyles.card}>{children}</View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const SubscriptionRecords = ({ navigation, route }) => {
  const { subscription } = route.params;
  const statusStyle = STATUS_STYLE[subscription.status] ?? STATUS_STYLE.Active;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.page_bg} barStyle="dark-content" />

      {/* ── SHEET WRAPPER ── */}
      <View style={styles.sheet}>

        {/* Drag Handle */}
        <View style={styles.handle} />

        {/* ── MODAL HEADER ── */}
        <View style={styles.modalHeader}>
          <View style={styles.avatarBox}>
            <Image
              source={require('../../../Assets/icons/sub.png')}
              style={styles.avatarIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerTextCol}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>{subscription.member}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {subscription.status}
                </Text>
              </View>
            </View>
            <Text style={styles.headerSub}>Subscription · {subscription.property}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* ── SCROLLABLE CONTENT ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

          {/* MEMBER INFORMATION */}
          <Section title="MEMBER INFORMATION">
            <InfoRow label="Full Name" value={subscription.member} />
            <InfoRow label="Mobile"    value={subscription.mobile} isLast />
          </Section>

          {/* SUBSCRIPTION DETAILS */}
          <Section title="SUBSCRIPTION DETAILS">
            <InfoRow label="Category"   value={subscription.category}  />
            <InfoRow label="Property"   value={subscription.property}  />
            <InfoRow label="Plan"        value={subscription.planLabel} />
            <InfoRow label="Start Date"  value={subscription.startDate} />
            <InfoRow label="End Date"    value={subscription.endDate}   isLast />
          </Section>

          {/* PAYMENT */}
          <View style={sectionStyles.wrapper}>
            <View style={sectionStyles.titleRow}>
              <Text style={sectionStyles.title}>PAYMENT</Text>
              <View style={sectionStyles.line} />
            </View>

            {/* Final Amount — highlighted gold card */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>FINAL AMOUNT</Text>
              <Text style={styles.amountValue}>{subscription.amount}</Text>
            </View>

            {/* Payment Mode row */}
            <View style={sectionStyles.card}>
              <InfoRow label="Payment Mode" value={subscription.paymentMode} isLast />
            </View>
          </View>

          {/* NOTES */}
          <Section title="NOTES">
            <InfoRow label="Remarks" value={subscription.remarks} isLast />
          </Section>

        </ScrollView>

      </View>

    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex:            1,
    backgroundColor: Colors.page_bg,
    justifyContent:  'flex-end',
  },

  sheet: {
    flex:                 1,
    backgroundColor:      Colors.card_bg,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    marginTop:            30,
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: -4 },
        shadowOpacity: 0.10,
        shadowRadius:  16,
      },
      android: { elevation: 16 },
    }),
  },

  handle: {
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: Colors.inputBorder,
    alignSelf:       'center',
    marginTop:       12,
    marginBottom:    4,
  },

  modalHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 20,
    paddingVertical:   16,
    gap:               14,
  },

  avatarBox: {
    width:           48,
    height:          48,
    borderRadius:    14,
    backgroundColor: Colors.inputBg,
    alignItems:      'center',
    justifyContent:  'center',
  },

  avatarIcon: {
    width:  22,
    height: 22,
  },

  headerTextCol: {
    flex: 1,
  },

  headerNameRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    flexWrap:      'wrap',
  },

  headerName: {
    color:      Colors.text_dark,
    fontSize:   F.f15,
    fontWeight: '700',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical:   3,
    borderRadius:      20,
  },

  statusText: {
    fontSize:   F.f11,
    fontWeight: '700',
  },

  headerSub: {
    color:     Colors.text_grey,
    fontSize:  F.f13,
    marginTop: 3,
  },

  closeBtn: {
    width:           36,
    height:          36,
    borderRadius:    10,
    backgroundColor: Colors.inputBg,
    alignItems:      'center',
    justifyContent:  'center',
  },

  closeBtnText: {
    color:      Colors.text_grey,
    fontSize:   F.f13,
    fontWeight: '600',
  },

  divider: {
    height:          1,
    backgroundColor: Colors.inputBorder,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop:        20,
    paddingBottom:     36,
    gap:               20,
  },

  // ── Final Amount Card ──
  amountCard: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   Colors.gold_bg,
    borderRadius:      16,
    borderWidth:       1,
    borderColor:       Colors.gold_border,
    paddingHorizontal: 20,
    paddingVertical:   20,
    marginBottom:      10,
  },

  amountLabel: {
    color:         Colors.text_label,
    fontSize:      F.f11,
    fontWeight:    '700',
    letterSpacing: 0.8,
  },

  amountValue: {
    color:      Colors.text_dark,
    fontSize:   F.f16,
    fontWeight: '800',
  },

});

// ─── Section Styles ───────────────────────────────────────────────────────────

const sectionStyles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
  },
  title: {
    color:         Colors.text_label,
    fontSize:      F.f11,
    fontWeight:    '700',
    letterSpacing: 1,
  },
  
  line: {
    flex:            1,
    height:          1,
    backgroundColor: Colors.inputBorder,
  },
  card: {
    backgroundColor: Colors.inputBg,
    borderRadius:    16,
    overflow:        'hidden',
    ...cardShadow,
  },
});

// ─── Row Styles ───────────────────────────────────────────────────────────────

const rowStyles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.inputBorder,
  },
  label: {
    color:    Colors.text_label,
    fontSize: F.f14,
    flex:     1,
  },
  value: {
    color:      Colors.text_dark,
    fontSize:   F.f13,
    fontWeight: '700',
    flex:       1,
    textAlign:  'right',
  },
});

export default SubscriptionRecords;