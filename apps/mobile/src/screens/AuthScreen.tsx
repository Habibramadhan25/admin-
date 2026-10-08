import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInputProps,
  Image,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AuthApi, UserProfile } from '../services/api';
import { useResponsive } from '../hooks/useResponsive';

interface AuthScreenProps {
  /**
   * Opsional. AuthScreen merupakan initial route (gate login), sehingga
   * tombol "Kembali" hanya muncul bila dibuka sebagai modal.
   */
  onBack?: () => void;
  onSuccess: (user: UserProfile) => void;
}

/** Palet "Klasik Buku" sesuai desain BacaYuk. */
const COLORS = {
  cream: '#F5EFE3',
  creamSoft: '#E9E1D3',
  card: '#FBF7EF',
  gold: '#A8823A',
  goldSoft: '#E3CE9E',
  goldTint: '#F6EEDF',
  wood: '#3B1710',
  woodSoft: '#4E2317',
  brownDark: '#3B1710',
  brownDarkHover: '#55230F',
  white: '#FFFFFF',
  inputBg: '#FDFBF6',
  inputBorder: '#DCD0BA',
  text: '#3B1710',
  textMuted: '#7A6A5A',
  textOnWood: '#F3E6D4',
  error: '#8C2F1D',
  errorBg: '#F7E4DE',
  success: '#2F5D3A',
  successBg: '#E3EFE2',
};

/** Breakpoint split screen: di bawah ini branding disembunyikan. */
const SPLIT_LAYOUT_BREAKPOINT = 1024;
/** Di bawah tinggi ini kartu memakai kepadatan lebih rapat. */
const COMPACT_HEIGHT = 840;

const DEMO_USERNAME = 'siswa';
const DEMO_PASSWORD = 'siswa123';
const DEMO_FULL_NAME = 'Siswa Demo BacaYuk';
const MOCK_AUTH_DELAY_MS = 1000;
const MIN_PASSWORD_LENGTH = 6;

type AuthMode = 'login' | 'register';
type FieldKey =
  | 'identifier'
  | 'loginPassword'
  | 'fullName'
  | 'regPassword'
  | 'confirmPassword';

/** Nama ikon mengikuti konvensi Lucide (grid 24px, stroke 2). */
type LucideIconName =
  | 'book-open'
  | 'arrow-left'
  | 'arrow-right'
  | 'eye'
  | 'eye-off'
  | 'user'
  | 'user-plus'
  | 'lock'
  | 'layers'
  | 'award'
  | 'trending-up'
  | 'zap';

/**
 * Ikon bergaya Lucide.
 *
 * Catatan: paket `lucide-react-native` (yang butuh `react-native-svg`) tidak
 * terpasang di repo ini, jadi glyph Feather dipakai sebagai pengganti visual —
 * Feather adalah induk langsung Lucide (grid 24px + stroke tipis yang sama).
 * Untuk beralih ke Lucide asli, cukup ganti isi komponen ini dengan
 * `import { X } from 'lucide-react-native'` tanpa mengubah pemakaiannya.
 */
const LucideIcon: React.FC<{
  name: LucideIconName;
  size?: number;
  color?: string;
}> = ({ name, size = 20, color = COLORS.text }) => (
  <Feather name={name as any} size={size} color={color} />
);

