import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { MaterialIcon } from './MaterialIcon';

interface BannerHeroProps {
  onExplorePress?: () => void;
}

export const BannerHero: React.FC<BannerHeroProps> = ({ onExplorePress }) => {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? colors.surfaceContainerHigh
            : colors.secondaryContainer,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.textColumn}>
        <Text
          style={[
            styles.title,
            {
              color: colors.primary,
            },
          ]}
        >
          Temukan Buku Favoritmu
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: isDark ? colors.onSurfaceVariant : colors.onSecondaryContainer,
            },
          ]}
        >
          Baca kapan saja, di mana saja. Perluas wawasan, hidup lebih bermakna.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onExplorePress}
          style={[
            styles.button,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: colors.onPrimary,
              },
            ]}
          >
            Jelajahi Koleksi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Decorative Book Illustration on right */}
      <View style={styles.imageColumn}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
          }}
          style={styles.heroBookCover}
          resizeMode="cover"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 180,
  },
  textColumn: {
    flex: 1,
    maxWidth: 500,
    zIndex: 2,
  },
  title: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '700',
  },
  imageColumn: {
    marginLeft: 16,
    zIndex: 1,
  },
  heroBookCover: {
    width: 90,
    height: 130,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
