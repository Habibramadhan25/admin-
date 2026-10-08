import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../theme/colors';
import { TabKey } from './BottomTabBar';
import { useResponsive } from '../hooks/useResponsive';

export interface HeaderProps {
  onProfilePress?: () => void;
  onLoginPress?: () => void;
  isLoggedIn?: boolean;
  avatarUrl?: string;
  userName?: string;
  userSchool?: string;
  title?: string;
  activeTab?: TabKey;
  onTabPress?: (tab: TabKey) => void;
}

const NAV_TABS = [
  { key: 'beranda' as TabKey, label: 'Beranda' },
  { key: 'koleksi' as TabKey, label: 'Koleksi Buku' },
  { key: 'favorit' as TabKey, label: 'Favorit' },
  { key: 'riwayat' as TabKey, label: 'Riwayat Baca' },
];

export const Header: React.FC<HeaderProps> = ({
  onProfilePress,
  onLoginPress,
  isLoggedIn = false,
  avatarUrl,
  userName,
  userSchool,
  title = 'BacaYuk',
  activeTab,
  onTabPress,
}) => {
  const { isDesktop, maxContentWidth } = useResponsive();

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.innerContainer, { maxWidth: maxContentWidth }]}>
        {/* Brand Wordmark (Clean typography, no emoji) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onTabPress && onTabPress('beranda')}
          style={styles.brandRow}
        >
          <View style={styles.brandMark}>
            <View style={styles.brandMarkBar} />
          </View>
          <View>
            <Text style={styles.brandText}>
              Baca<Text style={styles.brandTextAccent}>Yuk</Text>
            </Text>
            {isDesktop ? (
              <Text style={styles.brandSubtext}>Perpustakaan Siswa</Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Desktop Navigation Links */}
        {isDesktop && onTabPress ? (
          <View style={styles.desktopNavTabs}>
            {NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  activeOpacity={0.7}
                  onPress={() => onTabPress(tab.key)}
                  style={[styles.navTabBtn, isActive ? styles.navTabBtnActive : null]}
                >
                  <Text style={[styles.navTabLabel, isActive ? styles.navTabLabelActive : null]}>
                    {tab.label}
                  </Text>
                  {isActive ? <View style={styles.activeUnderline} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Right Side: Auth / Profile Button */}
        {isLoggedIn ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onProfilePress}
            style={styles.profileBtn}
          >
            {isDesktop && userName ? (
              <View style={styles.profileInfoText}>
                <Text style={styles.studentName} numberOfLines={1}>
                  {userName}
                </Text>
                {Boolean(userSchool) ? (
                  <Text style={styles.studentSchool} numberOfLines={1}>
                    {userSchool}
                  </Text>
                ) : null}
              </View>
            ) : null}
            <Image
              source={{
                uri:
                  avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
              }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onLoginPress}
            style={styles.loginBtn}
          >
            <Text style={styles.loginBtnText}>Masuk</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  innerContainer: {
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandMarkBar: {
    width: 14,
    height: 2,
    backgroundColor: '#38BDF8',
    borderRadius: 1,
  },
  brandText: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  brandTextAccent: {
    color: '#2563EB',
  },
  brandSubtext: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: -1,
  },
  desktopNavTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  navTabBtn: {
    paddingVertical: 6,
    position: 'relative',
  },
  navTabBtnActive: {},
  navTabLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
  },
  navTabLabelActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#0F172A',
    borderRadius: 1,
  },
  loginBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileInfoText: {
    alignItems: 'flex-end',
  },
  studentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  studentSchool: {
    fontSize: 11,
    color: '#64748B',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F1F5F9',
  },
});
