import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getNewBookings } from '../../Api/ApiService';

const Colors = {
  bg_dark: '#0F172A',
  primary: '#F59E0B',
  text_white: '#F1F5F9',
  text_grey: '#94A3B8',
  text_dark: '#1E293B',
  card_bg: '#FFFFFF',
  page_bg: '#EEF0F6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  border: '#E2E8F0',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const statusColor = (status) => {
  if (!status) return Colors.text_grey;
  const s = status.toLowerCase();
  if (s === 'confirmed') return Colors.success;
  if (s === 'cancelled') return Colors.danger;
  return Colors.warning;
};

const statusBg = (status) => {
  if (!status) return '#F1F5F9';
  const s = status.toLowerCase();
  if (s === 'confirmed') return '#D1FAE5';
  if (s === 'cancelled') return '#FEE2E2';
  return '#FEF3C7';
};

// ─── BOOKING CARD ─────────────────────────────────────────────────────────────
const BookingCard = ({ item, navigation }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={() =>
      navigation.navigate('UsersDetailsScreen', {
        bookingId: item.bookingId,
        booking: item,
      })
    }
  >
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.guestName}>{item.member || 'Unknown Guest'}</Text>
          <Text style={styles.propertyName}>
            {item.property} · {item.category}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusBg(item.status) },
          ]}>
          <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
            {item.status || 'Pending'}
          </Text>
        </View>
      </View>

      {/* Plan badge */}
      <View style={styles.planRow}>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>🗓 {item.plan}</Text>
        </View>

      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Dates Row */}
      <View style={styles.datesRow}>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>Check-In</Text>
          <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
        </View>
        <View style={styles.arrowBox}>
          <Text style={styles.arrow}>→</Text>
        </View>
        <View style={[styles.dateBox, { alignItems: 'flex-end' }]}>
          <Text style={styles.dateLabel}>Check-Out</Text>
          <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
        </View>
      </View>

      {/* Info Grid */}
      <View style={styles.infoGrid}>
        <InfoChip icon="👥" label="Guests" value={item.noOfGuest ?? '—'} />
        <InfoChip icon="📞" label="Mobile" value={item.mobile || '—'} />

      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          Received by: {item.receivedBy || '—'}
        </Text>
        {item.bookingSource ? (
          <Text style={styles.footerText}>Source: {item.bookingSource}</Text>
        ) : null}
      </View>
    </View>
  </TouchableOpacity>
);

const InfoChip = ({ icon, label, value, highlight }) => (
  <View style={styles.chip}>
    <Text style={styles.chipIcon}>{icon}</Text>
    <View>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={[styles.chipValue, highlight && { color: Colors.danger, fontWeight: '700' }]}>
        {String(value)}
      </Text>
    </View>
  </View>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
const CheckinDetailsScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const result = await getNewBookings();

      console.log('📦 getNewBookings result:', JSON.stringify(result, null, 2));

      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ Bookings loaded: ${result.data.length} records`);
        setBookings(result.data);
      } else {
        console.warn('⚠️ API failed:', result.message);
        setError(result.message || 'No bookings found.');
        setBookings([]);
      }
    } catch (err) {
      console.error('❌ Unexpected Error:', err);
      setError('Failed to load bookings. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Image
            source={require('../../Assets/icons/ak.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Check-In Details</Text>
          <Text style={styles.headerSubTitle}>
            Today's Bookings · {bookings.length} records
          </Text>
        </View>

        {/* Refresh button */}
       

        <View style={styles.goldLine} />
      </View>

      {/* ── CONTENT ── */}
      <View style={styles.pageWrapper}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading bookings...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(true)}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }>
            {bookings.length === 0 ? (
              <View style={styles.centered}>
                <Text style={styles.errorEmoji}>📋</Text>
                <Text style={styles.errorText}>No bookings for today.</Text>
              </View>
            ) : (
              bookings.map((item) => (
                <BookingCard
                  key={item.bookingId ?? item.Id ?? index}
                  item={item}
                  navigation={navigation}
                />
              ))
            )}
            <View style={{ height: 32 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CheckinDetailsScreen;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg_dark,
  },
  pageWrapper: {
    flex: 1,
    backgroundColor: Colors.page_bg,
  },

  // Header
  header: {
    backgroundColor: Colors.bg_dark,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 27,
  },
  goldLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    color: Colors.text_white,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubTitle: {
    color: Colors.text_grey,
    fontSize: 12,
    marginTop: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    zIndex: 2,
  },
  backIcon: {
    width: 18,
    height: 18,
    tintColor: Colors.text_white,
  },
 

  // List
  listContainer: {
    padding: 16,
    paddingTop: 12,
  },

  // Card
  card: {
    backgroundColor: Colors.card_bg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  guestName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text_dark,
  },
  propertyName: {
    fontSize: 12,
    color: Colors.text_grey,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  planText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '700',
  },
  bookingIdText: {
    fontSize: 11,
    color: Colors.text_grey,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },

  // Dates Row
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.text_grey,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.text_dark,
    fontWeight: '700',
    marginTop: 2,
  },
  arrowBox: {
    paddingHorizontal: 12,
  },
  arrow: {
    fontSize: 18,
    color: Colors.primary,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
    minWidth: '45%',
    flex: 1,
  },
  chipIcon: {
    fontSize: 14,
  },
  chipLabel: {
    fontSize: 10,
    color: Colors.text_grey,
    fontWeight: '600',
  },
  chipValue: {
    fontSize: 13,
    color: Colors.text_dark,
    fontWeight: '600',
    marginTop: 1,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 4,
  },
  footerText: {
    fontSize: 11,
    color: Colors.text_grey,
  },

  // States
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    color: Colors.text_grey,
    marginTop: 12,
    fontSize: 14,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    color: Colors.text_grey,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: Colors.bg_dark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: Colors.text_white,
    fontWeight: '700',
    fontSize: 14,
  },
});