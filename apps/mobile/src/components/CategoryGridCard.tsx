import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../theme/colors';

interface CategoryGridCardProps {
  name: string;
  count: number;
  onPress: () => void;
  fullWidth?: boolean;
}

export const CategoryGridCard: React.FC<CategoryGridCardProps> = ({
  name,
  count,
  onPress,
  fullWidth = false,
}) => {
  const initial = name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, fullWidth ? styles.fullCard : styles.halfCard]}
    >
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{initial}</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.nameText}>{name}</Text>
        <Text style={styles.countText}>{count} koleksi buku</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  halfCard: {
    width: '48%',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  fullCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  badgeContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  countText: {
    fontSize: 11,
    color: '#64748B',
  },
});
