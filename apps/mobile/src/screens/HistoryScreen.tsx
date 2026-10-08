import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { BookItem } from '../data/mockData';
import { useBooks } from '../services/bookStorage';
import { MaterialIcon } from '../components/MaterialIcon';
import { MobileTopBar } from '../components/MobileTopBar';
import { SearchBar } from '../components/SearchBar';
import { useResponsive } from '../hooks/useResponsive';

interface HistoryScreenProps {
  onSelectBook: (book: BookItem) => void;
  onReadBook?: (book: BookItem) => void;
  onOpenProfile: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onSelectBook,
  onReadBook,
  onOpenProfile,
}) => {
  const { colors, isDark } = useAppTheme();
  const { isDesktop, isMobile } = useResponsive();

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'reading' | 'completed' | 'month'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { books } = useBooks();

  // Books ongoing (Sedang Dibaca: progress > 0 and < 100)
  const ongoingBooks = books.filter(
    (b) => (b.progressPercentage || 0) > 0 && (b.progressPercentage || 0) < 100
  );

  // Books completed (Selesai: progress == 100)
  const completedBooks = books.filter(
    (b) => (b.progressPercentage || 0) === 100
  );

  const filterQuery = (list: BookItem[]) => {
    if (!searchQuery) return list;
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const showOngoing =
    activeFilter === 'all' || activeFilter === 'reading' || activeFilter === 'month';
  const showCompleted =
    activeFilter === 'all' || activeFilter === 'completed' || activeFilter === 'month';

  const displayedOngoing = filterQuery(ongoingBooks);
  const displayedCompleted = filterQuery(completedBooks);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      {isMobile ? (
        <MobileTopBar title="Riwayat Baca" onSettingsPress={onOpenProfile} />
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollContentDesktop : null,
        ]}
      >
        <View style={styles.container}>
          {/* Header Banner */}
          <View style={styles.headerKickerRow}>
            <Text style={[styles.kickerText, { color: colors.primary }]}>
              Arsip & Jejak Literasi
            </Text>
            <View
              style={[
                styles.syncBadge,
                { backgroundColor: colors.surfaceContainerHigh },
              ]}
            >
              <View
                style={[styles.syncDot, { backgroundColor: colors.tertiary }]}
              />
              <Text
                style={[styles.syncBadgeText, { color: colors.tertiary }]}
              >
                Sinkron Cloud
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.onSurface }]}>
            Riwayat Bacaan
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
          >
            Pantau rekaman waktu, progres baca yang sedang berjalan, dan seluruh buku
            yang telah Anda tamatkan.
          </Text>

          {/* 4 Stats Cards Grid */}
          <View style={styles.statsGrid}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: colors.onSurfaceVariant }]}>
                  Waktu Baca
                </Text>
                <MaterialIcon
                  name="schedule"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.statValRow}>
                <Text style={[styles.statVal, { color: colors.onSurface }]}>24</Text>
                <Text style={[styles.statUnit, { color: colors.onSurfaceVariant }]}>
                  Jam
                </Text>
              </View>
              <Text style={[styles.statFooter, { color: colors.tertiary }]}>
                +3.5 jam mgg ini
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: colors.onSurfaceVariant }]}>
                  Buku Selesai
                </Text>
                <MaterialIcon
                  name="verified"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.statValRow}>
                <Text style={[styles.statVal, { color: colors.onSurface }]}>8</Text>
                <Text style={[styles.statUnit, { color: colors.onSurfaceVariant }]}>
                  Buku
                </Text>
              </View>
              <Text style={[styles.statFooter, { color: colors.onSurfaceVariant }]}>
                Target: 12 tahun ini
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: colors.onSurfaceVariant }]}>
                  Halaman Dibaca
                </Text>
                <MaterialIcon
                  name="menu_book"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.statValRow}>
                <Text style={[styles.statVal, { color: colors.onSurface }]}>1.420</Text>
                <Text style={[styles.statUnit, { color: colors.onSurfaceVariant }]}>
                  Hal
                </Text>
              </View>
              <Text style={[styles.statFooter, { color: colors.tertiary }]}>
                Rata-rata 45 hal/hari
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.statHeader}>
                <Text style={[styles.statTitle, { color: colors.onSurfaceVariant }]}>
                  Streak Harian
                </Text>
                <MaterialIcon
                  name="local_fire_department"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.statValRow}>
                <Text style={[styles.statVal, { color: colors.onSurface }]}>7</Text>
                <Text style={[styles.statUnit, { color: colors.onSurfaceVariant }]}>
                  Hari
                </Text>
              </View>
              <Text style={[styles.statFooter, { color: colors.primary }]}>
                Rekor terbaik!
              </Text>
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <SearchBar
              placeholder="Cari judul, penulis, atau catatan..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsRow}
          >
            {[
              { key: 'all' as const, label: `Semua (${books.length})` },
              { key: 'reading' as const, label: `Sedang Dibaca (${ongoingBooks.length})` },
              { key: 'completed' as const, label: `Selesai (${completedBooks.length})` },
              { key: 'month' as const, label: 'Bulan Ini' },
            ].map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveFilter(tab.key)}
                  style={[
                    styles.filterTabBtn,
                    {
                      backgroundColor: isActive
                        ? colors.secondaryContainer
                        : colors.surfaceContainer,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTabBtnText,
                      {
                        color: isActive
                          ? colors.onSecondaryContainer
                          : colors.onSurfaceVariant,
                        fontWeight: isActive ? '700' : '500',
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* SECTION 1: SEDANG BERJALAN */}
          {showOngoing && displayedOngoing.length > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWithIcon}>
                  <MaterialIcon
                    name="hourglass_top"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.sectionHeading,
                      { color: colors.onSurface },
                    ]}
                  >
                    Sedang Berjalan
                  </Text>
                </View>
                <Text
                  style={[
                    styles.sectionCountText,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {displayedOngoing.length} Buku aktif
                </Text>
              </View>

              <View style={styles.itemsList}>
                {displayedOngoing.map((book) => (
                  <View
                    key={book.id}
                    style={[
                      styles.ongoingCard,
                      {
                        backgroundColor: colors.surfaceContainer,
                        borderColor: colors.outlineVariant,
                      },
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.thumbWrapper}>
                        <Image
                          source={{ uri: book.coverUrl }}
                          style={styles.thumbImage}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.cardInfo}>
                        <View style={styles.cardMetaTop}>
                          <View
                            style={[
                              styles.progressBadge,
                              { backgroundColor: colors.secondaryContainer },
                            ]}
                          >
                            <Text
                              style={[
                                styles.progressBadgeText,
                                { color: colors.onSecondaryContainer },
                              ]}
                            >
                              {book.progressPercentage}% Selesai
                            </Text>
                          </View>
                          <Text
                            style={[styles.timeText, { color: colors.outline }]}
                          >
                            {book.lastReadTime || 'Kemarin'}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.itemTitle,
                            { color: colors.onSurface },
                          ]}
                          numberOfLines={1}
                        >
                          {book.title}
                        </Text>
                        <Text
                          style={[
                            styles.itemAuthor,
                            { color: colors.onSurfaceVariant },
                          ]}
                          numberOfLines={1}
                        >
                          {book.author}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Track */}
                    <View style={styles.cardBottomRow}>
                      <View
                        style={[
                          styles.ongoingProgressTrack,
                          { backgroundColor: colors.surfaceContainerHighest },
                        ]}
                      >
                        <View
                          style={[
                            styles.ongoingProgressFill,
                            {
                              width: `${book.progressPercentage}%`,
                              backgroundColor: colors.primaryContainer,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.cardActionsRow}>
                        <Text
                          style={[
                            styles.timeRemainingText,
                            { color: colors.outline },
                          ]}
                        >
                          Sisa ± 1.5 jam
                        </Text>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() =>
                            onReadBook ? onReadBook(book) : onSelectBook(book)
                          }
                          style={[
                            styles.continueBtn,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.continueBtnText,
                              { color: colors.onPrimary },
                            ]}
                          >
                            Lanjutkan
                          </Text>
                          <MaterialIcon
                            name="arrow_forward"
                            size={16}
                            color={colors.onPrimary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* SECTION 2: BUKU YANG TELAH SELESAI */}
          {showCompleted && displayedCompleted.length > 0 ? (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionTitleWithIcon}>
                  <MaterialIcon
                    name="task_alt"
                    size={20}
                    color={colors.tertiary}
                  />
                  <Text
                    style={[
                      styles.sectionHeading,
                      { color: colors.onSurface },
                    ]}
                  >
                    Buku yang Telah Selesai
                  </Text>
                </View>
                <Text
                  style={[
                    styles.sectionCountText,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {displayedCompleted.length} Tamat
                </Text>
              </View>

              <View style={styles.itemsList}>
                {displayedCompleted.map((book) => (
                  <View
                    key={book.id}
                    style={[
                      styles.completedCard,
                      {
                        backgroundColor: colors.surfaceContainerLow,
                        borderColor: colors.outlineVariant,
                      },
                    ]}
                  >
                    <View style={styles.cardTopRow}>
                      <View style={styles.thumbWrapper}>
                        <Image
                          source={{ uri: book.coverUrl }}
                          style={styles.thumbImage}
                          resizeMode="cover"
                        />
                      </View>
                      <View style={styles.cardInfo}>
                        <View style={styles.cardMetaTop}>
                          <View
                            style={[
                              styles.completedBadge,
                              {
                                backgroundColor: colors.surfaceContainerHighest,
                              },
                            ]}
                          >
                            <MaterialIcon
                              name="check_circle"
                              size={12}
                              color={colors.tertiary}
                            />
                            <Text
                              style={[
                                styles.completedBadgeText,
                                { color: colors.tertiary },
                              ]}
                            >
                              100% Selesai
                            </Text>
                          </View>
                          <Text
                            style={[styles.timeText, { color: colors.outline }]}
                          >
                            {book.lastReadTime || 'Feb 2025'}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.itemTitle,
                            { color: colors.onSurface },
                          ]}
                          numberOfLines={1}
                        >
                          {book.title}
                        </Text>
                        <Text
                          style={[
                            styles.itemAuthor,
                            { color: colors.onSurfaceVariant },
                          ]}
                          numberOfLines={1}
                        >
                          {book.author}
                        </Text>
                        <View style={styles.starsRowCompleted}>
                          <MaterialIcon
                            name="star"
                            size={14}
                            color={colors.star}
                            filled={true}
                          />
                          <MaterialIcon
                            name="star"
                            size={14}
                            color={colors.star}
                            filled={true}
                          />
                          <MaterialIcon
                            name="star"
                            size={14}
                            color={colors.star}
                            filled={true}
                          />
                          <MaterialIcon
                            name="star"
                            size={14}
                            color={colors.star}
                            filled={true}
                          />
                          <MaterialIcon
                            name="star"
                            size={14}
                            color={colors.star}
                            filled={true}
                          />
                          <Text
                            style={[
                              styles.ratingScoreCompleted,
                              { color: colors.onSurfaceVariant },
                            ]}
                          >
                            5.0
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.cardFooterCompleted}>
                      <Text
                        style={[
                          styles.pagesStatsText,
                          { color: colors.outline },
                        ]}
                      >
                        Total {book.totalPages} Halaman • Dibaca 6 Hari
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          onReadBook ? onReadBook(book) : onSelectBook(book)
                        }
                        style={[
                          styles.replayBtn,
                          {
                            backgroundColor: colors.surfaceContainerHigh,
                          },
                        ]}
                      >
                        <MaterialIcon
                          name="replay"
                          size={15}
                          color={colors.onSurface}
                        />
                        <Text
                          style={[
                            styles.replayBtnText,
                            { color: colors.onSurface },
                          ]}
                        >
                          Baca Ulang
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
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
  scrollContent: {
    paddingBottom: 90,
  },
  scrollContentDesktop: {
    paddingBottom: 40,
  },
  container: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kickerText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncBadgeText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statTitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    fontWeight: '500',
  },
  statValRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 4,
  },
  statVal: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 24,
    fontWeight: '700',
  },
  statUnit: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
  },
  statFooter: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
  },
  searchRow: {
    marginBottom: 16,
  },
  filterTabsRow: {
    gap: 8,
    marginBottom: 28,
    paddingBottom: 4,
  },
  filterTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 9999,
  },
  filterTabBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
  },
  sectionBlock: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionHeading: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionCountText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
  },
  itemsList: {
    gap: 12,
  },
  ongoingCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    gap: 14,
  },
  thumbWrapper: {
    width: 60,
    height: 88,
    borderRadius: 6,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardMetaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  progressBadgeText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 10,
    fontWeight: '700',
  },
  timeText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
  },
  itemTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemAuthor: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
  },
  cardBottomRow: {
    gap: 10,
  },
  ongoingProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  ongoingProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRemainingText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  continueBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    fontWeight: '700',
  },

  // Completed card
  completedCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  completedBadgeText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 10,
    fontWeight: '700',
  },
  starsRowCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  ratingScoreCompleted: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardFooterCompleted: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  pagesStatsText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  replayBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '600',
  },
});
