import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { MaterialIcon } from './MaterialIcon';

export type TabKey = 'beranda' | 'koleksi' | 'favorit' | 'riwayat';

interface BottomTabBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabPress,
}) => {
  const { colors, isDark } = useAppTheme();

  const tabs = [
    { key: 'beranda' as TabKey, label: 'Beranda', icon: 'home' },
    { key: 'koleksi' as TabKey, label: 'Koleksi', icon: 'local_library' },
    { key: 'favorit' as TabKey, label: 'Favorit', icon: 'favorite' },
    { key: 'riwayat' as TabKey, label: 'Riwayat', icon: 'history' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceContainer,
          borderTopColor: colors.outlineVariant,
        },
      ]}
    >
      {tabs.map((t) => {
        const isActive = activeTab === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            activeOpacity={0.75}
            onPress={() => onTabPress(t.key)}
            style={[
              styles.tabItem,
              isActive
                ? [
                    styles.tabItemActive,
                    {
                      backgroundColor: isDark
                        ? colors.secondaryContainer
                        : colors.primaryContainer,
                    },
                  ]
                : null,
            ]}
          >
            <MaterialIcon
              name={t.icon}
              size={22}
              color={
                isActive
                  ? isDark
                    ? colors.onSecondaryContainer
                    : colors.onPrimary
                  : colors.onSurfaceVariant
              }
              filled={isActive}
            />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isActive
                    ? isDark
                      ? colors.onSecondaryContainer
                      : colors.onPrimary
                    : colors.onSurfaceVariant,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as any,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 50,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  tabItemActive: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  tabLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    marginTop: 2,
  },
});
