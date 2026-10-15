import React, { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Search,
  ArrowRight,
  Wrench,
  UserRound,
  BriefcaseBusiness,
  MapPin,
  RefreshCw,
  Check,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import AppSafeAreaView from '../../components/ui/AppSafeAreaView';
import AppText from '../../components/ui/AppText';
import AppButton from '../../components/ui/AppButton';
import AppLoader from '../../components/ui/AppLoader';
import TaskCard from '../../components/common/TaskCard';

import { fonts } from '../../theme';
import {
  getTasks,
  getSelectedTasks,
  selectTasks,
} from '../../services/taskService';
import { useTheme } from '../../context/ThemeContext';

const CATEGORY_CONFIG = {
  'Home Services': {
    icon: Wrench,
    label: 'Home Services',
  },
  'Personal Services': {
    icon: UserRound,
    label: 'Personal Services',
  },
  'Business Services': {
    icon: BriefcaseBusiness,
    label: 'Business Services',
  },
  'Local Services': {
    icon: MapPin,
    label: 'Local Services',
  },
};

const TaskSelectionScreen = ({ navigation }) => {
  const {colors} = useTheme()
  const [tasks, setTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const loadTasks = async (isRefresh = false) => {
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
      console.log('TASKS RESPONSE:', tasksResponse);
      console.log('SELECTED TASKS RESPONSE:', selectedResponse);
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
      } else if (Array.isArray(selectedData?.taskIds)) {
        selectedIds = selectedData.taskIds;
      }
      setTasks(apiTasks);
      setSelectedTasks(selectedIds.map(id => String(id)));
    } catch (err) {
      console.log('TASK LOAD ERROR:', err?.response?.data || err?.message);
      setError(
        err?.response?.data?.message ||
          'Unable to load services. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    loadTasks();
  }, []);
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return tasks;
    }
    return tasks.filter(task => {
      return (
        task.name?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      );
    });
  }, [tasks, search]);
  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((groups, task) => {
      const category = task.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(task);
      return groups;
    }, {});
  }, [filteredTasks]);
  const toggleTask = taskId => {
    const id = String(taskId);
    setSelectedTasks(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
    });
  };
  const handleContinue = async () => {
    if (selectedTasks.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Select at least one service',
        text2: 'Please choose the services you provide.',
      });
      return;
    }
    try {
      setSaving(true);
      console.log('SELECTING TASK IDS:', selectedTasks);
      const response = await selectTasks(selectedTasks);
      console.log('SELECT TASK RESPONSE:', response);
      await updateUser({
        isProfileCompleted: true,
      });
      Toast.show({
        type: 'success',
        text1: 'Services Saved',
        text2: `${selectedTasks.length} service${
          selectedTasks.length > 1 ? 's' : ''
        } selected.`,
      });
    } catch (err) {
      console.log('SELECT TASK ERROR:', err?.response?.data || err?.message);
      Toast.show({
        type: 'error',
        text1: 'Unable to save services',
        text2: err?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <AppSafeAreaView>
        <AppLoader fullScreen />
      </AppSafeAreaView>
    );
  }
  if (error && tasks.length === 0) {
    return (
      <AppSafeAreaView>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-surfaceLight items-center justify-center mb-5">
            <RefreshCw size={28} color={colors.primary} />
          </View>
          <AppText variant="title" style={{ textAlign: 'center' }}>
            Something went wrong
          </AppText>
          <AppText
            variant="bodySmall"
            color={colors.textSecondary}
            style={{
              textAlign: 'center',
              marginTop: 8,
              marginBottom: 24,
            }}
          >
            {error}
          </AppText>
          <AppButton
            title="Try Again"
            onPress={() => loadTasks()}
            fullWidth={false}
            leftIcon={<RefreshCw size={18} color={colors.black} />}
          />
        </View>
      </AppSafeAreaView>
    );
  }
  return (
    <AppSafeAreaView>
      <View className="flex-1">
        <View className="px-6 pt-7 pb-4">
          <AppText variant="heading">What services do you offer?</AppText>
          <AppText
            variant="body"
            color={colors.textSecondary}
            style={{ marginTop: 8 }}
          >
            Select the services you provide to people nearby.
          </AppText>
        </View>
        <View className="px-6 mb-5">
          <View
            className="flex-row items-center bg-surface border border-border rounded-[14px] px-4"
            style={{ height: 52 }}
          >
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search services..."
              placeholderTextColor={colors.textMuted}
              className="flex-1 ml-3"
              style={{
                color: colors.textPrimary,
                fontFamily: fonts.regular,
                fontSize: 15,
              }}
            />
          </View>
        </View>
        <FlatList
          data={filteredTasks}
          keyExtractor={item => String(item.id)}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 180,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTasks(true)}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item, index }) => {
            const isSelected = selectedTasks.includes(String(item.id));
            const previousItem = filteredTasks[index - 1];
            const showCategory =
              !previousItem || previousItem.category !== item.category;
            const config = CATEGORY_CONFIG[item.category];
            const CategoryIcon = config?.icon || BriefcaseBusiness;
            return (
              <View>
                {showCategory && (
                  <View className="flex-row items-center mb-3 mt-2">
                    <View className="w-9 h-9 rounded-[10px] bg-surfaceLight items-center justify-center mr-3">
                      <CategoryIcon size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <AppText variant="title">{item.category}</AppText>
                      <AppText variant="caption" color={colors.textMuted}>
                        {
                          filteredTasks.filter(
                            task => task.category === item.category,
                          ).length
                        }
                        services
                      </AppText>
                    </View>
                  </View>
                )}
                <TaskCard
                  task={item}
                  selected={isSelected}
                  onPress={() => toggleTask(item.id)}
                />
                {index === filteredTasks.length - 1 && <View className="h-4" />}
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Search size={36} color={colors.textMuted} />
              <AppText variant="title" style={{ marginTop: 16 }}>
                No services found
              </AppText>
              <AppText
                variant="bodySmall"
                color={colors.textSecondary}
                style={{
                  marginTop: 6,
                  textAlign: 'center',
                }}
              >
                Try searching with a different keyword.
              </AppText>
            </View>
          }
        />
        <View
          className="absolute bottom-0 left-0 right-0 px-6 pt-4"
          style={{
            paddingBottom: 24,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <AppText variant="bodySmall">Selected services</AppText>
              <AppText variant="title" color={colors.primary}>
                {selectedTasks.length}
              </AppText>
            </View>
            {selectedTasks.length > 0 ? (
              <View className="flex-row items-center">
                <Check size={16} color={colors.primary} />
                <AppText
                  variant="bodySmall"
                  color={colors.primary}
                  style={{ marginLeft: 5 }}
                >
                  Ready to continue
                </AppText>
              </View>
            ) : null}
          </View>
          <AppButton
            title={saving ? 'Saving...' : 'Confirm Services'}
            loading={saving}
            disabled={saving}
            onPress={handleContinue}
            rightIcon={
              !saving ? (
                <ArrowRight size={20} color={colors.black} strokeWidth={2.5} />
              ) : null
            }
          />
        </View>
      </View>
    </AppSafeAreaView>
  );
};

export default TaskSelectionScreen;
