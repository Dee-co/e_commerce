SmartCart — E-Commerce Mobile App
A React Native e-commerce application built for the React Native Developer assignment. SmartCart uses DummyJSON for mock product data and Redux Toolkit for shared application state.
Features
- Product browsing with images, prices, and ratings.
- Product details with cart and wishlist actions.
- Cart quantity management, product removal, and subtotal/total display.
- Wishlist support.
- Forest Green + Mint theme and reusable UI components.
- Network status detection using @react-native-community/netinfo.
- AsyncStorage API-cache utilities with a seven-day expiry and a maximum of 40 indexed entries.
- Abandoned-cart reminder hook integrated with the notification service.
- Redux Toolkit state management; persistence depends on the Redux Persist configuration in the project.
Important: DummyJSON is a mock API. It does not provide persistent production checkout or order history. Treat checkout/orders as simulated or locally persisted unless a backend has been implemented.

Tech Stack
- React Native and JavaScript
- Redux Toolkit and React Redux
- React Navigation
- AsyncStorage
- @react-native-community/netinfo
- DummyJSON API
- NativeWind
- lucide-react-native
Architecture
Update this example structure if the final repository uses different paths.
src/
├── components/ui/       # Reusable UI components
├── context/             # Theme context
├── navigation/          # Stack and tab navigation
├── screens/             # Home, Product Details, Cart, Wishlist, etc.
├── services/            # Product API and notification services
├── store/slices/        # Redux Toolkit slices
├── hooks/               # Network status, cart reminder, other hooks
└── utils/               # Product normalization and helpers
State Management
SmartCart uses Redux Toolkit because cart and wishlist state is shared across screens. Centralized state and reducers make updates predictable, while selectors let components subscribe to the state they need. Redux Persist can retain configured state across app restarts when it is correctly set up.
API
Product data is sourced from DummyJSON documentation. Common endpoints include:
- GET https://dummyjson.com/products
- GET https://dummyjson.com/products/:id
- GET https://dummyjson.com/products/categories
- GET https://dummyjson.com/products/search?q=:query
The exact endpoints and parameters depend on the implementation in productService.
Offline and Error Handling
The network utility provides:
- isDeviceOffline() to check the current connectivity state.
- useNetworkStatus() to subscribe to connectivity changes and expose isOffline.
The AsyncStorage cache utility stores cached data, expires entries after seven days, and limits its index to 40 entries. Ensure API service functions actually read from and write to this cache for offline product loading. Add bounded retries for transient request failures if they are not already implemented.
Abandoned-Cart Notifications
The useCartReminder hook uses:
- requestNotificationPermission()
- scheduleCartReminder(itemCount)
- cancelCartReminder()
Its current behavior:
1. Cancels an existing reminder when the hook mounts.
2. Requests permission when the cart has items.
3. Cancels reminders when the cart becomes empty.
4. Cancels reminders when the app returns to the foreground.
5. Schedules a reminder when the app enters the background with items still in the cart.
Verify platform-specific permission/scheduling behavior in notificationService. Cancel reminders after a successful checkout as well.
Installation and Setup
Prerequisites
- Node.js LTS and npm
- Android Studio, Android SDK, and an emulator or Android device
- A JDK version supported by the React Native version used in this repository
Install dependencies:
npm install
Start Metro:
npm start
Run the Android app in a second terminal:
npm run android
Use the scripts and package manager specified by the repository's package.json and lockfile if they differ.
Android Build
For a local debug APK:
cd android
./gradlew assembleDebug
Expected output path:
android/app/build/outputs/apk/debug/app-debug.apk
Configure release signing securely before making a release build. Do not commit signing keys or secrets.
Testing
Run tests only if a test script is configured in package.json:
npm test
Recommended assignment test coverage:
- Cart subtotal and quantity calculations, removal, and empty-cart behavior.
- Search matching, debounce behavior, and empty results.
- Similar-product selection and missing-category behavior.
- Notification scheduling and cancellation on foreground, empty cart, and successful purchase.
- Cache hit, expired cache entry, and network failure.
- Cart/wishlist persistence across app restarts.
Do not claim tests pass until they have been run.
Performance Notes
Verify and document the actual optimizations in the final implementation:
- Stable keyExtractor values for product lists.
- FlatList or an optimized list component for long product collections.
- Narrow Redux selectors to reduce unrelated re-renders.
- Memoization where it is useful and supported by profiling.
- Lightweight list-row components.
- React DevTools Profiler recording for representative interactions.
Profiler evidence: Include screenshots or a recording from React DevTools Profiler in the submission. This README does not claim profiling results have already been captured.
Assignment Checklist
- [ ] Product listing with images, prices, ratings, pagination, and pull-to-refresh
- [ ] Dynamic categories, debounced search, filters, and sorting
- [ ] Product details, image gallery, cart actions, and similar products
- [ ] Cart and wishlist management and persistence
- [ ] Simulated checkout, order confirmation, and purchase history
- [ ] Abandoned-cart reminders, including cancellation after purchase
- [ ] Offline cache, network failure handling, and retries
- [ ] Tests for cart, search, similar products, and notifications
- [ ] React DevTools Profiler evidence
- [ ] Screenshots/demo
- [ ] Git repository with meaningful commits
Known Limitations
- DummyJSON does not persist real orders or provide a production checkout backend.
- Confirm the API cache utilities are connected to actual API requests.
- Verify notification behavior on the target Android version and device/emulator.
- Update this README to match the final code, actual scripts, tests, and implemented screens.