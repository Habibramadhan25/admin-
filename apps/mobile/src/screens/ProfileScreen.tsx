import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { MOCK_USER } from '../data/mockData';
import { UserProfile } from '../services/api';
import { useResponsive } from '../hooks/useResponsive';
import { MaterialIcon } from '../components/MaterialIcon';

interface ProfileScreenProps {
  onBack: () => void;
  onLogout?: () => void;
  user?: UserProfile | null;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onLogout,
  user,
}) => {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { isDesktop } = useResponsive();

  const currentUser = user || MOCK_USER;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View
        style={[
          styles.topBarWrapper,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={[styles.topBar, isDesktop ? styles.topBarDesktop : null]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <MaterialIcon
              name="arrow_back"
              size={20}
              color={colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.backText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              Kembali
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.themeToggleBtn,
              {
                backgroundColor: colors.surfaceContainer,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <MaterialIcon
              name={isDark ? 'dark_mode' : 'light_mode'}
              size={18}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.profileCardWrapper,
            isDesktop ? styles.profileCardWrapperDesktop : null,
          ]}
        >
          {/* User Card */}
          <View
            style={[
              styles.userSection,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <Image
              source={{
                uri:
                  currentUser.avatarUrl ||
                  'https://lh3.googleusercontent.com/aida-public/AB6AXuD5PWNDaY3xaJAuXtLiYfHiRyhjRWcsmXS-cPnWIJ9EN3U1o1tyK5OICp2I3wZMg9v752rB0UJsBDNT-4HXkJt4LPn2Jr02hL300C__8s5m41mgHe4ixIIk02bGM1U5NUHLHkFrCy6OFdBlfaY9YwjZv35Z9RWAl08MVvh7NXmKQ7F_pRfL96coAzraUto0Voap0uHZjrs107W3ex5ozHl23YeIayhkTHgBMJgPQ-08ev6dyXseevc',
              }}
              style={[styles.avatarImage, { borderColor: colors.outlineVariant }]}
            />
            <Text style={[styles.userName, { color: colors.onSurface }]}>
              {currentUser.name}
            </Text>
            <Text style={[styles.userSchool, { color: colors.secondary }]}>
              {currentUser.school || 'SMP Juara Bangsa'}
            </Text>
            <Text style={[styles.userId, { color: colors.onSurfaceVariant }]}>
              @{currentUser.username} • {currentUser.email || `${currentUser.username}@example.com`}
            </Text>

            {/* Quick Stats */}
            <View
              style={[
                styles.statsRow,
                {
                  borderTopColor: colors.outlineVariant,
                  borderBottomColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {currentUser.booksRead || 8}
                </Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  Buku Selesai
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.outlineVariant },
                ]}
              />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {currentUser.readingHours || 24} Jam
                </Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  Total Baca
                </Text>
              </View>

              <View
                style={[
                  styles.statDivider,
                  { backgroundColor: colors.outlineVariant },
                ]}
              />

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.tertiary }]}>
                  7 Hari
                </Text>
                <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
                  Streak Aktif
                </Text>
              </View>
            </View>
          </View>

          {/* Settings / Options Menu List */}
          <View
            style={[
              styles.menuList,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: colors.outlineVariant },
              ]}
              onPress={toggleTheme}
            >
              <View style={styles.menuLeft}>
                <MaterialIcon
                  name={isDark ? 'dark_mode' : 'light_mode'}
                  size={20}
                  color={colors.primary}
                />
                <Text style={[styles.menuLabel, { color: colors.onSurface }]}>
                  Tampilan ({isDark ? 'Mode Gelap' : 'Mode Terang'})
                </Text>
              </View>
              <MaterialIcon
                name="chevron_right"
                size={18}
                color={colors.outline}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: colors.outlineVariant },
              ]}
            >
              <View style={styles.menuLeft}>
                <MaterialIcon
                  name="verified"
                  size={20}
                  color={colors.tertiary}
                />
                <Text style={[styles.menuLabel, { color: colors.onSurface }]}>
                  Target Membaca (8/12 Buku Tahun Ini)
                </Text>
              </View>
              <MaterialIcon
                name="chevron_right"
                size={18}
                color={colors.outline}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuItem,
                { borderBottomColor: colors.outlineVariant },
              ]}
            >
              <View style={styles.menuLeft}>
                <MaterialIcon
                  name="help"
                  size={20}
                  color={colors.secondary}
                />
                <Text style={[styles.menuLabel, { color: colors.onSurface }]}>
                  Bantuan & Panduan Literasi
                </Text>
              </View>
              <MaterialIcon
                name="chevron_right"
                size={18}
                color={colors.outline}
              />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          {onLogout ? (
            <TouchableOpacity
              style={[
                styles.logoutBtn,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                  borderColor: colors.outlineVariant,
                },
              ]}
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <MaterialIcon
                name="logout"
                size={18}
                color={colors.error}
              />
              <Text style={[styles.logoutText, { color: colors.error }]}>
                Keluar dari Akun Siswa
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBarWrapper: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  topBarDesktop: {
    maxWidth: 680,
    alignSelf: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '600',
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  profileCardWrapper: {
    width: '100%',
  },
  profileCardWrapperDesktop: {
    maxWidth: 680,
    alignSelf: 'center',
  },
  userSection: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    marginBottom: 16,
  },
  userName: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userSchool: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  userId: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  menuList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '700',
  },
});
