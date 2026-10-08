import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { MaterialIcon } from './MaterialIcon';

interface MobileTopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onSettingsPress?: () => void;
  onNotificationsPress?: () => void;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({
  title = 'BacaYuk',
  showBack = false,
  onBack,
  onSettingsPress,
}) => {
  const { colors, isDark, toggleTheme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.outlineVariant,
        },
      ]}
    >
      {showBack && onBack ? (
        <TouchableOpacity
          onPress={onBack}
          style={[styles.actionBtn, { backgroundColor: colors.surfaceContainer }]}
          activeOpacity={0.7}
        >
          <MaterialIcon
            name="arrow_back"
            size={22}
            color={colors.onSurfaceVariant}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.brandGroup}>
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 32, height: 32 }}
            resizeMode="contain"
          />
        </View>
      )}

      <Text
        style={[
          styles.title,
          {
            color: colors.primary,
          },
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      <View style={styles.rightActions}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.actionBtn, { backgroundColor: colors.surfaceContainer }]}
          activeOpacity={0.7}
        >
          <MaterialIcon
            name={isDark ? 'dark_mode' : 'light_mode'}
            size={20}
            color={colors.primary}
            filled={true}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    position: 'sticky' as any,
    top: 0,
    zIndex: 40,
  },
  brandGroup: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Literata, serif' as any,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
