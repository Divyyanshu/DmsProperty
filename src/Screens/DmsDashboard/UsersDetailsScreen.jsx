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
  Alert,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import { uploadGuestIds } from '../../Api/ApiService'; // ✅ ApiService se import

const { width } = Dimensions.get('window');
const PHOTO_SIZE = (width - 32 - 16 - 16 - 8 * 2) / 3;

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

// ─── PERMISSION ───────────────────────────────────────────────────────────────
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Please allow camera access to capture photos.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
const statusColor = (s) => {
  if (!s) return Colors.text_grey;
  if (s.toLowerCase() === 'confirmed') return Colors.success;
  if (s.toLowerCase() === 'cancelled') return Colors.danger;
  return Colors.warning;
};
const statusBg = (s) => {
  if (!s) return '#F1F5F9';
  if (s.toLowerCase() === 'confirmed') return '#D1FAE5';
  if (s.toLowerCase() === 'cancelled') return '#FEE2E2';
  return '#FEF3C7';
};

// ─── DETAIL ROW ───────────────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value, highlight }) => (
  <View style={styles.row}>
    <Text style={styles.rowIcon}>{icon}</Text>
    <View style={styles.rowContent}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && { color: Colors.danger, fontWeight: '700' }]}>
        {value || '—'}
      </Text>
    </View>
  </View>
);

