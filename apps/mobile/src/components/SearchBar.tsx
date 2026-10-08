import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { MaterialIcon } from './MaterialIcon';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Cari buku, penulis, atau kategori...',
  value,
  onChangeText,
  style,
}) => {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: colors.surfaceContainer,
          borderColor: colors.outlineVariant,
        },
        style,
      ]}
    >
      <MaterialIcon
        name="search"
        size={20}
        color={colors.onSurfaceVariant}
        style={styles.searchIcon}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: colors.onSurface,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        value={value}
        onChangeText={onChangeText}
      />
      {Boolean(value && value.length > 0 && onChangeText) ? (
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={() => onChangeText('')}
          activeOpacity={0.7}
        >
          <MaterialIcon
            name="close"
            size={16}
            color={colors.outline}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    paddingHorizontal: 16,
    borderWidth: 1,
    width: '100%',
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 14,
    paddingVertical: 0,
    outlineStyle: 'none' as any,
  },
  clearBtn: {
    padding: 4,
  },
});
