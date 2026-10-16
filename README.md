# SmartCart — E-Commerce Mobile App

A React Native e-commerce mobile application built for the **React Native Developer assignment**. SmartCart uses [DummyJSON](https://dummyjson.com/docs) for mock product data and **Redux Toolkit** for shared application state.

## ✨ Features

- **Product Listing:** Browse products with images, prices, and ratings.
- **Product Details:** View product information and manage cart and wishlist actions.
- **Shopping Cart:** Update quantities, remove products, and calculate subtotal and total.
- **Wishlist:** Save products for later.
- **Theme:** Forest Green and Mint color palette with reusable UI components.
- **Network Status:** Detect connectivity changes using `@react-native-community/netinfo`.
- **API Caching:** Cache API responses using AsyncStorage, with a seven-day expiry and a maximum of 40 indexed entries.
- **Abandoned Cart Reminders:** Schedule notifications when the app moves to the background with items in the cart, and cancel reminders when the cart is empty or the app returns to the foreground.
- **State Management:** Use Redux Toolkit to manage shared application state.

> **Note:** DummyJSON is a mock API and does not provide persistent production checkout or order history. Checkout and orders must be simulated or stored locally unless a backend is implemented.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React Native | Mobile application development |
| JavaScript | Application logic |
| Redux Toolkit | State management |
| React Redux | Connect components to Redux |
| React Navigation | Screen and tab navigation |
| AsyncStorage | Local storage and API cache |
| `@react-native-community/netinfo` | Network connectivity detection |
| DummyJSON | Mock product API |
| NativeWind | Utility-based styling |
| `lucide-react-native` | Icons |

## 📁 Project Architecture

The following is a representative structure. Update it to match the actual folders in your repository.

```text
src/
├── components/
│   └── ui/                 # Reusable UI components
├── context/                # Theme context
├── navigation/             # Stack and tab navigation
├── screens/                # Application screens
│   ├── Home/
│   ├── ProductDetails/
│   ├── Cart/
│   └── Wishlist/
├── services/
│   ├── productService      # Product API operations
│   └── notificationService # Cart reminder notifications
├── store/
│   └── slices/             # Redux Toolkit slices
├── hooks/
│   ├── useNetworkStatus    # Network status hook
│   └── useCartReminder     # Cart reminder lifecycle
└── utils/
    └── normalizeProduct    # Product data normalization
```

## 🧠 State Management

SmartCart uses **Redux Toolkit** because cart and wishlist data are shared across multiple screens.

### Why Redux Toolkit?

- Centralizes shared application state.
- Provides predictable state updates through reducers.
- Makes cart and wishlist updates easier to maintain.
- Supports selectors to access the state required by individual components.
- Can be integrated with Redux Persist to retain configured state across app restarts.

Local persistence depends on the Redux Persist configuration in the application.

## 🌐 API Integration

Product data is provided by the [DummyJSON API](https://dummyjson.com/docs).

| Endpoint | Purpose |
|---|---|
| `GET /products` | Retrieve products |
| `GET /products/:id` | Retrieve product details |
| `GET /products/categories` | Retrieve product categories |
| `GET /products/search?q=:query` | Search products |

Base URL:

```text
https://dummyjson.com
```

The actual endpoints and query parameters depend on the implementation in `productService`.

## 📡 Offline Support and Error Handling

SmartCart includes network connectivity utilities and AsyncStorage-based API cache helpers.

### Network Status

- `isDeviceOffline()` checks the current connectivity state.
- `useNetworkStatus()` listens for connectivity changes and exposes the `isOffline` status.

### API Cache

The cache utility provides:

- AsyncStorage-based cache storage.
- A maximum cache age of seven days.
- A maximum of 40 indexed cache entries.
- Cache clearing through `clearApiCache()`.

**Implementation note:** The API service must call the cache helpers to use cached responses when offline. Retry behavior should also be verified in the API service before being considered complete.

## 🔔 Abandoned Cart Notifications

The `useCartReminder` hook integrates with the notification service.

### Notification Functions

- `requestNotificationPermission()`
- `scheduleCartReminder(itemCount)`
- `cancelCartReminder()`

### Current Behavior

1. Cancels an existing reminder when the hook mounts.
2. Requests notification permission when the cart contains items.
3. Cancels reminders when the cart becomes empty.
4. Cancels reminders when the app returns to the foreground.
5. Schedules a reminder when the app enters the background and cart items remain.

Notification scheduling and permission behavior should be verified on the target Android version. Reminders should also be cancelled after a successful checkout.

## 🚀 Installation and Setup

### Prerequisites

- Node.js LTS
- npm
- Android Studio and Android SDK
- Android emulator or physical Android device
- A compatible JDK for the React Native version used by the project

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd SmartCart
```

Replace `<YOUR_REPOSITORY_URL>` with your actual Git repository URL.

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Metro

```bash
npm run start:dev
```

Make sure this script exists in `package.json`. If it does not, use the configured Metro start command, such as `npm start`.

### 4. Run on Android

Open another terminal and run:

```bash
npm run android
```

## 📦 Android Build

To generate a local debug APK:

```bash
cd android
./gradlew assembleDebug
```

The generated APK is normally available at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Release builds require appropriate Android signing configuration. Never commit signing keys or secrets to the repository.

## 🧪 Testing

Run the configured test command:

```bash
npm test
```

This command is applicable only if a test script is configured in `package.json`.

### Recommended Test Coverage

- Cart subtotal and quantity calculations.
- Product removal and empty-cart behavior.
- Search matching and debounce behavior.
- Similar-product selection.
- Notification scheduling and cancellation.
- API cache hits and expired cache entries.
- Network failure handling.
- Cart and wishlist persistence across app restarts.

Document actual test results before submitting the project.

## ⚡ Performance Optimization

The following areas should be verified and documented in the final implementation:

- Use stable `keyExtractor` values for product lists.
- Use `FlatList` or an optimized list component for long lists.
- Use focused Redux selectors to minimize unnecessary re-renders.
- Memoize expensive calculations and callbacks when beneficial.
- Keep list item components lightweight.
- Use React DevTools Profiler to inspect rendering behavior.

### Profiler Evidence

Include screenshots or a recording from React DevTools Profiler in the submission. Document actual observations rather than claiming unverified performance improvements.

## ✅ Assignment Checklist

- [ ] Product listing with images, prices, ratings, pagination, and pull-to-refresh
- [ ] Dynamic categories, debounced search, filters, and sorting
- [ ] Product details, image gallery, cart actions, and similar products
- [ ] Cart and wishlist management with persistence
- [ ] Simulated checkout, order confirmation, and purchase history
- [ ] Abandoned-cart reminders and cancellation after purchase
- [ ] Offline cache, network failure handling, and retries
- [ ] Tests for cart calculations, search, similar products, and notifications
- [ ] React DevTools Profiler evidence
- [ ] Screenshots or demo
- [ ] Git repository with meaningful commits

## ⚠️ Known Limitations

- DummyJSON does not persist real purchases or provide a production checkout backend.
- API caching works only where the cache helpers are integrated with API requests.
- Notification behavior must be verified on the target Android device or emulator.
- Features listed in the assignment checklist should be marked complete only after implementation and verification.

## 📸 Screenshots and Demo

Add application screenshots or a demo link here before submitting.

```text
screenshots/
├── home.png
├── product-details.png
├── cart.png
└── wishlist.png
```

## 👨‍💻 Author

**Deepak Malakar**

React Native Developer

