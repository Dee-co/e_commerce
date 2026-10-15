import React from 'react';
import {View} from 'react-native';
import {CheckCircle, AlertCircle, Info} from 'lucide-react-native';
import AppText from './AppText';
import { fonts} from '../../theme';
import { useTheme } from '../../context/ThemeContext';
const AppToast = ({type = 'success', text1, text2}) => {
  const {colors} = useTheme()
  const config = {
    success: {
      icon: CheckCircle,
      iconColor: colors.success,
    },
    error: {
      icon: AlertCircle,
      iconColor: colors.error,
    },
    info: {
      icon: Info,
      iconColor: colors.primary,
    },
  };
  const current = config[type] || config.info;
  const Icon = current.icon;
  return (
    <View
      style={{
        width: '90%',
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        elevation: 6,
        shadowColor: colors.black,
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: {
          width: 0,
          height: 4,
        },
      }}>
      <Icon
        size={22}
        color={current.iconColor}
        strokeWidth={2.5}
      />
      <View style={{flex: 1, marginLeft: 12}}>
        <AppText
          variant="bodySmall"
          style={{
            fontFamily: fonts.semiBold,
          }}>
          {text1}
        </AppText>
        {text2 ? (
          <AppText
            variant="caption"
            color={colors.textSecondary}
            style={{marginTop: 2}}>
            {text2}
          </AppText>
        ) : null}
      </View>
    </View>
  );
};

export default AppToast;