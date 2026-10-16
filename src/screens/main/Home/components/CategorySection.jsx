import React from 'react';
import { ScrollView, Pressable } from 'react-native';
import AppText from '../../../../components/ui/AppText';
import { useTheme } from '../../../../context/ThemeContext';
const CategorySection = ({
  categories = [],
  selectedCategory,
  onSelectCategory,
}) => {
  const { colors } = useTheme();

  const renderCategory = (categoryId, name) => {
    const isSelected = selectedCategory === categoryId;

    return (
      <Pressable
        key={categoryId ?? 'all'}
        onPress={() => onSelectCategory(categoryId)}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        className={`mr-2.5 h-[38px] items-center justify-center rounded-full border px-4 ${isSelected
            ? 'border-primary bg-primary'
            : 'border-border bg-surface'
          }`}
      >
        <AppText
          variant={isSelected ? 'button' : 'bodySmall'}
          color={isSelected ? colors.white : colors.textPrimary}
          style={{ includeFontPadding: false }}
        >
          {name}
        </AppText>
      </Pressable>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="px-5"
    >
      {renderCategory(null, 'All')}

      {categories.map(category =>
        renderCategory(category.id, category.name),
      )}
    </ScrollView>
  );
};

export default CategorySection;