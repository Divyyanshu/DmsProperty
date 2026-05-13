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
  Modal,
} from 'react-native';

// ─── Colors ───────────────────────────────────────────────────────────────────

const Colors = {
  bg_dark:        '#0F172A',
  bg_light:       '#F8FAFC',
  primary:        '#F59E0B',
  btn_primary:    '#F59E0B',
  btn_text:       '#0F172A',
  btn_icon:       '#0F172A',
  text_white:     '#F1F5F9',
  text_grey:      '#94A3B8',
  text_dark:      '#1E293B',
  text_label:     '#64748B',
  inputBgColor:   '#F1F5F9',
  inputBorder:    '#E2E8F0',
  inputIcon:      '#94A3B8',
  error:          '#EF4444',
  divider:        '#CBD5E1',
  badge_text:     '#94A3B8',
  overlay_circle: 'rgba(245,158,11,0.12)',
  card_bg:        '#FFFFFF',
  card_shadow:    '#E2E8F0',
  green_bg:       'rgba(34,197,94,0.12)',
  green_text:     '#16A34A',
  green_icon_bg:  'rgba(34,197,94,0.18)',
  blue_icon_bg:   'rgba(59,130,246,0.12)',
  gold_icon_bg:   '#F59E0B',
  nav_bg:         '#FFFFFF',
  nav_inactive:   '#94A3B8',
  nav_active:     '#0F172A',
  page_bg:        '#EEF0F6',
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
  height8:  8,
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
  width8:  8,
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
  { key: 'Home',    label: 'Home',    icon: require('../../Assets/icons/home.png') },
  { key: 'Members', label: 'Members', icon: require('../../Assets/icons/members.png') },
  { key: 'Enquiry', label: 'Enquiry', icon: require('../../Assets/icons/plus2.png') },
  { key: 'Reports', label: 'Reports', icon: require('../../Assets/icons/reports2.png') },
  { key: 'Logout',  label: 'Logout',  icon: require('../../Assets/icons/logout2.png') },
];

// ─── Overview Card Data ───────────────────────────────────────────────────────

const OVERVIEW_CARDS = [
  {
    key: 'members',
    value: '248',
    label: 'MEMBERS',
    growth: '↑ 12%',
    icon: require('../../Assets/icons/members.png'),
    iconBg: Colors.gold_icon_bg,
    iconTint: Colors.bg_dark,
  },
  {
    key: 'enquiry',
    value: '36',
    label: 'NEW ENQ.',
    growth: '↑ 8%',
    icon: require('../../Assets/icons/sub.png'),
    iconBg: Colors.green_icon_bg,
    iconTint: '#16A34A',
  },
  {
    key: 'revenue',
    value: '₹1.8L',
    label: 'REVENUE',
    growth: '↑ 21%',
    icon: require('../../Assets/icons/reports2.png'),
    iconBg: Colors.blue_icon_bg,
    iconTint: '#3B82F6',
  },
];

// ─── Quick Action Data ────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  {
    key: 'new_enquiry',
    label: 'New Enquiry',
    icon: require('../../Assets/icons/plus2.png'),
    iconBg: Colors.bg_dark,
    iconTint: Colors.text_white,
    isPlus: true,
  },
  {
    key: 'subscription',
    label: 'Subscription',
    icon: require('../../Assets/icons/sub.png'),
    iconBg: Colors.green_icon_bg,
    iconTint: '#16A34A',
    isPlus: false,
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: require('../../Assets/icons/reports2.png'),
    iconBg: Colors.blue_icon_bg,
    iconTint: '#3B82F6',
    isPlus: false,
  },
];

// ─── Period Options ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS = ['Today', 'Yesterday', 'This Month', 'This Year', 'Custom'];

// ─── Screen ───────────────────────────────────────────────────────────────────

