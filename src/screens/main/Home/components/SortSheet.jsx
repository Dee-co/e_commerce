import React from 'react';
import { Modal, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';

import AppText from '../../../../components/ui/AppText';
import { useTheme } from '../../../../context/ThemeContext';

export const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', api: null },
  {
    id: 'price-asc',
    label: 'Price: Low to High',
    api: { sortBy: 'price', order: 'asc' },
  },
  {
    id: 'price-desc',
    label: 'Price: High to Low',
    api: { sortBy: 'price', order: 'desc' },
  },
  {
    id: 'rating',
    label: 'Rating: High to Low',
    api: { sortBy: 'rating', order: 'desc' },
  },
  {
    id: 'name',
    label: 'Name: A to Z',
    api: { sortBy: 'title', order: 'asc' },
  },
];

const SortSheet = ({ visible, selectedId, onSelect, onClose }) => {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/50"
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-3xl bg-surface px-5 pb-8 pt-4"
          onPress={() => {}}
        >
          <AppText variant="title" className="mb-2 text-lg">
            Sort by
          </AppText>

          {SORT_OPTIONS.map(option => {
            const selected = option.id === selectedId;

            return (
              <Pressable
                key={option.id}
                onPress={() => onSelect(option.id)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className="h-12 flex-row items-center justify-between border-b border-border"
              >
                <AppText
                  variant={selected ? 'button' : 'bodySmall'}
                  color={
                    selected ? colors.primary : colors.textPrimary
                  }
                >
                  {option.label}
                </AppText>

                {selected && (
                  <Check size={18} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SortSheet;