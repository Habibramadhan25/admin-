import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { MaterialIcon } from './MaterialIcon';
import { TabKey } from './BottomTabBar';
import { UserProfile } from '../services/api';
import { useResponsive } from '../hooks/useResponsive';

interface TopNavbarProps {
  activeTab: TabKey | 'sedang-dibaca';
  onTabPress: (tab: TabKey) => void;
  currentUser: UserProfile | null;
  /** Fallback saja; di alur wajib-login tombol ini rarely tampil (navbar disembunyikan saat guest) */
  onLoginPress?: () => void;
  onProfilePress: () => void;
  onLogout: () => void;
}

const NAV_TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'beranda', label: 'Beranda' },
  { key: 'koleksi', label: 'Koleksi Buku' },
  { key: 'favorit', label: 'Favorit' },
  { key: 'riwayat', label: 'Riwayat Baca' },
];

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onTabPress,
  currentUser,
  onLoginPress,
  onProfilePress,
  onLogout,
}) => {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { isDesktop, isMobile } = useResponsive();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleWindowClick = () => {
        if (dropdownOpen) setDropdownOpen(false);
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && dropdownOpen) {
          setDropdownOpen(false);
        }
      };
      window.addEventListener('click', handleWindowClick);
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('click', handleWindowClick);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [dropdownOpen]);

  const isLoggedIn = Boolean(currentUser);

  return (
    <View
      style={[
        styles.navbarWrapper,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.navbarInner}>
        {/* LEFT: Brand Logo & Title */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabPress('beranda')}
          style={styles.brandGroup}
        >
          <Image
            source={require('../assets/logo.png')}
            style={styles.brandLogoImg}
            resizeMode="contain"
          />
          <View style={styles.brandTextGroup}>
            <Text style={[styles.brandTitle, { color: colors.primary }]}>
              BacaYuk
            </Text>
            {isDesktop ? (
              <Text
                style={[
                  styles.brandSubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Perpustakaan Siswa
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* CENTER (Desktop): Navigation Tabs */}
        {isDesktop ? (
          <View style={styles.navTabsGroup}>
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.7}
                  onPress={() => onTabPress(tab.key)}
                  style={[
                    styles.navTabBtn,
                    isActive
                      ? [
                          styles.navTabBtnActive,
                          {
                            backgroundColor: isDark
                              ? colors.surfaceContainerHigh
                              : colors.surfaceContainer,
                          },
                        ]
                      : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.navTabLabel,
                      {
                        color: isActive ? colors.primary : colors.onSurfaceVariant,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {isActive ? (
                    <View
                      style={[
                        styles.activeIndicator,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* RIGHT: Dark/Light Mode Toggle + User Profile / "Masuk" button */}
        <View style={styles.rightGroup}>
          {/* Tombol Toggle Dark / Light Mode */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleTheme}
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.outlineVariant,
              },
            ]}
            accessibilityLabel="Ganti tema gelap atau terang"
          >
            <MaterialIcon
              name={isDark ? 'dark_mode' : 'light_mode'}
              size={19}
              color={colors.primary}
              filled={true}
            />
          </TouchableOpacity>

          {/* Persis di sebelah toggle mode: Profil / Tombol Masuk */}
          {isLoggedIn && currentUser ? (
            /* KONDISI SUDAH LOGIN: Tampilkan Foto Profil Pengguna */
            <View style={styles.profileDropdownContainer}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                style={[
                  styles.avatarBtn,
                  {
                    borderColor: dropdownOpen
                      ? colors.primary
                      : colors.outlineVariant,
                  },
                ]}
              >
                <Image
                  source={{
                    uri:
                      currentUser.avatarUrl ||
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5PWNDaY3xaJAuXtLiYfHiRyhjRWcsmXS-cPnWIJ9EN3U1o1tyK5OICp2I3wZMg9v752rB0UJsBDNT-4HXkJt4LPn2Jr02hL300C__8s5m41mgHe4ixIIk02bGM1U5NUHLHkFrCy6OFdBlfaY9YwjZv35Z9RWAl08MVvh7NXmKQ7F_pRfL96coAzraUto0Voap0uHZjrs107W3ex5ozHl23YeIayhkTHgBMJgPQ-08ev6dyXseevc',
                  }}
                  style={styles.avatarImg}
                />
              </TouchableOpacity>

              {/* DROPDOWN MENU SAAT FOTO PROFIL DIKLIK */}
              {dropdownOpen ? (
                <View
                  style={[
                    styles.dropdownMenu,
                    {
                      backgroundColor: colors.surfaceContainerLowest,
                      borderColor: colors.outlineVariant,
                      shadowColor: '#000',
                    },
                  ]}
                  // Stop propagation so clicking inside menu doesn't close it prematurely
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  {/* User Profile Header in Dropdown */}
                  <View
                    style={[
                      styles.dropdownHeader,
                      {
                        backgroundColor: colors.surfaceContainerLow,
                        borderBottomColor: colors.outlineVariant,
                      },
                    ]}
                  >
                    <Image
                      source={{
                        uri:
                          currentUser.avatarUrl ||
                          'https://lh3.googleusercontent.com/aida-public/AB6AXuD5PWNDaY3xaJAuXtLiYfHiRyhjRWcsmXS-cPnWIJ9EN3U1o1tyK5OICp2I3wZMg9v752rB0UJsBDNT-4HXkJt4LPn2Jr02hL300C__8s5m41mgHe4ixIIk02bGM1U5NUHLHkFrCy6OFdBlfaY9YwjZv35Z9RWAl08MVvh7NXmKQ7F_pRfL96coAzraUto0Voap0uHZjrs107W3ex5ozHl23YeIayhkTHgBMJgPQ-08ev6dyXseevc',
                      }}
                      style={styles.dropdownAvatar}
                    />
                    <View style={styles.dropdownUserText}>
                      <Text
                        style={[
                          styles.dropdownUserName,
                          { color: colors.onSurface },
                        ]}
                        numberOfLines={1}
                      >
                        {currentUser.name}
                      </Text>
                      <Text
                        style={[
                          styles.dropdownUserEmail,
                          { color: colors.onSurfaceVariant },
                        ]}
                        numberOfLines={1}
                      >
                        {currentUser.email || `${currentUser.username}@sekolah.id`}
                      </Text>
                      {currentUser.school ? (
                        <Text
                          style={[
                            styles.dropdownUserSchool,
                            { color: colors.secondary },
                          ]}
                          numberOfLines={1}
                        >
                          {currentUser.school}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* Menu Items */}
                  <View style={styles.dropdownBody}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setDropdownOpen(false);
                        onProfilePress();
                      }}
                      style={styles.dropdownItem}
                    >
                      <MaterialIcon
                        name="person"
                        size={18}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.dropdownItemLabel,
                          { color: colors.onSurface },
                        ]}
                      >
                        Profil Saya
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setDropdownOpen(false);
                        onTabPress('favorit');
                      }}
                      style={styles.dropdownItem}
                    >
                      <MaterialIcon
                        name="favorite"
                        size={18}
                        color={colors.error}
                      />
                      <Text
                        style={[
                          styles.dropdownItemLabel,
                          { color: colors.onSurface },
                        ]}
                      >
                        Daftar Bacaan / Favorit
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setDropdownOpen(false);
                        onTabPress('riwayat');
                      }}
                      style={styles.dropdownItem}
                    >
                      <MaterialIcon
                        name="history"
                        size={18}
                        color={colors.secondary}
                      />
                      <Text
                        style={[
                          styles.dropdownItemLabel,
                          { color: colors.onSurface },
                        ]}
                      >
                        Riwayat Bacaan
                      </Text>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View
                      style={[
                        styles.dropdownDivider,
                        { backgroundColor: colors.outlineVariant },
                      ]}
                    />

                    {/* Logout Option */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        setDropdownOpen(false);
                        onLogout();
                      }}
                      style={[styles.dropdownItem, styles.logoutItem]}
                    >
                      <MaterialIcon
                        name="logout"
                        size={18}
                        color={colors.error}
                      />
                      <Text
                        style={[
                          styles.dropdownItemLabel,
                          { color: colors.error, fontWeight: '700' },
                        ]}
                      >
                        Keluar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            /* Fallback guest: tombol Masuk (hanya bila navbar dirender tanpa sesi) */
            onLoginPress ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onLoginPress}
                style={[
                  styles.loginBtn,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Text
                  style={[styles.loginBtnText, { color: colors.onPrimary }]}
                >
                  Masuk
                </Text>
              </TouchableOpacity>
            ) : null
          )}

          {/* Catatan: tombol "Keluar" TIDAK lagi ada di area header.
              Satu-satunya jalan keluar adalah menu dropdown profil di atas. */}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbarWrapper: {
    width: '100%',
    height: 64,
    borderBottomWidth: 1,
    position: 'sticky' as any,
    top: 0,
    zIndex: 100,
    justifyContent: 'center',
  },
  navbarInner: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoImg: {
    width: 44,
    height: 44,
  },
  brandTextGroup: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    marginTop: -2,
  },
  navTabsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  navTabBtnActive: {
    borderRadius: 8,
  },
  navTabLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    left: 14,
    right: 14,
    height: 2.5,
    borderRadius: 2,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loginBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  profileDropdownContainer: {
    position: 'relative',
    zIndex: 110,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 260,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 120,
  },
  dropdownHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
  },
  dropdownAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  dropdownUserText: {
    flex: 1,
    overflow: 'hidden',
  },
  dropdownUserName: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 14,
    fontWeight: '700',
  },
  dropdownUserEmail: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    marginTop: 1,
  },
  dropdownUserSchool: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  dropdownBody: {
    paddingVertical: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  dropdownItemLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownDivider: {
    height: 1,
    marginVertical: 4,
  },
  logoutItem: {
    paddingTop: 10,
  },
});
