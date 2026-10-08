import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { MaterialIcon } from './MaterialIcon';
import { TabKey } from './BottomTabBar';
import { UserProfile } from '../services/api';

interface SidebarProps {
  activeTab: TabKey | 'sedang-dibaca';
  onTabPress: (tab: TabKey | 'sedang-dibaca') => void;
  currentUser?: UserProfile | null;
  onProfilePress?: () => void;
  onLoginPress?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabPress,
  currentUser,
  onProfilePress,
  onLoginPress,
}) => {
  const { colors, isDark, toggleTheme } = useAppTheme();

  const navItems = [
    { key: 'beranda' as const, label: 'Beranda', icon: 'home' },
    { key: 'koleksi' as const, label: 'Koleksi Buku', icon: 'local_library' },
    { key: 'favorit' as const, label: 'Favorit', icon: 'favorite' },
    { key: 'sedang-dibaca' as const, label: 'Sedang Dibaca', icon: 'menu_book' },
    { key: 'riwayat' as const, label: 'Riwayat', icon: 'history' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderRightColor: colors.outlineVariant,
        },
      ]}
    >
      {/* Brand Header */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onTabPress('beranda')}
        style={styles.brandRow}
      >
        <MaterialIcon
          name="book"
          size={30}
          color={colors.primary}
          filled={true}
        />
        <Text style={[styles.brandText, { color: colors.primary }]}>BacaYuk</Text>
      </TouchableOpacity>

      {/* Navigation List */}
      <View style={styles.navList}>
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.75}
              onPress={() => onTabPress(item.key)}
              style={[
                styles.navItem,
                isActive
                  ? {
                      backgroundColor: isDark ? colors.primary : colors.primaryContainer,
                    }
                  : null,
              ]}
            >
              <MaterialIcon
                name={item.icon}
                size={22}
                color={
                  isActive
                    ? isDark
                      ? colors.onPrimary
                      : colors.onPrimaryContainer
                    : colors.onSurfaceVariant
                }
                filled={isActive}
              />
              <Text
                style={[
                  styles.navLabel,
                  {
                    color: isActive
                      ? isDark
                        ? colors.onPrimary
                        : colors.onPrimaryContainer
                      : colors.onSurfaceVariant,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Theme Toggle Button (Light / Dark Mode) */}
      <View
        style={[
          styles.themeToggleRow,
          {
            borderTopColor: colors.outlineVariant,
            backgroundColor: colors.surfaceContainer,
          },
        ]}
      >
        <View style={styles.themeToggleTextCol}>
          <Text style={[styles.themeToggleLabel, { color: colors.onSurface }]}>
            Mode {isDark ? 'Gelap' : 'Terang'}
          </Text>
          <Text style={[styles.themeToggleSub, { color: colors.onSurfaceVariant }]}>
            {isDark ? 'Tema Espresso' : 'Tema Kertas'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTheme}
          style={[
            styles.themeToggleBtn,
            {
              backgroundColor: isDark ? colors.surfaceContainerHigh : colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <MaterialIcon
            name={isDark ? 'dark_mode' : 'light_mode'}
            size={18}
            color={colors.primary}
            filled={true}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom User Profile Section */}
      <View
        style={[
          styles.profileSection,
          {
            borderTopColor: colors.outlineVariant,
          },
        ]}
      >
        {currentUser ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onProfilePress}
            style={styles.profileRow}
          >
            <Image
              source={{
                uri:
                  currentUser.avatarUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5PWNDaY3xaJAuXtLiYfHiRyhjRWcsmXS-cPnWIJ9EN3U1o1tyK5OICp2I3wZMg9v752rB0UJsBDNT-4HXkJt4LPn2Jr02hL300C__8s5m41mgHe4ixIIk02bGM1U5NUHLHkFrCy6OFdBlfaY9YwjZv35Z9RWAl08MVvh7NXmKQ7F_pRfL96coAzraUto0Voap0uHZjrs107W3ex5ozHl23YeIayhkTHgBMJgPQ-08ev6dyXseevc',
              }}
              style={[styles.avatar, { borderColor: colors.outlineVariant }]}
            />
            <View style={styles.profileTextCol}>
              <Text
                style={[styles.profileName, { color: colors.onSurface }]}
                numberOfLines={1}
              >
                {currentUser.name}
              </Text>
              <Text
                style={[styles.profileEmail, { color: colors.onSurfaceVariant }]}
                numberOfLines={1}
              >
                {currentUser.email || `${currentUser.username}@sekolah.id`}
              </Text>
            </View>
            <TouchableOpacity onPress={onProfilePress} style={styles.settingsBtn}>
              <MaterialIcon
                name="settings"
                size={18}
                color={colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onLoginPress}
            style={[
              styles.loginBtn,
              {
                backgroundColor: isDark ? colors.primary : colors.primaryContainer,
              },
            ]}
          >
            <MaterialIcon
              name="person"
              size={18}
              color={isDark ? colors.onPrimary : colors.onPrimaryContainer}
            />
            <Text
              style={[
                styles.loginBtnText,
                { color: isDark ? colors.onPrimary : colors.onPrimaryContainer },
              ]}
            >
              Masuk / Daftar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 256,
    height: '100vh' as any,
    minHeight: '100vh' as any,
    position: 'sticky' as any,
    top: 0,
    borderRightWidth: 1,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'column',
    zIndex: 40,
    flexShrink: 0,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 36,
    paddingHorizontal: 8,
  },
  brandText: {
    fontFamily: 'Literata, serif' as any,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  navList: {
    flex: 1,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    transitionDuration: '0.15s' as any,
  },
  navLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
  },
  themeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  themeToggleTextCol: {
    flex: 1,
  },
  themeToggleLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    fontWeight: '600',
  },
  themeToggleSub: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 10,
  },
  themeToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  profileTextCol: {
    flex: 1,
    overflow: 'hidden',
  },
  profileName: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '600',
  },
  profileEmail: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
  },
  settingsBtn: {
    padding: 4,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  loginBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '700',
  },
});
