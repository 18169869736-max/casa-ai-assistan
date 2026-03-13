import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { SelectionGridProps } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

function SelectionGrid<T>({
  items,
  selectedItem,
  onSelect,
  renderItem,
  numColumns = 2,
}: SelectionGridProps<T> & { numColumns?: number }) {
  const itemWidth = (screenWidth - Spacing.md * 3) / numColumns;

  const renderGridItem = ({ item, index }: { item: T; index: number }) => {
    const isSelected = selectedItem === item;
    
    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          { width: itemWidth },
          isSelected && styles.selectedItem,
        ]}
        onPress={() => onSelect(item)}
        activeOpacity={0.8}
      >
        <View style={styles.itemContent}>
          {renderItem(item)}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderGridItem}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  listContainer: {
    paddingVertical: Spacing.md,
    paddingBottom: 150,
  },
  row: {
    justifyContent: 'center',
    gap: Spacing.md,
  },
  gridItem: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: Spacing.md,
  },
});

export default SelectionGrid;