// ─── GUEST ID CARD ────────────────────────────────────────────────────────────
const GuestIdCard = ({ guestIndex, guestData, onNameChange, onAgeChange, onAddPhoto, onRemovePhoto, onRemoveGuest }) => {
  const MAX_PHOTOS = 4;
  const photos = guestData.photos ?? [];

  const handlePickSource = () => {
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit Reached', `You can upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }
    Alert.alert(
      `Guest ${guestIndex + 1} — Add Photo`,
      `${photos.length}/${MAX_PHOTOS} photos added`,
      [
        { text: '📷 Camera', onPress: () => onAddPhoto(guestIndex, 'camera') },
        { text: '🖼️ Gallery', onPress: () => onAddPhoto(guestIndex, 'gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.guestCard}>
      {/* Guest Header */}
      <View style={styles.guestHeader}>
        <View style={styles.guestNumberBadge}>
          <Text style={styles.guestNumberText}>{guestIndex + 1}</Text>
        </View>
        <Text style={styles.guestCardTitle}>Guest {guestIndex + 1}</Text>
        <Text style={styles.guestPhotoCount}>{photos.length}/{MAX_PHOTOS} photos</Text>
        <TouchableOpacity style={styles.removeGuestBtn} onPress={() => onRemoveGuest(guestIndex)} activeOpacity={0.8}>
          <Text style={styles.removeGuestText}>✕ Remove</Text>
        </TouchableOpacity>
      </View>

      {/* Name + Age Row */}
      <View style={styles.nameAgeRow}>
        <TextInput
          style={[styles.nameInput, { flex: 1, marginRight: 10 }]}
          placeholder={`Guest ${guestIndex + 1} Name`}
          placeholderTextColor={Colors.text_grey}
          value={guestData.name}
          onChangeText={(text) => onNameChange(guestIndex, text)}
        />
        <TextInput
          style={[styles.nameInput, styles.ageInput]}
          placeholder="Age"
          placeholderTextColor={Colors.text_grey}
          value={guestData.age}
          onChangeText={(text) => {
            const cleaned = text.replace(/[^0-9]/g, '');
            if (cleaned === '' || (Number(cleaned) >= 1 && Number(cleaned) <= 120)) {
              onAgeChange(guestIndex, cleaned);
            }
          }}
          keyboardType="numeric"
          maxLength={3}
        />
      </View>

      {/* Photo Label */}
      <Text style={styles.photoLabel}>🪪 ID Photos</Text>

      {/* Photo Grid */}
      <View style={styles.previewGrid}>
        {photos.map((photo, pIndex) => (
          <View key={pIndex} style={styles.previewItem}>
            <Image source={{ uri: photo.uri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.sideLabel}>
              <Text style={styles.sideLabelText}>{pIndex % 2 === 0 ? 'Front' : 'Back'}</Text>
            </View>
            <TouchableOpacity style={styles.removePhotoBtn} onPress={() => onRemovePhoto(guestIndex, pIndex)} activeOpacity={0.8}>
              <Text style={styles.removePhotoBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {photos.length < MAX_PHOTOS && (
          <TouchableOpacity style={styles.addPhotoBox} onPress={handlePickSource} activeOpacity={0.8}>
            <Text style={styles.addPhotoIcon}>+</Text>
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {photos.length === 0 && (
        <Text style={styles.noPhotoHint}>Please Upload Your ID</Text>
      )}
    </View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
const UsersDetailsScreen = ({ navigation, route }) => {
  const { bookingId, booking } = route.params ?? {};
  const maxGuests = Number(booking?.noOfGuest ?? 1);

  const [guests, setGuests] = useState([]);
  const [uploading, setUploading] = useState(false);

  // ── Add new guest card ──
  const handleAddGuest = () => {
    if (guests.length >= maxGuests) {
      Alert.alert('Guest Limit Reached',
  `This booking allows a maximum of ${maxGuests} guests.`);
      return;
    }
    setGuests((prev) => [...prev, { name: '', age: '', photos: [] }]);
  };

  // ── Remove guest card ──
  const handleRemoveGuest = (idx) => {
    Alert.alert('Remove Guest',
  'Are you sure you want to remove this guest?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setGuests((prev) => prev.filter((_, i) => i !== idx)),
      },
    ]);
  };

  // ── Name Change ──
  const handleNameChange = (idx, text) => {
    setGuests((prev) => {
      const u = [...prev];
      u[idx] = { ...u[idx], name: text };
      return u;
    });
  };

  // ── Age Change ──
  const handleAgeChange = (idx, text) => {
    setGuests((prev) => {
      const u = [...prev];
      u[idx] = { ...u[idx], age: text };
      return u;
    });
  };

  // ── Add Photo ──
  const handleAddPhoto = async (guestIdx, source) => {
    const MAX_PHOTOS = 4;
    if (guests[guestIdx].photos.length >= MAX_PHOTOS) return;

    const appendPhoto = (asset) => {
      setGuests((prev) => {
        const u = [...prev];
        u[guestIdx] = {
          ...u[guestIdx],
          photos: [...u[guestIdx].photos, { uri: asset.uri, name: asset.fileName ?? `photo_${Date.now()}.jpg` }],
        };
        return u;
      });
    };

    if (source === 'camera') {
      const ok = await requestCameraPermission();
      if (!ok) {
        Alert.alert('Permission Denied',
  'Camera access has been denied. Please enable it from your device settings.');
        return;
      }
      launchCamera({ mediaType: 'photo', quality: 0.6, saveToPhotos: false }, (res) => {
        if (res.didCancel || res.errorCode) return;
        const asset = res.assets?.[0];
        if (asset) appendPhoto(asset);
      });
    } else {
      const remaining = MAX_PHOTOS - guests[guestIdx].photos.length;
      launchImageLibrary({ mediaType: 'photo', quality: 0.6, selectionLimit: remaining }, (res) => {
        if (res.didCancel || res.errorCode) return;
        (res.assets ?? []).forEach(appendPhoto);
      });
    }
  };

  // ── Remove Photo ──
  const handleRemovePhoto = (guestIdx, photoIdx) => {
    Alert.alert('Remove Photo',
  'Are you sure you want to remove this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          setGuests((prev) => {
            const u = [...prev];
            u[guestIdx] = { ...u[guestIdx], photos: u[guestIdx].photos.filter((_, i) => i !== photoIdx) };
            return u;
          }),
      },
    ]);
  };

  // ======================================================
  // ── UPLOAD ALL  ✅ (ApiService use ho raha hai ab)
  // ======================================================
  const handleUpload = async () => {
    const totalPhotos = guests.reduce((acc, g) => acc + g.photos.length, 0);

    if (totalPhotos === 0) {
      Alert.alert('No Photos Added',
  'Please add at least one guest photo before proceeding.');
      return;
    }

    // Validate: naam, age aur photo zaroori
    for (let i = 0; i < guests.length; i++) {
      if (!guests[i].name?.trim()) {
        Alert.alert('Name Required',
  `Please enter the name for Guest ${i + 1}.`);
        return;
      }
      if (!guests[i].age?.trim()) {
        Alert.alert( 'Age Required',
  `Please enter the age for Guest ${i + 1}.`);
        return;
      }
      if (guests[i].photos.length === 0) {
        Alert.alert(  'Photo Required',
  `Please add at least one photo for Guest ${i + 1}.`);
        return;
      }
    }

    console.log('==============================');
    console.log('=== UPLOAD STARTED ===');
    console.log('==============================');
    console.log(`BookingID       : ${bookingId}`);
    console.log(`Total Guests    : ${guests.length}`);
    console.log(`Total Photos    : ${totalPhotos}`);
    guests.forEach((g, i) => {
      console.log(`  Guest[${i}] Name : ${g.name}  Age: ${g.age}  Photos: ${g.photos.length}`);
      g.photos.forEach((p, pi) => console.log(`    Photo[${pi}] uri: ${p.uri}`));
    });

    setUploading(true);

    try {
      // ── FormData Build ──
      const formData = new FormData();

      // 1. JSON Payload
      const personsPayload = {
        BookingID: bookingId,
        Persons: guests.map((g, idx) => ({
          PersonName: g.name.trim(),
          Age:        g.age.trim(),
          FrontKey:   `P${idx}_Front`,
          BackKey:    `P${idx}_Back`,
        })),
      };
      formData.append('data', JSON.stringify(personsPayload));

      // 2. Photos Append
      guests.forEach((g, gIdx) => {
        g.photos.forEach((photo, pIdx) => {
          const isFront = pIdx % 2 === 0;
          const key     = isFront ? `P${gIdx}_Front` : `P${gIdx}_Back`;
          const ext     = photo.uri?.split('.').pop()?.split('?')[0] ?? 'jpg';
          const mime    = ext === 'png' ? 'image/png' : 'image/jpeg';

          formData.append(key, {
            uri:  photo.uri,
            type: mime,
            name: photo.name || `${key}.${ext}`,
          });
        });
      });

      console.log('FormData Ready → Sending via ApiService...');

      // ✅ ApiService call — token automatic attach hoga AxiosClient se
      const result = await uploadGuestIds(formData);

      console.log('Upload Result =>', JSON.stringify(result, null, 2));

      if (result.success) {
        Alert.alert('✅ Success', 'Files uploaded successfully!');
        setGuests([]);
      } else {
        Alert.alert('❌ Failed', result.message || 'Upload failed');
      }

    } catch (err) {
      console.error('Upload Error:', err);
      Alert.alert('❌ Error', err.message || 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  const totalPhotos = guests.reduce((acc, g) => acc + g.photos.length, 0);
  const canAddMore  = guests.length < maxGuests;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Image source={require('../../Assets/icons/ak.png')} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>User Details</Text>
          <Text style={styles.headerSubTitle}>#{bookingId?.slice(-8) ?? '—'}</Text>
        </View>
        <View style={styles.goldLine} />
      </View>

      {/* ── CONTENT ── */}
      <ScrollView style={styles.pageWrapper} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Guest Name Banner */}
        <View style={styles.nameBanner}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{booking?.member?.charAt(0)?.toUpperCase() ?? '?'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guestName}>{booking?.member ?? 'Unknown Guest'}</Text>
            <Text style={styles.guestSub}>{booking?.mobile ?? '—'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBg(booking?.status) }]}>
            <Text style={[styles.statusText, { color: statusColor(booking?.status) }]}>
              {booking?.status ?? 'Pending'}
            </Text>
          </View>
        </View>

        {/* Property Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏨 Property Info</Text>
          <DetailRow icon="🏠" label="Property" value={booking?.property} />
          <DetailRow icon="🗂" label="Category" value={booking?.category} />
          <DetailRow icon="🗓" label="Plan" value={booking?.plan} />
          <DetailRow icon="🏡" label="Host" value={booking?.host} />
        </View>

        {/* Stay Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Stay Dates</Text>
          <View style={styles.datesRow}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>CHECK-IN</Text>
              <Text style={styles.dateValue}>{formatDate(booking?.startDate)}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={[styles.dateBox, { alignItems: 'flex-end' }]}>
              <Text style={styles.dateLabel}>CHECK-OUT</Text>
              <Text style={styles.dateValue}>{formatDate(booking?.endDate)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Info</Text>
          <DetailRow icon="💰" label="Deal Amount" value={booking?.amount} />
          <DetailRow icon="✅" label="Advance Paid" value={`₹${Number(booking?.advanceAmount ?? 0).toLocaleString('en-IN')}`} />
          <DetailRow icon="⏳" label="Balance Due" value={`₹${Number(booking?.balanceAmount ?? 0).toLocaleString('en-IN')}`} highlight />
        </View>

        {/* Other Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Other Info</Text>
          <DetailRow icon="👥" label="No. of Guests" value={String(booking?.noOfGuest ?? '—')} />
          <DetailRow icon="📋" label="Booking Source" value={booking?.bookingSource} />
          <DetailRow icon="👤" label="Received By" value={booking?.receivedBy} />
          <DetailRow icon="🔖" label="Booking ID" value={bookingId} />
        </View>

        {/* ─── ID UPLOAD SECTION ────────────────────────────────────────────── */}
        <View style={styles.uploadSectionHeader}>
          <Text style={styles.uploadSectionTitle}>🪪 Guest ID Upload</Text>
          <View style={styles.uploadSectionBadge}>
            <Text style={styles.uploadSectionBadgeText}>
              {guests.length}/{maxGuests} Added
            </Text>
          </View>
        </View>
        <Text style={styles.uploadSectionHint}>
         Tap "+ Add Guest" to add a guest ID. A maximum of {maxGuests} guest(s) can be added.
        </Text>

        {/* Rendered Guest Cards */}
        {guests.map((g, idx) => (
          <GuestIdCard
            key={idx}
            guestIndex={idx}
            guestData={g}
            onNameChange={handleNameChange}
            onAgeChange={handleAgeChange}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onRemoveGuest={handleRemoveGuest}
          />
        ))}

        {/* + Add Guest Button */}
        {canAddMore && (
          <TouchableOpacity style={styles.addGuestBtn} onPress={handleAddGuest} activeOpacity={0.8}>
            <Text style={styles.addGuestBtnIcon}>+</Text>
            <Text style={styles.addGuestBtnText}>
              Add Guest  ({guests.length}/{maxGuests})
            </Text>
          </TouchableOpacity>
        )}

        {/* Max reached info */}
        {!canAddMore && (
          <View style={styles.maxReachedBox}>
            <Text style={styles.maxReachedText}>'Upload Successful'{maxGuests} All files have been uploaded successfully</Text>
          </View>
        )}

        {/* Upload All Button */}
        {guests.length > 0 && (
          <TouchableOpacity
            style={[styles.uploadIdBtn, (totalPhotos === 0 || uploading) && styles.uploadIdBtnDisabled]}
            onPress={handleUpload}
            activeOpacity={0.85}
            disabled={uploading || totalPhotos === 0}>
            <Text style={styles.uploadIdBtnText}>
              {uploading ? '⏳  Uploading...' : `⬆️  ID Upload All  ${totalPhotos > 0 ? `(${totalPhotos} photos)` : ''}`}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── UPLOAD LOADER OVERLAY ── */}
      <Modal transparent animationType="fade" visible={uploading}>
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loaderTitle}>Uploading...</Text>
            <Text style={styles.loaderSub}> Uploading guest ID documents...{'\n'}
  Please wait.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UsersDetailsScreen;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.bg_dark },
  pageWrapper: { flex: 1, backgroundColor: Colors.page_bg },
  scrollContent: { padding: 16, paddingTop: 12 },

  header: {
    backgroundColor: Colors.bg_dark, paddingHorizontal: 20, paddingTop: 8,
    paddingBottom: 24, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', marginTop: 27,
  },
  goldLine: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: Colors.primary },
  headerTitle: { color: Colors.text_white, fontSize: 18, fontWeight: '700' },
  headerSubTitle: { color: Colors.text_grey, fontSize: 12, marginTop: 2, fontFamily: 'monospace' },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center', marginRight: 14, zIndex: 2,
  },
  backIcon: { width: 18, height: 18, tintColor: Colors.text_white },

  nameBanner: {
    backgroundColor: Colors.card_bg, borderRadius: 18, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.bg_dark, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.primary, fontSize: 22, fontWeight: '800' },
  guestName: { fontSize: 16, fontWeight: '700', color: Colors.text_dark },
  guestSub: { fontSize: 12, color: Colors.text_grey, marginTop: 2 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700' },

  section: {
    backgroundColor: Colors.card_bg, borderRadius: 18, padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.text_dark, marginBottom: 12, letterSpacing: 0.3 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  rowIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  rowContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, color: Colors.text_grey },
  rowValue: { fontSize: 13, color: Colors.text_dark, fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 8 },

  datesRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12 },
  dateBox: { flex: 1 },
  dateLabel: { fontSize: 10, color: Colors.text_grey, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { fontSize: 14, color: Colors.text_dark, fontWeight: '700', marginTop: 2 },
  arrow: { fontSize: 18, color: Colors.primary, paddingHorizontal: 12 },

  uploadSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6, marginTop: 4 },
  uploadSectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text_dark, flex: 1 },
  uploadSectionBadge: { backgroundColor: Colors.bg_dark, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  uploadSectionBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '700' },
  uploadSectionHint: { fontSize: 12, color: Colors.text_grey, marginBottom: 14, lineHeight: 18 },

  guestCard: {
    backgroundColor: Colors.card_bg, borderRadius: 18, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
  },
  guestHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  guestNumberBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.bg_dark, alignItems: 'center', justifyContent: 'center' },
  guestNumberText: { color: Colors.primary, fontSize: 13, fontWeight: '800' },
  guestCardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.text_dark },
  guestPhotoCount: { fontSize: 11, color: Colors.text_grey, fontWeight: '600' },
  removeGuestBtn: { backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  removeGuestText: { color: Colors.danger, fontSize: 11, fontWeight: '700' },

  nameAgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  nameInput: {
    backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.text_dark,
  },
  ageInput: { width: 72, textAlign: 'center', marginRight: 0 },

  photoLabel: { fontSize: 12, fontWeight: '700', color: Colors.text_dark, marginBottom: 10 },

  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  previewItem: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 10, overflow: 'visible' },
  previewImage: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 10, borderWidth: 1, borderColor: Colors.border },
  sideLabel: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  sideLabelText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  removePhotoBtn: {
    position: 'absolute', top: -7, right: -7, width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.danger, alignItems: 'center', justifyContent: 'center', zIndex: 10, elevation: 4,
  },
  removePhotoBtnText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  addPhotoBox: {
    width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 10, borderWidth: 1.5,
    borderColor: Colors.primary, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFBEB', gap: 4,
  },
  addPhotoIcon: { fontSize: 22, color: Colors.primary, fontWeight: '700', lineHeight: 26 },
  addPhotoText: { fontSize: 10, color: Colors.primary, fontWeight: '700' },
  noPhotoHint: { fontSize: 11, color: Colors.text_grey, textAlign: 'center', marginBottom: 4, marginTop: 4 },

  addGuestBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed',
    borderRadius: 16, paddingVertical: 16, marginBottom: 12, backgroundColor: '#FFFBEB',
  },
  addGuestBtnIcon: { fontSize: 20, color: Colors.primary, fontWeight: '800', lineHeight: 24 },
  addGuestBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  maxReachedBox: {
    backgroundColor: '#D1FAE5', borderRadius: 12, paddingVertical: 12,
    alignItems: 'center', marginBottom: 12,
  },
  maxReachedText: { fontSize: 13, color: Colors.success, fontWeight: '700' },

  uploadIdBtn: {
    backgroundColor: Colors.bg_dark, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  uploadIdBtnDisabled: { backgroundColor: '#CBD5E1' },
  uploadIdBtnText: { color: Colors.text_white, fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },

  loaderOverlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.75)',
    alignItems: 'center', justifyContent: 'center',
  },
  loaderBox: {
    backgroundColor: Colors.card_bg, borderRadius: 20, paddingVertical: 32, paddingHorizontal: 40,
    alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  loaderTitle: { fontSize: 17, fontWeight: '800', color: Colors.text_dark, marginTop: 4 },
  loaderSub: { fontSize: 13, color: Colors.text_grey, textAlign: 'center', lineHeight: 20 },
});