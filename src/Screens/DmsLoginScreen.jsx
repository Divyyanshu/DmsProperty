import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginUser } from '../Api/ApiService';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const BOTTOM_SPACE = Platform.OS === 'ios' ? 34 : 16;

const Colors = {
  bg_dark: '#0F172A',
  bg_light: '#F8FAFC',
  primary: '#F59E0B',
  btn_primary: '#F59E0B',
  btn_text: '#0F172A',
  btn_icon: '#0F172A',
  text_white: '#F1F5F9',
  text_grey: '#94A3B8',
  text_dark: '#1E293B',
  text_label: '#64748B',
  inputBgColor: '#F1F5F9',
  inputBorder: '#E2E8F0',
  inputIcon: '#94A3B8',
  error: '#EF4444',
  error_bg: '#FEE2E2',
  error_border: '#FECACA',
  divider: '#CBD5E1',
  badge_text: '#94A3B8',
  overlay_circle: 'rgba(245,158,11,0.12)',
  input_active_bg: '#FFFBEB',
  input_active_border: '#F59E0B',
  btn_success_bg: '#16A34A',
  btn_dark_bg: '#1E293B',
  warning_bg: '#FEF3C7',
  warning_border: '#FDE68A',
  warning_text: '#D97706',
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
  font22: 22,
  font28: 28,
};

// ─── Heights ──────────────────────────────────────────────────────────────────
const CommonHeights = {
  height8: 8,
  height10: 10,
  height14: 14,
  height16: 16,
  height18: 18,
  height20: 20,
  height22: 22,
  height24: 24,
  height26: 26,
  height30: 30,
  height40: 40,
  height52: 52,
  height56: 56,
};

// ─── Widths ───────────────────────────────────────────────────────────────────
const CommonWidths = {
  width8: 8,
  width10: 10,
  width12: 12,
  width16: 16,
  width20: 20,
  width24: 24,
  width30: 30,
  width36: 36,
  width40: 40,
};

// ─── Button States ────────────────────────────────────────────────────────
const BTN_IDLE = 'idle';
const BTN_LOADING = 'loading';
const BTN_SUCCESS = 'success';
const BTN_ERROR = 'error';

// ─── Validation Functions ─────────────────────────────────────────────────
const validateUsername = value => {
  if (!value || value.trim().length === 0) {
    return 'Username is required';
  }
  if (value.trim().length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(value.trim())) {
    return 'Username can only contain letters, numbers, dots, hyphens, and underscores';
  }
  return null;
};

const validatePassword = value => {
  if (!value || value.length === 0) {
    return 'Password is required';
  }
  if (value.length < 3) {
    return 'Password must be at least 3 characters';
  }
  return null;
};

