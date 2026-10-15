import { configureStore,combineReducers } from '@reduxjs/toolkit';
import {persistStore,persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage'
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
const rootReducer = combineReducers({
    cart:cartReducer,
    wishlist:wishlistReducer
});
const persistConfig = {
    key:'root',
    storage:AsyncStorage,
    whitelist:['cart','wishlist']
};
const persistedReducer = persistReducer(
  persistConfig,
  rootReducer,
);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/FLUSH',
        ],
      },
    }),
});

export const persistor = persistStore(store);