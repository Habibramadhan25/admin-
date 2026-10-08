import React, { useEffect } from 'react';
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
import { BookItem } from '../data/mockData';
import { MaterialIcon } from '../components/MaterialIcon';
import { MobileTopBar } from '../components/MobileTopBar';
import { useResponsive } from '../hooks/useResponsive';

interface BookDetailScreenProps {
  book: BookItem;
  onBack: () => void;
  onStartReading: (book: BookItem) => void;
  onToggleFavorite: (book: BookItem) => void;
  isFavorite?: boolean;
}

export const BookDetailScreen: React.FC<BookDetailScreenProps> = ({
  book,
  onBack,
  onStartReading,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const { colors, isDark } = useAppTheme();
  const { isDesktop, isMobile } = useResponsive();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onBack();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [onBack]);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      {/* Mobile Top Bar */}
      {isMobile ? (
        <MobileTopBar
          title={book.title}
          showBack={true}
          onBack={onBack}
        />
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollContentDesktop : null,
        ]}
      >
        <View style={styles.container}>
          {/* Breadcrumb Navigation (Desktop) */}
          {isDesktop ? (
            <View style={styles.breadcrumbRow}>
              <TouchableOpacity
                onPress={onBack}
                style={styles.breadcrumbLink}
                activeOpacity={0.7}
              >
                <MaterialIcon
                  name="arrow_back"
                  size={18}
                  color={colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.breadcrumbText,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  Koleksi Buku
                </Text>
              </TouchableOpacity>
              <MaterialIcon
                name="chevron_right"
                size={18}
                color={colors.outline}
              />
              <Text
                style={[
                  styles.breadcrumbCurrent,
                  { color: colors.onSurface },
                ]}
              >
                Detail Buku
              </Text>
            </View>
          ) : null}

          {/* Main Book Detail Canvas */}
          <View
            style={[
              styles.detailCanvas,
              isDesktop ? styles.detailCanvasDesktop : null,
            ]}
          >
            {/* Left Column: Cover & Actions */}
            <View
              style={[
                styles.leftColumn,
                isDesktop ? styles.leftColumnDesktop : null,
              ]}
            >
              <View
                style={[
                  styles.coverWrapper,
                  {
                    backgroundColor: colors.surfaceContainer,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <Image
                  source={{ uri: book.coverUrl }}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsCol}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onStartReading(book)}
                  style={[
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <MaterialIcon
                    name="menu_book"
                    size={20}
                    color={colors.onPrimary}
                    filled={true}
                  />
                  <Text
                    style={[
                      styles.primaryBtnText,
                      { color: colors.onPrimary },
                    ]}
                  >
                    Mulai Membaca
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => onToggleFavorite(book)}
                  style={[
                    styles.secondaryBtn,
                    {
                      backgroundColor: isDark
                        ? colors.surfaceContainerHigh
                        : colors.surfaceContainerLowest,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <MaterialIcon
                    name={isFavorite ? 'favorite' : 'favorite_border'}
                    size={20}
                    color={isFavorite ? colors.error : colors.secondary}
                    filled={isFavorite}
                  />
                  <Text
                    style={[
                      styles.secondaryBtnText,
                      { color: isFavorite ? colors.error : colors.onSurface },
                    ]}
                  >
                    {isFavorite ? 'Tersimpan di Favorit' : 'Tambah ke Favorit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Column: Title, Rating, Metadata, Synopsis */}
            <View style={styles.rightColumn}>
              <View style={styles.titleSection}>
                <Text
                  style={[
                    styles.bookTitle,
                    isDesktop ? styles.bookTitleDesktop : null,
                    { color: colors.onSurface },
                  ]}
                >
                  {book.title}
                </Text>
                <Text
                  style={[
                    styles.bookAuthor,
                    { color: colors.secondary },
                  ]}
                >
                  {book.author}
                </Text>

                {/* Rating Row */}
                <View style={styles.ratingRow}>
                  <Text
                    style={[
                      styles.ratingScore,
                      { color: colors.onSurface },
                    ]}
                  >
                    {book.rating.toFixed(1)}
                  </Text>
                  <View style={styles.starsRow}>
                    <MaterialIcon name="star" size={18} color={colors.star} filled={true} />
                    <MaterialIcon name="star" size={18} color={colors.star} filled={true} />
                    <MaterialIcon name="star" size={18} color={colors.star} filled={true} />
                    <MaterialIcon name="star" size={18} color={colors.star} filled={true} />
                    <MaterialIcon name="star_half" size={18} color={colors.star} filled={true} />
                  </View>
                  <Text
                    style={[
                      styles.reviewsCountText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    ({book.reviewsCount || 1256} ulasan)
                  </Text>
                </View>
              </View>

              {/* 4-cell Metadata Grid */}
              <View style={styles.metadataGrid}>
                <View
                  style={[
                    styles.metaCard,
                    {
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[styles.metaLabel, { color: colors.onSurfaceVariant }]}>
                    Kategori
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.onSurface }]}>
                    {book.category}
                  </Text>
                </View>

                <View
                  style={[
                    styles.metaCard,
                    {
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[styles.metaLabel, { color: colors.onSurfaceVariant }]}>
                    Bahasa
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.onSurface }]}>
                    {book.language}
                  </Text>
                </View>

                <View
                  style={[
                    styles.metaCard,
                    {
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[styles.metaLabel, { color: colors.onSurfaceVariant }]}>
                    Jumlah Halaman
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.onSurface }]}>
                    {book.totalPages}
                  </Text>
                </View>

                <View
                  style={[
                    styles.metaCard,
                    {
                      backgroundColor: colors.surfaceContainer,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <Text style={[styles.metaLabel, { color: colors.onSurfaceVariant }]}>
                    Tahun Terbit
                  </Text>
                  <Text style={[styles.metaValue, { color: colors.onSurface }]}>
                    {book.publishedYear || 2017}
                  </Text>
                </View>
              </View>

              {/* Synopsis / Description */}
              <View style={styles.synopsisSection}>
                <Text
                  style={[
                    styles.synopsisHeading,
                    { color: colors.onSurface },
                  ]}
                >
                  Deskripsi
                </Text>
                <Text
                  style={[
                    styles.synopsisBody,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {book.synopsis}
                </Text>
              </View>
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
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  breadcrumbLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '500',
  },
  breadcrumbCurrent: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '700',
  },
  detailCanvas: {
    flexDirection: 'column',
    gap: 24,
  },
  detailCanvasDesktop: {
    flexDirection: 'row',
    gap: 48,
    alignItems: 'flex-start',
  },
  leftColumn: {
    width: '100%',
  },
  leftColumnDesktop: {
    width: 340,
    flexShrink: 0,
  },
  coverWrapper: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  actionButtonsCol: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '600',
  },
  rightColumn: {
    flex: 1,
  },
  titleSection: {
    marginBottom: 28,
  },
  bookTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 6,
  },
  bookTitleDesktop: {
    fontSize: 44,
    lineHeight: 52,
  },
  bookAuthor: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingScore: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 18,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewsCountText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  metaCard: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  metaLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    marginBottom: 4,
  },
  metaValue: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    fontWeight: '700',
  },
  synopsisSection: {
    marginBottom: 20,
  },
  synopsisHeading: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  synopsisBody: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 16,
    lineHeight: 26,
  },
});
