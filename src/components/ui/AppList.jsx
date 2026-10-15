import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    View,
} from 'react-native';

import AppText from './AppText';
import { useTheme } from '../../context/ThemeContext';

const AppList = ({
    data = [],
    renderItem,
    keyExtractor = item => String(item.id),

    loading = false,
    refreshing = false,
    onRefresh,

    onEndReached,
    onEndReachedThreshold = 0.5,

    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,

    contentContainerStyle,
    columnWrapperStyle,
    numColumns = 1,
    horizontal = false,

    showsVerticalScrollIndicator = false,
    showsHorizontalScrollIndicator = false,

    ItemSeparatorComponent,
    ListHeaderComponentStyle,
    ListFooterComponentStyle,

    emptyTitle = 'No items found',
    emptyMessage = 'There is nothing to display right now.',

    ...flatListProps
}) => {
    const { colors } = useTheme();

    const isEmpty = data.length === 0;

    const defaultEmptyComponent = (
        <View className="flex-1 items-center justify-center px-6 py-12">
            <AppText
                variant="heading"
                className="text-center text-lg font-bold"
            >
                {emptyTitle}
            </AppText>

            <AppText
                className="mt-2 text-center"
                color={colors.textMuted}
            >
                {emptyMessage}
            </AppText>
        </View>
    );

    const defaultFooterComponent = (
        <View className="items-center py-4">
            <ActivityIndicator
                size="small"
                color={colors.primary}
            />
        </View>
    );

    if (loading && isEmpty) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator
                    size="large"
                    color={colors.primary}
                />
            </View>
        );
    }

    return (
        <FlatList
            {...flatListProps}
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            horizontal={horizontal}
            numColumns={numColumns}
            columnWrapperStyle={
                numColumns > 1 ? columnWrapperStyle : undefined
            }
            refreshing={refreshing}
            onRefresh={onRefresh}
            onEndReached={onEndReached}
            onEndReachedThreshold={onEndReachedThreshold}
            ListHeaderComponent={ListHeaderComponent}
            ListHeaderComponentStyle={ListHeaderComponentStyle}
            ListFooterComponent={
                ListFooterComponent ??
                (loading && !isEmpty ? defaultFooterComponent : null)
            }
            ListFooterComponentStyle={ListFooterComponentStyle}
            ListEmptyComponent={ListEmptyComponent ?? defaultEmptyComponent}
            ItemSeparatorComponent={ItemSeparatorComponent}
            contentContainerStyle={[
                { flexGrow: 1 },
                contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={showsVerticalScrollIndicator}
            showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        />
    );
};

export default AppList;