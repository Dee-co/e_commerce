import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import AppText from '../ui/AppText';
import { useTheme } from '../../context/ThemeContext';

const CategoryFilter = ({
  categories = [],
  selectedCategory,
  onSelect,
  showIcons = false,
}) => {
  const {colors} = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingRight: 16,
      }}
    >
      {categories.map(category => {
        const active = selectedCategory === category.key;
        const Icon = category.icon;
        return (
          <Pressable
            key={category.key}
            onPress={() => onSelect(category.key)}
            className={`mr-2 h-10 flex-row items-center rounded-full border px-4 ${
              active ? 'border-primary bg-primary' : 'border-border bg-surface'
            }`}
          >
            {showIcons && Icon && (
              <Icon
                size={16}
                color={active ? colors.black : colors.textSecondary}
              />
            )}
            <AppText
              variant="bodySmall"
              color={active ? colors.black : colors.textSecondary}
              className={showIcons && Icon ? 'ml-2' : ''}
            >
              {category.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

export default CategoryFilter;
