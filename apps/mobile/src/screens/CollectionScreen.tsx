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
import { BookCard } from '../components/BookCard';
import { MobileTopBar } from '../components/MobileTopBar';
import { useResponsive } from '../hooks/useResponsive';

interface CollectionScreenProps {
  onSelectBook: (book: BookItem) => void;
  onReadBook?: (book: BookItem) => void;
  onOpenProfile: () => void;
  initialCategory?: string;
}

export const CollectionScreen: React.FC<CollectionScreenProps> = ({
  onSelectBook,
  onReadBook,
  onOpenProfile,
  initialCategory = 'Semua',
}) => {
  const { colors, isDark } = useAppTheme();
  const { isDesktop, isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(initialCategory);
  const { books } = useBooks();

  const filters = [
    'Semua',
    'Novel',
    'Pengembangan Diri',
    'Sejarah',
    'Motivasi',
    'Romance',
  ];

  const filteredBooks = books.filter((b) => {
    const matchesSearch = searchQuery
      ? b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesFilter =
      selectedFilter === 'Semua'
        ? true
        : b.category.toLowerCase().includes(selectedFilter.toLowerCase()) ||
          (selectedFilter === 'Pengembangan Diri' &&
            b.category.toLowerCase().includes('self'));

    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {isMobile ? (
        <MobileTopBar title="Koleksi Buku" onSettingsPress={onOpenProfile} />
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollContentDesktop : null,
        ]}
      >
        <View style={styles.container}>
          {/* Header & Search Bar (Desktop 2-column or Mobile Stacked) */}
          <View
            style={[
              styles.headerRow,
              isDesktop ? styles.headerRowDesktop : null,
            ]}
          >
            {isDesktop ? (
              <View style={styles.headerTitles}>
                <Text style={[styles.pageTitle, { color: colors.onSurface }]}>
                  Koleksi Buku
                </Text>
                <Text style={[styles.pageSubtitle, { color: colors.onSurfaceVariant }]}>
                  Temukan berbagai buku menarik untuk dibaca.
                </Text>
              </View>
            ) : null}

            <View style={isDesktop ? styles.desktopSearchWrapper : styles.mobileSearchWrapper}>
              <SearchBar
                placeholder="Cari buku, penulis, atau kategori..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Filter Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsRow}
          >
            {filters.map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.8}
                  onPress={() => setSelectedFilter(filter)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: isActive
                        ? colors.secondaryContainer
                        : colors.surfaceContainer,
                      borderColor: isActive
                        ? colors.outlineVariant
                        : colors.outlineVariant,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      {
                        color: isActive
                          ? colors.onSecondaryContainer
                          : colors.onSurfaceVariant,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Book Grid */}
          <View style={styles.bookGrid}>
            {filteredBooks.map((book) => (
              <View
                key={book.id}
                style={[
                  styles.gridItem,
                  isDesktop ? styles.gridItemDesktop : null,
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
    paddingTop: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    marginBottom: 20,
  },
  headerRowDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitles: {
    flex: 1,
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
  desktopSearchWrapper: {
    width: 360,
  },
  mobileSearchWrapper: {
    width: '100%',
  },
  filterPillsRow: {
    gap: 10,
    marginBottom: 24,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterPillText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
  },
  bookGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'flex-start',
  },
  gridItem: {
    width: '47%',
    maxWidth: 180,
  },
  gridItemDesktop: {
    width: 175,
    maxWidth: 180,
  },
});
