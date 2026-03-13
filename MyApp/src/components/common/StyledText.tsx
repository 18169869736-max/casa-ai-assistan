import React from 'react';
import { Text as DefaultText, TextProps } from 'react-native';
import { Typography } from '../../constants/theme';

export function Text(props: TextProps) {
  const { style, ...otherProps } = props;

  return (
    <DefaultText
      style={[{ fontFamily: Typography.fontFamily.regular }, style]}
      {...otherProps}
    />
  );
}