// ─── Main Login Screen Component ───────────────────────────────────────────
const DmsLoginScreen = ({ navigation }) => {
  // ── State Management ──────────────────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [globalError, setGlobalError] = useState('');
  const [globalWarning, setGlobalWarning] = useState('');
  const [btnState, setBtnState] = useState(BTN_IDLE);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const loaderOpacity = useRef(new Animated.Value(0)).current;

  // ── Computed State ───────────────────────────────────────────────────
  const isLoading = btnState === BTN_LOADING;
  const isSuccess = btnState === BTN_SUCCESS;
  const isError = btnState === BTN_ERROR;
  const isFormValid =
    username.trim().length >= 3 &&
    password.length >= 3 &&
    !usernameError &&
    !passwordError;
  const isFormDisabled = isLoading || isSuccess;

  const handleUsernameChange = text => {
    setUsername(text);
    if (usernameError) setUsernameError('');
    if (globalError) setGlobalError('');
    if (globalWarning) setGlobalWarning('');
  };

  const handlePasswordChange = text => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (globalError) setGlobalError('');
    if (globalWarning) setGlobalWarning('');
  };

  const handleUsernameBlur = () => {
    setUsernameFocused(false);
    const err = validateUsername(username);
    if (err) {
      setUsernameError(err);
    }
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    const err = validatePassword(password);
    if (err) {
      setPasswordError(err);
    }
  };

  const showLoaderAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(loaderOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(loaderOpacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  };

  const handleSignIn = async () => {
    try {
      // Reset previous errors
      setGlobalError('');
      setGlobalWarning('');

      // Validate inputs
      const uErr = validateUsername(username);
      const pErr = validatePassword(password);

      setUsernameError(uErr || '');
      setPasswordError(pErr || '');

      if (uErr || pErr) {
        const errorMessage = uErr || pErr;
        Alert.alert(
          '⚠️ Validation Error',
          errorMessage,
          [{ text: 'OK', style: 'default' }],
          { cancelable: true },
        );
        return;
      }

      // Check login attempts
      if (loginAttempts >= 5) {
        setGlobalWarning(
          'Too many login attempts. Please try again in 30 minutes.',
        );
        Alert.alert(
          'Account Locked',
          'Too many failed login attempts. Please try again later or reset your password.',
          [
            {
              text: 'Reset Password',
              onPress: () => navigation.navigate('ForgotPassword'),
              style: 'default',
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ],
          { cancelable: false },
        );
        return;
      }
      setBtnState(BTN_LOADING);
      showLoaderAnimation();
      const trimmedUsername = username.trim();
      const trimmedPassword = password;
      const result = await loginUser(trimmedUsername, trimmedPassword);

      if (result && result.success) {
        setBtnState(BTN_SUCCESS);
        setLoginAttempts(0);
        setUsernameError('');
        setPasswordError('');
        setGlobalError('');

        Alert.alert(
          'Login Successful',
          `Welcome back, ${trimmedUsername}!\nRedirecting to your dashboard...`,
          [
            {
              text: 'Continue',
              onPress: () => {
                setBtnState(BTN_IDLE);
                navigation.replace('DashboardScreen');
              },
              style: 'default',
            },
          ],
          { cancelable: false },
        );
      } else {
        // Failed login
        setBtnState(BTN_ERROR);
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        const remainingAttempts = 5 - newAttempts;

        const errorMessage =
          result?.message ||
          'Invalid credentials. Please check your username and password.';

        setGlobalError(errorMessage);

        // Different alert messages based on remaining attempts
        if (remainingAttempts <= 2) {
          Alert.alert(
            '❌ Login Failed',
            `${errorMessage}\n\n⚠️ Warning: ${remainingAttempts} attempt(s) remaining before account lock.`,
            [
              {
                text: 'Try Again',
                onPress: () => {
                  setPassword('');
                  setBtnState(BTN_IDLE);
                },
                style: 'default',
              },
              {
                text: 'Forgot Password?',
                onPress: () => {
                  setPassword('');
                  setBtnState(BTN_IDLE);
                  navigation.navigate('ForgotPassword');
                },
                style: 'default',
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ],
            { cancelable: false },
          );
        } else {
          Alert.alert(
            '❌ Login Failed',
            errorMessage,
            [
              {
                text: 'Try Again',
                onPress: () => {
                  setPassword('');
                  setBtnState(BTN_IDLE);
                },
                style: 'default',
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ],
            { cancelable: false },
          );
        }
      }
    } catch (error) {
      // Handle unexpected errors
      setBtnState(BTN_ERROR);
      setGlobalError('An unexpected error occurred. Please try again.');

      Alert.alert(
        '⚠️ Error',
        'An unexpected error occurred. Please check your connection and try again.',
        [
          {
            text: 'Retry',
            onPress: () => {
              setBtnState(BTN_IDLE);
            },
            style: 'default',
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: false },
      );

      console.error('Login error:', error);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar
        backgroundColor={Colors.bg_dark}
        barStyle="light-content"
        translucent={false}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0
        }
      >
        <View
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BOTTOM_SPACE + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isLoading}
        >
          <View style={styles.header}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.accentLine} />

            <View style={styles.appIdentity}>
              <View style={styles.iconBox}>
                <Image
                  source={require('../Assets/icons/reports2.png')}
                  style={styles.appIcon}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.appName}>Data Management{'\n'}System</Text>
                <Text style={styles.appSubtitle}>ENTERPRISE PLATFORM</Text>
              </View>
            </View>
          </View>

          {/* ── FORM CARD ────────────────────────────────────────── */}
          <View style={styles.formCard}>
            <View style={styles.pill} />

            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>
              Sign in to access your dashboard
            </Text>

            {/* ── ERROR BANNER ──────────────────────────────────── */}
            {globalError ? (
              <View style={styles.errorBanner}>
                <View style={styles.errorBannerDot}>
                  <Text style={styles.errorBannerDotText}>!</Text>
                </View>
                <Text style={styles.errorBannerMsg}>{globalError}</Text>
              </View>
            ) : null}

            {/* ── WARNING BANNER ────────────────────────────────── */}
            {globalWarning ? (
              <View style={styles.warningBanner}>
                <View style={styles.warningBannerDot}>
                  <Text style={styles.warningBannerDotText}>⚠️</Text>
                </View>
                <Text style={styles.warningBannerMsg}>{globalWarning}</Text>
              </View>
            ) : null}

            {/* ── LOGIN ATTEMPTS INFO ───────────────────────────── */}
            {loginAttempts > 0 && loginAttempts < 5 ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Login attempts: {loginAttempts}/5
                </Text>
              </View>
            ) : null}

            {/* ── USERNAME INPUT ────────────────────────────────── */}
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <View
              style={[
                styles.inputWrapper,
                usernameFocused && !usernameError && styles.inputFocused,
                usernameError ? styles.inputError : null,
              ]}
            >
              <Image
                source={require('../Assets/icons/username.png')}
                style={[
                  styles.inputIcon,
                  {
                    tintColor: usernameFocused
                      ? Colors.primary
                      : Colors.inputIcon,
                  },
                ]}
                resizeMode="contain"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor={Colors.inputIcon}
                value={username}
                onChangeText={handleUsernameChange}
                onFocus={() => setUsernameFocused(true)}
                onBlur={handleUsernameBlur}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!isFormDisabled}
                maxLength={50}
                selectionColor={Colors.primary}
              />
            </View>
            {usernameError ? (
              <Text style={styles.errorText}>{usernameError}</Text>
            ) : null}
            <Text
              style={[styles.fieldLabel, { marginTop: CommonHeights.height16 }]}
            >
              PASSWORD
            </Text>
            <View
              style={[
                styles.inputWrapper,
                passwordFocused && !passwordError && styles.inputFocused,
                passwordError ? styles.inputError : null,
              ]}
            >
              <Image
                source={require('../Assets/icons/dmspass.png')}
                style={[
                  styles.inputIcon,
                  {
                    tintColor: passwordFocused
                      ? Colors.primary
                      : Colors.inputIcon,
                  },
                ]}
                resizeMode="contain"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={Colors.inputIcon}
                value={password}
                onChangeText={handlePasswordChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={handlePasswordBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSignIn}
                editable={!isFormDisabled}
                maxLength={100}
                selectionColor={Colors.primary}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                activeOpacity={0.7}
                style={styles.eyeBtn}
                disabled={isFormDisabled}
              >
                <Image
                  source={require('../Assets/icons/eyes.png')}
                  style={[
                    styles.eyeIcon,
                    {
                      tintColor: showPassword
                        ? Colors.primary
                        : Colors.inputIcon,
                    },
                  ]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}

            {/* ── FORGOT PASSWORD LINK ──────────────────────────── */}
            <TouchableOpacity
              style={styles.forgotBtn}
              activeOpacity={0.7}
              onPress={() => {
                if (!isFormDisabled) {
                  navigation.navigate('ForgotPassword');
                }
              }}
              disabled={isFormDisabled}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* ── SIGN IN BUTTON ────────────────────────────────── */}
            <TouchableOpacity
              style={[
                styles.signInBtn,
                {
                  backgroundColor: isSuccess
                    ? Colors.btn_success_bg
                    : isError
                    ? Colors.error
                    : Colors.btn_dark_bg,
                  opacity: isFormValid || isLoading ? 1 : 0.5,
                },
              ]}
              onPress={handleSignIn}
              disabled={isLoading || isSuccess || !isFormValid}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator
                    color={Colors.text_white}
                    size="small"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.signInText}>Authenticating...</Text>
                </>
              ) : isSuccess ? (
                <>
                  <Image
                    source={require('../Assets/icons/check.png')}
                    style={styles.access}
                    resizeMode="contain"
                  />
                  <Text style={styles.signInText}>Access Granted</Text>
                </>
              ) : isError ? (
                <>
                  <Text style={styles.signInText}>Login Failed - Retry</Text>
                </>
              ) : (
                <>
                  <Image
                    source={require('../Assets/icons/logout2.png')}
                    style={styles.signInIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.signInText}>Sign In to Dashboard</Text>
                </>
              )}
            </TouchableOpacity>

            {/* ── LOGIN ATTEMPTS WARNING ────────────────────────── */}
            {loginAttempts >= 3 && loginAttempts < 5 ? (
              <View style={styles.warningContainer}>
                <Text style={styles.warningSmallText}>
                  🔒 {5 - loginAttempts} attempt(s) remaining
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg_light,
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.bg_dark,
    paddingHorizontal: CommonWidths.width20,
    paddingTop: CommonHeights.height16,
    paddingBottom: CommonHeights.height8,
    overflow: 'hidden',
  },

  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 110,
    backgroundColor: Colors.bg_dark,
    top: -50,
    right: -40,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 25,
  },

  circle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.bg_dark,
    bottom: 10,
    right: 60,
    opacity: 0.5,
    borderColor: 'rgba(202, 156, 41, 0.12)',
    borderWidth: 25,
  },

  accentLine: {
    width: CommonWidths.width36,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
    marginTop: CommonHeights.height16,
    marginBottom: CommonHeights.height16,
  },

  appIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: CommonWidths.width12,
    marginBottom: CommonHeights.height26,
  },

  iconBox: {
    width: CommonWidths.width40,
    height: CommonHeights.height40,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  appIcon: {
    width: CommonWidths.width24,
    height: CommonHeights.height24,
    tintColor: Colors.bg_dark,
  },

  appName: {
    color: Colors.text_white,
    fontSize: CommonFonts.font15,
    fontWeight: '600',
  },

  appSubtitle: {
    color: Colors.text_grey,
    fontSize: CommonFonts.font11,
    letterSpacing: 1,
    marginTop: 2,
  },

  // ── Form Card ──────────────────────────────────────────────────────────
  formCard: {
    flexGrow: 1,
    minHeight: SCREEN_HEIGHT * 0.68,
    backgroundColor: Colors.bg_light,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: CommonWidths.width20,
    paddingTop: CommonHeights.height16,
    paddingBottom: CommonHeights.height30,
  },

  pill: {
    alignSelf: 'center',
    width: CommonWidths.width30,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginBottom: CommonHeights.height22,
    marginTop: 13,
  },

  welcomeTitle: {
    color: Colors.text_dark,
    fontSize: CommonFonts.font22,
    fontWeight: 'bold',
    marginTop: 6,
  },

  welcomeSubtitle: {
    color: Colors.text_grey,
    fontSize: CommonFonts.font14,
    marginBottom: CommonHeights.height22,
    marginTop: 6,
  },

  // ── Error Banner ───────────────────────────────────────────────────────
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.error_bg,
    borderWidth: 1,
    borderColor: Colors.error_border,
    borderRadius: 12,
    paddingHorizontal: CommonWidths.width12,
    paddingVertical: CommonHeights.height14,
    marginBottom: CommonHeights.height16,
    gap: CommonWidths.width10,
  },

  errorBannerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },

  errorBannerDotText: {
    color: '#FFFFFF',
    fontSize: CommonFonts.font13,
    fontWeight: 'bold',
    lineHeight: 16,
  },

  errorBannerMsg: {
    flex: 1,
    color: Colors.error,
    fontSize: CommonFonts.font13,
    lineHeight: 18,
    fontWeight: '500',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning_bg,
    borderWidth: 1,
    borderColor: Colors.warning_border,
    borderRadius: 12,
    paddingHorizontal: CommonWidths.width12,
    paddingVertical: CommonHeights.height14,
    marginBottom: CommonHeights.height16,
    gap: CommonWidths.width10,
  },

  warningBannerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.warning_text,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },

  warningBannerDotText: {
    color: '#FFFFFF',
    fontSize: CommonFonts.font10,
    fontWeight: 'bold',
  },

  warningBannerMsg: {
    flex: 1,
    color: Colors.warning_text,
    fontSize: CommonFonts.font13,
    lineHeight: 18,
    fontWeight: '500',
  },

  // ── Info Box ───────────────────────────────────────────────────────────
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: CommonWidths.width12,
    paddingVertical: CommonHeights.height10,
    marginBottom: CommonHeights.height16,
    borderLeftWidth: 4,
    borderLeftColor: '#0284C7',
  },

  infoText: {
    color: '#0284C7',
    fontSize: CommonFonts.font12,
    fontWeight: '500',
  },

  warningContainer: {
    marginTop: CommonHeights.height14,
    paddingHorizontal: CommonWidths.width12,
    paddingVertical: CommonHeights.height10,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },

  warningSmallText: {
    color: Colors.error,
    fontSize: CommonFonts.font12,
    fontWeight: '600',
    textAlign: 'center',
  },

  fieldLabel: {
    color: Colors.text_label,
    fontSize: CommonFonts.font11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: CommonHeights.height10,
    marginTop: 10,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBgColor,
    borderRadius: 14,
    paddingHorizontal: CommonWidths.width12,
    height: CommonHeights.height52,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
  },

  inputFocused: {
    borderColor: Colors.input_active_border,
    backgroundColor: Colors.input_active_bg,
  },

  inputError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },

  inputIcon: {
    width: CommonWidths.width16,
    height: CommonHeights.height18,
    marginRight: CommonWidths.width10,
  },

  input: {
    flex: 1,
    color: Colors.text_dark,
    fontSize: CommonFonts.font15,
    padding: 0,
  },

  eyeBtn: {
    padding: 8,
    marginRight: -4,
  },

  eyeIcon: {
    width: CommonWidths.width20,
    height: CommonHeights.height20,
  },

  errorText: {
    color: Colors.error,
    fontSize: CommonFonts.font12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '500',
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: CommonHeights.height10,
    marginBottom: CommonHeights.height22,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  forgotText: {
    color: Colors.text_label,
    fontSize: CommonFonts.font13,
    fontWeight: '500',
  },

  signInBtn: {
    borderRadius: 16,
    height: CommonHeights.height56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: CommonWidths.width10,
    marginBottom: CommonHeights.height16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  access: {
    width: 22,
    height: 22,
    tintColor: Colors.text_white,
  },

  signInIcon: {
    width: CommonWidths.width16,
    height: CommonHeights.height18,
    tintColor: Colors.text_white,
  },

  signInText: {
    color: Colors.text_white,
    fontSize: CommonFonts.font16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default DmsLoginScreen;
