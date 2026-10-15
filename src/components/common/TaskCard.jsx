import React from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import AppText from '../ui/AppText';
import { useTheme } from '../../context/ThemeContext';
const TaskCard = ({ task, selected = false, onPress }) => {
  const {colors} = useTheme();
  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 flex-row items-center rounded-2xl border p-4 ${
        selected ? 'border-primary bg-surfaceLight' : 'border-border bg-surface'
      }`}
    >
      <View className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-surfaceLight">
        <AppText variant="title" color={colors.primary}>
          {task.name?.charAt(0)}
        </AppText>
      </View>
      <View className="flex-1">
        <AppText variant="title">{task.name}</AppText>
        <AppText
          variant="caption"
          color={colors.textSecondary}
          style={{ marginTop: 2 }}
        >
          {task.category}
        </AppText>
      </View>
      {selected && (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Check size={15} color={colors.black} strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
};

export default TaskCard;
