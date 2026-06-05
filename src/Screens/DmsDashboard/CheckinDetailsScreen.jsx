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
} from 'react-native';

import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

const Colors = {
  bg_dark: '#0F172A',
  primary: '#F59E0B',
  text_white: '#F1F5F9',
  text_grey: '#94A3B8',
  text_dark: '#1E293B',
  inputBorder: '#E2E8F0',
  card_bg: '#FFFFFF',
  page_bg: '#EEF0F6',
};

const CheckinDetailsScreen = ({ navigation }) => {
  const [images, setImages] = useState([]);

  const pickImage = () => {
    Alert.alert(
      'Upload ID',
      'Choose Option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (!result.didCancel && result.assets?.length) {
      setImages(prev => [...prev, result.assets[0]]);
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });
    if (!result.didCancel && result.assets?.length) {
      setImages(prev => [...prev, result.assets[0]]);
    }
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert('Validation', 'Please upload at least one ID image');
      return;
    }

    // API CALL HERE
    console.log(images);

    Alert.alert(
      'Success',
      'Check-In details submitted successfully',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    // ✅ SafeAreaView sirf bg_dark rakho — yeh status bar + header area cover karega
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.bg_dark} barStyle="light-content" />

      {/* HEADER — bg_dark */}
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

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Check-In Details</Text>
          <Text style={styles.headerSubTitle}>Upload Guest ID Proofs</Text>
        </View>

        <View style={styles.goldLine} />
      </View>

      {/* ✅ Yeh wrapper View page_bg color deta hai — SafeAreaView se alag */}
      <View style={styles.pageWrapper}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Guest Documents</Text>

            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Text style={styles.uploadText}>+ Upload ID Image</Text>
            </TouchableOpacity>

            <View style={styles.imageContainer}>
              {images.map((item, index) => (
                <Image
                  key={index}
                  source={{ uri: item.uri }}
                  style={styles.preview}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Check-In</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CheckinDetailsScreen;

const styles = StyleSheet.create({
  // ✅ SafeAreaView ka bg = bg_dark (header/status bar match karega)
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg_dark,
  },

  // ✅ Content area ka bg = page_bg (light grey)
  pageWrapper: {
    flex: 1,
    backgroundColor: Colors.page_bg,
  },

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

  container: {
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text_dark,
    marginBottom: 16,
  },

  uploadBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
  },

  uploadText: {
    color: Colors.primary,
    fontWeight: '700',
  },

  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },

  preview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
    marginBottom: 10,
  },

  submitBtn: {
    backgroundColor: Colors.bg_dark,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },

  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
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
});