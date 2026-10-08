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
import { BookCard } from '../components/BookCard';
import { SearchBar } from '../components/SearchBar';
import { MobileTopBar } from '../components/MobileTopBar';
import { MaterialIcon } from '../components/MaterialIcon';
import { useResponsive } from '../hooks/useResponsive';

interface FavoritesScreenProps {
  favoriteBookIds: string[];
  onSelectBook: (book: BookItem) => void;
  onReadBook?: (book: BookItem) => void;
  onToggleFavorite: (book: BookItem) => void;
  onExploreCollection: () => void;
  onOpenProfile: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  favoriteBookIds,
  onSelectBook,
  onReadBook,
  onToggleFavorite,
  onExploreCollection,
  onOpenProfile,
}) => {
  const { colors, isDark } = useAppTheme();
  const { isDesktop, isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const { books } = useBooks();

  const favoriteBooks = books.filter((b) =>
    favoriteBookIds.includes(b.id)
  ).filter((b) => {
    if (!searchQuery) return true;
    return (
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {isMobile ? (
        <MobileTopBar title="Buku Favorit" onSettingsPress={onOpenProfile} />
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollContentDesktop : null,
        ]}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerBlock}>
            <Text style={[styles.pageTitle, { color: colors.onSurface }]}>
              Buku Favorit
            </Text>
            <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
              Daftar koleksi buku yang telah Anda simpan untuk dibaca kembali.
            </Text>
          </View>

          {favoriteBooks.length > 0 ? (
            <>
              {/* Search Bar */}
              <View style={styles.searchWrapper}>
                <SearchBar
                  placeholder="Cari di daftar favorit..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* List of Favorites (Menyusun rapi ke bawah) */}
              <View style={styles.booksList}>
                {favoriteBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onPress={onSelectBook}
                    onRead={onReadBook}
                    onToggleFavorite={onToggleFavorite}
                    variant="favorite-row"
                  />
                ))}
              </View>
            </>
          ) : (
            /* Empty State */
            <View
              style={[
                styles.emptyState,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconCircle,
                  {
                    backgroundColor: colors.surfaceContainerHigh,
                  },
                ]}
              >
                <MaterialIcon
                  name="favorite_border"
                  size={36}
                  color={colors.outline}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                Belum Ada Buku Favorit
              </Text>
              <Text
                style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}
              >
                Simpan buku-buku menarik dari Koleksi atau Beranda dengan menekan tombol
                "Tambah ke Favorit".
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onExploreCollection}
                style={[
                  styles.exploreBtn,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.exploreBtnText,
                    { color: colors.onPrimary },
                  ]}
                >
                  Jelajahi Koleksi
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerBlock: {
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
  },
  searchWrapper: {
    marginBottom: 24,
    maxWidth: 400,
  },
  booksList: {
    flexDirection: 'column',
    maxWidth: 860,
    width: '100%',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 440,
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '700',
  },
});
