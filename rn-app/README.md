# IPTV Premium - React Native Edition 📺

A high-performance, premium IPTV application built with React Native. This app connects to any Xtream Codes compatible provider to deliver a seamless streaming experience for Live TV, Movies, and Series.

---

## 🚀 Key Features

### For Users
- **Live TV**: Full EPG support (where available) with category-based browsing and instant search.
- **VOD (Movies)**: Detailed metadata including ratings, cast, movie posters, and high-quality backdrops.
- **Series & Episodes**: Season-by-season breakdown with episode summaries and progress tracking.
- **Multiple Players**: Choose your favorite rendering engine. Support for internal player, **Infuse**, and **VLC**.
- **Audio & Subtitles**: Easily switch between available audio tracks and local/embedded subtitles.
- **Optimized for Large Screens**: Native support for iPad and Android tablets with responsive layouts.
- **Offline Viewing**: Optional background download system for watching your favorite content without an internet connection.

### For Developers
- **TypeScript First**: Fully typed codebase for maximum reliability.
- **Modular Navigation**: Clean separation between Auth and App flows using React Navigation.
- **Native Background Downloads**: Leverages `@kesha-antonov/react-native-background-downloader` for true OS-level backgrounding.
- **Feature Flags**: Toggle complex features (like downloads) globally using a central config.
- **Optimized Caching**: Smart local caching of categories and stream metadata to reduce API load.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation
1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Install CocoaPods (iOS only)**:
   ```bash
   cd ios && pod install && cd ..
   ```

### Configuration
You can manage app behavior and default credentials in `src/config.ts`:
```typescript
export const CONFIG = {
    features: {
        enableDownloads: false, // Toggle offline download functionality
    },
};
```

#### 🔐 Environment Variables
For security and convenience, default login credentials are managed via a `.env` file.
1. **Create your .env file** (gitignored):
   ```bash
   cp .env.sample .env
   ```
2. **Edit `.env`** with your credentials:
   ```env
   DEFAULT_URL=http://your-provider.com:80
   DEFAULT_USERNAME=your_username
   DEFAULT_PASSWORD=your_password
   ```
The app will automatically pre-fill these values on the login screen.

---

## 🖥️ Development

### Start the development server
```bash
npm start
```

### Run on iOS
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

---

## 📖 User Guide
1. **Login**: Launch the app and enter your IPTV credentials (URL, Username, Password).
2. **Browsing**: Use the bottom tabs to switch between **Live TV**, **Movies**, and **Series**.
3. **Watching**: Tap any content to see details. Press **Play** to start streaming.
4. **Player Options**: If you have Infuse or VLC installed, the app will offer you the choice to open the stream in those players for advanced playback features.
5. **Downloads (if enabled)**: Tap the **Download** button on a movie or episode. You can close the app, and the download will continue in the background. Access your files via the **Downloads** tab.

---

## 🏗️ Architecture
- **`/src/services`**: Core business logic (API, Downloads, Storage).
- **`/src/screens`**: Feature-specific UI components.
- **`/src/utils`**: Helper functions for responsive UI, player selection, and formatting.
- **`/src/navigation`**: Bottom tab and Stack navigation configuration.

---

## 📄 Requirements Documentation
Detailed technical requirements can be found in the `/requirements` folder:
- [Core Navigation](../requirements/app.component.md)
- [Live TV Hub](../requirements/dashboard.component.md)
- [VOD Details](../requirements/vod-details.component.md)
- [Series Management](../requirements/series-details.component.md)