export const AuthScreen: React.FC<AuthScreenProps> = ({ onBack, onSuccess }) => {
  const { width, height } = useResponsive();

  /** Desktop lebar: dua kolom (branding + kartu form). */
  const isSplitLayout = width >= SPLIT_LAYOUT_BREAKPOINT;
  /** Laptop pendek: rapatkan jarak agar kartu tetap utuh dalam satu layar. */
  const isCompact = height < COMPACT_HEIGHT;

  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<FieldKey | null>(null);

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  /** Simulasi proses autentikasi selama 1 detik (indikator loading) */
  const simulateAuth = () =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, MOCK_AUTH_DELAY_MS);
    });

  const completeAuth = (user: UserProfile) => {
    setSuccessMessage('Berhasil! Menyiapkan perpustakaan Anda...');
    setTimeout(() => onSuccess(user), 450);
  };

  const handleLogin = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!identifier.trim() || !loginPassword) {
      setErrorMessage('Username/email dan kata sandi wajib diisi.');
      return;
    }

    if (loginPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    await simulateAuth();
    const res = await AuthApi.login(identifier.trim(), loginPassword);
    setIsLoading(false);

    if (res.success && res.user) {
      completeAuth(res.user);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRegister = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }

    if (!identifier.trim()) {
      setErrorMessage('Username atau email wajib diisi.');
      return;
    }

    if (!regPassword) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    if (regPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`);
      return;
    }

    if (regPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes('@');

    setIsLoading(true);
    await simulateAuth();
    const res = await AuthApi.register({
      fullName: fullName.trim(),
      username: isEmail ? cleanIdentifier.split('@')[0] : cleanIdentifier,
      email: isEmail ? cleanIdentifier : undefined,
      password: regPassword,
    });
    setIsLoading(false);

    if (res.success && res.user) {
      completeAuth(res.user);
    } else {
      setErrorMessage(res.message);
    }
  };

  /**
   * Isi otomatis akun uji coba siswa lalu langsung proses login (simulasi).
   * Bila backend sedang offline/akun belum pernah dibuat, akun demo didaftarkan
   * lebih dulu agar tombol ini tetap bisa dipakai.
   */
  const handleUseDemoAccount = async () => {
    setMode('login');
    setIdentifier(DEMO_USERNAME);
    setLoginPassword(DEMO_PASSWORD);
    setErrorMessage(null);
    setSuccessMessage(null);

    setIsLoading(true);
    await simulateAuth();
    let res = await AuthApi.login(DEMO_USERNAME, DEMO_PASSWORD);

    if (!(res.success && res.user)) {
      const registered = await AuthApi.register({
        username: DEMO_USERNAME,
        fullName: DEMO_FULL_NAME,
        password: DEMO_PASSWORD,
      });
      if (registered.success && registered.user) {
        res = {
          success: true,
          user: registered.user,
          message: registered.message,
        };
      }
    }

    setIsLoading(false);

    if (res.success && res.user) {
      completeAuth(res.user);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const isFocused = (field: FieldKey) => focusedField === field;

  /** Cangkang input: border halus, focus ring emas saat aktif */
  const shellStyle = (field: FieldKey) => [
    styles.inputShell,
    {
      borderColor: isFocused(field) ? COLORS.gold : 'transparent',
      backgroundColor: isFocused(field) ? COLORS.goldSoft : 'transparent',
    },
  ];

  const inputStyle = (field: FieldKey) => [
    styles.input,
    {
      backgroundColor: COLORS.inputBg,
      borderColor: isFocused(field) ? COLORS.gold : COLORS.inputBorder,
      borderWidth: isFocused(field) ? 2 : 1,
    },
  ];

  const renderPasswordToggle = (
    visible: boolean,
    onToggle: () => void
  ) => (
    <TouchableOpacity
      onPress={onToggle}
      style={styles.eyeButton}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={
        visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
      }
    >
      <LucideIcon
        name={visible ? 'eye-off' : 'eye'}
        size={18}
        color={COLORS.gold}
      />
    </TouchableOpacity>
  );

  /** Satu baris isian: label + ikon Lucide + input (+ tombol mata). */
  const renderField = ({
    field,
    label,
    icon,
    placeholder,
    value,
    onChangeText,
    isPassword = false,
    passwordVisible = false,
    onTogglePassword,
    helperText,
    ...inputProps
  }: {
    field: FieldKey;
    label: string;
    icon: LucideIconName;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    isPassword?: boolean;
    passwordVisible?: boolean;
    onTogglePassword?: () => void;
    helperText?: string;
  } & Omit<TextInputProps, 'style' | 'value' | 'onChangeText'>) => {
    const onFocus = () => setFocusedField(field);
    const onBlur = () => setFocusedField(null);

    return (
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>{label}</Text>

        <View style={shellStyle(field)}>
          <View style={styles.inputRow}>
            <LucideIcon
              name={icon}
              size={17}
              color={isFocused(field) ? COLORS.gold : COLORS.textMuted}
            />

            <TextInput
              style={inputStyle(field)}
              placeholder={placeholder}
              placeholderTextColor={COLORS.textMuted}
              value={value}
              onChangeText={onChangeText}
              onFocus={onFocus}
              onBlur={onBlur}
              accessibilityLabel={label}
              {...(isPassword
                ? { secureTextEntry: !passwordVisible }
                : null)}
              {...inputProps}
            />

            {isPassword && onTogglePassword
              ? renderPasswordToggle(Boolean(passwordVisible), onTogglePassword)
              : null}
          </View>
        </View>

        {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      </View>
    );
  };

  const renderAlert = () => {
    if (errorMessage) {
      return (
        <View style={[styles.alertBox, { backgroundColor: COLORS.errorBg }]}>
          <LucideIcon name="award" size={17} color={COLORS.error} />
          <Text style={[styles.alertText, { color: COLORS.error }]}>
            {errorMessage}
          </Text>
        </View>
      );
    }

    if (successMessage) {
      return (
        <View style={[styles.alertBox, { backgroundColor: COLORS.successBg }]}>
          <LucideIcon name="award" size={17} color={COLORS.success} />
          <Text style={[styles.alertText, { color: COLORS.success }]}>
            {successMessage}
          </Text>
        </View>
      );
    }

    return null;
  };

  /* ------------------------------------------------------------------ *
   * Kolom Kiri: Branding (hanya di split screen / tablet ke atas)
   * ------------------------------------------------------------------ */

  const renderFeature = (
    emoji: string,
    title: string,
    description: string
  ) => (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={styles.featureTextWrap}>
        <Text style={styles.featureInlineText}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDesc}> — {description}</Text>
        </Text>
      </View>
    </View>
  );

  const renderBrandingPanel = () => (
    <View style={styles.brandingPaperCard}>
      {/* Tombol Kembali diletakkan di sisi krem agar kontrasnya terbaca */}
      {renderBackButton()}

      <View style={styles.brandColumn}>
        {/* Logo + wordmark */}
        <View style={styles.logoRow}>
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 48, height: 48 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.wordmark}>BacaYuk</Text>
            <Text style={styles.wordmarkSub}>Perpustakaan Digital Pelajar</Text>
          </View>
        </View>

        <View style={styles.badge}>
          <LucideIcon name="book-open" size={12} color="#8A6D1C" />
          <Text style={styles.badgeText}>GERAKAN LITERASI SEKOLAH</Text>
        </View>

        {/* Heading serif utama */}
        <Text style={styles.heroHeading}>
          Membuka cakrawala ilmu,{'\n'}satu halaman setiap hari.
        </Text>

        {/* Kotak kutipan border emas */}
        <View style={styles.quoteBox}>
          <Text style={styles.quoteMark}>{'\u201C'}</Text>
          <Text style={styles.quoteText}>
            Buku adalah lentera yang tak pernah padam di tengah pekatnya
            ketidaktahuan. Setiap kata yang dibaca adalah langkah kecil menuju
            cita-cita luhur.
          </Text>
          <Text style={styles.quoteAuthor}>— Pustaka Juara BacaYuk</Text>
        </View>

        {/* Tiga fitur */}
        <View style={styles.featureList}>
          {renderFeature(
            '📚',
            '1.200+ Buku Terkurasi',
            'Sastra, fiksi, cerita rakyat & ensiklopedia anak.'
          )}
          {renderFeature(
            '📝',
            'Jurnal Baca & Streak',
            'Catat jam membaca harian dan progres bacaan.'
          )}
          {renderFeature(
            '🏅',
            'Lencana Kehormatan',
            'Kumpulkan poin literasi untuk sekolahmu.'
          )}
        </View>
      </View>

      {/* Sudut lipatan kertas */}
      <View style={styles.paperCurlCorner} />
    </View>
  );

  /* ------------------------------------------------------------------ *
   * Kartu Form
   * ------------------------------------------------------------------ */

  const renderTabButton = (
    tabMode: AuthMode,
    label: string,
    iconName?: LucideIconName
  ) => {
    const isActive = mode === tabMode;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}
        onPress={() => switchMode(tabMode)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {iconName ? (
            <LucideIcon
              name={iconName}
              size={14}
              color={isActive ? COLORS.brownDark : COLORS.textMuted}
            />
          ) : null}
          <Text
            style={[
              styles.tabButtonText,
              isActive ? styles.tabButtonTextActive : null,
            ]}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFormCardContent = () => (
    <>
      {/* Tab pill Masuk / Daftar Akun */}
      <View style={styles.tabSwitcher}>
        {renderTabButton('login', 'Masuk', 'arrow-right')}
        {renderTabButton('register', 'Daftar Akun', 'user-plus')}
      </View>

      {renderAlert()}

      {/* Isian form sesuai tab aktif */}
      {mode === 'login' ? renderLoginForm() : renderRegisterForm()}

      {/* Tombol utama */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isCompact ? styles.submitButtonCompact : null,
          { backgroundColor: isLoading ? COLORS.brownDarkHover : COLORS.brownDark },
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={
          mode === 'login'
            ? 'Masuk ke perpustakaan'
            : 'Daftar dan mulai membaca'
        }
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>
              {mode === 'login'
                ? 'Masuk ke Perpustakaan'
                : 'Daftar & Mulai Membaca'}
            </Text>
            <LucideIcon
              name="arrow-right"
              size={17}
              color={COLORS.goldSoft}
            />
          </>
        )}
      </TouchableOpacity>

      {/* Akses cepat siswa (demo) */}
      <View style={styles.demoBox}>
        <View style={styles.demoHeader}>
          <View style={styles.demoIconBadge}>
            <LucideIcon name="zap" size={13} color={COLORS.gold} />
          </View>
          <Text style={styles.demoTitle}>Akses Cepat Siswa (Demo)</Text>
        </View>

        <Text style={styles.demoText}>
          Ingin menguji tampilan & koleksi tanpa mendaftar?
        </Text>

        <TouchableOpacity
          onPress={handleUseDemoAccount}
          disabled={isLoading}
          activeOpacity={0.85}
          style={[
            styles.demoButton,
            isLoading ? styles.buttonDisabled : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Gunakan akun uji coba siswa"
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.gold} size="small" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13 }}>👆</Text>
              <Text style={styles.demoButtonText}>
                Gunakan Akun Uji Coba Siswa
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View
          style={[
            styles.demoHintChip,
            isCompact ? styles.demoHintChipCompact : null,
          ]}
        >
          <Text style={styles.demoHint}>
            {DEMO_USERNAME} / {DEMO_PASSWORD}
          </Text>
        </View>
      </View>
    </>
  );

  const renderLoginForm = () => (
    <View
      style={[
        styles.formContainer,
        isCompact ? styles.formContainerCompact : null,
      ]}
    >
      {renderField({
        field: 'identifier',
        label: 'Username atau Email',
        icon: 'user',
        placeholder: 'Masukkan username (cth: siswa)',
        value: identifier,
        onChangeText: setIdentifier,
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'username',
        keyboardType: 'email-address',
        returnKeyType: 'next',
      })}

      {renderField({
        field: 'loginPassword',
        label: 'Kata Sandi',
        icon: 'lock',
        placeholder: 'Masukkan kata sandi akun',
        value: loginPassword,
        onChangeText: setLoginPassword,
        isPassword: true,
        passwordVisible: showLoginPassword,
        onTogglePassword: () => setShowLoginPassword((v) => !v),
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'current-password',
        returnKeyType: 'go',
        onSubmitEditing: handleSubmit,
      })}
    </View>
  );

  const renderRegisterForm = () => (
    <View
      style={[
        styles.formContainer,
        isCompact ? styles.formContainerCompact : null,
      ]}
    >
      {renderField({
        field: 'fullName',
        label: 'Nama Lengkap',
        icon: 'user',
        placeholder: 'Nama lengkap pelajar',
        value: fullName,
        onChangeText: setFullName,
        autoCapitalize: 'words',
        autoComplete: 'name',
        returnKeyType: 'next',
      })}

      {renderField({
        field: 'identifier',
        label: 'Username atau Email',
        icon: 'user',
        placeholder: 'Contoh: rafli2025',
        value: identifier,
        onChangeText: setIdentifier,
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'username',
        keyboardType: 'email-address',
        returnKeyType: 'next',
      })}

      {renderField({
        field: 'regPassword',
        label: 'Kata Sandi',
        icon: 'lock',
        placeholder: 'Minimal 6 karakter',
        value: regPassword,
        onChangeText: setRegPassword,
        isPassword: true,
        passwordVisible: showRegPassword,
        onTogglePassword: () => setShowRegPassword((v) => !v),
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'new-password',
        returnKeyType: 'next',
        helperText: `Minimal ${MIN_PASSWORD_LENGTH} karakter`,
      })}

      {renderField({
        field: 'confirmPassword',
        label: 'Konfirmasi Kata Sandi',
        icon: 'lock',
        placeholder: 'Ulangi kata sandi di atas',
        value: confirmPassword,
        onChangeText: setConfirmPassword,
        isPassword: true,
        passwordVisible: showConfirmPassword,
        onTogglePassword: () => setShowConfirmPassword((v) => !v),
        autoCapitalize: 'none',
        autoCorrect: false,
        autoComplete: 'new-password',
        returnKeyType: 'go',
        onSubmitEditing: handleSubmit,
      })}
    </View>
  );

  const renderBackButton = () => {
    if (!onBack) return null;
    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Kembali ke halaman sebelumnya"
      >
        <LucideIcon name="arrow-left" size={17} color={COLORS.textMuted} />
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
    );
  };

  /* ------------------------------------------------------------------ *
   * Layout: Kolom Kiri (branding) + Kolom Kanan (kartu form di atas kayu)
   * ------------------------------------------------------------------ */

  const renderSplitLayout = () => (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.splitCenterContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.splitContentRow}>
        {/* Kolom Kiri: Kertas Antik Parchment */}
        {renderBrandingPanel()}

        {/* Kolom Kanan: Tumpukan Kertas Form */}
        <View style={styles.rightCardWrapper}>
          <View style={styles.stackPaperBack2} />
          <View style={styles.stackPaperBack1} />

          <View
            style={[
              styles.formCard,
              isCompact ? styles.formCardCompact : null,
            ]}
          >
            {renderFormCardContent()}
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderStackLayout = () => (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.stackScroll,
        isCompact ? styles.stackScrollCompact : null,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {renderBackButton()}

      {/* Tumpukan Kertas Form di Mobile */}
      <View style={[styles.rightCardWrapper, { maxWidth: 440, width: '100%' }]}>
        <View style={styles.stackPaperBack2} />
        <View style={styles.stackPaperBack1} />

        <View
          style={[
            styles.formCard,
            styles.formCardStack,
            isCompact ? styles.formCardCompact : null,
          ]}
        >
          {/* Header Maskot di Mobile */}
          <View style={styles.miniBrand}>
            <Image
              source={require('../assets/logo.png')}
              style={{ width: 44, height: 42 }}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.miniWordmark}>BacaYuk</Text>
              <Text style={styles.miniWordmarkSub}>
                Perpustakaan Digital Pelajar
              </Text>
            </View>
          </View>

          {renderFormCardContent()}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.backgroundDesk}>
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=2400',
        }}
        style={styles.backgroundImageFill}
        resizeMode="cover"
      />
      <View style={styles.backgroundOverlay}>
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {isSplitLayout ? renderSplitLayout() : renderStackLayout()}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  backgroundDesk: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#1E0F0A',
  },
  backgroundImageFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 12, 6, 0.65)',
  },
  splitCenterContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  splitContentRow: {
    flexDirection: 'row',
    maxWidth: 1020,
    width: '100%',
    gap: 28,
    alignItems: 'stretch',
    justifyContent: 'center',
  },

  /* ---------------- Kolom kiri: Kertas Antik Parchment ---------------- */
  brandingPaperCard: {
    flex: 1.25,
    backgroundColor: '#FAF6EE',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E8DFC9',
    paddingHorizontal: 36,
    paddingVertical: 32,
    shadowColor: '#1C0C06',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 12,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  paperCurlCorner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 44,
    height: 44,
    borderTopLeftRadius: 8,
    backgroundColor: '#FAF6EE',
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#D5C2A5',
    shadowColor: '#1C0C06',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  brandColumn: {
    width: '100%',
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordmark: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: COLORS.brownDark,
  },
  wordmarkSub: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    marginTop: 1,
    color: '#8A6D1C',
    fontWeight: '600',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 4.5,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#D5C2A5',
    backgroundColor: '#EFE4D0',
  },
  badgeText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#6E4F28',
  },
  heroHeading: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 26,
    lineHeight: 35,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginTop: 16,
    color: COLORS.brownDark,
  },
  quoteBox: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.45)',
    backgroundColor: 'rgba(245, 236, 220, 0.85)',
  },
  quoteMark: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 34,
    lineHeight: 28,
    color: COLORS.gold,
    opacity: 0.55,
  },
  quoteText: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 13.5,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: -4,
    color: COLORS.brownDark,
  },
  quoteAuthor: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11.5,
    marginTop: 8,
    color: '#8A6D1C',
    fontWeight: '700',
  },
  featureList: {
    marginTop: 20,
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(232, 223, 201, 0.8)',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE4D0',
    borderWidth: 1,
    borderColor: '#D5C2A5',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureInlineText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12.5,
    lineHeight: 18,
  },
  featureTitle: {
    fontWeight: '700',
    color: COLORS.brownDark,
  },
  featureDesc: {
    fontWeight: '400',
    color: COLORS.textMuted,
  },

  /* ---------------- Kolom Kanan: Tumpukan Kertas Form ---------------- */
  rightCardWrapper: {
    flex: 1,
    maxWidth: 420,
    position: 'relative',
    justifyContent: 'center',
  },
  stackPaperBack2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EFE8DC',
    borderRadius: 24,
    transform: [{ rotate: '2deg' }],
    borderWidth: 1,
    borderColor: '#D5C2A5',
    shadowColor: '#1C0C06',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  stackPaperBack1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#E6DBCA',
    borderRadius: 24,
    transform: [{ rotate: '-1.5deg' }],
    borderWidth: 1,
    borderColor: '#D5C2A5',
    shadowColor: '#1C0C06',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },

  /* ---------------- Kartu form ---------------- */
  formCard: {
    width: '100%',
    backgroundColor: '#FAF7F2',
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingVertical: 26,
    borderWidth: 1,
    borderColor: '#E8DFC9',
    shadowColor: '#1C0C06',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 10,
    zIndex: 10,
  },
  formCardCompact: {
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  formCardStack: {
    maxWidth: 440,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.gold,
    opacity: 0.9,
  },

  /* Tab pill Masuk / Daftar Akun */
  tabSwitcher: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    backgroundColor: COLORS.creamSoft,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.goldSoft,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#3B1710',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabButtonText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabButtonTextActive: {
    color: COLORS.brownDark,
    fontWeight: '700',
  },

  cardTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    marginTop: 22,
    color: COLORS.brownDark,
  },
  cardSubtitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 18,
    color: COLORS.textMuted,
  },

  /* Alert */
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 11,
    borderRadius: 10,
    marginBottom: 14,
  },
  alertText: {
    flex: 1,
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    lineHeight: 18,
  },

  /* Form */
  formContainer: {
    gap: 12,
  },
  formContainerCompact: {
    gap: 9,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.brownDark,
  },
  inputShell: {
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 11,
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    color: COLORS.brownDark,
    outlineStyle: 'none' as any,
  },
  eyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  helperText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    color: COLORS.textMuted,
  },

  /* Tombol utama */
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 18,
  },
  submitButtonCompact: {
    minHeight: 44,
    marginTop: 13,
  },
  submitButtonText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: COLORS.white,
  },

  /* Kotak demo */
  demoBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.goldSoft,
    borderStyle: 'dashed' as any,
    backgroundColor: COLORS.goldTint,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  demoIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.goldSoft,
  },
  demoTitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.brownDark,
  },
  demoText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 11,
    color: COLORS.textMuted,
  },
  demoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gold,
    backgroundColor: COLORS.card,
  },
  demoButtonText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gold,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  demoHintChip: {
    alignSelf: 'center',
    marginTop: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: COLORS.creamSoft,
  },
  demoHintChipCompact: {
    marginTop: 7,
  },
  demoHint: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: COLORS.textMuted,
  },

  /* ---------------- Layout mobile / tablet ---------------- */
  stackScroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  stackScrollCompact: {
    paddingVertical: 12,
  },
  miniBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  miniWordmark: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    color: COLORS.gold,
  },
  miniWordmarkSub: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11.5,
    marginTop: 1,
    color: COLORS.textMuted,
  },

  /* Tombol kembali (hanya saat dibuka sebagai modal) */
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});