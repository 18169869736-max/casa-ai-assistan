import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../constants/theme';
import { SpaceTypeOption } from '../../constants/spaceTypes';

interface RoomTypeGridProps {
  roomTypes: SpaceTypeOption[];
  selectedRoomType?: string;
  onRoomTypeSelect: (roomConfig: SpaceTypeOption) => void;
  numColumns?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const RoomTypeGrid: React.FC<RoomTypeGridProps> = ({
  roomTypes,
  selectedRoomType,
  onRoomTypeSelect,
  numColumns = 2,
}) => {
  const containerPadding = Spacing.lg;
  const itemSpacing = Spacing.sm;
  const itemWidth = (screenWidth - containerPadding * 2 - itemSpacing * (numColumns - 1)) / numColumns;

  const renderRoomType = (roomConfig: SpaceTypeOption, index: number) => {
    const isSelected = selectedRoomType === roomConfig.type;
    const isLeftItem = index % numColumns === 0;

    return (
      <TouchableOpacity
        key={roomConfig.type}
        style={[
          styles.roomTypeCard,
          {
            width: itemWidth,
            marginLeft: isLeftItem ? 0 : itemSpacing,
          },
          isSelected && styles.selectedCard,
        ]}
        onPress={() => onRoomTypeSelect(roomConfig)}
        activeOpacity={0.8}
      >
        <Ionicons
          name={roomConfig.icon as any}
          size={24}
          color={isSelected ? Colors.primary : Colors.textSecondary}
        />
        <Text style={[
          styles.roomTypeLabel,
          isSelected && styles.selectedLabel
        ]}>
          {roomConfig.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRows = () => {
    const rows = [];
    for (let i = 0; i < roomTypes.length; i += numColumns) {
      const rowItems = roomTypes.slice(i, i + numColumns);
      rows.push(
        <View key={i} style={styles.row}>
          {rowItems.map((item, index) => renderRoomType(item, i + index))}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      {renderRows()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  roomTypeCard: {
    backgroundColor: Colors.background,
    borderRadius: 25,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
    gap: Spacing.sm,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
  },
  roomTypeLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    flex: 1,
  },
  selectedLabel: {
    color: Colors.primary,
    fontWeight: Typography.weights.semiBold,
  },
});

export default RoomTypeGrid;