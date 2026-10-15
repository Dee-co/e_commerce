import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ChevronDown,
  Check,
  X,
  Search,
  AlertCircle,
} from 'lucide-react-native';
import AppText from './AppText';
import { fonts } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

const SEARCH_THRESHOLD = 6;
const FIELD_HEIGHT = 54;
const OPTION_HEIGHT = 56;
const centeredText = {
  includeFontPadding: false,
  textAlignVertical: 'center',
};

const AppSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  leftIcon,
  searchable,
}) => {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');
  const selectedOption = options.find(option => option.value === value);
  const showSearch =
    searchable !== undefined ? searchable : options.length > SEARCH_THRESHOLD;
  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter(option =>
      String(option.label).toLowerCase().includes(q),
    );
  }, [options, query]);
  const openSheet = () => {
    setQuery('');
    setVisible(true);
  };
  const closeSheet = () => {
    setVisible(false);
    setQuery('');
  };
  const handleSelect = option => {
    onChange?.(option.value);
    closeSheet();
  };
  const borderColor = error
    ? colors.error
    : visible
    ? colors.primary
    : colors.border;
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <AppText
            variant="bodySmall"
            style={{ fontFamily: fonts.semiBold, ...centeredText }}
          >
            {label}
          </AppText>
          {required && (
            <AppText
              variant="bodySmall"
              color={colors.error}
              style={{
                marginLeft: 3,
                fontFamily: fonts.semiBold,
                ...centeredText,
              }}
            >
              *
            </AppText>
          )}
        </View>
      )}
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={openSheet}
        style={{
          height: FIELD_HEIGHT,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor,
          borderRadius: 14,
          backgroundColor: colors.surface,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {leftIcon && (
          <View
            style={{
              width: 24,
              height: 24,
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {leftIcon}
          </View>
        )}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <AppText
            variant="body"
            color={selectedOption ? colors.textPrimary : colors.textMuted}
            style={centeredText}
            numberOfLines={1}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </AppText>
        </View>
        <View
          style={{
            width: 24,
            height: 24,
            marginLeft: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChevronDown
            size={20}
            strokeWidth={2.2}
            color={
              disabled
                ? colors.textMuted
                : visible
                ? colors.primary
                : colors.textSecondary
            }
          />
        </View>
      </TouchableOpacity>
      {/* Error / Helper */}
      {error ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <AlertCircle size={14} color={colors.error} />
          <AppText
            variant="caption"
            color={colors.error}
            style={{ marginLeft: 6, flex: 1, ...centeredText }}
          >
            {error}
          </AppText>
        </View>
      ) : helperText ? (
        <AppText
          variant="caption"
          color={colors.textMuted}
          style={{ marginTop: 6 }}
        >
          {helperText}
        </AppText>
      ) : null}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closeSheet}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={closeSheet} />
          {/* Sheet */}
          <View
            style={{
              maxHeight: '75%',
              backgroundColor: colors.surface,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 28,
            }}
          >
            <View
              style={{
                alignSelf: 'center',
                width: 44,
                height: 5,
                borderRadius: 3,
                marginBottom: 16,
                backgroundColor: colors.border,
              }}
            />
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <AppText variant="title">{label || 'Select'}</AppText>
                <AppText
                  variant="caption"
                  color={colors.textMuted}
                  style={{ marginTop: 2 }}
                  numberOfLines={1}
                >
                  {selectedOption
                    ? `Selected: ${selectedOption.label}`
                    : `${options.length} options available`}
                </AppText>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={closeSheet}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.surfaceLight,
                }}
              >
                <X size={18} strokeWidth={2} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {showSearch && (
              <View
                style={{
                  height: 48,
                  paddingHorizontal: 14,
                  marginBottom: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 12,
                  backgroundColor: colors.surfaceLight,
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    marginRight: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Search size={18} color={colors.textMuted} />
                </View>
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search..."
                  placeholderTextColor={colors.textMuted}
                  autoCorrect={false}
                  style={{
                    flex: 1,
                    height: '100%',
                    paddingVertical: 0,
                    paddingHorizontal: 0,
                    color: colors.textPrimary,
                    fontFamily: fonts.regular,
                    fontSize: 15,
                    ...centeredText,
                  }}
                />
                <View
                  style={{
                    width: 20,
                    height: 20,
                    marginLeft: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {query.length > 0 && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setQuery('')}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <X size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 4 }}
            >
              {filteredOptions.length === 0 ? (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <AppText variant="body" color={colors.textMuted}>
                    No results found
                  </AppText>
                </View>
              ) : (
                filteredOptions.map(option => {
                  const selected = option.value === value;
                  return (
                    <TouchableOpacity
                      key={String(option.value)}
                      activeOpacity={0.8}
                      onPress={() => handleSelect(option)}
                      style={{
                        minHeight: OPTION_HEIGHT,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 14,
                        borderWidth: 1.5,
                        borderColor: selected ? colors.primary : 'transparent',
                        marginBottom: 8,
                        backgroundColor: selected
                          ? colors.borderPrimary
                          : colors.surfaceLight,
                      }}
                    >
                      {option.icon && (
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            marginRight: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.surface,
                          }}
                        >
                          {option.icon}
                        </View>
                      )}
                      <View style={{ flex: 1, justifyContent: 'center' }}>
                        <AppText
                          color={selected ? colors.primary : colors.textPrimary}
                          style={{
                            fontFamily: selected
                              ? fonts.semiBold
                              : fonts.regular,
                            ...centeredText,
                          }}
                        >
                          {option.label}
                        </AppText>
                        {option.description && (
                          <AppText
                            variant="caption"
                            color={colors.textSecondary}
                            style={{ marginTop: 2 }}
                          >
                            {option.description}
                          </AppText>
                        )}
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          marginLeft: 12,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1.5,
                          borderColor: selected
                            ? colors.primary
                            : colors.border,
                          backgroundColor: selected
                            ? colors.primary
                            : 'transparent',
                        }}
                      >
                        {selected && (
                          <Check
                            size={14}
                            strokeWidth={3}
                            color={colors.black}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default AppSelect;