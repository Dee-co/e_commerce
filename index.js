/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee from '@notifee/react-native';
notifee.onBackgroundEvent(async () => {});
AppRegistry.registerComponent(appName, () => App);