const DashboardScreen = ({ navigation }) => {
  const [activeTab, setActiveTab]           = useState('Home');
  const [ddOpen, setDdOpen]                 = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [dropdownLayout, setDropdownLayout] = useState({ x: 0, y: 0, width: 0 });

  const handlePeriodSelect = (item) => {
    setSelectedPeriod(item);
    setDdOpen(false);
  };

  const handleTabPress = (tab) => {
    if (tab.key === 'Logout') { navigation.replace('DmsLoginScreen'); return; }
    if (tab.key === 'Reports') { navigation.navigate('ReportsScreen'); return; }
    if (tab.key === 'Enquiry') { navigation.navigate('NewEnquiryScreen'); return; }
    setActiveTab(tab.key);
  };

  const handleQuickAction = (action) => {
    if (action.key === 'new_enquiry') { navigation.navigate('NewEnquiryScreen'); return; }
    if (action.key === 'reports') { navigation.navigate('ReportsScreen'); return; }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* ── TOP HEADER ───────────────────────────────────────────────────── */}
      <View style={styles.header}>

        {/* Left: User Info */}
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

        {/* Right: Notification + Avatar */}
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

      {/* ── SCROLLABLE BODY ──────────────────────────────────────────────── */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── OVERVIEW SECTION ───────────────────────────────────────────── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Overview</Text>

          {/* Dropdown Trigger */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.ddTrigger}
            onPress={(e) => {
              e.target.measure((fx, fy, width, height, px, py) => {
                setDropdownLayout({ x: px, y: py + height + 4, width });
                setDdOpen(true);
              });
            }}
          >
            <Text style={styles.ddTriggerText}>{selectedPeriod}</Text>
            <Image
              source={require('../../Assets/icons/dropdown.png')}
              style={styles.dropdownIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* ── Period Dropdown Modal ─────────────────────────────────────── */}
        <Modal
          visible={ddOpen}
          transparent
          animationType="none"
          onRequestClose={() => setDdOpen(false)}
        >
          <TouchableOpacity
            style={styles.ddBackdrop}
            activeOpacity={1}
            onPress={() => setDdOpen(false)}
          >
            <View style={[styles.ddList, { top: dropdownLayout.y, right: 16 }]}>
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
                  <Text style={[
                    styles.ddItemText,
                    selectedPeriod === item && styles.ddItemTextActive,
                  ]}>
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

        {/* ── OVERVIEW CARDS ─────────────────────────────────────────────── */}
        <View style={styles.overviewRow}>
          {OVERVIEW_CARDS.map((card) => (
            <View key={card.key} style={styles.overviewCard}>
              <View style={[styles.overviewIconBox, { backgroundColor: card.iconBg }]}>
                <Image
                  source={card.icon}
                  style={[styles.overviewIcon, { tintColor: card.iconTint }]}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.overviewValue}>{card.value}</Text>
              <Text style={styles.overviewLabel}>{card.label}</Text>
              <Text style={styles.overviewGrowth}>{card.growth}</Text>
            </View>
          ))}
        </View>

        {/* ── QUICK ACTIONS SECTION ───────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { marginTop: CommonHeights.height26 }]}>
          Quick Actions
        </Text>

        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.quickActionCard}
              activeOpacity={0.8}
              onPress={() => handleQuickAction(action)}
            >
              <View style={[styles.quickActionIconBox, { backgroundColor: action.iconBg }]}>
                {action.isPlus ? (
                  <Text style={styles.plusSign}>＋</Text>
                ) : (
                  <Image
                    source={action.icon}
                    style={[styles.quickActionIcon, { tintColor: action.iconTint }]}
                    resizeMode="contain"
                  />
                )}
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* ── BOTTOM NAV BAR ───────────────────────────────────────────────── */}
      <View style={styles.navBar}>
        {NAV_TABS.map((tab) => {
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
                  { tintColor: isActive ? Colors.nav_active : Colors.nav_inactive },
                ]}
                resizeMode="contain"
              />
              <Text style={[
                styles.navLabel,
                isActive ? styles.navLabelActive : styles.navLabelInactive,
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: Colors.page_bg,
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

  // ── User Info (left side of header) ───────────────────────────────────────

  userInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },

  username: {
    color: Colors.text_white,
    fontSize: CommonFonts.font20,
    fontWeight: '580',
    top: 10,
  },

  // NEW — day name below username
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

  // ── Header Right (bell + avatar) ──────────────────────────────────────────

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

  // ── Body ──────────────────────────────────────────────────────────────────

  body: {
    flex: 1,
    backgroundColor: Colors.page_bg,
  },

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

  // ── Dropdown Trigger ──────────────────────────────────────────────────────

  ddTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBgColor,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },

  ddTriggerText: {
    color: Colors.primary,
    fontSize: CommonFonts.font13,
    fontWeight: '600',
  },

  // ── Dropdown Modal ────────────────────────────────────────────────────────

  ddBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
     bottom: 34,
     marginLeft: 10,
  },

  ddList: {
    position: 'absolute',
    width: 109,
    backgroundColor: Colors.card_bg,
    borderRadius: 1,
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
      android: { elevation: 4 },
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

  // ── Overview Cards ────────────────────────────────────────────────────────

  overviewRow: {
    flexDirection: 'row',
    gap: CommonWidths.width12,
    
  },

  overviewCard: {
    flex: 1,
    backgroundColor: Colors.card_bg,
    borderRadius: 10,
    paddingHorizontal: CommonWidths.width10,
    paddingVertical: CommonHeights.height8,
    paddingBottom: -3,
    
    alignItems: 'flex-start',
    justifyContent:'center',
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
    fontSize: CommonFonts.font18,
    fontWeight: 'bold',
    
  },

  overviewLabel: {
    color: Colors.text_grey,
    fontSize: CommonFonts.font10,
    fontWeight: '600',
    letterSpacing: 0.5,
    top:5,
  },

  overviewGrowth: {
    color: Colors.green_text,
    fontSize: CommonFonts.font11,
    fontWeight: '600',
    marginLeft: 50,
    bottom: 75,
   
  },

  // ── Quick Actions ─────────────────────────────────────────────────────────

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

  // ── Bottom Nav Bar ────────────────────────────────────────────────────────

  navBar: {
    flexDirection: 'row',
    backgroundColor: Colors.nav_bg,
    borderTopWidth: 1,
    borderTopColor: Colors.inputBorder,
    paddingBottom: Platform.OS === 'ios' ? 16 : CommonHeights.height10,
    paddingTop: CommonHeights.height14,
    paddingHorizontal: CommonWidths.width8,
  },

  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  navIcon: {
    width: CommonWidths.width20,
    height: CommonHeights.height20,
  },

  navLabel: {
    fontSize: CommonFonts.font11,
    fontWeight: '500',
  },

  navLabelActive: {
    color: Colors.nav_active,
    fontWeight: '700',
  },

  navLabelInactive: {
    color: Colors.nav_inactive,
  },

});

export default DashboardScreen;