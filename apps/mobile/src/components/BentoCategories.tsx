import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { MaterialIcon } from './MaterialIcon';

interface BentoCategoriesProps {
  onSelectCategory: (catId: string) => void;
  onSeeAll?: () => void;
}

const CATEGORIES = [
  { id: 'novel', name: 'Novel', icon: 'auto_stories' },
  { id: 'self-help', name: 'Pengembangan Diri', icon: 'trending_up' },
  { id: 'sejarah', name: 'Sejarah', icon: 'account_balance' },
  { id: 'motivasi', name: 'Motivasi', icon: 'psychology' },
  { id: 'romance', name: 'Romance', icon: 'favorite' },
  { id: 'sains', name: 'Sains', icon: 'science' },
];

export const BentoCategories: React.FC<BentoCategoriesProps> = ({
  onSelectCategory,
  onSeeAll,
}) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Kategori</Text>
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>Lihat semua</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.8}
            onPress={() => onSelectCategory(cat.id)}
            style={[
              styles.card,
              {
                backgroundColor: colors.surfaceContainerHigh,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: colors.secondaryContainer,
                },
              ]}
            >
              <MaterialIcon
                name={cat.icon}
                size={18}
                color={colors.onSecondaryContainer}
              />
            </View>
            <Text
              style={[styles.catName, { color: colors.onSurface }]}
              numberOfLines={2}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 22,
    fontWeight: '600',
  },
  seeAllText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  catName: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
