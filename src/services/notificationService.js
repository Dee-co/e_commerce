import notifee, {
    AndroidImportance,
    AuthorizationStatus,
    TriggerType,
} from '@notifee/react-native';
const CHANNEL_ID = 'cart-reminders';
const CART_REMINDER_ID = 'abandoned-cart';
export const REMINDER_DELAY_MS = __DEV__ ? 15 * 1000 : 10 * 60 * 1000;
const log = (...args) => {
    if (__DEV__) {
        console.log('[CartReminder]', ...args);
    }
};
const ensureChannel = () =>
    notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Cart reminders',
        importance: AndroidImportance.DEFAULT,
    });
export const requestNotificationPermission = async () => {
    try {
        const settings = await notifee.requestPermission();
        return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
    } catch (error) {
        log('Permission request error:', error);
        return false;
    }
};
const hasNotificationPermission = async () => {
    const settings = await notifee.getNotificationSettings();
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
};

export const scheduleCartReminder = async itemCount => {
    try {
        if (!(await hasNotificationPermission())) {
            log('Skipped: notification permission not granted');
            return false;
        }
        const channelId = await ensureChannel();
        await notifee.cancelTriggerNotification(CART_REMINDER_ID);

        const fireAt = Date.now() + REMINDER_DELAY_MS;

        await notifee.createTriggerNotification(
            {
                id: CART_REMINDER_ID,
                title: 'You left something in your cart 🛒',
                body:
                    itemCount === 1
                        ? '1 item is waiting for you. Complete your order before it sells out!'
                        : `${itemCount} items are waiting for you. Complete your order before they sell out!`,
                android: {
                    channelId,
                    pressAction: { id: 'default' },
                },
            },
            {
                type: TriggerType.TIMESTAMP,
                timestamp: fireAt,
            },
        );

        const ids = await notifee.getTriggerNotificationIds();
        log(`Scheduled for ${new Date(fireAt).toLocaleTimeString()}`, ids);

        return true;
    } catch (error) {
        console.log('SCHEDULE CART REMINDER ERROR:', error);
        return false;
    }
};

export const cancelCartReminder = async () => {
    try {
        await notifee.cancelTriggerNotification(CART_REMINDER_ID);
        await notifee.cancelNotification(CART_REMINDER_ID);
        log('Cancelled');
    } catch (error) {
        console.log('CANCEL CART REMINDER ERROR:', error);
    }
};
export const showTestNotification = async () => {
    const allowed = await requestNotificationPermission();

    if (!allowed) {
        log('Test notification skipped: permission not granted');
        return;
    }

    const channelId = await ensureChannel();

    await notifee.displayNotification({
        title: 'Test notification',
        body: 'Notifications are working',
        android: {
            channelId,
            pressAction: { id: 'default' },
        },
    });
};
