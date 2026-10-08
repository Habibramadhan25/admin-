import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { BookItem } from '../data/mockData';
import { useBooks } from '../services/bookStorage';
import { SearchBar } from '../components/SearchBar';
import { BannerHero } from '../components/BannerHero';
import { BookCard } from '../components/BookCard';
import { BentoCategories } from '../components/BentoCategories';
import { MobileTopBar } from '../components/MobileTopBar';
import { useResponsive } from '../hooks/useResponsive';

interface HomeScreenProps {
  onSelectBook: (book: BookItem) => void;
  onReadBook?: (book: BookItem) => void;
  onExploreCollection: (category?: string) => void;
  /**
   * Tidak lagi dipakai di dalam layar ini. Banner "Selamat datang kembali!"
   * sengaja dibuat statis, dan navigasi profil hanya dari avatar di TopNavbar.
   * Prop tetap ada agar signature komponen (App.tsx) tidak berubah.
   */
  onOpenProfile: () => void;
  /**
   * Dipertahankan agar signature komponen tidak berubah (App.tsx tetap
   * mengirim handleLogout), namun tidak lagi dirender: tombol "Keluar"
   * sekarang hanya ada di menu dropdown profil pada TopNavbar.
   */
  onLogout?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectBook,
  onReadBook,
  onExploreCollection,
}) => {
  const { colors, isDark } = useAppTheme();
  const { isDesktop, isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const { books } = useBooks();

  const filteredBooks = books.filter((b) => {
    if (!searchQuery) return true;
    return (
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Mobile Top App Bar — tanpa handler profil:
          menu profil hanya dibuka dari avatar di TopNavbar. */}
      {isMobile ? <MobileTopBar title="BacaYuk" /> : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollContentDesktop : null,
        ]}
      >
        <View style={styles.container}>
          {/* Banner sapaan: STATIS murni (tanpa onPress/Touchable).
              Navigasi profil HANYA lewat avatar di TopNavbar. */}
          <View style={styles.homeHeaderRow}>
            <View style={styles.homeHeaderInfo}>
              <Text
                style={[styles.homeHeaderTitle, { color: colors.onSurface }]}
              >
                Selamat datang kembali!
              </Text>
              <Text
                style={[
                  styles.homeHeaderSubtitle,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                Lanjutkan membaca dan temukan buku baru hari ini.
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <SearchBar
              placeholder="Cari buku, penulis, atau kategori..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Hero Banner */}
          <BannerHero onExplorePress={() => onExploreCollection()} />

          {/* Buku Terbaru (Horizontal Scroll) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.onSurface },
                ]}
              >
                Buku Terbaru
              </Text>
              <TouchableOpacity onPress={() => onExploreCollection()}>
                <Text style={[styles.seeAllLink, { color: colors.primary }]}>
                  Lihat semua
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {filteredBooks.map((book) => (
                <View key={book.id} style={styles.horizontalCardItem}>
                  <BookCard
                    book={book}
                    onPress={onSelectBook}
                    onRead={onReadBook}
                    customWidth={140}
                  />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Kategori (Bento Grid Style) */}
          <BentoCategories
            onSelectCategory={(catId) => onExploreCollection(catId)}
            onSeeAll={() => onExploreCollection()}
          />

          {/* Rekomendasi Pilihan Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.onSurface },
                ]}
              >
                Pilihan Minggu Ini
              </Text>
              <TouchableOpacity onPress={() => onExploreCollection()}>
                <Text style={[styles.seeAllLink, { color: colors.primary }]}>
                  Lihat semua
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recommendationGrid}>
              {filteredBooks.slice(0, isDesktop ? 5 : 4).map((book) => (
                <View
                  key={book.id}
                  style={[
                    styles.gridCardItem,
                    isDesktop ? styles.gridCardItemDesktop : null,
                  ]}
                >
                  <BookCard
                    book={book}
                    onPress={onSelectBook}
                    onRead={onReadBook}
                    customWidth="100%"
                  />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  scrollContentDesktop: {
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  searchSection: {
    marginBottom: 20,
  },
  homeHeaderRow: {
    marginBottom: 20,
  },
  homeHeaderInfo: {
    flex: 1,
  },
  homeHeaderTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 20,
    fontWeight: '700',
  },
  homeHeaderSubtitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 22,
    fontWeight: '600',
  },
  seeAllLink: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalScroll: {
    gap: 16,
    paddingBottom: 4,
  },
  horizontalCardItem: {
    width: 140,
  },
  recommendationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'flex-start',
  },
  gridCardItem: {
    width: '47%',
    maxWidth: 180,
  },
  gridCardItemDesktop: {
    width: 175,
    maxWidth: 180,
  },
});
