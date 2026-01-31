# Lumina IPTV 📺
### The Ultimate Cross-Platform Streaming Ecosystem

Lumina IPTV is a modern, high-performance streaming solution designed to bridge the gap between web and mobile entertainment. Powered by **Angular** for the web and **React Native** for mobile, it provides a seamless experience for accessing Live TV, Movies, and Series from any Xtream Codes compatible provider.

---

## 🏗️ Project Architecture

Lumina is built as a monorepo consisting of two primary platforms sharing a unified technical philosophy:

- **[Web Client (Angular)](./angular)**: A robust, full-featured web dashboard for desktop and browser-based viewing.
- **[Mobile App (React Native)](./rn-app)**: A premium, native mobile experience optimized for iOS, Android, and tablets.
- **[Requirements & Documentation](./requirements)**: Detailed technical specifications and architecture docs.

---

## 🚀 Key Features

### 📺 Streaming Experience
- **Live TV Perfection**: Category-based browsing with instant search and full EPG (Electronic Program Guide) support.
- **Cinematic VOD**: Extensive metadata for movies, including posters, ratings, cast details, and high-quality backdrops.
- **Series Management**: Organized season / episode breakdowns with summaries and progress tracking.
- **Multi-Player Support**: Integration with professional players like **Infuse** and **VLC** for advanced playback features.

### 🛠️ Developer Excellence
- **Unified Logic**: Shared business logic patterns via the [XtreamService](./requirements/xtream.service.md).
- **TypeScript First**: End-to-end type safety across both web and mobile platforms.
- **Modern Tech Stack**: Leveraging Angular 18 and React Native for industry-standard performance and reliability.
- **Environment Driven**: Seamless configuration via `.env` files for both platforms.

---

## 🛠️ Getting Started

To get started with either platform, please refer to their respective setup guides:

| Component | Guide |
| :--- | :--- |
| **Angular Web** | [Web Setup Instructions](./angular/README.md) |
| **React Native App** | [Mobile Setup Instructions](./rn-app/README.md) |

### Quick Start (Credentials)
Both platforms use a `.env` file for default provider configurations.
1. Copy the sample: `cp .env.sample .env` (within the respective folder)
2. Add your provider URL, Username, and Password.

---

## 📖 Deep Dive Documentation

For a detailed understanding of the system components, explore the requirements folder:
- [Core Navigation Shell](./requirements/app.component.md)
- [Live TV Hub & Dashboard](./requirements/dashboard.component.md)
- [VOD & Movie Details](./requirements/vod-details.component.md)
- [Series & Episode Management](./requirements/series-details.component.md)
- [API Connectivity Service](./requirements/xtream.service.md)

---

<p align="center">
  Built with ❤️ for the streaming community.
</p>
