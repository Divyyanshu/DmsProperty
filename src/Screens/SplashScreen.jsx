
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Colors from '../Constants/Colors';

const { width, height } = Dimensions.get('window');

/* ─── small icon svg-like component ──────────────────────────────────────── */
function LogoIcon({ size = 72 }) {
  return (
    <View
      style={[
        styles.logoIconWrapper,
        { width: size, height: size, borderRadius: size * 0.24 },
      ]}
    >
      {/* Three horizontal "lines" representing a document/data icon */}
      <View style={styles.iconLine} />
      <View style={[styles.iconLine, { width: '60%' }]} />
      <View style={[styles.iconLine, { width: '75%' }]} />
    </View>
  );
}

/* ─── Decorative ring ─────────────────────────────────────────────────────── */
function Ring({ size, opacity, top, left, delay }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.05] });

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          top,
          left,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function SplashScreen({ navigation }) {
  // Animation values
  const logoOpacity   = useRef(new Animated.Value(0)).current;
  const logoScale     = useRef(new Animated.Value(0.6)).current;
  const brandOpacity  = useRef(new Animated.Value(0)).current;
  const brandY        = useRef(new Animated.Value(24)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY      = useRef(new Animated.Value(20)).current;
  const barWidth      = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // ── Sequence ──────────────────────────────────────────────────────────
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]),

      // 2. Brand name slides up
      Animated.parallel([
        Animated.timing(brandOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(brandY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 3. Tagline slides up
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 4. Progress bar fills
      Animated.timing(barWidth, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false, // width cannot use native driver
      }),

      // 5. Fade out before navigating
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.replace('DmsLoginScreen');
    });
  }, []);

  const progressWidth = barWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Decorative rings ──────────────────────────────────────────── */}
      <Ring size={320} opacity={0.06} top={-80}        left={-100}       delay={0}    />
      <Ring size={260} opacity={0.08} top={height*0.5} left={width-160}  delay={500}  />
      <Ring size={200} opacity={0.05} top={height*0.7} left={-60}        delay={1000} />
      <Ring size={180} opacity={0.07} top={-40}        left={width-100}  delay={200}  />

      {/* ── Gold accent bar top-left ───────────────────────────────────── */}
      

      <SafeAreaView style={styles.safeArea}>
        {/* ── Center content ────────────────────────────────────────────── */}
        <View style={styles.centerBlock}>
          {/* Logo icon */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
              marginBottom: 28,
            }}
          >
            <LogoIcon size={80} />
          </Animated.View>

          {/* Brand name */}
          <Animated.View
            style={{
              opacity: brandOpacity,
              transform: [{ translateY: brandY }],
              alignItems: 'center',
            }}
          >
            <Text style={styles.brandName}>Data Management</Text>
            <Text style={styles.brandName}>System</Text>
            <Text style={styles.brandSub}>ENTERPRISE PLATFORM</Text>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <View style={styles.dividerDot} />
            <View style={styles.dividerLine} />
          </View>

          {/* Tagline */}
          <Animated.Text
            style={[
              styles.tagline,
              { opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
            ]}
          >
            Unified Data,{' '}
            <Text style={styles.taglineAccent}>Smarter Decisions</Text>
          </Animated.Text>

          
        </View>

        {/* ── Bottom progress ───────────────────────────────────────────── */}
        <View style={styles.bottomBlock}>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.loadingText}>Initializing secure workspace…</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <View style={[styles.badgeDot, { backgroundColor: '#22C55E' }]} />
              <Text style={styles.badgeText}>256-bit SSL</Text>
            </View>
            <View style={styles.badge}>
              <View style={[styles.badgeDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.badgeText}>End-to-end Encrypted</Text>
            </View>
            <View style={styles.badge}>
              <View style={[styles.badgeDot, { backgroundColor: '#60A5FA' }]} />
              <Text style={styles.badgeText}>ISO 27001</Text>
            </View>
          </View>

          <Text style={styles.version}>v2.1.0 · © 2026 DMS Platform</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg_dark,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },

 
 
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.white_alpha20,
  },

  /* Center block */
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  /* Logo icon */
  logoIconWrapper: {
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 18,
    paddingHorizontal: 16,
  },
  iconLine: {
    height: 3.5,
    width: '80%',
    backgroundColor: Colors.dark_icon_bg,
    borderRadius: 2,
  },

  /* Brand */
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text_white,
    letterSpacing: 0.5,
    lineHeight: 34,
    textAlign: 'center',
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text_grey,
    letterSpacing: 3.5,
    marginTop: 6,
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.white_alpha10,
    maxWidth: 60,
  },
  dividerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },

  /* Tagline */
  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text_white,
    textAlign: 'center',
    lineHeight: 30,
  },
  taglineAccent: {
    color: Colors.primary,
  },
  taglineSub: {
    fontSize: 13,
    color: Colors.text_grey,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 10,
    maxWidth: 280,
  },

  /* Bottom */
  bottomBlock: {
    paddingHorizontal: 28,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.white_alpha10,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 12,
    color: Colors.text_grey,
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    color: Colors.text_grey,
    letterSpacing: 0.2,
  },
  version: {
    fontSize: 10,
    color: Colors.text_label,
    marginTop: 4,
  },
});