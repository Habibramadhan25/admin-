import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

interface MaterialIconProps {
  name: string;
  size?: number;
  color?: string;
  filled?: boolean;
  style?: StyleProp<TextStyle>;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  size = 20,
  color = '#1c1c19',
  filled = false,
  style,
}) => {
  return (
    <Text
      style={[
        {
          fontFamily: 'Material Symbols Outlined' as any,
          fontSize: size,
          color,
          lineHeight: size,
          textAlign: 'center',
          includeFontPadding: false,
          userSelect: 'none' as any,
          ...(filled
            ? ({ fontVariationSettings: "'FILL' 1, 'wght' 400" } as any)
            : ({ fontVariationSettings: "'FILL' 0, 'wght' 400" } as any)),
        },
        style,
      ]}
    >
      {name}
    </Text>
  );
};
