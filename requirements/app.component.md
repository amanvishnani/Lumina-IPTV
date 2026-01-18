# AppComponent

The `AppComponent` is the main foundation of the web application. It acts as the "shell" that holds everything else together.

## Key Responsibilities
- **App Shell**: Provides the basic structure where different pages (like Login or Dashboard) are displayed.
- **Startup**: Sets the title of the browser tab and initializes the app.

## Angular Implementation
- **Root Component**: Defined with the `app-root` selector.
- **Routing**: Imports and uses `RouterOutlet` in its template to enable page transitions.
- **Standalone Mode**: Uses `standalone: true` and specifies its own imports and styles.

## React Native Implementation
- **Entry Point**: Serves as the root component defined in `App.tsx`.
- **Navigation Container**: Wraps the entire application in `NavigationContainer` from `@react-navigation/native`.
- **Stack Navigation**: Implements `createStackNavigator` to manage the transition between Auth (Login) and App (Dashboard) flows.
- **Initial Auth Check**: Uses `useEffect` and `useState` to perform a splash-style check for saved credentials via `xtreamService.isLoggedIn()` before rendering the navigation tree.
- **Global Styling**: Sets basic theme colors (background: #000) for the consistent "Dark Mode" aesthetic.
