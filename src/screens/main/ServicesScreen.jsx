import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, TextInput, View } from 'react-native';
import {
  Search,
  Wrench,
  UserRound,
  BriefcaseBusiness,
  MapPin,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import AppText from '../../components/ui/AppText';
import AppLoader from '../../components/ui/AppLoader';
import TaskCard from '../../components/common/TaskCard';
import CategoryFilter from '../../components/common/CategoryFilter';

import {
  getTasks,
  getSelectedTasks,
  selectTasks,
} from '../../services/taskService';
import { useTheme } from '../../context/ThemeContext';

const CATEGORIES = [
  {
    key: 'All',
    label: 'All',
    icon: null,
  },
  {
    key: 'Home Services',
    label: 'Home',
    icon: Wrench,
  },
  {
    key: 'Personal Services',
    label: 'Personal',
    icon: UserRound,
  },
  {
    key: 'Business Services',
    label: 'Business',
    icon: BriefcaseBusiness,
  },
  {
    key: 'Local Services',
    label: 'Local',
    icon: MapPin,
  },
];

const ServicesScreen = () => {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const cardStyle = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const loadServices = useCallback(async (isRefresh = false) => {
    try {
      setError('');
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const [tasksResponse, selectedResponse] = await Promise.all([
        getTasks(),
        getSelectedTasks(),
      ]);
      console.log('SERVICES TASKS RESPONSE:', tasksResponse);
      console.log('SERVICES SELECTED RESPONSE:', selectedResponse);
      const apiTasks = Array.isArray(tasksResponse?.data)
        ? tasksResponse.data
        : [];
      const selectedData = selectedResponse?.data;
      let selectedIds = [];
      if (Array.isArray(selectedData)) {
        selectedIds = selectedData;
      } else if (Array.isArray(selectedData?.tasks)) {
        selectedIds = selectedData.tasks.map(task =>
          typeof task === 'object' ? task.id : task,
        );
      } else if (Array.isArray(selectedData?.selectedTasks)) {
        selectedIds = selectedData.selectedTasks.map(task =>
          typeof task === 'object' ? task.id : task,
        );
      } else if (Array.isArray(selectedData?.taskIds)) {
        selectedIds = selectedData.taskIds;
      }
      setTasks(apiTasks);
      setSelectedTasks(selectedIds.map(id => String(id)));
    } catch (err) {
      console.log('SERVICES LOAD ERROR:', err?.response?.data || err?.message);
      setError(
        err?.response?.data?.message ||
          'Unable to load services. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter(task => {
      const matchesCategory = category === 'All' || task.category === category;
      const matchesSearch =
        !query ||
        task.name?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [tasks, search, category]);

  const toggleTask = async taskId => {
    const id = String(taskId);
    const updatedSelection = selectedTasks.includes(id)
      ? selectedTasks.filter(item => item !== id)
      : [...selectedTasks, id];
    setSelectedTasks(updatedSelection);
    try {
      setSaving(true);
      await selectTasks(updatedSelection);
      console.log('UPDATED SELECTED TASKS:', updatedSelection);
    } catch (err) {
      console.log('UPDATE TASK ERROR:', err?.response?.data || err?.message);
      setSelectedTasks(selectedTasks);
      Toast.show({
        type: 'error',
        text1: 'Unable to update service',
        text2: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppSafeAreaView bottom={false}>
        <AppLoader fullScreen />
      </AppSafeAreaView>
    );
  }

  return (
    <AppSafeAreaView bottom={false}>
      <View className="flex-1">
        <View className="px-6 pt-5">
          <AppText variant="heading">Services</AppText>
          <AppText variant="body" color={colors.textSecondary} className="mt-2">
            Find services that match your needs
          </AppText>
          <View
            className="mt-6 h-[52px] flex-row items-center rounded-xl px-4"
            style={cardStyle}
          >
            <Search size={20} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search services..."
              placeholderTextColor={colors.textMuted}
              className="ml-3 flex-1 text-base"
              style={{
                fontFamily: 'Eina01-Regular',
                color: colors.textPrimary,
              }}
            />
          </View>
          <View className="mt-4">
            <CategoryFilter
              categories={CATEGORIES}
              selectedCategory={category}
              onSelect={setCategory}
              showIcons
            />
          </View>
          <View className="mb-3 mt-6 flex-row items-center justify-between">
            <View>
              <AppText variant="title">Available services</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {selectedTasks.length} selected
              </AppText>
            </View>
            <AppText variant="caption" color={colors.textSecondary}>
              {filteredTasks.length} results
            </AppText>
          </View>
        </View>
        {error ? (
          <View className="mx-6 mb-4 rounded-2xl p-4" style={cardStyle}>
            <AppText variant="bodySmall" color={colors.error}>
              {error}
            </AppText>
          </View>
        ) : null}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 pb-8"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadServices(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
              progressBackgroundColor={colors.surface}
            />
          }
        >
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              selected={selectedTasks.includes(String(task.id))}
              onPress={() => toggleTask(task.id)}
            />
          ))}
          {filteredTasks.length === 0 && (
            <View className="items-center py-16">
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.surfaceLight }}
              >
                <Search size={24} color={colors.textMuted} />
              </View>
              <AppText variant="title" className="mt-4">
                No services found
              </AppText>
              <AppText
                variant="bodySmall"
                color={colors.textSecondary}
                className="mt-2 text-center"
              >
                Try another search or category.
              </AppText>
            </View>
          )}
        </ScrollView>
        {saving ? (
          <View
            className="absolute bottom-4 self-center rounded-full px-4 py-2"
            style={{
              backgroundColor: colors.surfaceLight,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <AppText variant="caption" color={colors.primary}>
              Saving changes...
            </AppText>
          </View>
        ) : null}
      </View>
    </AppSafeAreaView>
  );
};

export default ServicesScreen;